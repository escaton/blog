---
id: 1107
title: Связь между входными каналами (crosstalk) в Red Pitaya
date: 2014-03-18T19:33:33+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=1107
permalink: /red_pitaya_crosstalk/
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
  - 2735293784
categories:
  - Red Pitaya
  - Исследования
tags:
  - red pitaya
  - электроника
---
В одном из [экспериментов с платой red pitaya](http://catethysis.ru/index.php/%d0%bf%d1%80%d0%b8%d0%b5%d1%85%d0%b0%d0%bb%d0%b0-%d0%bf%d0%bb%d0%b0%d1%82%d0%b0-red-pitaya/ "Приехала плата Red Pitaya") я заметил на втором (неподключенном) канале слабый пик, повторяющий сильный пик на первом канале, к которому был подключен генератор. Явление не новое, обычный crosstalk &#8212; но нужно его исследовать и получить таблицу параметров.

<!--more-->

# Условия опыта

## Оборудование

Использую плату Red Pitaya в режиме спектрографа и генератор Rigol DG4062. Генератор включен в режиме синуса, амплитуда выходного напряжения &#8212; 710 мВ, к плате Red Pitaya подключен кабелем <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://www.caledonian-cables.com/product/Coaxial%20Cables/50Ohm%20RF%20Coaxial%20Cables/3D-FB.htm" >3D-FB</a> длиной 90см с разъёмами BNC-BNC.

В режиме спектрографа у платы есть анализатор, показывающий амплитуду и частоту самого сильного пика на обоих каналах. Будем использовать его показания.

[<img class="alignnone size-large wp-image-1148" alt="pitaya_in_crosstalk_display" src="http://catethysis.ru/wp-content/uploads/2014/03/pitaya_in_crosstalk_display-1024x729.png" width="604" height="429" />](http://catethysis.ru/wp-content/uploads/2014/03/pitaya_in_crosstalk_display.png)

## Порядок эксперимента

  1. Подключаю генератор кабелем к одному из аналоговых входов исследуемой платы.
  2. Запускаю плату из веб-интерфейса в режиме спектрографа.
  3. Включаю генератор на определённую частоту из списка (100 кГц, 1 МГц, далее от 5 до 60 МГц с шагом 5 МГц).
  4. Снимаю показания анализатора спектрографа для обоих каналов &#8212; подключенного и неподключенного и записываю их в таблицу.
  5. Перехожу к следующей частоте, после прохода всего списка частот меняю каналы. На низких частотах переключаюсь на более низкую частоту дикретизации, чтобы сохранить точность измерений.

# Результаты измерения связи каналов

[<img class="alignnone size-full wp-image-1128" alt="pitaya_in_crosstalk" src="http://catethysis.ru/wp-content/uploads/2014/03/pitaya_in_crosstalk.png" width="705" height="641" />](http://catethysis.ru/wp-content/uploads/2014/03/pitaya_in_crosstalk.png)

Связь не превышает -37.8 дБ, и ощутимо возрастает на высоких частотах &#8212; это довольно логично. На низких частотах &#8212; связь слабее, порядка -50дБ.

Смотрите также моё [исследование спектра прямоугольного сигнала платой red pitaya](http://catethysis.ru/index.php/%d1%87%d1%91%d1%82%d0%bd%d1%8b%d0%b5-%d0%b3%d0%b0%d1%80%d0%bc%d0%be%d0%bd%d0%b8%d0%ba%d0%b8-%d0%b2-%d0%bf%d1%80%d1%8f%d0%bc%d0%be%d1%83%d0%b3%d0%be%d0%bb%d1%8c%d0%bd%d0%be%d0%bc-%d1%81%d0%b8%d0%b3/ "Исследование спектра прямоугольного сигнала платой Red Pitaya").