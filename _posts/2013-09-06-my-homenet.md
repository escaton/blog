---
id: 85
title: Моя домашняя сеть
date: 2013-09-06T01:16:42+00:00
author: catethysis
layout: post
guid: http://192.168.1.10/?p=85
permalink: /my-homenet/
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
  - 2726263225
categories:
  - Сервер
tags:
  - linux
  - передача данных
  - электроника
---
У меня дома три компьютера x86, несколько arm-based компьютеров и переменное количество мобильных устройств.

Вся сеть держится на Wi-Fi роутере ASUS RT-N16, перешитом на <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://www.dd-wrt.com/wiki/index.php/Asus_RT-N16" >DD-WRT</a>. Не могу сказать, что доволен им. Сетевые разъёмы были выбраны явно самые дешёвые &#8212; после нескольких десятков подключений они <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://forum.hdtv.ru/index.php?showtopic=11368&p=198425" >окисляются и портятся</a>. Методы вроде протирки контактов ацетоном дают лишь временное появление контакта. Можно попробовать подобраться к контактам стирательной резинкой, но это тоже довольно тяжело сделать в узком пространстве. Скорее всего, поможет дремель с полировальным кругом &#8212; но есть опасность сдвинуть контакты со своих мест.
  
Ещё к нему периодически не могут подключиться некоторые устройства по wi-fi, но это скорее проблема устройств.
  
Сейчас роутер установлен внутрь HTPC, с жёстко закреплёнными сетевыми проводами. Всё работает, но надежды нет. Наверное, придётся перепаивать ethernet-разъёмы, или сделать выносную патч-панель.

Основной компьютер в сети, несколько месяцев работавший веб-сервером &#8212; Core-i3. Второй компьютер &#8212; HTPC, на котором почти постоянно работает оболочка <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://ru.wikipedia.org/wiki/XBMC" >xbmc</a>; а когда не работает xbmc &#8212; работает скринсейвер с фотографиями.

Третий x86 компьютер &#8212; [сервер на Atom](?p=4), которому посвящено большинство постов в блоге. Без корпуса, поэтому находится в укромном месте, чтобы не быть на виду.

Около выходной двери висит <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://www.ixbt.com/portopc/superpad.shtml" >китайский планшет</a> c Ethernet-гнездом, на нём отображается веб-страница с новостями, пробками и погодой. Скоро он будет отображать страницу управления умным домом. Планшет называется <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://www.ixbt.com/portopc/superpad.shtml"  target="_blank">Flytouch 3</a>. За давностию лет у него слетела прошивка, была найдена <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://4pda.ru/forum/index.php?showtopic=281614"  target="_blank">такая</a> (версия для устройства с питанием от 9 вольт), <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://4pda.ru/forum/index.php?showtopic=231617"  target="_blank">одна полезная тема</a>, <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://ublaze.ru/forum/ftopic1164.html"  target="_blank">другая полезная тема</a>. Дисплей 1024*600 пикселей. Плата версии sv8811_v4p1, процессор &#8212; imapx210. Ему нужно 9 вольт, поэтому он питается от 12 вольт через [преобразователь](?p=18).

Для нужд видеонаблюдения я применяю <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://market.yandex.ru/model.xml?modelid=7879331&hid=723087"  target="_blank">TL-MR3020</a>, перешитый на <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://wiki.openwrt.org/ru/toh/tp-link/tl-mr3020"  target="_blank">OpenWRT</a>. К нему подключена видеокамера <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://www.logitech.com/ru-ru/product/hd-webcam-c270"  target="_blank">Logitech C270</a>, питание к роутеру сделано самодельной PoE (передача питания по незадействованным линиям Ethernet), так что к нему подходит только ethernet-провод. Если его питать от блока питания, то можно передавать сигнал по Wi-Fi, и обеспечить полную автономность.

Для уменьшения количества блоков питания и увеличения их КПД все устройства, которые могут питаться от 12 вольт или меньше &#8212; питаются от общей линии 12 вольт, напрямую или через <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/?p=18">преобразователь</a>. Эта линия будет проложена проводом <a href="http://cs-cs.net/kvvg-cables"  target="_blank">КВВГ-нг</a> на 4 жилы: 2 на питание, 2 &#8212; шина <a title="Шина CAN" href="http://catethysis.ru/index.php/%d1%88%d0%b8%d0%bd%d0%b0-can/" target="_blank">CAN</a> для умного дома. В дальнейшем питание будет переведено на 19 вольт от блока питания ноутбука, и установлен аккумулятор в качестве ИБП.