---
id: 2054
title: 'STM32: генератор синусоидального сигнала на TIM и DMA'
date: 2014-10-30T15:57:05+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2054
permalink: /stm32-tim-dma-pwm-sin/
ratings_users:
  - 6
ratings_score:
  - 29
ratings_average:
  - 4.83
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 3172371092
categories:
  - Готовые девайсы
---
Мне потребовалось сделать генератор синуса с помощью ШИМ для управления силовым двухфазным мостом из мощных высоковольтных полевых транзисторов. Я ранее писал про модули STM32 [TIM/PWM](http://catethysis.ru/stm32-timers-pwm/ "STM32 → таймеры → ШИМ") (таймер, включенный в режиме ШИМ с двумя выходами) и [DMA](http://catethysis.ru/stm32_dma/ "STM32 → DMA") (модуль прямого доступа к памяти), каждому из которых я посвятил отдельную подробную статью.

Просто используя оба этих модуля, очень легко сделать такой генератор синуса, не расходующий ресурсы процессора.

<!--more-->

Вспомним принципы управления силовым мостом. Мост состоит из двух стоек (1 и 2) с транзисторами, нижним (&#171;холодным&#187;, L = low) и верхним (&#171;горячим&#187;, H = high).

  * Нижний транзистор постоянно находится под потенциалом земли, на его затвор нужно подавать 10-20 вольт (относительно земли) для открытия и 0 для закрытия.
  * Верхний транзистор примерно 50% времени находится под потенциалом питания, и в моих условиях это около 500 вольт. На его затвор необходимо подавать 0/20 вольт относительно его истока, т.е. относительно земли это 500/520 вольт.

Для того, чтобы через нагрузку моста шёл 50 Гц переменный ток без постоянной составляющей, необходимо:

  1. 10 миллисекунд пропускать ток в одну сторону, включив H1 и L2;
  2. 10 миллисекунд пропускать ток в другую сторону, включив H2 и L1;

Более того, чтобы этот ток был синусоидальным, нужно постоянно регулировать проводимость моста. Понятно, что линейный режим тут неприменим (иначе на мосте будет выделяться такая же тепловая мощность, как на нагрузке), поэтому используем ключевой режим с ШИМ-модуляцией.

В самом начале полупериода, когда значение синуса лишь немного выше нуля, будем подавать на транзистор L2 ШИМ-сигнал с минимальной скважностью, и постепенно будем её увеличивать. В момент pi/4 (т.е. 5 миллисекунд) после начала полупериода скважность должна дойти до максимума, и начать спадать. Весь этот полупериод должен быть постоянно включен транзистор H1, а H2 и L1 должны быть выключены.

Второй полупериод &#8212; всё точно так же, только стойки меняются местами, и так мы обеспечиваем обратный ток.

Конечно, я намеренно опустил множество деталей, начиная от генерации высокого напряжения 520 вольт, заканчивая дэд-таймом и динамическими потерями, но суть управления я примерно описал. Приступим к рассмотрению алгоритма!

## Алгоритм работы

При старте программы сразу заполним массив значениями синуса. Главный принцип динамического программирования: никогда не вычисляй заново то, что ты уже вычислял. Так и здесь, нет смысла перевычислять значения синуса на каждом шаге, можно просто свести их в таблицу.

Далее, настроим таймер на работу с двумя выходами в ШИМ-режиме. Я использую таймер TIM3, все его 4 выхода мне потребуются. Распределил по транзисторам я их так:

  1. tim3.1 &#8212; L1
  2. tim3.2 &#8212; H1
  3. tim3.3 &#8212; L2
  4. tim3.4 &#8212; H2

Как я писал ранее, выходы таймера очень гибко конфигурируются, допуская множество вариантов. Мы используем три варианта: выход ШИМ, жёсткий 0 и жёсткая 1 на выходе.
  
В самом начале все выходы настроены на 0. Также здесь мы настроим скорость работы таймера.

Настройка DMA сводится к выбору нужных каналов DMA (это 6 канал для tim3.1 и 2 канал для tim3.3), указанию адреса массива-источника и адреса регистра-приёмника (&TIM3->CCR1, &TIM3->CCR3), включению прерываний и разрешению их работы.

## Готовая программа

<pre><code class="cs">#include "math.h"

#define CPU_Freq 24000000	// частота ядра микроконтроллера
#define PWM_Freq 20000   	// частота модуляции
#define MOD_Freq 50      	// частота переменного тока

#define steps		(PWM_Freq/MOD_Freq/2)
#define precision	(CPU_Freq/PWM_Freq/2)
#define pi		3.1415926535

uint16_t sin_ar[steps];

void fill_sine()
{
	for(int i = 0; i&lt;steps; i++)
 		sin_ar[i] = (uint16_t)(fabs(sin((i + 2) * pi / steps)) * precision); 
} 

void init_SW() 
{ 
	fill_sine(); 
} 

void init_DMA() 
{ 
	RCC-&gt;AHBENR |= RCC_AHBENR_DMA1EN;
	DMA1_Channel6-&gt;CPAR = (uint32_t) &TIM3-&gt;CCR1;
	DMA1_Channel2-&gt;CPAR = (uint32_t) &TIM3-&gt;CCR3;
	DMA1_Channel6-&gt;CMAR = (uint32_t) &sin_ar[0];
	DMA1_Channel2-&gt;CMAR = (uint32_t) &sin_ar[0];
	DMA1_Channel6-&gt;CNDTR = steps;
	DMA1_Channel2-&gt;CNDTR = steps;
	DMA1_Channel6-&gt;CCR = DMA_CCR6_MINC | DMA_CCR6_CIRC | DMA_CCR6_DIR | DMA_CCR6_EN | DMA_CCR6_MSIZE_0 | DMA_CCR6_PSIZE_0;
	DMA1_Channel2-&gt;CCR = DMA_CCR2_MINC | DMA_CCR2_CIRC | DMA_CCR2_DIR | DMA_CCR2_EN | DMA_CCR2_MSIZE_0 | DMA_CCR2_PSIZE_0;
	DMA_ITConfig(DMA1_Channel6, DMA_IT_TC, ENABLE);
	DMA_ITConfig(DMA1_Channel2, DMA_IT_TC, ENABLE);
	NVIC_EnableIRQ(DMA1_Channel6_IRQn);
	NVIC_EnableIRQ(DMA1_Channel2_IRQn);
}

void init_TIM()
{
	RCC-&gt;APB1ENR |= RCC_APB1ENR_TIM3EN;
	TIM3-&gt;CCER   |= TIM_CCER_CC1E | TIM_CCER_CC2E | TIM_CCER_CC3E | TIM_CCER_CC4E;
	TIM3-&gt;CCMR1  |= TIM_CCMR1_OC1M_2 | TIM_CCMR1_OC1M_1 | TIM_CCMR1_OC1PE | TIM_CCMR1_OC2M_2 | TIM_CCMR1_OC2PE;
	TIM3-&gt;CCMR2  |= TIM_CCMR2_OC3M_2 | TIM_CCMR2_OC3PE | TIM_CCMR2_OC4M_2 | TIM_CCMR2_OC4M_1 | TIM_CCMR2_OC4PE;
	TIM3-&gt;DIER   |= TIM_DIER_CC1DE | TIM_DIER_CC3DE;
	TIM3-&gt;CR1    |= TIM_CR1_CEN | TIM_CR1_ARPE;
	TIM3-&gt;PSC = 1;
	TIM3-&gt;ARR = precision;
	TIM3-&gt;CCR1 = precision;
	TIM3-&gt;CCR4 = precision;
	DBGMCU-&gt;CR |= DBGMCU_CR_DBG_TIM3_STOP;
}

void init_GPIO()
{
	RCC-&gt;APB2ENR |= RCC_APB2ENR_IOPBEN | RCC_APB2ENR_AFIOEN;

	AFIO-&gt;MAPR &= ~AFIO_MAPR_SWJ_CFG;
	AFIO-&gt;MAPR |= AFIO_MAPR_TIM3_REMAP_PARTIALREMAP | AFIO_MAPR_SWJ_CFG_JTAGDISABLE;
	
	GPIOB-&gt;CRL &= ~GPIO_CRL_CNF4 & ~GPIO_CRL_CNF5 & ~GPIO_CRL_CNF0 & ~GPIO_CRL_CNF1;
	GPIOB-&gt;CRL |=  GPIO_CRL_CNF4_1 | GPIO_CRL_MODE4_0 | GPIO_CRL_CNF5_1 | GPIO_CRL_MODE5_0 | GPIO_CRL_CNF0_1 | GPIO_CRL_MODE0_0 | GPIO_CRL_CNF1_1 | GPIO_CRL_MODE1_0;
}

int8_t a = 1, b = 0;

void DMA1_Channel6_IRQHandler(void)
{
	DMA_ClearITPendingBit(DMA1_IT_TC6);
	if(a) TIM3-&gt;CCMR1 &= ~TIM_CCMR1_OC2M_0 & ~TIM_CCMR1_OC1M_1;
	else  TIM3-&gt;CCMR1 |=  TIM_CCMR1_OC2M_0 |  TIM_CCMR1_OC1M_1;
	a = 1 - a;
}

void DMA1_Channel2_IRQHandler(void)
{
	DMA_ClearITPendingBit(DMA1_IT_TC2);
	if(b) TIM3-&gt;CCMR2 &= ~TIM_CCMR2_OC4M_0 & ~TIM_CCMR2_OC3M_1;
	else  TIM3-&gt;CCMR2 |=  TIM_CCMR2_OC4M_0 |  TIM_CCMR2_OC3M_1;
	b = 1 - b;
}

void init_HW()
{
	init_GPIO();
	init_TIM();
	init_DMA();
}

void main()
{
	init_SW();
	init_HW();
	
	while(1);
}</code></pre>

В главном цикле мы запускаем инициализацию софта (заполнение массива значениями синуса) и железа (настройка ног, таймера и DMA), и входим в бесконечный цикл. После обработки каждой полуволны канал DMA вызывает прерывание, в котором мы отправляем 1 на верхний транзистор и ШИМ на противоположный нижний, а другие два транзистора отключаем. Потом переключаем стойки.

Можете посмотреть сигнал [осциллографом ](http://catethysis.ru/red-pitaya_arrived/ "Приехала плата Red Pitaya")на контактах PB0 и PB4. Я получил такую картину:

[<img class="alignnone size-full wp-image-2058" src="http://catethysis.ru/wp-content/uploads/2014/10/sin_pwm.png" alt="sin_pwm" width="1330" height="723" />](http://catethysis.ru/wp-content/uploads/2014/10/sin_pwm.png)

Не правда ли, очень похоже на ШИМ-синус? После фильтрации он станет очень красивым. Осциллограф не показал самые тонкие пики в максимумах и минимумах синусоид, но они там есть &#8212; при более сильном увеличении их видно. Четверти синусоид совершенно симметричны, я специально сидел и измерял длительности импульсов с блокнотом  <img src="http://catethysis.ru/wp-includes/images/smilies/icon_smile.gif" alt=":)" class="wp-smiley" />Тонкий пик немного позже середины полупериода &#8212; всего лишь влияние недостаточной частоты дискретизации осциллографа, на самом деле там гораздо больше пиков, и они расположены симметрично.

Тот же самый сигнал на осциллографе с бОльшей частотой дискретизации:

[<img class="alignnone size-full wp-image-2089" src="http://catethysis.ru/wp-content/uploads/2014/10/B10xyLFIEAAmRre.jpg-large.jpg" alt="B10xyLFIEAAmRre.jpg large" width="1024" height="576" />](http://catethysis.ru/wp-content/uploads/2014/10/B10xyLFIEAAmRre.jpg-large.jpg)

Тут видно что сигнал совершенно симметричен.

За кадром осталось очень многое &#8212; подстройка частоты и мощности, слежение за состоянием нагрузки, разнообразные защиты и прочая обратная связь. Незанятый главный цикл очень поможет нам реализовать всё это, не мешая устойчивой генерации ШИМ-синуса.

## Улучшения

Иногда имеет смысл делать качающуюся частоту. В моём коде это тоже можно сделать, правда это немного разрушит всё красоту &#8212; теперь мы будем заново заполнять буфер синусов пере каждой полуволной, рассчитывая таблицу под новую частоту. В принципе, это не так уж сильно потратит ресурсы, но всё-таки лучше все эти таблицы тоже рассчитать заранее.