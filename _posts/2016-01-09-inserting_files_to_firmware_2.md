---
id: 2854
title: Вставка файлов в прошивку — 2 часть
date: 2016-01-09T14:44:04+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2854
permalink: /inserting_files_to_firmware_2/
ratings_users:
  - 2
ratings_score:
  - 10
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 4475767939
categories:
  - STM32
---
Я уже писал о методе [добавления внешних файлов в прошивку](http://catethysis.ru/inserting_files_to_firmware/ "Вставка файлов в прошивку") микроконтроллера, даже написал для этой цели онлайн-[конвертер бинарного файла в c-хедер](http://catethysis.ru/calculators/ "Калькуляторы"). Однако есть более простой и удобный способ, который предоставляет IAR, да и строго говоря, любой линкер обязан уметь так делать.

Конечно, вы уже поняли — мы полезем в параметры линкера.

Одна из самых частых моих задач за последнее время — это сборка прошивки основного девайса, в которую вкомпилена прошивка дочерней платы. Основной девайс при запуске проверяет версию прошивки дополнительной платы, и если она младше — обновляет её до свежей. Поэтому я должен включить в основную прошивку бинарный файл с дочерней прошивкой.

Открываем окно Options -> Linker -> Input:

[<img class="alignnone wp-image-2855 size-large" src="http://catethysis.ru/wp-content/uploads/2016/01/Снимок-экрана-2016-01-09-в-13.02.24-1024x940.png" alt="Снимок экрана 2016-01-09 в 13.02.24" width="604" height="554" />](http://catethysis.ru/wp-content/uploads/2016/01/Снимок-экрана-2016-01-09-в-13.02.24.png)

Внизу видим опции &#171;Raw binary image&#187;. Это именно то, что нам нужно, указываем файл.

<!--more-->

Что обозначают остальные опции?

  * Symbol — глобальный символ кода, это то имя, которое будет присвоено массиву с содержимым файла. Я написал здесь batp_fw, потому что это прошивка (firmware) платы BATP.
  * Section — секция линкера, в которой файл будет размещён. Напишем здесь &#171;fw_section&#187;, только ещё надо будет создать и разместить эту секцию.
  * Align — выравнивание по границе байт, полуслов или слов. Обычно я ставлю здесь 4 (выровнять по границе слов).

Укажите имя символа в окошке &#171;Keep symbols&#187;, иначе символ (и весь массив) будет выкинут линкером при сборке.

<img class="alignnone size-large wp-image-2857" src="http://catethysis.ru/wp-content/uploads/2016/01/Снимок-экрана-2016-01-09-в-13.14.461-1024x938.png" alt="Снимок экрана 2016-01-09 в 13.14.46" width="604" height="553" />

Сохраните изменения, и пойдём править скрипт линкера. Он лежит в папке проекта, что-то вроде stm32f4xx_flash.icf.

<pre>/*###ICF### Section handled by ICF editor, don't touch! ****/
/*-Editor annotation file-*/
/* IcfEditorFile="$TOOLKIT_DIR$\config\ide\IcfEditor\cortex_v1_0.xml" */
/*-Specials-*/
define symbol __ICFEDIT_intvec_start__ = 0x08000000;
/*-Memory Regions-*/
define symbol __ICFEDIT_region_ROM_start__    = 0x08000000;
define symbol __ICFEDIT_region_ROM_end__      = 0x081FFFFF;
define symbol __ICFEDIT_region_RAM_start__    = 0x20000000;
define symbol __ICFEDIT_region_RAM_end__      = 0x2002FFFF;
define symbol __ICFEDIT_region_CCMRAM_start__ = 0x10000000;
define symbol __ICFEDIT_region_CCMRAM_end__   = 0x1000FFFF;
/*-Sizes-*/
define symbol __ICFEDIT_size_cstack__ = 0x400;
define symbol __ICFEDIT_size_heap__   = 0x200;
/**** End of ICF editor section. ###ICF###*/


define memory mem with size = 4G;
define region ROM_region      = mem:[from __ICFEDIT_region_ROM_start__   to __ICFEDIT_region_ROM_end__];
define region RAM_region      = mem:[from __ICFEDIT_region_RAM_start__   to __ICFEDIT_region_RAM_end__];
define region CCMRAM_region   = mem:[from __ICFEDIT_region_CCMRAM_start__   to __ICFEDIT_region_CCMRAM_end__];

define block CSTACK    with alignment = 8, size = __ICFEDIT_size_cstack__   { };
define block HEAP      with alignment = 8, size = __ICFEDIT_size_heap__     { };

initialize by copy { readwrite };
do not initialize  { section .noinit };

place at address mem:__ICFEDIT_intvec_start__ { readonly section .intvec };

&gt;&gt;&gt; place at address mem:0x08100000 { readonly section fw_section }; &lt;&lt;&lt;

place in ROM_region   { readonly };
place in RAM_region   { readwrite,
                        block CSTACK, block HEAP };</pre>

Я добавил строчку

<pre>place at address mem:0x08001000 { readonly section fw_section };</pre>

практически в самом конце скрипта линкера. Это разместит тот файл во flash-памяти, начиная с адреса 0x08001000.

Файл batp_fw.bin в редакторе выглядит так:

[<img class="alignnone wp-image-2859 size-medium" src="http://catethysis.ru/wp-content/uploads/2016/01/Снимок-экрана-2016-01-09-в-13.33.36-300x185.png" alt="Снимок экрана 2016-01-09 в 13.33.36" width="300" height="185" />](http://catethysis.ru/wp-content/uploads/2016/01/Снимок-экрана-2016-01-09-в-13.33.36.png)

Компилируем, собираем проект и запускаем. Посмотрим редактор памяти (View -> Memory во время отладки):

[<img class="alignnone size-large wp-image-2858" src="http://catethysis.ru/wp-content/uploads/2016/01/Снимок-экрана-2016-01-09-в-13.32.58-1024x419.png" alt="Снимок экрана 2016-01-09 в 13.32.58" width="604" height="247" />](http://catethysis.ru/wp-content/uploads/2016/01/Снимок-экрана-2016-01-09-в-13.32.58.png)

Как видим, файл действительно разместился по нужному нам адресу.

Ну и вишенка на торте, использование этого куска памяти, как массив в программе — это очень&#8230; нет, крайне просто!

<pre>extern uint32_t batp_fw[];</pre>

Конечно, тип данных может быть любой удобный вам. Хотите обращаться побайтово — используйте char или лучше uint8\_t, хотите ускорить чтение — обращайтесь пословно с помощью unsigned int или лучше uint32\_t.

Заключение.

Этот способ лучше, чем вклейка в код массива байт файла, как в прошлой статье. Но он, возможно, чуть сложнее. И если нужно что-то подправить в файле перед слияением — вам понадобится hex-редактор, в отличие от прошлого способа, где это можно сделать хоть Блокнотом.

Однако, этот способ даёт включить только один файл, если нужно включить несколько— потребуется ручная правка командной строки линкера.