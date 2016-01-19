---
id: 1742
title: Взлом пульта кондиционера
date: 2014-06-23T01:34:34+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=1742
permalink: /hack-a-conditioner-remote-tsop1736/
ratings_users:
  - 2
ratings_score:
  - 10
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 2787120816
categories:
  - Без рубрики
---
С приходом лета повысилась температура, а мои домашние шиншиллы очень не любят жару. Два года назад мы поставили кондиционер, но он странно работает — даже если температура упала до нужного уровня, он продолжает охлаждать. Неудобно — нужно постоянно мучать пульт, да и энергия тратится.
  
Поэтому первой частью умного дома станет «термореле» для кондиционера: при увеличении температуры оно включит кондиционер по ИК-каналу, а при понижении — выключит.
  
В первую очередь необходимо разобраться с ИК-пультом кондиционера: нам нужно всего два действия — включение и выключение, которые в пульте посажены на одну кнопку, меняющую своё состояние. Чтобы эмулировать сигнал пульта, нужно прочитать сигнал ИК-приёмником. Используем классический приёмник TSOP1736, а сигнал снимем с него осциллографом. Плата [Red Pitaya](http://catethysis.ru/red-pitaya_arrived/ "Приехала плата Red Pitaya") идеально подходит для этого!

Подключение очень простое: 1 ногу приёмника к земле, 2 ногу — к питанию 5 вольт, а сигнал — на третьей (open drain).

[<img class="alignnone size-full wp-image-1744" src="http://catethysis.ru/wp-content/uploads/2014/06/TSOP_cokolevka.jpg" alt="TSOP_cokolevka" width="376" height="293" />](http://catethysis.ru/wp-content/uploads/2014/06/TSOP_cokolevka.jpg) [<img class="alignnone size-large wp-image-1745" src="http://catethysis.ru/wp-content/uploads/2014/06/TSOP1736-circuits.jpg" alt="TSOP1736-circuits" width="541" height="160" />](http://catethysis.ru/wp-content/uploads/2014/06/TSOP1736-circuits.jpg)

На приборе переключаем вход в HV, запускаем в интерфейсе прибора «осциллограф», настраиваем его в режим захвата (Normal), Edge: Normal, Level: 1 В и Probe attenuation: 10x. Подключаем щуп осциллографа к 3 ноге, и нажимаем кнопку на пульте (наведя его на приёмник). Появится осциллограмма, и теперь нужно вручную перевести её в биты.

[<img class="alignnone size-full wp-image-1747" src="http://catethysis.ru/wp-content/uploads/2014/06/conditioner1.png" alt="conditioner" width="1117" height="536" />](http://catethysis.ru/wp-content/uploads/2014/06/conditioner1.png)

&nbsp;

<!--more-->

Кодовые посылки включения и выключения пульта кондиционера Hyundai выглядят так:

<pre>Выкл: 00000000000000001111111101110101010111011101010101110111010101010101010101010111011101010101010111010111010101110101111111111111111111111111111111111110101010101010101010101010101110101010101010101010101110101010111011101010
Вкл:  000000000000000011111111011101010111011101110101010111011101010101010101010101011101110101010101011101011101010111010111111111111111111111111111111111111010101010101010101010101010111010101010101010101010111010101011101110101110</pre>

0.55 мс на бит, это 1818 кбод.

Записывать их просто так было бы неинтересно, хочется найти закономерность. Во-первых, в посылках очень много общего — попробуем расставить пробелы вот так:

<pre>Выкл: 0000000000000000111111110111010101  01110111010101011101110101010101010101010101110111010101010101110101110101011101011111111111111111111111111111111010101010101010101010101010111010101010101010101010111010101011101110101  0
Вкл:  00000000000000001111111101110101011101110111010101011101110101010101010101010101110111010101010101110101110101011101011111111111111111111111111111111010101010101010101010101010111010101010101010101010111010101011101110101110</pre>

Видно два места, в которых в одной последовательности «01», а в другой «0111», и если поставить там по два пробела — длина последовательностей сравняется. Это наводит на мысль, что под «01» закодирован один бит (a), а под «0111» — другой (b). Кстати, это кодирование Sony — фиксированный «1», а бит закодирован в длине «0».

После такой замены последовательности выглядят так:

<pre>01 = a
0111 = b
Выкл: 000000000000000011111111baaabbaaabbaaaaaaaaaabbaaaaababaabab111111111111111111111111111111111aaaaaaaaaaaaabaaaaaaaaaabaaabbaab
Вкл:  000000000000000011111111baabbbaaabbaaaaaaaaaabbaaaaababaabab111111111111111111111111111111111aaaaaaaaaaaaabaaaaaaaaaabaaabbabb</pre>

Очевидно, что 000000000000000011111111 (16 \* «0» + 8 \* «1») в начале, и 111111111111111111111111111111111 (33 * «1») — просто синхронизирующие последовательности, и их можно не рассматривать. Теперь всё сокращается до:

<pre>Выкл:  baaabbaaabbaaaaaaaaaabbaaaaababaabab aaaaaaaaaaaaabaaaaaaaaaabaaabbaab
Вкл:   baabbbaaabbaaaaaaaaaabbaaaaababaabab aaaaaaaaaaaaabaaaaaaaaaabaaabbabb</pre>

Честно говоря, пока не очень понятно (правда, скорее всего 4 бит отвечает за включение/выключение кондиционера). Попробуем разобрать посылки от других кнопок, может что-то прояснится, проверим настройку температуры:

<pre>t-16:  baabbbbb aaaaaaaa aaaabbba aaaababa abab
t-17:  baabbbbb baaaaaaa aaaabbba aaaababa abab
t-18:  baabbbbb abaaaaaa aaaabbba aaaababa abbb
t-19:  baabbbbb bbaaaaaa aaaabbba aaaababa abab
t-20:  baabbbbb aabaaaaa aaaabbba aaaababa abab
t-21:  baabbbbb babaaaaa aaaabbba aaaababa abab
t-22:  baabbbbb abbaaaaa aaaabbba aaaababa abab
t-23:  baabbbbb bbbaaaaa aaaabbba aaaababa abab
t-24:  baabbbbb aaabaaaa aaaabbba aaaababa abab
t-25:  baabbbbb baabaaaa aaaabbba aaaababa abab
t-26:  baabbbbb ababaaaa aaaabbba aaaababa abab
t-27:  baabbbbb bbabaaaa aaaabbba aaaababa abab
t-28:  baabbbbb aabbaaaa aaaabbba aaaababa abab
t-29:  baabbbbb babbaaaa aaaabbba aaaababa abab
t-30:  baabbbbb abbbaaaa aaaabbba aaaababa abab</pre>

Точно! Второй байт — это температура в градусах, относительно 16 градусов. Более того, становится понятным что байты здесь по 8 бит (а может и по 4), и вначале отправляется младший бит. Ещё мы угадали с кодированием битов: «a» соответствует 0, а «b» — 1.

<pre>Режим Swing:
on:    baabbbba bbbaaaaa aaaabbba aaaababa abab
off:   baabbbaa bbbaaaaa aaaabbba aaaababa abab

Режимы mode:
auto:  aaabaaaa baabaaaa aaaaabba aaaababa abab
cool:  baabbbaa bbbaaaaa aaaabbba aaaababa abab
dry:   ababbaaa babaaaaa aaaaabba aaaababa abab
fan:   bbabbbaa babaaaaa aaaaabba aaaababa abab
heat:  aabbaaaa aabbaaaa aaaaabba aaaababa abab

Sleep: baabbbba bbbaaaaa aaaabbba aaaababa abab

Уровни Fan:
auto:  baabaabb baabaaaa aaaaabba aaaababa abab baaabaaaaaaaabaaaaaaaaaabaaabbbb
fan 1: baabbabb baabaaaa aaaaabba aaaababa abab baaabaaaaaaaabaaaaaaaaaabaaabbbb
fan 2: baababbb baabaaaa aaaaabba aaaababa abab baaabaaaaaaaabaaaaaaaaaabaaabbbb
fan 3: baabbbbb baabaaaa aaaaabba aaaababa abab baaabaaaaaaaabaaaaaaaaaabaaabbbb
fan 4: baabbbbb baabaaaa aaaabbba aaaababa abab baaabaaaaaaaabaaaaaaaaaabaaabbbb</pre>

Получается, в первом байте:
  
4 бит — режим on/off
  
7 бит — режим Swing

Для моих целей этого пока достаточно.