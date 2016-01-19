---
id: 819
title: STM32 → таймеры → ШИМ
date: 2013-12-17T06:12:23+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=819
permalink: /stm32-timers-pwm/
notely:
  - 
  - 
  - 
wp_noextrenallinks_mask_links:
  - 0
  - 0
  - 0
ratings_users:
  - 8
  - 8
  - 8
ratings_score:
  - 36
  - 36
  - 36
ratings_average:
  - 4.5
  - 4.5
  - 4.5
dsq_thread_id:
  - 2727669949
categories:
  - Справочник
tags:
  - STM32
  - электроника
---
В микроконтроллерах STM32 есть несколько таймеров, способных работать в режиме широтно-импульсной модуляции. Такой функциональностью обладают все таймеры, кроме Basic timers (TIM6 и TIM7).

<!--more-->

Приведу пример использования таймера TIM3 в этом режиме.

<pre><code class="cpp">// Включаем порт ввода-вывода и настраиваем ножку PB0
RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB, ENABLE);
GPIO_InitStructure.GPIO_Speed = GPIO_Speed_2MHz;
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;  
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_0;
GPIO_Init(GPIOB, &GPIO_InitStructure);

// Включаем тактирование таймера
RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);

// Настраиваем таймер на использование 3 канала (т.е. контакта PB0)
TIM3-&gt;CCER |= TIM_CCER_CC3E;

// Переводим 3 канал в режим ШИМ2
TIM3-&gt;CCMR2|= TIM_CCMR2_OC3M_0 | TIM_CCMR2_OC3M_1 | TIM_CCMR2_OC3M_2;

// Настраиваем прескалер
TIM3-&gt;PSC = 10;

// Настраиваем период таймера = 1000 циклов
TIM3-&gt;ARR = 1000;

// Настраиваем скважность = 200 циклов
TIM3-&gt;CCR3 = 200;

// Включаем таймер
TIM3-&gt;CR1 |= TIM_CR1_CEN;
</code></pre>

Всё, этого достаточно для того, чтобы на [В микроконтроллерах STM32 есть несколько таймеров, способных работать в режиме широтно-импульсной модуляции. Такой функциональностью обладают все таймеры, кроме Basic timers (TIM6 и TIM7).

<!--more-->

Приведу пример использования таймера TIM3 в этом режиме.

<pre><code class="cpp">// Включаем порт ввода-вывода и настраиваем ножку PB0
RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB, ENABLE);
GPIO_InitStructure.GPIO_Speed = GPIO_Speed_2MHz;
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;  
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_0;
GPIO_Init(GPIOB, &GPIO_InitStructure);

// Включаем тактирование таймера
RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);

// Настраиваем таймер на использование 3 канала (т.е. контакта PB0)
TIM3-&gt;CCER |= TIM_CCER_CC3E;

// Переводим 3 канал в режим ШИМ2
TIM3-&gt;CCMR2|= TIM_CCMR2_OC3M_0 | TIM_CCMR2_OC3M_1 | TIM_CCMR2_OC3M_2;

// Настраиваем прескалер
TIM3-&gt;PSC = 10;

// Настраиваем период таймера = 1000 циклов
TIM3-&gt;ARR = 1000;

// Настраиваем скважность = 200 циклов
TIM3-&gt;CCR3 = 200;

// Включаем таймер
TIM3-&gt;CR1 |= TIM_CR1_CEN;
</code></pre>

Всё, этого достаточно для того, чтобы на](http://catethysis.ru/stm32-%e2%86%92-%d0%bf%d0%be%d1%80%d1%82%d1%8b-gpio/ "STM32 → Порты GPIO") появился ШИМ-сигнал. Как это сделано?
  
Таймер получает тактовые импульсы с шины APB, чья частота в два раза меньше частоты ядра (24МГц в нашем случае) (ссылка на RCC), и они проходят через прескалер, настроенный нами на 10 &#8212; т.е. получается 1.2МГц. Таймер настроен на отсчёт 1000 тактов, после которых берёт новое значение из регистра ARR, которое мы не изменяем &#8212; т.е. те же 1000, это период ШИМ-сигнала. В начале цикла таймер выводит в выход &#171;1&#187;, а спустя 200 тактов сбрасывает в &#171;0&#187; &#8212; это скважность ШИМ.