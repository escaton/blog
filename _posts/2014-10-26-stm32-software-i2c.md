---
id: 2036
title: 'STM32: софтовый I2C'
date: 2014-10-26T21:30:30+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2036
permalink: /stm32-software-i2c/
wp_noextrenallinks_mask_links:
  - 0
ratings_users:
  - 2
ratings_score:
  - 10
ratings_average:
  - 5
dsq_thread_id:
  - 3158745052
categories:
  - Библиотеки
tags:
  - STM32
  - электроника
---
Модуль I2C в STM32 сразу после включения работает в Slave-режиме, т.е. ждёт сигналов от внешнего I2C-мастера. Точно так же, как работает, к примеру, [микросхема памяти EEPROM](http://catethysis.ru/stm32-i2c/ "STM32 → I2C"), [цифровой барометр](http://catethysis.ru/bmp180-digital-barometer-stm32/ "Цифровой барометр BMP180") или [RFID-ридер](http://catethysis.ru/stm32_rfid_reader/ "STM32: RFID-ридер"). В недавнем проекте мне нужно было сделать девайс, который подключается к микроконтроллеру по I2C в слейв-роли, и я этот режим полностью мне подходил.

Однако, поскольку железо делают умные люди из Франции и Италии, а библиотеки пишут нацеленные на скорость разработчики из Индии — этот режим работает довольно плохо, и проблему усугубляет полное отсутствие каких-либо примеров работы в этом режиме.
  
Гуглинг даёт около пяти тем на разных форумах, каждая из которых не содержит ответов и рабочих примеров. Разбираться времени не было, поэтому я сделал простой модуль софтверного [I2C](http://catethysis.ru/stm32-i2c/ "STM32 → I2C"), который просто слушает пины SDA и SCL.

<!--more-->

<pre><code class="cs">#define I2C_PORT_RCC RCC_APB2Periph_GPIOB 
#define I2C_PORT PORTB
#define SCL GPIO_Pin_6
#define SDA GPIO_Pin_7
#define SLAVE_ADDR 0x68

void process_query(uint8_t addr, uint8_t *buf, uint8_t len)
{
	if(addr == SLAVE_ADDR) { // приняли команду, адресованную нам?
		// обрабатываем принятую команду
	}
}

void init_HW()
{
	RCC_APB2PeriphClockCmd(I2C_PORT_RCC | RCC_APB2Periph_AFIO, ENABLE);
	GPIO_InitStructure.GPIO_Speed = GPIO_Speed_2MHz;
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IPU;
	GPIO_InitStructure.GPIO_Pin = SCL | SDA;
	GPIO_Init(I2C_PORT, &GPIO_InitStructure);
	GPIO_WriteBit(I2C_PORT, SCL, Bit_SET);
	GPIO_WriteBit(I2C_PORT, SDA, Bit_SET);
}

void main()
{
	init_HW();
	
	uint16_t old_scl = Bit_SET, scl = Bit_SET, old_sda = Bit_SET, sda = Bit_SET;
	uint8_t byte = 0, pos = 0, buf[250] = {0}, buf_pos = 0;
	while(1)
	{
		old_scl = scl; scl = GPIO_ReadInputDataBit(I2C_PORT, SCL); // читаем новое состояние SCL, сохраняем старое
		old_sda = sda; sda = GPIO_ReadInputDataBit(I2C_PORT, SDA); // читаем новое состояние SDA, сохраняем старое
		
		if((old_scl == Bit_RESET) && (scl == Bit_SET)) { // фронт на SCL
			if(pos % 9 == 0) { // приняли бит ACK?
				buf[buf_pos++] = byte; // сохраняем весь принятый БАЙТ в буфер
				byte = 0; // буферный БАЙТ готов для приёма следующих БИТ
			}
			byte = byte * 2 + (sda == Bit_SET); // сохраняем принятый БИТ
		}
		if((old_scl == Bit_SET) && (scl == Bit_RESET)) // спад на SCL
			pos++; // увеличиваем счётчик БИТ
		if((old_sda == Bit_RESET) && (sda == Bit_SET) && (scl == Bit_SET)) { // приняли сигнал STOP
			process_query(buf[0]/2, buf+1, buf_pos-1); // обрабатываем всю принятую посылку
				// в buf в первом байте лежит адрес, в следующих байтах - данные. поэтому передаём:
				// адрес - buf[0], и делим его на 2, потому что седьмой бит - флаг "чтение/запись"
				// данные - buf+1, т.е. буфер, начиная с первого байта (а не с нулевого)
				// длина данных - buf_pos-1, "-1" - потому что данных на 1 меньше, чем весь буфер, за счёт адреса
			pos = 0; buf_pos = 0; // сбрасываем счётчики в начальное состояние
		}
	}
}</code></pre>

Работа модуля очень проста:

  * По фронту на линии SCL — записываем в буфер byte новый принятый бит;
  * По спаду на линии SCL — инкрементируем счётчик бит;
  * После приёма 8 бит и одного ACK (счётчик бит кратен 9) — записываем принятый байт в буфер buf (максимальная длина &#8212; 250 байт, можно менять);
  * По сигналу STOP (фронт на линии SDA при сброшенном SCL) — обрабатываем принятую посылку в процедуре process_query. Именно она следит за адресом слейва.

Метод достаточно ресурсоёмок, поэтому 400кГц I2C работает только на процессорах с частотой не меньше 72 МГц. [Плата VLDiscovery](http://catethysis.ru/stm32-discovery-boards/ "STM32 — обзор плат Discovery") (STM32F100RBT, 24 МГц) сможет обработать только 100кГц I2C, чего впрочем должно хватить для большинства применений.

В модуле реализован только приём данных, передачи обратно пока нет. Когда понадобится &#8212; допишу функцию передачи.