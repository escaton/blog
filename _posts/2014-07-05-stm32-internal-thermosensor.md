---
id: 1855
title: 'STM32: встроенный термодатчик'
date: 2014-07-05T23:54:58+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=1855
permalink: /stm32-internal-thermosensor/
ratings_users:
  - 2
ratings_score:
  - 10
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 2820322318
categories:
  - Справочник
tags:
  - STM32
  - датчики
  - сенсор
  - термодатчик
  - электроника
---
В STM32 есть встроенный термодатчик и источник опорного напряжения. Термодатчик подключен к 16 каналу АЦП и показывает напряжение относительно ИОН, который подключен к 17 каналу. Канал АЦП &#8212; внутренний, и не имеет выхода наружу.

Референс мануал сообщает формулу перевода показаний в температуру: Temperature = (V\_25-V\_sense)/Slope + 25. Значения V\_25 и Slope указаны в даташите на конкретный микроконтроллер, и для кристалла STM32F107 таковы: V\_25 = 1.45 В, Slope = 4.3 мВ/градус.

Для измерения необходимо:

  1. Настроить АЦП: нам нужен канал 16.
  2. Установить бит TEMPVREF, который включает модули термодатчика и ИОН
  3. Считать измеренные данные
  4. Перевести единицы АЦП в вольты
  5. Вычислить температуру по формуле выше.

<pre><code class="cpp">RCC_APB2PeriphClockCmd(RCC_APB2Periph_ADC1, ENABLE);

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
ADC_TempSensorVrefintCmd(ENABLE);

ADC_RegularChannelConfig(ADC1, ADC_Channel_16, 1, ADC_SampleTime_28Cycles5);
ADC_SoftwareStartConvCmd(ADC1, ENABLE);
while (ADC_GetFlagStatus(ADC1, ADC_FLAG_EOC) == RESET);
	
float V_25 = 1.45;
float Slope = 4.3e-3;
float Vref = 1.78;

ADC_SoftwareStartConvCmd(ADC1, ENABLE);
while (ADC_GetFlagStatus(ADC1, ADC_FLAG_EOC) == RESET);
uint16_t data = ADC_GetConversionValue(ADC1);
float V_sense = data/4096.0*Vref;
float temp = (V_25 - V_sense)/Slope + 25.0;
</code></pre>

В моём случае напряжение Vref составило 1.78 вольта, и таким образом напряжение на термодатчике &#8212; 1.41 вольта. Вычисляем температуру: (1.45-1.41)/0.0043 + 25 = 34 градуса Цельсия. Получается, это и не датчик вовсе, а показометр &#8212; который тем не менее может сказать вам что температура упала или поднялась.