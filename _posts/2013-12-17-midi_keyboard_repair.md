---
id: 802
title: Ремонт MIDI-клавиатуры
date: 2013-12-17T06:24:35+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=802
permalink: /midi_keyboard_repair/
notely:
  - 
  - 
  - 
wp_noextrenallinks_mask_links:
  - 0
  - 0
  - 0
ratings_users:
  - 1
  - 1
  - 1
ratings_score:
  - 5
  - 5
  - 5
ratings_average:
  - 5
  - 5
  - 5
dsq_thread_id:
  - 2726264436
categories:
  - Руководства
  - Электроника
tags:
  - STM32
  - электроника
---
Волею судеб у меня оказалась неработающая MIDI-клавиатура M-audio Axiom 49. Попытка ремонта не принесла успеха, и я захотел попробовать сделать для нее самодельную электронику. Ведь такая клавиатура не содержит звукосинтезирующей схемы, а лишь переводит нажатия клавиш в MIDI-формат. Таким образом, единственная ценность такого прибора &#8212; это механика, которая у Axiom 49 очень хороша.

<!--more-->

Первым делом разберем клавиатуру, почистим все контакты от грязи и пыли, и разберемся с ее внутренним устройством.

## Фотографии плат

Разбираем клавиши:

<img class="alignnone" alt="Разобранные клавиши MIDI-клавиатуры M-Audio Axiom 49" src="http://static.catethysis.ru/files/midi_kbd_keys_disassembled.jpg" width="1474" height="828" />

Плата крупным планом:

<img class="alignnone" alt="Плата клавиш MIDI-клавиатуры M-Audio Axiom 49" src="http://static.catethysis.ru/files/midi_kbd_keys_board_top.jpg" width="1474" height="828" />

Плата снизу:

<img class="alignnone" alt="Плата клавиш MIDI-клавиатуры M-Audio Axiom 49 снизу" src="http://static.catethysis.ru/files/midi_kbd_keys_board_bottom.jpg" width="1474" height="828" />

Плата цифровой клавиатуры:

<img class="alignnone" alt="Плата цифровой части MIDI-клавиатуры M-Audio Axiom 49" src="http://static.catethysis.ru/files/midi_kbd_numpad_board.jpg" width="1474" height="828" />

С схемотехнической точки зрения это просто набор из нескольких матричных клавиатур, с которыми мы уже умеем работать через [порты GPIO](http://catethysis.ru/stm32-%e2%86%92-%d0%bf%d0%be%d1%80%d1%82%d1%8b-gpio/ "STM32 → Порты GPIO"). Более того, все эти клавиатуры уже снабжены необходимыми диодами, и нам достаточно просто подключить их все к микроконтроллеру.

Тестовую версию сделаем на макетной плате и отладочной плате STM32Discovery.

Клавиатура оказалась собрана по схеме 12*7: 12 это по две кнопки на каждую клавишу в группе из 6 клавиш (т.е. полуоктава) и 7 таких полуоктав. Точнее, полуоктав 6, а в последней группе только одна клавиша, &#171;до&#187; 5 октавы. Клавиатура обслуживаетя своим контролером, однако мы не знаем алгоритм его работы и протокол связи, поэтому я думаю что его можно выкинуть и сделать все самостоятельно.

От барабанных пэдов выведены все контакты, а &#171;общий&#187; разделен на два &#8212; верхний ряд и нижний. Можно объединить оба общих, и получить организацию 1\*8, а можно объединить ряды пэдов и получить 2\*4. Далее выберем, что будет удобнее.

Цифровая клавиатура организована как 2*7, таблица приведена ниже.

Управляющие кнопки &#8212; 2*8.

Получается, все матричные клавиатуры имеют по 7-8 катодов. Значит, их можно обслуживать все одновременно! К примеру, включаем катод #3 и видим нажатую &#171;ре&#187; первой октавы и третий пэд. Все это сводится к матричной клавиатуре 17*9.

## Работа с клавиатурой

Для начала хотелось бы попробовать адресовать клавиатуру, как самую главную часть девайса. Ну и чтобы увидеть, что всё работает &#8212; приделаем озвучку нажатой клавиши, тон будет генерироваться с помощью [таймера](http://catethysis.ru/stm32-%e2%86%92-%d1%82%d0%b0%d0%b9%d0%bc%d0%b5%d1%80%d1%8b-%e2%86%92-%d1%88%d0%b8%d0%bc/ "STM32 → таймеры → ШИМ").

<pre><code class="cpp">GPIO_InitTypeDef GPIO_InitStructure;
RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE);
RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB, ENABLE);
RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOC, ENABLE);
GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;

GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IPU;
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_2 | GPIO_Pin_3 | GPIO_Pin_4 | GPIO_Pin_5;
GPIO_Init(GPIOC, &GPIO_InitStructure);
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_0 | GPIO_Pin_1 | GPIO_Pin_2 | GPIO_Pin_3 | GPIO_Pin_4 | GPIO_Pin_5 | GPIO_Pin_6 | GPIO_Pin_7;
GPIO_Init(GPIOA, &GPIO_InitStructure);

GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;  
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_10 | GPIO_Pin_8 | GPIO_Pin_9;
GPIO_Init(GPIOC, &GPIO_InitStructure);
GPIO_SetBits(GPIOC, GPIO_Pin_10 | GPIO_Pin_8 | GPIO_Pin_9);
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_8 | GPIO_Pin_9 | GPIO_Pin_10 | GPIO_Pin_11 | GPIO_Pin_12 | GPIO_Pin_13 | GPIO_Pin_14 | GPIO_Pin_15;
GPIO_Init(GPIOA, &GPIO_InitStructure);
GPIO_SetBits(GPIOA, GPIO_Pin_8 | GPIO_Pin_9 | GPIO_Pin_10 | GPIO_Pin_11 | GPIO_Pin_12 | GPIO_Pin_13 | GPIO_Pin_14 | GPIO_Pin_15);

GPIO_InitStructure.GPIO_Speed = GPIO_Speed_2MHz;
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;  
GPIO_InitStructure.GPIO_Pin = GPIO_Pin_0;
GPIO_Init(GPIOB, &GPIO_InitStructure);

RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);
TIM3-&gt;CCER |= TIM_CCER_CC3E;
TIM3-&gt;CCMR2|= TIM_CCMR2_OC3M_0 | TIM_CCMR2_OC3M_1 | TIM_CCMR2_OC3M_2;
TIM3-&gt;PSC = 4;
TIM3-&gt;CR1 |= TIM_CR1_CEN;
int freq=1000;

// Частоты нот первой октавы в десятых долях герца
uint32_t notes[]={1, 2616, 2772, 2937, 3111, 3296, 3492, 3700, 3920, 4153, 4400, 4662, 4939};
uint16_t octave_pins[]={GPIO_Pin_8, GPIO_Pin_9, GPIO_Pin_10, GPIO_Pin_11, GPIO_Pin_12};
int octave=0;
int oct=1;
int sum_notes=0;
while(1)
{
  GPIO_ResetBits(GPIOA, octave_pins[octave]);
  int note=0;
  int state_a=GPIO_ReadInputData(GPIOA);
  int state_c=GPIO_ReadInputData(GPIOC);
  if(!(state_c&GPIO_Pin_4)) note=1;
  if(!(state_a&GPIO_Pin_6)) note=2;
  if(!(state_a&GPIO_Pin_4)) note=3;
  if(!(state_a&GPIO_Pin_2)) note=4;
  if(!(state_a&GPIO_Pin_0)) note=5;
  if(!(state_c&GPIO_Pin_3)) note=6;
  if(note&gt;0) {
    if(octave%2==1) note+=6;
    oct=1&lt;&lt;(octave/2);     TIM3-&gt;ARR= SystemCoreClock/notes[note]/oct;
    TIM3-&gt;CCR3=TIM3-&gt;ARR/40;
  }
  GPIO_SetBits(GPIOA, GPIO_Pin_8 | GPIO_Pin_9 | GPIO_Pin_10 | GPIO_Pin_11 | GPIO_Pin_12 | GPIO_Pin_13 | GPIO_Pin_14 | GPIO_Pin_15);
  sum_notes+=note;
  octave++; if(octave&gt;4) { octave=0; if(sum_notes==0) TIM3-&gt;CCR3=0; sum_notes=0; }
  Delay(10000);
}</code></pre>

Непривычно длинный код, по сравнению с возможностями библиотеки [itacone](http://catethysis.ru/stm32-itacone-library/ "Библиотека для STM32 — itacone") <img src="http://catethysis.ru/wp-includes/images/smilies/icon_smile.gif" alt=":)" class="wp-smiley" />

Не стоит ожидать от этой программы чего-то интересного &#8212; это одноголосый синтезатор с прямоугольным сигналом, и без всяческих манипуляций с огибающей звука. Однако он даёт понять, что мы на правильном пути.