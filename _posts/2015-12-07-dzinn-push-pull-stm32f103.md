---
id: 2775
title: Push-Pull преобразователь с использованием STM32F103
date: 2015-12-07T03:29:33+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2775
permalink: /dzinn-push-pull-stm32f103/
wp_noextrenallinks_mask_links:
  - 0
ratings_users:
  - 3
ratings_score:
  - 15
ratings_average:
  - 5
dsq_thread_id:
  - 4381691392
categories:
  - STM32
  - Питание
  - Электроника
---
Автор: Dzinn

## Введение

Так уж сложилось, что интересная тема в вузе потребовала собрать интересный импульсный блок питания. До этого момента, автор уже много раз собирал однотактные преобразователи: прямоходовые и обратноходовые, на основе микроконтроллеров STM32F031 и STM32F103 и собственных печатных плат. Но тут встал вопрос с двухтактными преобразователями, которые требуют принципиально другого управления, что первоначально поставило в тупик. Решение ряда проблем, с которыми столкнулся автор приведено в данной статье.

## Железо

Так уж случилось, что силовые платы разводить приходится с завидным постоянством, поэтому немного думая, использую компоненты, которых было навалом от старых проектов, была собрана простенькая отладочная плата для проверки расчетов и подготовке к «большому проекту». Схема предоставлена на рис.1, разводка платы на рис.2, и получившийся внешний вид на рис.3.

<img class="alignnone size-full wp-image-2777" src="http://catethysis.ru/wp-content/uploads/2015/12/1.jpg" alt="1" width="982" height="415" />
  
Рис.1. Схемотехническое описание отладочной платы

<!--more-->

<img class="alignnone size-full wp-image-2778" src="http://catethysis.ru/wp-content/uploads/2015/12/2.jpg" alt="2" width="874" height="342" />
  
Рис.2. Разводка печатной отладочной платы

<img class="alignnone size-full wp-image-2779" src="http://catethysis.ru/wp-content/uploads/2015/12/3.jpg" alt="3" width="755" height="505" />
  
Рис.3. Трёхмерная модель отладочной платы

Плата была изготовлена методом ЛУТ. В ней нет ничего сложного и необычного, кроме, пожалуй, рабочих частот: фронт сигнала в менее 0.3 мкс при рабочей частоте в 24 кГц. Для импульсного блока питания это крошечная величина, но автору вполне хватало. Радиаторы для полевых транзисторов IRFZ44N так и не потребовались, так как в схеме будут значительно быстрее перегреваться диоды.

Честно признаюсь, что данная плата у меня сгорела при нагрузке всего 80 Вт. Так что если захотите до мелочей повторить со своими разработками, то будьте аккуратнее. А на самом деле предельный ток в данном устройстве в 10 ампер потребовал наличия небольшого радиатора на транзисторах, впрочем как и снижения частоты (нагрузка на диоды).

## Управляющий контроллер

Подключалось это всё к собственной <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/https://vk.com/wall-51756903?offset=60&w=wall-51756903_791" >отладочной плате</a> на базе STM32F103C8T6. Конечно, можно использовать китайские аналоги, но так как я много работаю на данных чипах, потребовалась плата для отточки схемотехники подключения данного чипа + требовалась приличная разводка аналоговой части, которой обычно лишены китайские братья. Внешний вид платы приведён на рис.4.

<img class="alignnone size-full wp-image-2782" src="http://catethysis.ru/wp-content/uploads/2015/12/7.jpg" alt="7" width="604" height="340" />
  
Рис.4. Отладочная плата на базе STM32F103 собственной разработки

Силовая часть подключалась к РВ0 и РВ1, которые являются выводами 3-го таймера. Это таймер общего назначения. Самый обычный таймер. Выбран был просто из-за удобства расположения на плате. То, что описано далее можно с лёгкостью провернуть на любом другом таймере, вплоть до TIM1 (Advanced-control timer).

## Программирование

Для начала пришлось разогнать контроллер до 48 МГц. Это делалось следующим куском кода:

<pre><code class="cpp">void Rcc_INIT_new()
{
    //PLL
    RCC-&gt;CFGR &= ~RCC_CFGR_PLLSRC;
    RCC-&gt;CR &= ~RCC_CR_PLLON;
    RCC-&gt;CFGR &= ~RCC_CFGR_SW;;
    RCC-&gt;CFGR |= RCC_CFGR_SW_PLL;
    RCC-&gt;CFGR &= ~RCC_CFGR_PLLMULL;
    RCC-&gt;CFGR |= RCC_CFGR_PLLMULL12;
    RCC-&gt;CR |= RCC_CR_PLLON;
    while((RCC-&gt;CR & RCC_CR_PLLRDY)==0) {}
}
</code></pre>

Конечно, можно расписать, что значит каждая приведённая строчка, но этим просто завалены отечественные сайты, уделим время более уникальным вещам. Заметим, для тех кому лень лезть по форумам и «обучающим сайтам», что основная регулировка производится настройкой <code class="cpp">RCC_CFGR_PLLMULL(Х)</code>.

Далее встала следующая, и собственно основная проблема, довольно слабо описанная в отечественном интернете: создание импульсов формы, показанной на Рис.5.

<img class="alignnone size-full wp-image-2780" src="http://catethysis.ru/wp-content/uploads/2015/12/5.jpg" alt="5" width="1102" height="560" />
  
Рис.5. Требуемая форма импульсов для push-pull преобразователя.

Все описания работы с таймерами имеют существенный косяк: они начинают(заканчивают) фронт сигнала синхронно с нулём работы таймера. В данном типе преобразователей(двухтактные), это совершенно не допустимо. В результате:

  1. Делать ногодрыг для управления силовой частью не хотелось (подразумевается повесить на контроллер неплохую математику для обработки параметров)
  2. Общественные примеры использования таймеров в режиме PWM делать нужные формы импульсов не позволяют, если конечно каждый раз не перенастраивать таймер.

В результате открыли manual по PWM, и нашли следующую чудесную вещь: синхронизация импульсов PWM центру. Это ровно то, что нужно, так как позволяет делать импульсы следующим образом + регулировка производится очень удобно (см рис.6). При правильной настройке правда придётся держать две настройки PWM каналов, так как один канал должен быть прямым, а другой инверсным. Это конечно потребует памяти, но немного.

<img class="alignnone size-full wp-image-2781" src="http://catethysis.ru/wp-content/uploads/2015/12/6.jpg" alt="6" width="1037" height="394" />
  
Рис.6. Форма импульсов при синхронизации по центру импульса. Заштрихованы области, которые добавляются при увеличении времени импульса.

Как легко заметить, остаётся важное правило: половина периода между началами импульсов в линиях. Аналогичный принцип работает с любыми двухтактными преобразователями: полумост и мост.

## Реализация

Вся реализация разбилась на две функции и константы:

  1. Две выделенных константы типа TIM\_OCInitTypeDef и TIM\_OCInitTypeDef2.
  2. Инициализация со стоповыми параметрами. Это делается для того, чтобы после инициализации блок питания блок питания не начал работать. Запуск инициируется установкой функции на нужное значение скважности.
  3. Функция регулировки скважности. Важно, чтобы значение скважности были ниже, чем 0.45.

Всё реализовано с помощью библиотек SPL. У меня конечно в планах переписать потом под CMSIS, но пока по старинке решил набросать под SPL.

Инициализация с комментариями:

<pre><code class="cpp">void PWM_Out()
{
    GPIO_InitTypeDef port;
    TIM_TimeBaseInitTypeDef TIM_TimeBaseStructure;

    //Port init for working with PWM

    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE);

    port.GPIO_Mode = GPIO_Mode_AF_PP;
    port.GPIO_Pin = (GPIO_Pin_6 | GPIO_Pin_7);
    port.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(GPIOA, &port);

    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB, ENABLE);

    port.GPIO_Mode = GPIO_Mode_AF_PP;
    port.GPIO_Pin = (GPIO_Pin_0|GPIO_Pin_1);
    port.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_Init(GPIOB, &port);

    // Global TIM Init

    RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);

    TIM_TimeBaseStructure.TIM_Prescaler = 0;
    TIM_TimeBaseStructure.TIM_CounterMode = TIM_CounterMode_CenterAligned1;
    //this is the main string. It configures TIM3 for synchronization signal center
    TIM_TimeBaseStructure.TIM_Period = 1000; // this if durty cykle. It must be less then 0.45
    TIM_TimeBaseStructure.TIM_ClockDivision = 0;
    TIM_TimeBaseStructure.TIM_RepetitionCounter = 0;

    TIM_TimeBaseInit(TIM3, &TIM_TimeBaseStructure);

    //Init LINE 1

    TIM_OCInitStructure.TIM_OCMode = TIM_OCMode_PWM1;
    TIM_OCInitStructure.TIM_OutputState = TIM_OutputState_Enable;
    TIM_OCInitStructure.TIM_OutputNState = TIM_OutputNState_Enable;
    TIM_OCInitStructure.TIM_OCPolarity = TIM_OCPolarity_High;
    TIM_OCInitStructure.TIM_OCNPolarity = TIM_OCNPolarity_High;
    TIM_OCInitStructure.TIM_OCIdleState = TIM_OCIdleState_Set;
    TIM_OCInitStructure.TIM_OCNIdleState = TIM_OCNIdleState_Reset;

    //------start value of PWM---------------
    TIM_OCInitStructure.TIM_Pulse= 0;
    TIM_OC4Init(TIM3, &TIM_OCInitStructure);

    //Init LINE 1

    TIM_OCInitStructure2.TIM_OCMode = TIM_OCMode_PWM1;
    TIM_OCInitStructure2.TIM_OutputState = TIM_OutputState_Enable;
    TIM_OCInitStructure2.TIM_OutputNState = TIM_OutputNState_Enable;
    TIM_OCInitStructure2.TIM_OCPolarity = TIM_OCPolarity_Low;
    TIM_OCInitStructure2.TIM_OCNPolarity = TIM_OCNPolarity_Low;
    TIM_OCInitStructure2.TIM_OCIdleState = TIM_OCIdleState_Set;
    TIM_OCInitStructure2.TIM_OCNIdleState = TIM_OCNIdleState_Reset;
    TIM_OCInitStructure2.TIM_Pulse= 1000;

    TIM_OC3Init(TIM3, &TIM_OCInitStructure2);
    TIM_OC2Init(TIM3, &TIM_OCInitStructure2);
    TIM_OC1Init(TIM3, &TIM_OCInitStructure2);

    /* TIM3 counter enable */
    TIM_Cmd(TIM3, ENABLE);
    /* TIM3 Main Output Enable */
    TIM_CtrlPWMOutputs(TIM3, ENABLE);
}</code></pre>

И простенькая функция регулировки:

<pre><code class="cpp">void set_pwm(int pwm) //till 1000
{
    TIM_Cmd(TIM3, DISABLE);

    TIM_OCInitStructure.TIM_Pulse = pwm;
    TIM_OCInitStructure2.TIM_Pulse = 1000 - pwm;
    TIM_OC3Init(TIM3, &TIM_OCInitStructure2);
    TIM_OC4Init(TIM3, &TIM_OCInitStructure);

    TIM_Cmd(TIM3, ENABLE);
}</code></pre>

Конечно можно добавить защиту от превышения 0.45 от максимального значения, но если рассматривать в общем случае, то данного кода вполне достаточно. Конечно, в готовом блоке питания необходимо в той или иной мере это предусмотреть.

## Результаты

Фотографии силового модуля:

<img class="alignnone size-full wp-image-2793" src="http://catethysis.ru/wp-content/uploads/2015/12/9.jpg" alt="9" width="2560" height="1442" />
  
Плата силового модуля, вид сверху

<img class="alignnone size-full wp-image-2792" src="http://catethysis.ru/wp-content/uploads/2015/12/8.jpg" alt="8" width="2560" height="1442" />
  
Модуль в сборе с трансформатором

В результате получилось запустить Push-Pull преобразователь с приличным коэффициентом регулирования по напряжению(100 уровней). В настоящее время планируется:

  1. Разработка блока питания с 500-ми уровнями напряжения.
  2. Разработка и сборка приличной платы с возможностью создания блока питания мощностью до 1000Вт по данной схеме, с питанием по первичке 400В.
  3. Борьба с самим трансформатором и компонентами выходной схемы. Дело в том, что трансформатор на выходе выдаёт максимальное напряжение в 800В. Это накладывает кучу ограничений и желаний уменьшить обмотки, увеличив частоту. Но это будет отдельная статья.
  4. Разработка 1 МГц блока питания по схеме Push-pull с низковольтным питанием.

Через какое-то время данные задачи будут решены, а пока у вас появился пример кода для программирования двухтактного преобразователя.

С уважением, <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/https://vk.com/jedikiller" >Dzinn</a>.