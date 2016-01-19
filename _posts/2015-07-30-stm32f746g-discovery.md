---
id: 2473
title: Анбоксинг и обзор STM32F746G-Discovery — новой отладочной платы от ST
date: 2015-07-30T20:03:49+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2473
permalink: /stm32f746g-discovery/
wp_noextrenallinks_mask_links:
  - 0
ratings_users:
  - 5
ratings_score:
  - 25
ratings_average:
  - 5
dsq_thread_id:
  - 3986980415
categories:
  - STM32
  - Без рубрики
tags:
  - ST_сотрудничество
---
Итак, у меня есть самая топовая плата STM32F746G-Discovery с процессором новой серии F7, и это — первый в России обзор этой платы. Её пока нет ни у кого больше.

[<img class="alignnone size-full wp-image-2475" src="http://catethysis.ru/wp-content/uploads/2015/07/packed.jpg" alt="packed" width="698" height="1034" />](http://catethysis.ru/wp-content/uploads/2015/07/packed.jpg)

Плата приехала в обычном пластмассовом кейсе, как и все другие платы Дискавери. Сбоку есть краткий перечень её фич:

  * Процессор STM32F746NGH6 — TFBGA-216, 216 мегагерц и 462 DMIPS.
  * Самый новый программатор/отладчик ST-Link/V2.1, которого раньше не было ни в одной Дискавери.
  * WQVGA TFT ЖК-дисплей диагональю 4.3 дюйма и ёмкостным тач-скрином
  * 128 Мбит SDRAM (из них доступно только 64) и 128 Мбит Flash, подключенная по Quad-SPI
  * Поддержка S/PDIF, стоит крутой аудиокодек и два MEMS-микрофона
  * 3 USB-порта (порт программатора, USB-FS и USB-HS)
  * Гнездо microSD карты
  * Аудио вход и выход
  * Колодка пинов, совместимая с Ардуино
  * MIPI-порт камеры
  * RJ-45 Ethernet

<!--more-->

Картину дополняет надпись &#171;High-perfomance&#187;, и это реально так — прежняя топовая плата F429Discovery обеспечивала &#171;всего лишь&#187; 225 DMIPS, более чем в два раза меньше. Плюс к тому она имела довольно маленький экранчик с плохими углами обзора.
  
На новой плате установлен большой и красивый 4.3&#8243; экран от компании Rockchip.

## Внутренности

Посмотрим, какие компоненты находятся на плате.

[<img class="alignnone size-full wp-image-2477" src="http://catethysis.ru/wp-content/uploads/2015/07/top.jpg" alt="top" width="1286" height="590" />](http://catethysis.ru/wp-content/uploads/2015/07/top.jpg)

На верхней стороне расположен дисплей с тач-скрином и два MEMS-микрофона. Но самое интересное — на нижней стороне платы:

<img class="alignnone size-full wp-image-2476" src="http://catethysis.ru/wp-content/uploads/2015/07/bottom.jpg" alt="bottom" width="1288" height="590" />

Снизу расположено всё то богатство, которое делает новую плату Discovery такой желанной: мощный МК, High Speed USB с внешним PHY, SDRAM и Flash-память, новый отладчик ST-Link V2.1, крутой аудиокодек и прочие плюшки. Пройдём по всем компонентам по очереди.

## Процессор

[<img class="alignnone size-full wp-image-2533" src="http://catethysis.ru/wp-content/uploads/2015/07/2015-08-02-21.32.05.jpg" alt="2015-08-02 21.32.05" width="1600" height="900" />](http://catethysis.ru/wp-content/uploads/2015/07/2015-08-02-21.32.05.jpg)

Процессор **STM32F746NGH6U** на ядре ARM Cortex-M7 с частотой 216 МГц, математическим сопроцессором (FPU) одинарной точности и DSP-процессором, а также с модулем MPU (memory protection unit), позволяющим увеличить безопасность приложений. Память чипа состоит из 1 мегабайта флеша, 340 килобайт SRAM, 80 килобайт кеша второго уровня CCM (64 килобайт кеш данных и 16 килобайт кеш инструкций) и 4 килобайт резервного RAM. Конечно, это количество можно существенно расширить подключением внешней памяти по интерфейсам Quad-SPI или FSMC (тогда внешняя память отображается на общее адресное пространство).

Также в ядре есть ART-ускоритель, 8 килобайт кеша первого уровня, а новый конвеер здорово увеличил свою эффективность до 2.14 DMIPS/МГц, таким образом частота 216 МГц даёт нам эпические 462 DMIPS.

В чипе есть три 12-бит АЦП, два ЦАП, RTC, 13 16-битных таймеров общего назначения, 2 advanced-control таймера, генератор случайных чисел и кучу интерфейсов (25 модулей). Ещё можно отметить интерфейс камеры, 168 GPIO, интерфейсы для цифрового звука (SAI и S/PDIF), USB-HS со встроенным PHY, Ethernet-MAC и отдельный интерфейс дисплея с ускорителем графики и Chrom-ART функциями.

Чип тактируется от внешнего 25 МГц кварца, конечно внутри можно использовать ФАПЧ для умножения частоты.

## Оперативная память

<img class="alignnone size-full wp-image-2534" src="http://catethysis.ru/wp-content/uploads/2015/07/2015-08-02-21.33.08.jpg" alt="2015-08-02 21.33.08" width="1600" height="900" />

SDRAM **MT48LCM32B2B5** объёмом 128 мегабит в корпусе VFBGA, частотой тактирования 166 МГц и шириной шины 32 бита, что даёт скорость передачи до 5 ГБит/с. Конечно, на этой плате вряд ли возможно достичь таких скоростей — но это не умаляет её достоинств.

Схема подключения SDRAM к STM32F746:

[<img class="alignnone size-full wp-image-2495" src="http://catethysis.ru/wp-content/uploads/2015/07/sdram_sch.jpg" alt="sdram_sch" width="724" height="654" />](http://catethysis.ru/wp-content/uploads/2015/07/sdram_sch.jpg)

## Flash-память

<img class="alignnone size-full wp-image-2537" src="http://catethysis.ru/wp-content/uploads/2015/07/2015-08-02-21.36.09.jpg" alt="2015-08-02 21.36.09" width="1600" height="900" />

Стоит чип **N25Q128A13EF840E** от компании Micron: NOR-flash память размером 128 мегабит в корпусе V-PDFN-8 с QuadSPI-интерфейсом и частотой тактирования вплоть до 108 МГц, что при ширине шины 4 бита даёт скорость передачи 432 Мбит/с.

Схема её подключения к STM32F746:

[<img class="alignnone size-full wp-image-2494" src="http://catethysis.ru/wp-content/uploads/2015/07/flash_sch.jpg" alt="flash_sch" width="525" height="177" />](http://catethysis.ru/wp-content/uploads/2015/07/flash_sch.jpg)

## Внутрисхемный программатор/отладчик

<img class="alignnone size-full wp-image-2539" src="http://catethysis.ru/wp-content/uploads/2015/07/2015-08-02-21.36.51.jpg" alt="2015-08-02 21.36.51" width="1600" height="900" />

Новый **ST-Link V2.1** даёт возможность просто копировать файл прошивки в виртуальную &#171;флешку&#187; и так прошивать контроллер.

Схема ST-Link:

[<img class="alignnone size-full wp-image-2492" src="http://catethysis.ru/wp-content/uploads/2015/07/stlink_sch.jpg" alt="stlink_sch" width="697" height="497" />](http://catethysis.ru/wp-content/uploads/2015/07/stlink_sch.jpg)

## Ethernet PHY и разъём

<img class="alignnone size-full wp-image-2536" src="http://catethysis.ru/wp-content/uploads/2015/07/2015-08-02-21.35.10.jpg" alt="2015-08-02 21.35.10" width="1600" height="900" />

**LAN8742** — самый новый 10/100 Мбит/с Ethernet PHY от компании Microchip, по сравнению с популярным LAN8720 в нём добавлены функции Wake-on-LAN, энергосберегающая технология flexPWR и автоопределение типа кабеля. Он по-прежнему производится в корпусе QFN-24: вся линейка LAN87xx — это самые маленькие Ethernet PHY на рынке.

Развязывающий трансформатор встроен в Ethernet-разъём, упрощая разводку и удешевляя BOM.

Также теперь чётко определена задержка сигнала в кристалле, благодаря этому можно строить более точные системы передачи сигналов времени (IEEE1588), а LDO на все необходимые напряжения сделаны внутри микросхемы.

Теперь LAN8742 просыпается только тогда, когда ему приходят данные, предназначенные лично ему. Всё остальное время он находится во сне, реализуя заветы <del>Ленина</del> стандарта 802.11az.

Вот схема Ethernet-модуля на LAN8742:

[<img class="alignnone size-full wp-image-2547" src="http://catethysis.ru/wp-content/uploads/2015/07/ethernet_sch1.jpg" alt="ethernet_sch" width="1684" height="566" />](http://catethysis.ru/wp-content/uploads/2015/07/ethernet_sch1.jpg)

<img class="alignnone wp-image-2508 size-full" src="http://catethysis.ru/wp-content/uploads/2015/07/rainbow_dash1.jpg" alt="rainbow_dash" width="150" height="176" />_Наконец-то мы с тобой сделаем хороший пример с Ethernet._

## High speed USB

<img class="alignnone size-full wp-image-2538" src="http://catethysis.ru/wp-content/uploads/2015/07/2015-08-02-21.36.33.jpg" alt="2015-08-02 21.36.33" width="1600" height="900" />

USB PHY **USB3320C** тоже делает Microchip/SMSC (как и Ethernet PHY), и в нём тоже есть технология flexPWR. Он предоставляет честный high-speed USB (480 Мбит/с), но тут уже вступают ограничения самого микроконтроллера, который не сможет прогонять такой объём данных.

Схема подключения интерфейса USB3320C:

[<img class="alignnone size-full wp-image-2546" src="http://catethysis.ru/wp-content/uploads/2015/07/usb_sch1.jpg" alt="usb_sch" width="1503" height="701" />](http://catethysis.ru/wp-content/uploads/2015/07/usb_sch1.jpg)

## Аудиокодек

<img class="alignnone size-full wp-image-2535" src="http://catethysis.ru/wp-content/uploads/2015/07/2015-08-02-21.34.49.jpg" alt="2015-08-02 21.34.49" width="1600" height="900" />

Крутой аудиокодек **WM8994** от признанных мастеров жанра Wolfson (аудиофилы оценят!)

Многоканальный аудиокодек с двумя АЦП и четырьмя ЦАП, каждый по 24 бит! Обещают SNR 100дБ.
  
Есть интерфейс цифрового микрофона (как раз для MP34DT01) с функцией активации голосом.
  
Мощность выходного усилителя динамиков — 2 * 2Вт в классе D или AB, плюс усилитель наушников в классе W.
  
Есть встроенный 5-диапазонный 6-канальный эквалайзер.

Схема подключения кодека WM8994:

[<img class="alignnone size-full wp-image-2498" src="http://catethysis.ru/wp-content/uploads/2015/07/codec.jpg" alt="codec" width="1294" height="651" />](http://catethysis.ru/wp-content/uploads/2015/07/codec.jpg)

## MEMS-микрофоны

<img class="alignnone size-full wp-image-2543" src="http://catethysis.ru/wp-content/uploads/2015/07/2015-08-02-21.38.44.jpg" alt="2015-08-02 21.38.44" width="1600" height="900" />

MEMS-микрофоны **MP34DT01** от ST, питаются от 3.3В, и выдают PDM-сигнал:

<img class="alignnone" src="https://reference.digilentinc.com/_media/nexys4-ddr:n4aa.png?w=500&tok=ffef84" alt="" width="500" height="164" />

Этот тип передачи аудиоданных интересен тем, что он является одновременно и цифровым, и аналоговым. Если его пропустить через НЧ-фильтр, получится аналоговый сигнал, который можно напрямую усиливать и подавать на наушники.

Они напрямую подключены к аудиокодеку WM8994, но могут использоваться и контроллером STM32F746.

[<img class="alignnone size-full wp-image-2490" src="http://catethysis.ru/wp-content/uploads/2015/07/micro_codec.jpg" alt="micro_codec" width="1409" height="523" />](http://catethysis.ru/wp-content/uploads/2015/07/micro_codec.jpg)

Правда, футпринт явно требует разводки на многослойной плате, чтобы утащить сигналы сразу на нижний слой. Наверное, это сделано для уменьшения радиошума от ВЧ-интерфейса микрофона.

[<img class="alignnone size-full wp-image-2489" src="http://catethysis.ru/wp-content/uploads/2015/07/mems_micro.jpg" alt="mems_micro" width="272" height="153" />](http://catethysis.ru/wp-content/uploads/2015/07/mems_micro.jpg)

_<img class="alignnone wp-image-2508 size-full" src="http://catethysis.ru/wp-content/uploads/2015/07/rainbow_dash1.jpg" alt="rainbow_dash" width="150" height="176" />По-моему, ты давно должен написать статью про эти микрофоны!_

## Слот microSD-карты

<img class="alignnone size-full wp-image-2540" src="http://catethysis.ru/wp-content/uploads/2015/07/2015-08-02-21.37.26.jpg" alt="2015-08-02 21.37.26" width="1600" height="900" />

Схема подключения **SD-слота** к STM32F746:

[<img class="alignnone size-full wp-image-2493" src="http://catethysis.ru/wp-content/uploads/2015/07/sd_sch.jpg" alt="sd_sch" width="424" height="473" />](http://catethysis.ru/wp-content/uploads/2015/07/sd_sch.jpg)

## Ардуино-совместимый разъём

[<img class="alignnone size-full wp-image-2478" src="http://catethysis.ru/wp-content/uploads/2015/07/arduino.jpg" alt="arduino" width="1004" height="955" />](http://catethysis.ru/wp-content/uploads/2015/07/arduino.jpg)

Да, ST решила окучить рынок самодельщиков, и поставила на плату **разъём Arduino**. Спорное решение, особенно если учесть что он поставлен ВМЕСТО гребёнки со всеми выводами контроллера, давно уже ставшей привычным и стандартным решением.

Я не шучу. Гребёнки со всеми контактами действительно нет.

Схема ардуино-гребёнки:

[<img class="alignnone size-full wp-image-2496" src="http://catethysis.ru/wp-content/uploads/2015/07/arduino_sch.jpg" alt="arduino_sch" width="792" height="613" />](http://catethysis.ru/wp-content/uploads/2015/07/arduino_sch.jpg)

## Дисплей

Наверное, самое главное на этой плате после процессора <img src="http://catethysis.ru/wp-includes/images/smilies/icon_smile.gif" alt=":)" class="wp-smiley" />

[<img class="alignnone wp-image-2504 size-full" src="http://catethysis.ru/wp-content/uploads/2015/07/display.jpg" alt="RK043FN48H  display" width="1249" height="800" />](http://catethysis.ru/wp-content/uploads/2015/07/display.jpg)

На плате установлен дисплей RK043FN48H от компании Rocktech. На дисплей приклеен ёмкостный тач-скрин с контроллером FT5330.

Схема подключения дисплея к STM32F746:

[<img class="alignnone wp-image-2545 size-full" src="http://catethysis.ru/wp-content/uploads/2015/07/display_sch1.jpg" alt="RK043FN48H  schematics" width="1585" height="991" />](http://catethysis.ru/wp-content/uploads/2015/07/display_sch1.jpg)

_<img class="alignnone wp-image-2508 size-full" src="http://catethysis.ru/wp-content/uploads/2015/07/rainbow_dash1.jpg" alt="rainbow_dash" width="150" height="176" />Какой хороший дисплей! Ты ведь нарисуешь меня на нём, правда?_

## S/PDIF-разъём

<img class="alignnone size-full wp-image-2542" src="http://catethysis.ru/wp-content/uploads/2015/07/2015-08-02-21.37.46.jpg" alt="2015-08-02 21.37.46" width="1600" height="900" />

## Разъём камеры MIPI

<img class="alignnone size-full wp-image-2541" src="http://catethysis.ru/wp-content/uploads/2015/07/2015-08-02-21.37.38.jpg" alt="2015-08-02 21.37.38" width="1600" height="900" />

Схема подключения MIPI-камеры к STM32F746:

<img class="alignnone size-full wp-image-2544" src="http://catethysis.ru/wp-content/uploads/2015/07/camera_sch.jpg" alt="camera_sch" width="952" height="839" />

Есть интересное мнение, согласно которому из этого порта можно сделать внешний расширитель портов GPIO, которого теперь так не хватает.

## Примеры

По умолчанию в плату прошит пример, слушающий звук с микрофонов и показывающий на дисплее его осциллограмму:

[<img class="alignnone size-full wp-image-2502" src="http://catethysis.ru/wp-content/uploads/2015/07/demo1.jpg" alt="demo" width="1275" height="874" />](http://catethysis.ru/wp-content/uploads/2015/07/demo1.jpg)