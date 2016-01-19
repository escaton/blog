---
id: 864
title: 'STM32: светодиодный тюнер для электрогитары'
date: 2013-12-21T03:18:19+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=864
permalink: /stm32-electroguitar_led_tuner/
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
  - 2729692981
categories:
  - Готовые девайсы
tags:
  - STM32
  - электроника
---
Встроенные таймеры позволяют крайне легко сделать простейший тюнер для гитары. Нужно только знать необходимые частоты нот, и использовать синий светодиод <img src="http://catethysis.ru/wp-includes/images/smilies/icon_smile.gif" alt=":)" class="wp-smiley" />

<!--more-->

Прибор будет очень простым &#8212; кнопка, меняющая частоту, светодиод и МК. Когда прибор настроен, допустим, на частоту ноты ми &#8212; светодиод вспыхивает с частотой 82.4Гц с помощью [таймера](http://catethysis.ru/stm32-%e2%86%92-%d1%82%d0%b0%d0%b9%d0%bc%d0%b5%d1%80%d1%8b-%e2%86%92-%d1%88%d0%b8%d0%bc/ "STM32 → таймеры → ШИМ"). Подносим светодиод к струне, и если струна настроена на ту же частоту &#8212; проявляется <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://ru.wikipedia.org/wiki/%D1%F2%F0%EE%E1%EE%F1%EA%EE%EF#.D0.A1.D1.82.D1.80.D0.BE.D0.B1.D0.BE.D1.81.D0.BA.D0.BE.D0.BF.D0.B8.D1.87.D0.B5.D1.81.D0.BA.D0.B8.D0.B9_.D1.8D.D1.84.D1.84.D0.B5.D0.BA.D1.82" >стробоскопический эффект</a>, струна кажется застывшей.