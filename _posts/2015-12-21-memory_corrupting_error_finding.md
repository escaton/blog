---
id: 2801
title: Поиск ошибки, портящей память, в C коде для STM32
date: 2015-12-21T19:40:04+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2801
permalink: /memory_corrupting_error_finding/
ratings_users:
  - 3
ratings_score:
  - 15
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 4422607360
categories:
  - STM32
---
Прямо сейчас я нахожусь в командировке в Беларуси, и поймал странное поведение программы, проявляющееся после 20-30 секунд работы девайса на STM32.

У меня в программе есть энумератор, который может принимать только три значения, от 0 до 2:

[<img class="alignnone size-full wp-image-2836" src="http://catethysis.ru/wp-content/uploads/2015/12/Снимок-экрана-2015-12-21-в-14.45.13.png" alt="Снимок экрана 2015-12-21 в 14.45.13" width="554" height="172" />](http://catethysis.ru/wp-content/uploads/2015/12/Снимок-экрана-2015-12-21-в-14.45.13.png)

Однако, при отладке оказалось что в этой переменная лежит 0x72, вот скриншот окна Watch:

[<img class="alignnone size-full wp-image-2837" src="http://catethysis.ru/wp-content/uploads/2015/12/Снимок-экрана-2015-12-21-в-14.46.14.png" alt="Снимок экрана 2015-12-21 в 14.46.14" width="432" height="100" />](http://catethysis.ru/wp-content/uploads/2015/12/Снимок-экрана-2015-12-21-в-14.46.14.png)

Как так? Ещё и на осциллографе какая-то фигня вместо нормальных посылок на UART, который обрабатывается вообще в другом месте кода.

<!--more-->

Открываем [map-файл](http://catethysis.ru/calculators/ "Калькуляторы"). printer_type лежит по адресу 0x200002a3. Смотрим память.

[<img class="alignnone size-full wp-image-2840" src="http://catethysis.ru/wp-content/uploads/2015/12/Снимок-экрана-2015-12-21-в-14.48.01.png" alt="Снимок экрана 2015-12-21 в 14.48.01" width="1356" height="484" />](http://catethysis.ru/wp-content/uploads/2015/12/Снимок-экрана-2015-12-21-в-14.48.01.png)

Ясно, его затёр мусор, начинающийся примерно в 0x20000214. Опять смотрим map.
  
Вот он, массив databuf_BA.

[<img class="alignnone size-full wp-image-2841" src="http://catethysis.ru/wp-content/uploads/2015/12/Снимок-экрана-2015-12-21-в-14.49.23.png" alt="Снимок экрана 2015-12-21 в 14.49.23" width="934" height="96" />](http://catethysis.ru/wp-content/uploads/2015/12/Снимок-экрана-2015-12-21-в-14.49.23.png)

Но он имеет длину 50.

[<img class="alignnone size-full wp-image-2843" src="http://catethysis.ru/wp-content/uploads/2015/12/Снимок-экрана-2015-12-21-в-14.50.10.png" alt="Снимок экрана 2015-12-21 в 14.50.10" width="724" height="138" />](http://catethysis.ru/wp-content/uploads/2015/12/Снимок-экрана-2015-12-21-в-14.50.10.png)

Найдём, где массив заполняется. Так и есть, мы просто идём по массиву подряд, не проверяя границы.

[<img class="alignnone size-full wp-image-2844" src="http://catethysis.ru/wp-content/uploads/2015/12/Снимок-экрана-2015-12-21-в-14.50.46.png" alt="Снимок экрана 2015-12-21 в 14.50.46" width="950" height="330" />](http://catethysis.ru/wp-content/uploads/2015/12/Снимок-экрана-2015-12-21-в-14.50.46.png)

Когда я писал это место, я надеялся что received_count (сбрасывающийся немного дальше) никогда не превысит не то, что 50, а даже 20. Зря надеялся, ошибки могут возникать везде.

Исправление, конечно, очень простое: нужно контролировать рост адреса в массиве выше какого-то безопасного значения меньше его размера.

[<img class="alignnone size-full wp-image-2848" src="http://catethysis.ru/wp-content/uploads/2015/12/Снимок-экрана-2015-12-21-в-18.47.02.png" alt="Снимок экрана 2015-12-21 в 18.47.02" width="718" height="132" />](http://catethysis.ru/wp-content/uploads/2015/12/Снимок-экрана-2015-12-21-в-18.47.02.png)

&nbsp;

Вот так, из-за характера расположения переменных в памяти, и того что C не контролирует переполнение &#8212; ошибка в одном месте портит что-то в совершенно другом месте. Это &#8212; классический пример сильной связности кода на C.