---
id: 1024
title: 'STM32 — с нуля до RTOS. 3: Выходы таймера'
date: 2014-02-25T15:34:40+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=1024
permalink: /stm32-from_zero_to_rtos-3_timer_outputs/
notely:
  - 
  - 
  - 
wp_noextrenallinks_mask_links:
  - 0
  - 0
  - 0
ratings_users:
  - 2
  - 2
  - 2
ratings_score:
  - 10
  - 10
  - 10
ratings_average:
  - 5
  - 5
  - 5
dsq_thread_id:
  - 2730063894
categories:
  - С нуля
  - С нуля до RTOS
tags:
  - STM32
  - электроника
---
Внешне не изменится ничего, но мы узнаем много нового. У таймеров STM32 есть собственные выходы, которыми они могут управлять самостоятельно, без прерываний. Несмотря на отсутствие внешних изменений, часто такая возможность очень полезна.

Теперь нам потребуется перейти на другой таймер, потому что на ножке PC8 висит 3 канал 3 таймера. Да, у таймеров в STM32 есть по нескольку каналов, и на каждом из них может происходить что–то своё (конечно, завязанное на период обновления всего таймера).

<!--more-->

## 12. Настройка таймера в режим выхода

И опять знакомый код инициализации. Заводим переменную типа TIM\_OCInitTypeDef, выполняем её инициализацию, проводим собственные настройки, и передаём её в инициализатор таймера TIM\_OC3Init. Вот код:

    TIM_OCInitTypeDef TIM_OCConfig;
    TIM_OCStructInit(&TIM_OCConfig);
    TIM_OCConfig.TIM_OCMode = TIM_OCMode_Toggle;
    TIM_OCConfig.TIM_OutputState = TIM_OutputState_Enable;
    TIM_OC3Init(TIM3, &TIM_OCConfig);

А настройки таковы — OCMode (режим выхода) устанавливаем в Toggle, т.е. при каждом переполнении таймера выходная ножка будет переключаться на противоположное состояние — как и в нашем прошлом примере. OutputState — выход включен/выключен, нам конечно нужно включить. Это не текущее состояние ножки, это &#171;включена связь выхода таймера и выходной ножки&#187;.

## 13. Настройка выходной ножки

А вот тут посложнее, много нового.

Во–первых, нужно использовать режим GPIO\_Mode\_AF\_PP вместо старого GPIO\_Mode\_Out\_PP. AF — это Alternate Function, т.е. выход с альтернативной функцией, не GPIO. Подробнее можно прочитать в [статье про ножки ввода–вывода](http://catethysis.ru/index.php/stm32-%e2%86%92-%d0%bf%d0%be%d1%80%d1%82%d1%8b-gpio/ "STM32 → Порты GPIO").

Во–вторых, раз мы используем такой режим ножки, нужно включить тактирование модуля альтернативных функций. Это такой связующий модуль между периферией вроде таймеров, АЦП/ЦАП, UART, SPI, прочим богатством периферии  и ножками ввода–вывода. Он висит на шине APB2, поэтому код включения выглядит так: RCC\_APB2PeriphClockCmd(RCC\_APB2Periph_AFIO, ENABLE);

## 14. microXplorer

Откуда я узнал, что 3 канал 3 таймера висит на PC8? Из программы microXplorer. Она имеет базу всех микроконтроллеров ST, а также в удобном виде показывает всю периферию.

Нажимаем Shift–S (или меню Tools –> MCUs Selector), выбираем семейство STM32F1, подсемейство STM32F100, и видим в списке внизу наш контроллер, STM32F100R(8-B)Tx. Буква/цифра перед T не играет никакой роли для периферии, она показывает объём памяти — поэтому все варианты объединены. Важен лишь тип корпуса — от него зависит количество ножек и объём доступной периферии.

<img alt="" src="http://static.catethysis.ru/files/STM32_lessons_TIM_microxplorer_mcu_select.png" width="534" height="348" />

Выбираем кристалл, открывается его внешний вид с ногами. Нажимаем на ножку PC8 — и видим список функций, доступных на этой ножке.

![](http://static.catethysis.ru/files/STM32_lessons_TIM_microxplorer_PC8_list.png)

Как видим, в списке есть TIM3_CH3 — третий канал третьего таймера. Но не торопимся нажимать на этот пункт. Попробуем сначала выбрать в меню слева TIM3 в режиме Forced–Output (а это именно тот режим, который нам нужен).

<img alt="" src="http://static.catethysis.ru/files/STM32_lessons_TIM_microxplorer_TIM3.png" width="457" height="480" />

Чудеса! Почему microXplorer поставил все каналы таймера на ножки PB0, PB1, PA6 и PA7, если только что показывал что TIM3_CH3 висит на PC8? Дело в том, что у многой периферии пины можно переставлять на другие места — ремапить. Более того, ремапить можно не полностью а частично, к примеру 3 и 4 канал оставить на месте, а 1 и 2 перенести на PB5 и PB4. Вы можете это увидеть, нажав Ctrl и попробовав перемещать выделенные ноги.

## 15. Ремапим пины таймера TIM3

Значит, нам потребуется ещё и ремапить пины таймера. К счастью, делается это очень просто: GPIO\_PinRemapConfig(GPIO\_FullRemap_TIM3, ENABLE); — используем полный ремап, он перенесёт 3 канал 3 таймера на нужную нам ножку PC8. Ремаппинг — очень полезная вещь, часто она помогает очень удобно разводить платы, и даже когда плата уже почти готова и внезапно нужно что–то добавить — порой он спасает от полной переразводки.

## 16. Код

Заодно и наведём порядок в коде, разнесём всё по функциям.

    #include "stm32f10x_conf.h"
    
    void init_GPIO()
    {
      RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOC, ENABLE);
    
      GPIO_InitTypeDef GPIO_InitStructure;
      GPIO_StructInit(&GPIO_InitStructure);
      GPIO_InitStructure.GPIO_Speed = GPIO_Speed_2MHz;
      GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;
      GPIO_InitStructure.GPIO_Pin = GPIO_Pin_8;
      GPIO_Init(GPIOC, &GPIO_InitStructure);
    
      RCC_APB2PeriphClockCmd(RCC_APB2Periph_AFIO, ENABLE);
      GPIO_PinRemapConfig(GPIO_FullRemap_TIM3, ENABLE);
    }
    
    void init_TIM()
    {
      RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);
    
      TIM_TimeBaseInitTypeDef TIM_InitStructure;
      TIM_TimeBaseStructInit(&TIM_InitStructure);
      TIM_InitStructure.TIM_Prescaler = 24000;  
      TIM_InitStructure.TIM_Period = 1000; 
      TIM_TimeBaseInit(TIM3, &TIM_InitStructure);
    
      TIM_OCInitTypeDef TIM_OCConfig;
      TIM_OCStructInit(&TIM_OCConfig);
      TIM_OCConfig.TIM_OCMode = TIM_OCMode_Toggle;
      TIM_OCConfig.TIM_OutputState = TIM_OutputState_Enable;
      TIM_OC3Init(TIM3, &TIM_OCConfig);
    
      TIM_Cmd(TIM3, ENABLE);
    }
    
    void main()
    {
      init_GPIO();
      init_TIM();
      while(1) ;
    }

Всё работает, и можно <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://static.catethysis.ru/files/STM32_Projects_3_TIM2.rar" >скачать архив с этим проектом</a>.

Весь цикл:
  
[1. Порты ввода–вывода](http://catethysis.ru/index.php/stm32-from_zero_to_rtos-1_gpio/ "STM32 — с нуля до RTOS. 1: Порты ввода–вывода")
  
[2. Таймер и прерывания](http://catethysis.ru/index.php/stm32-from_zero_to_rtos-2_timers/ "STM32 — с нуля до RTOS. 2: Таймер и прерывания")
  
3. Выходы таймера
  
[4. Внешние прерывания и NVIC](http://catethysis.ru/index.php/stm32-from_zero_to_rtos-4_exti_nvic/ "STM32 — с нуля до RTOS. 4: Внешние прерывания и NVIC")
  
[5. Ставим FreeRTOS](http://catethysis.ru/index.php/freertos_stm32f100_iar/ "Установка FreeRTOS на STM32F100 в IAR")