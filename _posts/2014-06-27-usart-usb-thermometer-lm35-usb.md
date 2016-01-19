---
id: 1777
title: 'STM32: термометр с подключением по USART/USB'
date: 2014-06-27T19:09:21+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=1777
permalink: /usart-usb-thermometer-lm35-usb/
wp_noextrenallinks_mask_links:
  - 0
ratings_users:
  - 1
ratings_score:
  - 5
ratings_average:
  - 5
dsq_thread_id:
  - 2802343046
categories:
  - Готовые девайсы
tags:
  - STM32
  - датчики
---
Для знакомства с АЦП сразу соберём полезный прибор: USB-термометр.  Для этого нам понадобятся:

  * аналоговый термодатчик LM35 от National Semiconductor (правда, это уже Texas Instruments)
  * STM32VLDiscovery
  * UART-USB конвертер FT232

Аналоговые термодатчики широко используются, несмотря на наличие цифровых — они дешевле и несколько проще в программировании. Благодаря наличию встроенных АЦП в STM32 всё подключение сводится просто к использованию одной из ног АЦП.

Я традиционно применяю именно LM35, в одном из серийных устройств они себя хорошо показали, да и стоимость невысока — 70 рублей за штуку. Однако, в стандартном включении они могут измерять лишь положительные температуры, а для полного диапазон производитель предлагает не слишком удобную схему со смещением нуля. Его фичи:

  * напряжение питания — от 4 вольт
  * точность — не хуже чем полградуса
  * высокая линейность выходной характеристики на всём диапазоне
  * очень удобная характеристика &#8212; выходное напряжение это просто 10мВ * температура. При 21 градусе на выходе 210мВ.
  * 70 рублей в терраэлектронике

<!--more-->


  
Популярен также датчик LM19, у него свои плюсы и  минусы:

  * пониженное напряжение питания —вплоть до 2.5В
  * невысокая точность — 2.5 градуса
  * такая же линейная характеристика
  * отрицательный наклон характеристики, выше температура — ниже напряжение, при 20 градусах на выходе 1.632В.
  * 45 рублей в терраэлектронике

А вообще, таких датчиков существует очень много, на любой вкус. Схема подключения у всех стандартна — одну ногу на землю, другую на питание, аналоговый сигнал &#8212; на третьей.

Программа чтения сигнала с помощью АЦП сразу вычисляет температуру и отправляет её в [UART](http://catethysis.ru/stm32-uart-usart/ "STM32 → UART / USART").

<pre><code class="cpp">#include "stm32f10x_conf.h"
#include 

void USART1_Send(char chr) {
	while(!(USART1-&gt;SR & USART_SR_TC));
	USART1-&gt;DR = chr;
}

void USART1_Send_String(char* str) {
	int i=0;
	while(str[i])
		USART1_Send(str[i++]);
}

void main()
{
	RCC-&gt;APB2ENR|= RCC_APB2ENR_USART1EN | RCC_APB2ENR_IOPAEN | RCC_APB2ENR_AFIOEN;
	GPIOA-&gt;CRH &= !GPIO_CRH_CNF9;
	GPIOA-&gt;CRH |=  GPIO_CRH_CNF9_1 | GPIO_CRH_MODE9_0;
	USART1-&gt;BRR = 0x9C4;
	USART1-&gt;CR1 |= USART_CR1_TE | USART_CR1_UE;
  
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB | RCC_APB2Periph_ADC1, ENABLE);

	GPIO_InitTypeDef GPIO_InitStructure;
	GPIO_InitStructure.GPIO_Speed = GPIO_Speed_2MHz;
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AIN;
	GPIO_InitStructure.GPIO_Pin = GPIO_Pin_0;
	GPIO_Init(GPIOB, &GPIO_InitStructure);
	
	ADC_InitTypeDef ADC_InitStructure;
	ADC_InitStructure.ADC_Mode = ADC_Mode_Independent;
	ADC_InitStructure.ADC_ScanConvMode = DISABLE;
	ADC_InitStructure.ADC_ContinuousConvMode = DISABLE;
	ADC_InitStructure.ADC_ExternalTrigConv = ADC_ExternalTrigConv_None;
	ADC_InitStructure.ADC_DataAlign = ADC_DataAlign_Right;
	ADC_InitStructure.ADC_NbrOfChannel = 1;
	ADC_Init(ADC1, &ADC_InitStructure);
	ADC_Cmd(ADC1, ENABLE);

	ADC_ResetCalibration(ADC1);
	while(ADC_GetResetCalibrationStatus(ADC1));
	ADC_StartCalibration(ADC1);
	while(ADC_GetCalibrationStatus(ADC1));

	ADC_RegularChannelConfig(ADC1, ADC_Channel_8, 1, ADC_SampleTime_7Cycles5);
	ADC_SoftwareStartConvCmd(ADC1, ENABLE);
	while (ADC_GetFlagStatus(ADC1, ADC_FLAG_EOC) == RESET);

	char s[10];
	while(1)
	{
		ADC_SoftwareStartConvCmd(ADC1, ENABLE);
		while (ADC_GetFlagStatus(ADC1, ADC_FLAG_EOC) == RESET);
		
		sprintf(s, "%5.1f\r\n", ADC_GetConversionValue(ADC1)/17.3);
		USART1_Send_String(s);
	}
}
</code></pre>