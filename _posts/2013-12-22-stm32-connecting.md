---
id: 886
title: STM32 → Подключение
date: 2013-12-22T03:31:23+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=886
permalink: /stm32-connecting/
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
notely:
  - 
  - 
  - 
wp_noextrenallinks_mask_links:
  - 0
  - 0
  - 0
dsq_thread_id:
  - 2726619044
categories:
  - Справочник
tags:
  - STM32
  - электроника
---
Минимальный рабочий набор, который даст вам прошить и запустить любой микроконтроллер STM32.

<!--more-->

Микроконтроллер STM32 требует для подключения не так много, как к примеру серия LPC &#8212; однако, и здесь есть свои тонкости. Разобьём все требования по группам.

## Питание

Необходимо обеспечить микроконтроллер питанием &#8212; Vdd и GND. Сложность заключается в том, что:

  1. В микросхеме обычно есть несколько линий Vdd и GND. Линии GND внутри кристалла соединены очень тонкими проводами, лишь для уравнивания потенциалов &#8212; по ним не может течь большой ток. Линии Vdd же зачастую вообще не соединены, и питают только свою отдельную часть микросхемы. Поэтому обязательно нужно **соединить все контакты Vdd и GND** микросхемы.
  2. Также обычно есть линии питания аналоговой части &#8212; AVdd и AGND. Их тоже нельзя оставлять без питания, подключите их к источнику опорного напряжения или к Vdd/GND, если требования к точности АЦП невысоки.
  
    Ни в коем случае не забывайте это сделать, МК не запустится без питания аналоговой части. В даташитах и Reference manuals этому факту не уделено никакого внимания, однако опыт показывает что это так.

## Сброс

В общем случае линия сброса не должна висеть в воздухе. Однако, она подтянута внутренним слабым резистором к &#171;+&#187;, и исключительно для тестовых целей её можно оставить висящей. Конечно, идеальным решением будет применение специальных микросхем сброса &#8212; супервизора питания или формирователя сигнала сброса. Кстати, по умолчанию после сброса все [ножки GPIO](http://catethysis.ru/stm32-%e2%86%92-%d0%bf%d0%be%d1%80%d1%82%d1%8b-gpio/ "STM32 → Порты GPIO") отключены для экономии питания, но есть и побочный положительный эффект: даже если они случайно замкнуты на землю или питание &#8212; КЗ не случится.

## Помехи

В схемах с такой высокой скоростью работы становятся важными помехи от внешних и внутренних источников. Ведь при работе на 168МГц внутри микроконтроллера 168 миллионов раз в секунду переключаются миллионы транзисторов &#8212; все они, конечно, генерируют большое количество помех по питанию. Более того, эти помехи рождаются прямо внутри микросхемы, и действуют на неё же внутри &#8212; единственная для нас возможность как-то на них повлиять это установка хороших конденсаторов сразу возле корпуса микросхемы.

Что такое хорошие конденсаторы? Конечно, желательно плёночные, но в формате SMD их не бывает. Поэтому используем стандартные SMD-конденсаторы, но ставим их парами &#8212; я обычно применяю 10мкФ + 100нФ.

Зачем ставить маленький конденсатор параллельно большому, ведь их ёмкости сложатся? Маленький конденсатор имеет гораздо меньшее значение ESR (последовательного сопротивления), и сможет значительно быстрее реагировать на резкие изменения тока потребления и лучше сглаживать резкие выбросы. Большой же конденсатор обеспечит МК стабильным током, не зависящим от длины и индуктивности линии питания.
  
Большой конденсатор подобен катапульте, он &#171;бьёт по площадям&#187;, но не обладает достаточной маневренностью для близкого контакта; маленький конденсатор не имеет большой силы, но благодаря своей проворности успевает отразить натиск мелких и резких помех.

В случае подключения AVdd к Vdd я также советую сделать хотя бы простой фильтр в виде пары конденсаторов вблизи AVdd и AGND (если есть AGND, если нет &#8212; подключите конденсаторы между AVdd и GND).

## Режим загрузки

Все микроконтроллеры STM32 поддерживают несколько режимов загрузки &#8212; из пользовательского Flash, из RAM и из внешней памяти. Самый распространённый режим &#8212; это, конечно, загрузка из Flash. Он соответствует конфигурации BOOT0=0, BOOT1=0 &#8212; т.е. подключаем оба контакта BOOT к земле. Эти выводы не имеют подтяжек к линиям питания, поэтому их нельзя оставлять плавающими.

Также есть возможность загрузки встроенного бутлоадера, и приём прошивки через [UART](http://catethysis.ru/stm32-%e2%86%92-uart-usart/ "STM32 → UART / USART") или USB, но пока не будем этого касаться.

## Итого

Таким образом, минимальный рабочий набор для микроконтроллера STM32F050F4P6 &#8212; это 1 и 15 контакты на землю, а 5 и 16 &#8212; на +3.3В.

Для прошивки &#8212; 19 контакт подключите к SWDIO программатора, а 20 &#8212; к SWCLK. Землю программатора подключите к земле контроллера.