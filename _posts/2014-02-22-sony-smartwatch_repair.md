---
id: 996
title: Разборка и ремонт Sony SmartWatch
date: 2014-02-22T13:30:29+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=996
permalink: /sony-smartwatch_repair/
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
  - 2728081020
categories:
  - Руководства
  - Электроника
tags:
  - электроника
---
У меня есть часы Sony SmartWatch (первой версии). Я их активно использовал, потом потерял шнур. Спустя полгода нашёл, и попытался их зарядить. Несколько дней часы были подключены к USB, но ничего не вышло &#8212; аккумулятор сел ниже нижнего порога, и контроллер батареи в часах, видимо, считал что батареи нет, и отказывался её заряжать.

Обычный метод решения такой проблемы &#8212; зарядить её вручную, но сначала нужно до неё добраться. Дизайн часов напоминал о методе разборки iPod и iPad &#8212; присоской вытянуть экран с платой из корпуса (корпус в них выполнен в виде корыта, в котором лежит электроника, приклеенная к экрану). Но у меня не было присоски, и я попробовал другой метод.

<!--more-->

Вводим скальпель в щель между пластмассовым корпусом и алюминиевой рамкой.<img class="alignnone" style="line-height: 1.5;" alt="" src="http://static.catethysis.ru/files/smartwatch_frame_detach.jpg" width="1200" height="675" />

Проходим им по всему периметру. Пройти придётся не один раз &#8212; рамка приклеена вязким клеем, и сопротивляется стягиванию.<img class="alignnone" style="line-height: 1.5;" alt="" src="http://static.catethysis.ru/files/smartwatch_frame.jpg" width="1200" height="675" />

Снимаем рамку (её стоит почистить от грязи), перед нами экран.<img class="alignnone" alt="" src="http://static.catethysis.ru/files/smartwatch_screen.jpg" width="1200" height="675" />

Экран тоже приклеен к корпусу, но несильно. Отделяем его от корпуса скальпелем. Очень важно &#8212; помните, что от экрана идут два тонких шлейфа, которые можно легко разрезать. Отклеивайте экран осторожно, и не вытаскивайте его, а отгибайте в сторону шлейфов. Они &#8212; со стороны надписи SONY.<img class="alignnone" style="line-height: 1.5;" alt="" src="http://static.catethysis.ru/files/smartwatch_screen_detach.jpg" width="1200" height="675" />

Вот и всё! Перед нами плата часов и аккумулятор.<img class="alignnone" style="line-height: 1.5;" alt="" src="http://static.catethysis.ru/files/smartwatch_disassembled.jpg" width="1200" height="675" />

Очень удобно, что контакты аккумулятора торчат наружу, а не внутрь &#8212; к ним легко припаяться. Проверяем напряжение &#8212; так и есть, 2.8В. Это меньше нижнего порога контроллера заряда.<img class="alignnone" style="line-height: 1.5;" alt="" src="http://static.catethysis.ru/files/smartwatch_charging.jpg" width="1200" height="675" />

Устанавливаем блок питания на 4.2 вольта, отсечка по 12 мА.<img class="alignnone" alt="" src="http://static.catethysis.ru/files/smartwatch_charge_voltage.jpg" width="1200" height="675" />

Начинаем с капельной зарядки &#8212; устанавливаем ток в несколько миллиампер (конкретно &#8212; 0.05C..0.1C миллиампер) и оставляем на пару часов. Это приносит первые положительные результаты
  
&#8212; напряжение поднимается с 2.8 В до 3.7 В. Очень хорошо &#8212; ведь это значит, что аккумулятор не убит полностью, и сможет дальше работать.<img class="alignnone" alt="" src="http://static.catethysis.ru/files/smartwatch_charge_current.jpg" width="1200" height="675" />

Хочется быстрее закончить, поэтому установим ток, равный 0.5C &#8212; как в классическом методе. Ёмкость аккумулятора = 110 мАч, то есть ток заряда = 110мА * 0.5 = 55 мА. Лучше &#8212; чуть меньше. Нельзя ориентироваться на показометр блока питания! Он вполне может врать на 10мА, которые окажутся критичными.<img class="alignnone" style="line-height: 1.5;" alt="" src="http://static.catethysis.ru/files/smartwatch_misdisplay.jpg" width="1200" height="675" />

Тем временем напряжение поднялось до 3.8 В, теперь можно заряжать от USB.

Итог &#8212; всё работает!