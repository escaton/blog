---
id: 591
title: Собеседование / 1 задание
date: 2013-11-23T11:05:18+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=591
permalink: /interview_1_task/
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
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 2732588812
categories:
  - JavaScript
tags:
  - javascript
  - собеседование
---
## Асинхронные методы передачи браузер → сервер

### очевидное

  * AJAX–запрос на &#171;url?param&#187;. Выполняется вручную через XMLHttpRequest, либо различные библиотеки — jQuery, ExtJS, protototype.js, JSHttpRequest.
  * скрытый iframe с управлением location — очень просто, но не кроссбраузерно, и жрёт много памяти (т.к. по сути это ещё одно окно браузера), оставляет следы в истории браузера, а так же появляется индикатор загрузки страницы.
  * динамическое создание объекта или скрипта с src = &#171;url?param&#187; — не очень удобно, но кроссбраузерно.

### сокеты

  * WebSockets в html5, плюс обёртка над ним <span style="line-height: 1.5;">socket.io — наверное, самое родное для nodejs</span>
  * флеш-скрипты (имеют реализацию сокетов), либо jssockets — удобная обёртка над флешовыми функциями сокетов.

### экзотика

  * Long polling (оно же — Comet), например через JSONP.
  * nowjs — надстройка над socket.io для RPC. Опасность выстрела в ногу.
  * <span style="line-height: 1.5;">нефинализированный jpeg — остаётся открытый канал передачи, который можно использовать в своих целях. Сложно использовать, возможны утечки памяти.</span>

[Следующее задание &#8212; ограничение скорости вызова функций.](http://catethysis.ru/index.php/%d1%81%d0%be%d0%b1%d0%b5%d1%81%d0%b5%d0%b4%d0%be%d0%b2%d0%b0%d0%bd%d0%b8%d0%b5-2-%d0%b7%d0%b0%d0%b4%d0%b0%d0%bd%d0%b8%d0%b5/ "Собеседование / 2 задание")