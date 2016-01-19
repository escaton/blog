---
id: 2360
title: Связь по SPI между двумя микроконтроллерами
date: 2015-07-16T23:46:18+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2360
permalink: /spi_between_mcu/
wp_noextrenallinks_mask_links:
  - 0
ratings_users:
  - 1
ratings_score:
  - 5
ratings_average:
  - 5
dsq_thread_id:
  - 3941163164
categories:
  - STM32
  - Без рубрики
tags:
  - SPI
  - STM32
  - передача данных
---
Это простейший пример передачи данных между двумя модулями SPI в STM32F4. Я использую плату STM32F4Discovery, на ней запущены модули SPI1 и SPI2 в обычном режиме: полнодуплексная связь, длина пакета данных — 8 бит, отрицательная полярность (CPOL = 0), синхронизация по первому тактовому импульсу (CPHA = 0). Для начала сделаем всё самым простым способом — без использования прерываний.

В процедуре main передадим данные из SPI1, они попадут в SPI2 — примем их оттуда. Потом точно так же отправим данные из SPI2 в SPI1.

Первый модуль будет работать в режиме Master, т.е. она управляет трафиком на линии связи, генерируя тактовый сигнал SCK. Второй модуль работает в режиме Slave, и передаёт данные только по сигналу с мастера. Таким образом, мастер должен тактировать и свою передачу (= приём слейва), и передачу слейва (= приём мастера). Сам слейв по своей инициативе передавать данные не может.

Поэтому мастер должен &#171;протактировать&#187; передачу слейва. Сделать это очень просто, нам достаточно просто отправить мастером посылку с любыми данными нужной длины, при этом во входной буфер будут приходить данные от слейва. Модуль SPI слейва устроен как сдвиговый регистр, линия тактов которого подключена ко входу SCK, а входящая и выходящая линия данных — к MOSI и MISO соответственно. Подача тактов на SCK заставляет этот сдвиговый регистр выталкивать в MISO своё внутреннее состояние.

Можно сделать и по-другому, постоянно переназначая роли master и slave.

<!--more-->

## Линии GPIO и соединения

SPI1 использует следующие линии:
  
SCK — PA5
  
MISO — PA6
  
MOSI — PA7

Линии SPI2:
  
SCK — PB13
  
MISO — PB14
  
MOSI — PB15

Соедините одноимённые линии обоих модулей между собой, т.е. SCK—SCK, MOSI—MOSI, MISO—MISO. Сигнал Slave Select нам не потребуется — мы будем управлять им программно, а на самом деле он просто будет всегда включён, т.е. слейв будет &#171;постоянно выбран&#187;. И правда, у нас же только один слейв.

## Код примера

<pre><code class="cpp">#include "stm32f4xx_gpio.h"
#include "stm32f4xx_spi.h"

void SPI1_init()
{
	RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOA, ENABLE);
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_SPI1,  ENABLE);

	GPIO_InitTypeDef GPIO_InitStructure;
	GPIO_StructInit(&GPIO_InitStructure);

	GPIO_InitStructure.GPIO_Pin = GPIO_Pin_5 | GPIO_Pin_6 | GPIO_Pin_7;
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF;
	GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
	GPIO_InitStructure.GPIO_OType = GPIO_OType_PP;
	GPIO_InitStructure.GPIO_PuPd = GPIO_PuPd_DOWN;
	GPIO_Init(GPIOA, &GPIO_InitStructure);

	GPIO_PinAFConfig(GPIOA, GPIO_PinSource5, GPIO_AF_SPI1);
	GPIO_PinAFConfig(GPIOA, GPIO_PinSource6, GPIO_AF_SPI1);
	GPIO_PinAFConfig(GPIOA, GPIO_PinSource7, GPIO_AF_SPI1);

	SPI_I2S_DeInit(SPI1);
	SPI_InitTypeDef SPI_InitStructure;
	SPI_StructInit(&SPI_InitStructure);

	SPI_InitStructure.SPI_Direction = SPI_Direction_2Lines_FullDuplex;
	SPI_InitStructure.SPI_Mode = SPI_Mode_Master;
	SPI_InitStructure.SPI_DataSize = SPI_DataSize_16b;
	SPI_InitStructure.SPI_NSS = SPI_NSS_Soft;
	SPI_Init(SPI1, &SPI_InitStructure);
	SPI_Cmd(SPI1, ENABLE);
}

void SPI2_init()
{
	RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOB, ENABLE);
	RCC_APB1PeriphClockCmd(RCC_APB1Periph_SPI2,  ENABLE);

	GPIO_InitTypeDef GPIO_InitStructure;
	GPIO_StructInit(&GPIO_InitStructure);

	GPIO_InitStructure.GPIO_Pin = GPIO_Pin_13 | GPIO_Pin_14 | GPIO_Pin_15;
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF;
	GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
	GPIO_InitStructure.GPIO_OType = GPIO_OType_PP;
	GPIO_InitStructure.GPIO_PuPd = GPIO_PuPd_DOWN;
	GPIO_Init(GPIOB, &GPIO_InitStructure);

	GPIO_PinAFConfig(GPIOB, GPIO_PinSource13, GPIO_AF_SPI2);
	GPIO_PinAFConfig(GPIOB, GPIO_PinSource14, GPIO_AF_SPI2);
	GPIO_PinAFConfig(GPIOB, GPIO_PinSource15, GPIO_AF_SPI2);

	SPI_I2S_DeInit(SPI2);
	SPI_InitTypeDef SPI_InitStructure;
	SPI_StructInit(&SPI_InitStructure);

	SPI_InitStructure.SPI_Direction = SPI_Direction_2Lines_FullDuplex;
	SPI_InitStructure.SPI_Mode = SPI_Mode_Slave;
	SPI_InitStructure.SPI_DataSize = SPI_DataSize_16b;
	SPI_InitStructure.SPI_NSS = SPI_NSS_Soft;
	SPI_Init(SPI2, &SPI_InitStructure);
	SPI_Cmd(SPI2, ENABLE);
}

uint16_t SPI_receive(SPI_TypeDef* SPIx)
{
	while(SPI_I2S_GetFlagStatus(SPIx, SPI_I2S_FLAG_RXNE) == RESET);
	return (uint16_t)SPI_I2S_ReceiveData(SPIx);
}

enum direction {forward, backward};

void set_direction(enum direction dir)
{
	switch(dir) {
	case  forward: { SPI1-&gt;CR1 |= SPI_CR1_MSTR | SPI_CR1_SSI; SPI2-&gt;CR1 &= ~SPI_CR1_MSTR & ~SPI_CR1_SSI; break; }
	case backward: { SPI2-&gt;CR1 |= SPI_CR1_MSTR | SPI_CR1_SSI; SPI1-&gt;CR1 &= ~SPI_CR1_MSTR & ~SPI_CR1_SSI; break; }
	}
}

void main()
{
	SPI1_init();
	SPI2_init();
	
	set_direction(forward);
	SPI_I2S_SendData(SPI1, 4567);
	uint16_t data1 = SPI_receive(SPI2);
	
	set_direction(backward);
	SPI_I2S_SendData(SPI1, 0);
	SPI_I2S_SendData(SPI2, 8648);
	uint16_t data2 = SPI_receive(SPI1);
	
	while(data1);
}</code></pre>

Функция set_direction просто перенастраивает модуль на роль мастера или слейва.

## Реализация на прерываниях

Теперь сделаем то же самое на прерываниях

<pre><code class="cpp">#include "stm32f4xx_gpio.h"
#include "stm32f4xx_spi.h"

void SPI1_init()
{
	RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOA, ENABLE);
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_SPI1,  ENABLE);

	GPIO_InitTypeDef GPIO_InitStructure;
	GPIO_StructInit(&GPIO_InitStructure);

	GPIO_InitStructure.GPIO_Pin = GPIO_Pin_5 | GPIO_Pin_6 | GPIO_Pin_7;
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF;
	GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
	GPIO_InitStructure.GPIO_OType = GPIO_OType_PP;
	GPIO_InitStructure.GPIO_PuPd = GPIO_PuPd_DOWN;
	GPIO_Init(GPIOA, &GPIO_InitStructure);

	GPIO_PinAFConfig(GPIOA, GPIO_PinSource5, GPIO_AF_SPI1);
	GPIO_PinAFConfig(GPIOA, GPIO_PinSource6, GPIO_AF_SPI1);
	GPIO_PinAFConfig(GPIOA, GPIO_PinSource7, GPIO_AF_SPI1);

	SPI_I2S_DeInit(SPI1);
	SPI_InitTypeDef SPI_InitStructure;
	SPI_StructInit(&SPI_InitStructure);

	SPI_InitStructure.SPI_Direction = SPI_Direction_2Lines_FullDuplex;
	SPI_InitStructure.SPI_Mode = SPI_Mode_Master;
	SPI_InitStructure.SPI_DataSize = SPI_DataSize_16b;
	SPI_InitStructure.SPI_NSS = SPI_NSS_Soft;
	SPI_Init(SPI1, &SPI_InitStructure);
	SPI_I2S_ITConfig(SPI1, SPI_I2S_IT_RXNE, ENABLE);
	SPI_Cmd(SPI1, ENABLE);
}

void SPI2_init()
{
	RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOB, ENABLE);
	RCC_APB1PeriphClockCmd(RCC_APB1Periph_SPI2,  ENABLE);

	GPIO_InitTypeDef GPIO_InitStructure;
	GPIO_StructInit(&GPIO_InitStructure);

	GPIO_InitStructure.GPIO_Pin = GPIO_Pin_13 | GPIO_Pin_14 | GPIO_Pin_15;
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF;
	GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
	GPIO_InitStructure.GPIO_OType = GPIO_OType_PP;
	GPIO_InitStructure.GPIO_PuPd = GPIO_PuPd_DOWN;
	GPIO_Init(GPIOB, &GPIO_InitStructure);

	GPIO_PinAFConfig(GPIOB, GPIO_PinSource13, GPIO_AF_SPI2);
	GPIO_PinAFConfig(GPIOB, GPIO_PinSource14, GPIO_AF_SPI2);
	GPIO_PinAFConfig(GPIOB, GPIO_PinSource15, GPIO_AF_SPI2);

	SPI_I2S_DeInit(SPI2);
	SPI_InitTypeDef SPI_InitStructure;
	SPI_StructInit(&SPI_InitStructure);

	SPI_InitStructure.SPI_Direction = SPI_Direction_2Lines_FullDuplex;
	SPI_InitStructure.SPI_Mode = SPI_Mode_Slave;
	SPI_InitStructure.SPI_DataSize = SPI_DataSize_16b;
	SPI_InitStructure.SPI_NSS = SPI_NSS_Soft;
	SPI_Init(SPI2, &SPI_InitStructure);
	SPI_I2S_ITConfig(SPI2, SPI_I2S_IT_RXNE, ENABLE);
	SPI_Cmd(SPI2, ENABLE);
}

uint16_t SPI_receive(SPI_TypeDef* SPIx)
{
	while(SPI_I2S_GetFlagStatus(SPIx, SPI_I2S_FLAG_RXNE) == RESET);
	return (uint16_t)SPI_I2S_ReceiveData(SPIx);
}

enum direction {forward, backward};

void set_direction(enum direction dir)
{
	switch(dir) {
	case  forward: { SPI1-&gt;CR1 |= SPI_CR1_MSTR | SPI_CR1_SSI; SPI2-&gt;CR1 &= ~SPI_CR1_MSTR & ~SPI_CR1_SSI; break; }
	case backward: { SPI2-&gt;CR1 |= SPI_CR1_MSTR | SPI_CR1_SSI; SPI1-&gt;CR1 &= ~SPI_CR1_MSTR & ~SPI_CR1_SSI; break; }
	}
}

void SPI1_IRQHandler()
{
	SPI_I2S_ClearITPendingBit(SPI1, SPI_I2S_IT_RXNE);
	uint16_t data = SPI_I2S_ReceiveData(SPI1);
	set_direction(forward);
	SPI_I2S_SendData(SPI1, data + 1);
}

void SPI2_IRQHandler()
{
	SPI_I2S_ClearITPendingBit(SPI2, SPI_I2S_IT_RXNE);
	uint16_t data = SPI_I2S_ReceiveData(SPI2);
	set_direction(backward);
	SPI_I2S_SendData(SPI2, data + 1);
}

void main()
{
	SPI1_init();
	SPI2_init();
	
	NVIC_InitTypeDef NVIC_InitStructure;
	NVIC_PriorityGroupConfig(NVIC_PriorityGroup_2);
   
	NVIC_InitStructure.NVIC_IRQChannel = SPI1_IRQn;
	NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 1;
	NVIC_InitStructure.NVIC_IRQChannelSubPriority = 0;
	NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
	NVIC_Init(&NVIC_InitStructure);
	NVIC_InitStructure.NVIC_IRQChannel = SPI2_IRQn;
	NVIC_Init(&NVIC_InitStructure);
	
	set_direction(forward);
	SPI_I2S_SendData(SPI1, 4567);
	
	while(1);
}</code></pre>