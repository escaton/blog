---
id: 1025
title: 'STM32 — с нуля до RTOS. 4: Внешние прерывания и NVIC'
date: 2014-02-25T15:34:47+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=1025
permalink: /stm32-from_zero_to_rtos-4_exti_nvic/
notely:
  - 
  - 
  - 
wp_noextrenallinks_mask_links:
  - 0
  - 0
  - 0
ratings_users:
  - 4
  - 4
  - 4
ratings_score:
  - 20
  - 20
  - 20
ratings_average:
  - 5
  - 5
  - 5
dsq_thread_id:
  - 2728054994
categories:
  - С нуля
  - С нуля до RTOS
tags:
  - STM32
  - электроника
---
Говоря о прерываниях, невозможно не рассказать о так называемых внешних прерываниях. За страшным названием стоит просто прерывание от переключения входной ножки. Да, в PIC была одна или две специальных ножки, умеющих генерировать прерывания — тут же таких ножек вагон. Работает всё точно так же, как и во втором проекте — разве что нужно настроить ножку на вход.

<!--more-->

# <span style="font-size: 30px; line-height: 1.3;">17. Прерывания EXTI</span>

При задании прерывания EXTI нужно задать порт–источник и пин–источник прерывания. Также нужно указать реакцию (прерывание или событие — разница пока не важна, выбираем прерывание), тип перепада (только фронт, только спад или и то и другое) и линию EXTI — просто номер EXTI–прерывания, одного из 5.

    void init_EXTI()
    {  
      EXTI_InitTypeDef EXTI_InitStructure;
    
      GPIO_EXTILineConfig(GPIO_PortSourceGPIOA, GPIO_PinSource0);
      EXTI_InitStructure.EXTI_Line = EXTI_Line0;
      EXTI_InitStructure.EXTI_Mode = EXTI_Mode_Interrupt;
      EXTI_InitStructure.EXTI_Trigger = EXTI_Trigger_Rising;  
      EXTI_InitStructure.EXTI_LineCmd = ENABLE;
      EXTI_Init(&EXTI_InitStructure);
    }

Обработчик прерывания будет тот же, что и во втором проекте. Отличие только в названии обработчика (векторе прерывания) и проверяемых флагах.

    int state=0;
    
    void EXTI0_IRQHandler(void)
    { 
      if (EXTI_GetITStatus(EXTI_Line0))
      { 
        EXTI_ClearITPendingBit(EXTI_Line0);
        if(state)
          GPIO_WriteBit(GPIOC, GPIO_Pin_8, Bit_SET);
        else
          GPIO_WriteBit(GPIOC, GPIO_Pin_8, Bit_RESET);
        state = 1 - state; 
      }
    }

## 18. NVIC — приоритетный контроллер прерываний

Однако так ничего работать не будет. Прерывания EXTI обслуживаются через контроллер прерываний, который называется NVIC — значит, нам нужно его настроить. Здесь тоже всё довольно просто: назначаем источник (прерывание EXTI0), приоритет и состояние (включен/выключен). Инициализируем.

    void init_NVIC()
    {  
      NVIC_InitTypeDef NVIC_InitStructure;
    
      NVIC_InitStructure.NVIC_IRQChannel = EXTI0_IRQn;
      NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 0x0F;
      NVIC_InitStructure.NVIC_IRQChannelSubPriority = 0x0F;
      NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
      NVIC_Init(&NVIC_InitStructure);   
    }
    

### Весь код 4 проекта полностью

    #include "stm32f10x_conf.h"
    
    void init_GPIO()
    {
      RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOC, ENABLE);
    
      GPIO_InitTypeDef GPIO_InitStructure;
      GPIO_StructInit(&GPIO_InitStructure);
      GPIO_InitStructure.GPIO_Speed = GPIO_Speed_2MHz;
      GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;
      GPIO_InitStructure.GPIO_Pin = GPIO_Pin_8;
      GPIO_Init(GPIOC, &GPIO_InitStructure);
    }
    
    int state=0;
    
    void EXTI0_IRQHandler(void)
    { 
      if (EXTI_GetITStatus(EXTI_Line0))
      { 
        EXTI_ClearITPendingBit(EXTI_Line0);
        if(state)
          GPIO_WriteBit(GPIOC, GPIO_Pin_8, Bit_SET);
        else
          GPIO_WriteBit(GPIOC, GPIO_Pin_8, Bit_RESET);
        state = 1 - state; 
      }
    }
    
    void init_EXTI()
    {  
      EXTI_InitTypeDef EXTI_InitStructure;
    
      GPIO_EXTILineConfig(GPIO_PortSourceGPIOA, GPIO_PinSource0);
      EXTI_InitStructure.EXTI_Line = EXTI_Line0;
      EXTI_InitStructure.EXTI_Mode = EXTI_Mode_Interrupt;
      EXTI_InitStructure.EXTI_Trigger = EXTI_Trigger_Rising;  
      EXTI_InitStructure.EXTI_LineCmd = ENABLE;
      EXTI_Init(&EXTI_InitStructure);
    }
    
    void init_NVIC()
    {  
      NVIC_InitTypeDef NVIC_InitStructure;
    
      NVIC_InitStructure.NVIC_IRQChannel = EXTI0_IRQn;
      NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 0x0F;
      NVIC_InitStructure.NVIC_IRQChannelSubPriority = 0x0F;
      NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
      NVIC_Init(&NVIC_InitStructure);   
    }
    
    void main()
    {
      init_GPIO();
      init_EXTI();
      init_NVIC();
      while(1) ;
    }

<a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://static.catethysis.ru/files/STM32_Projects_4_EXTI.rar" >Скачать архив 4 проекта</a>.

Весь цикл:
  
[1. Порты ввода–вывода](http://catethysis.ru/index.php/stm32-from_zero_to_rtos-1_gpio/ "STM32 — с нуля до RTOS. 1: Порты ввода–вывода")
  
[2. Таймер и прерывания](http://catethysis.ru/index.php/stm32-from_zero_to_rtos-2_timers/ "STM32 — с нуля до RTOS. 2: Таймер и прерывания")
  
[3. Выходы таймера](http://catethysis.ru/index.php/stm32-from_zero_to_rtos-3_timer_outputs/ "STM32 — с нуля до RTOS. 3: Выходы таймера")
  
4. Внешние прерывания и NVIC
  
[5. Ставим FreeRTOS](http://catethysis.ru/index.php/freertos_stm32f100_iar/ "Установка FreeRTOS на STM32F100 в IAR")