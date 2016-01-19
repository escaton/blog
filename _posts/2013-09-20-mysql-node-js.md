---
id: 142
title: Работа с MySQL в Node.js
date: 2013-09-20T09:49:32+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=142
permalink: /mysql-node-js/
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
wp_noextrenallinks_mask_links:
  - 0
  - 0
  - 0
dsq_thread_id:
  - 2726254490
categories:
  - Модули node.js
tags:
  - mysql
  - node.js
  - модули
---
С помощью пакета node-mysql можно обращаться к MySQL-базам из Node.js.Устанавливаем:

<pre>npm install mysql</pre>

Подключаем в проект:

<pre>var mysql = require('mysql');
var connection = mysql.createConnection({ host: 'localhost', user: '<em>db_user</em>', password: '<em>db_user_pwd</em>'});
connection.connect();
connection.query('use <em>database</em>');</pre>

Курсивом выделены имя/пароль пользователя MySQL, а так же название базы.

Используем:

<pre>connection.query('select * from <em>table</em>;', function(error, fields, result) {
    if (error) { throw error; }
    //работаем с массивом result
});</pre>

Важные замечания:

  * Не нужно забывать делать if (error) { throw error; } сразу в обработчике. Иначе могут происходить зависания обработчика даже если ошибок не возникло.
  * Запрос к базе сравнительно медленный, поэтому лучше всего его делать асинхронно. Делается это через [promise](http://catethysis.ru/?p=218 "Promise в Node.js (библиотека Vow)").