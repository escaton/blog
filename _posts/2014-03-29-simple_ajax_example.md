---
id: 1246
title: Простой пример использования AJAX
date: 2014-03-29T13:20:54+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=1246
permalink: /simple_ajax_example/
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
  - 2730417839
categories:
  - JavaScript
  - Руководства
tags:
  - javascript
  - node.js
---
Я подготовил простой пример &#8212; демонстрацию технологии AJAX. Он доступен по адресу <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://ajax_test.catethysis.ru/" >http://ajax_test.catethysis.ru/</a> &#8212; читайте сразу там. Суть: клиентская страница 5 раз в секунду запрашивает с сервера новое значение, а получив его &#8212; отображает в <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://htmlbook.ru/html/span" >span</a>.

<!--more-->

## Клиентская часть

Таймер на 200 миллисекунд создан javascript-функцией <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://javascript.ru/setInterval" >setInterval</a>, запрос значения &#8212; функцией <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://javascript.ru/ajax/transport/xmlhttprequest" >XMLHTTPRequest</a>.
  
Ей нужно передать адрес, по которому находится требуемое значение:

    http://ajax_test.catethysis.ru/value

Эта функция также предоставляет механизм отслеживания состояния запросов, и как только запрос исполнен и значение пришло &#8212; забираем его и складываем в элемент с id=&#187;ajax&#187;. Вот код клиентской части:

    window.onload = function() {
        xmlhttp = new XMLHttpRequest();
        setInterval(function() {
            xmlhttp.open('GET', '/value?p='+Math.random(), false);
            xmlhttp.send(null);
            if(xmlhttp.status == 200)
                document.getElementById('ajax').innerHTML = xmlhttp.responseText;
        }, 500);
    }

## Серверная часть

На стороне сервера находится простой веб-сервер, написанный на [node.js](http://catethysis.ru/index.php/node-js/), но конечно, то же самое можно сделать и на более простых языках типа б-гомерзкого PHP. Сервер просто отдаёт текущее время. Вот его код:

    var http = require('http');
    var express = require('express');
    var app = express();
    app.use(express.bodyParser());
    
    app.get('/value', function (req, res) {
        today=new Date();
        res.end(today.toLocaleTimeString());
    });
    
    app.listen(9280);

Более того, эта страница может быть даже статичной, т.е. просто html-файлом, который отдаст [nginx](http://catethysis.ru/index.php/%d0%be%d1%82%d0%b4%d0%b0%d1%87%d0%b0-%d1%81%d1%82%d0%b0%d1%82%d0%b8%d0%ba%d0%b8-%d0%bd%d0%b0-nginx/) &#8212; но особого смысла передавать аяксом статику нет, её проще закодить внутрь страницы.

## Подробнее

Однако, мы можем столкнуться с проблемой &#8212; ajax-ответ может кешироваться как и любая другая страница! Но ведь ответ нашего сервера постоянно изменяется, его нельзя кешировать. Для борьбы с этим &#8212; просто добавим случайный параметр к запросу:

    'http://ajax_test.catethysis.ru/value?p='+Math.random()

Теперь кеширование не будет работать, и будут отображаться свежие данные.