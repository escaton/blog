---
id: 404
title: 'Модули node.js: быстрый старт'
date: 2013-09-26T19:48:58+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=404
permalink: /node-js-modules-kickstart/
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
notely:
  - 
  - 
  - 
dsq_thread_id:
  - 2726263848
wp_noextrenallinks_mask_links:
  - 0
categories:
  - Node.js
  - Модули node.js
  - Руководства
  - С нуля
tags:
  - node.js
  - модули
---
На этой странице я соберу примеры кода для всех популярных node.js модулей, чтобы вы могли быстро войти в суть дела и начать их использовать. На многие модули есть отдельные страницы, а вот [здесь](http://catethysis.ru/index.php/node-js/ "node.js") написано про сам node.js, ну и чуть–чуть про его модули.

<!--more-->

## express.js

Простейший код для создания сервера, отдающего &#171;hello&#187; на запрос корня:

<pre>установка: npm install express

var http = require('http');
var express = require('express');
var app = express();
app.use(express.bodyParser());

app.get('/', function (req, res) {
    res.end('hello!');
});

app.listen(19880);</pre>

Подробнее про [express.js](http://catethysis.ru/index.php/%d1%81%d0%b0%d0%bc%d1%8b%d0%b9-%d0%b2%d0%b0%d0%b6%d0%bd%d1%8b%d0%b9-%d0%bc%d0%be%d0%b4%d1%83%d0%bb%d1%8c-express-node-js/ "Самый важный модуль — express / node.js").

## fs.js

Загрузка файла с диска и сохранение под другим именем:

<pre>var fs = require('fs');

fs.readFile('file.dat', function (err, data) {
    console.log(data);
    fs.open('file.dat', "w", 0644, function (err, file_handle){
        if(!err) fs.write(file_handle, 'new_data', null, 'utf8', function (err, written) {
            console.log('successfull');
        });
    });
});</pre>

Примечание — в этом примере не получится прочитать информацию из файла, а потом записать её в новый файл, потому что во внутренней функции data недоступна из–за заморочек с замыканиями.

## request.js

Загрузка файла из интернета.

<pre>var request = require('request');

request({uri:'http://www.amazon.com/', method:'GET', encoding:'binary'},
    function (err, res, page) {
        console.log(page);
});</pre>

## iconv–lite.js

Переход между различными кодировками, например конвертирование текста из win1251 в utf8:

<pre>установка: npm install iconv-lite

iconv = require('iconv-lite');

result = iconv.encode (iconv.decode (new Buffer (body, 'binary'), 'win1251'), 'utf8'));</pre>

## cheerio.js

Парсер DOM–дерева веб–страниц.

<pre>установка: npm install cheerio

var $ = cheerio.load(page); //Заранее скачать страницу с помощью request

$('a').each(function(){
    console.log(this.attr("href"));
});</pre>

Подробнее про [cheerio.js](http://catethysis.ru/index.php/cheerio-node-js/ "Парсим html — cheerio / node.js").

## vow.js

Работа с параллельно выполняющимися потоками.

<pre>установка: npm install vow

var vow = require('vow');
var semaphore1 = vow.promise();
var semaphore2 = vow.promise();
setTimeout(function() {semaphore1.fulfill(0);}, 5000);
setTimeout(function() {semaphore2.fulfill(0);}, 7000);
vow.all ([semaphore1, semaphore2]).then (function (value) {
    console.log('Завершились оба потока');
});</pre>

Подробнее про [vow.js](http://catethysis.ru/index.php/promise-%d0%b2-node-js-%d0%b1%d0%b8%d0%b1%d0%bb%d0%b8%d0%be%d1%82%d0%b5%d0%ba%d0%b0-vow/ "Promise в Node.js (библиотека Vow)").

## mysql.js

Общение с базой данных MySQL.

<pre>установка: npm install mysql

var mysql = require('mysql');
var connection = mysql.createConnection({ host: 'localhost', user: '<em>db_user</em>', password: '<em>db_user_pwd</em>'});
connection.connect();
connection.query('use <em>database</em>');

connection.query('select * from <em>table</em>;', function(error, fields, result) {
    if (error) { throw error; }
    console.log(result);
});</pre>

Подробнее про [mysql.js](http://catethysis.ru/index.php/%d1%80%d0%b0%d0%b1%d0%be%d1%82%d0%b0-%d1%81-mysql-%d0%b2-nginx/ "Работа с MySQL в Node.js").

## imagemagick.js

Работа с изображениями.

<pre>установка: npm install imagemagick

var imagic = require('imagemagick');

imagic.resize({ srcPath: path, dstPath: path_m, width: 1621, filter: 'Point' }, function(err, stdout, stderr){
    if (err) throw err;
});</pre>

Подробнее про [imagemagick.js](http://catethysis.ru/index.php/%d1%80%d0%b0%d0%b1%d0%be%d1%82%d0%b0-%d1%81-%d0%b8%d0%b7%d0%be%d0%b1%d1%80%d0%b0%d0%b6%d0%b5%d0%bd%d0%b8%d1%8f%d0%bc%d0%b8-imagemagick-node-js/ "Работа с изображениями — imagemagick / node.js").

## cron.js

Выполнение функций по расписанию.

<pre>установка: npm install cron

var cronJob = require('cron').CronJob;

new cronJob('* */10 * * * *', function() {
    console.log('Прошло десять минут');
}</pre>

Подробнее про [cron.js](http://catethysis.ru/index.php/%d0%bc%d0%be%d0%b4%d1%83%d0%bb%d1%8c-node-js-cron/ "Расписания — cron / node.js").

## highlight.js

Подсветка синтаксиса.

<pre>установка: npm install highlight

var hljs = require("highlight.js");
var text = "var a = 5;";
html = hljs.highlight('javascript', text).value;
console.log(html);</pre>

Подробнее про [highlight.js](http://catethysis.ru/index.php/%d0%bf%d0%be%d0%b4%d1%81%d0%b2%d0%b5%d1%82%d0%ba%d0%b0-%d1%81%d0%b8%d0%bd%d1%82%d0%b0%d0%ba%d1%81%d0%b8%d1%81%d0%b0-highlight-js-node-js/ "Подсветка синтаксиса — highlight.js / node.js").