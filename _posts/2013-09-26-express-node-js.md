---
id: 405
title: Самый важный модуль — express / node.js
date: 2013-09-26T19:09:30+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=405
permalink: /express-node-js/
ratings_users:
  - 3
  - 3
  - 3
ratings_score:
  - 15
  - 15
  - 15
ratings_average:
  - 5
  - 5
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 2726984073
categories:
  - Модули node.js
  - С нуля
tags:
  - node.js
  - модули
---
Многие уже не воспринимают node.js без этого модуля. Он здорово упрощает рутинные операции по созданию сервера, работе с запросами и всякой маршрутизацией.

<!--more-->Страница на 

<a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/https://github.com/visionmedia/express"  target="_blank">github</a>, страница на <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/https://nodejsmodules.org/pkg/express"  target="_blank">nodejsmodules</a>, <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://expressjs.com/"  target="_blank">сайт проекта</a>.

## Запрос

Простейший код для создания сервера, отдающего &#171;hello&#187; на запрос корня:

<pre>var http = require('http');
var express = require('express');
var app = express();
app.use(express.bodyParser());

app.get('/', function (req, res) {
    res.end('hello!');
});

app.listen(19880);</pre>

Все функции библиотеки возвращают обратно объект app, поэтому их можно цепочить:

<pre>app.get('/', function (req, res) { res.end('hello!'); }).listen(19880);</pre>

Чтобы ответить на POST-запрос, просто используйте app.post(&#8216;/&#8217;, function (req, res) {}); Для ответа на запрос конкретного пути используйте

<pre>app.get('/index.htm') - реагирует на запрос site/index.htm
app.get('/files/file.htm') - реагирует на запрос site/files/file.htm</pre>

### Переменные пути

<pre>app.get('/:file') - реагирует на запрос любой страницы из корня
app.get('/:folder/:file') - реагирует на запрос любой страницы из любой папки
app.get('/files/:file') - реагирует на запрос любой страницы из папки files</pre>

Запрос попадает в переменную req. Все переменные доступны как &#171;req.params.имя_переменной&#187;, например в приведённом примере можно получить значения req.params.file, req.params.folder. Конечно, это нужно использовать с умом &#8212; допустим, сначала поставить в очередь обработки (разместить выше) функцию, реагирующую на &#171;/&#187;, потом &#171;/index.htm&#187;, и уже потом &#171;/:file&#187;, поскольку весь перечень обработчиков обходятся последовательно, и обход прекращается при достижении подходящего обработчика.

### Параметры клиента

Доступны некоторые параметры вроде IP юзера (req.ip), URL страницы (req.path), протокол (req.protocol).

### Данные запроса

При запросе пути вроде /index.htm?a=5&long\_variable\_name=7 значения переменных попадают в req.query.a и req.query.long\_variable\_name соответственно.

## Ответ сервера

Это поле деятельности переменной res. res.send или res.end отправляют ответ сервера &#8212; код ответа и текст страницы. Любое из полей может быть пропущено, допустим res.send(&#8216;hello&#8217;); отправит страницу с текстом hello и код 200, а res.send(404); отправит код ошибки 404. Также можно отправлять массивы и объекты, тогда send преобразует их в json-строки.

### Передача файлов

Очевидно, так можно отправлять и файлы в бинарном виде, только сначала надо их загрузить с помощью библиотеки fs. Чтобы сообщить клиенту тип передаваемого файла, служит функция res.type(), например res.type(&#8216;html&#8217;) для html-кода (по умолчанию), или res.type(&#8216;png&#8217;) для PNG-картинки (используйте PNG в своих проектах!)

На самом деле, куда проще отправлять файл командой res.attachment(&#8216;путь\_к\_файлу&#8217;) или её расширенным вариантом res.sendfile(&#8216;путь\_к\_файлу&#8217;, [options], function (err) {}). Но это для &#171;нескачиваемых&#187; файлов &#8212; элементов вёрстки, js-кода или css-файлов, картинок.

### Передача загружаемых файлов

Очень легко можно осуществить передачу &#171;скачиваемого&#187; файла, т.е. такого который вызовет появление у юзера окошка &#171;Загрузить файл&#187;.

    res.download('/archive.zip', 'file_on_disk.zip', function(err){
      if (!err) { downloads_remaining_count--; }
    });

Вот мы и сделали файлохостинг с ограниченным количеством загрузок файлов <img src="http://catethysis.ru/wp-includes/images/smilies/icon_smile.gif" alt=":)" class="wp-smiley" />

## Загрузка файлов

Чтобы дать юзеру возможность загружать к вам файлы, сделайте следующее. Отдайте ему методом GET страницу с кодом

<pre>&lt;form method="post" enctype="multipart/form-data"&gt;
    File: &lt;input type="file" name="downloaded_file" multiple="multiple"&gt;
    &lt;input type="submit" value="Upload"&gt;
&lt;/form&gt;</pre>

В обработчике POST этой страницы вы получите переменную req.files.downloaded_file. Если было загружено несколько файлов, то это массив объектов (с параметром length = количество файлов), если был загружен один файл &#8212; это объект. В каждом объекте будет записан путь к нему. Кстати, папку для сохранения временных файлов можно задать в самом начале кода, при создании объекта app &#8212; передайте методу bodyParser соответствующий параметр:

<pre>express.bodyParser({ uploadDir: 'photos' }));</pre>

## Подключаемые модули express.js

Мы обошли вниманием строку app.use(express.bodyParser()) при инициализации модуля, а она между прочим очень важна. Функция use &#8212; это интерфейс подключения дополнительных модулей к express.js. bodyParser &#8212; это мета-модуль, объединяющий модули json, urlencoded и multipart. Все их можно подключать по отдельности, и передавать им какие-то параметры. Существует ещё несколько модулей, самые полезные &#8212; logger и compress, которые включает gzip-сжатие страниц.