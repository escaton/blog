---
id: 134
title: Русский язык в MySQL 5.5
date: 2013-09-09T04:56:36+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=134
permalink: /mysql-5-5-cyrllic-encoding/
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
  - 2763556442
categories:
  - Linux
tags:
  - linux
  - mysql
  - глюк
---
MySQL 5.5.32 неверно работает с русским языком. Решение простое:

Редактируем файл  /etc/mysql/conf.d/utf8_charset.cnf &#8212; добавляем следующие строки:

<pre>[mysqld]
character-set-server=utf8
collation-server=utf8_general_ci
skip-character-set-client-handshake</pre>

Перезагружаем сервер MySQL, заходим в его консоль:

<pre>sudo service mysql restart
mysql -u USER -pPWD</pre>

Проверяем изменения:

<pre>mysql&gt; SHOW VARIABLES LIKE 'char%';
+--------------------------+----------------------------------+
| Variable_name            | Value                            |
+--------------------------+----------------------------------+
| character_set_client     | utf8                             |
| character_set_connection | utf8                             |
| character_set_database   | utf8                             |
| character_set_filesystem | binary                           |
| character_set_results    | utf8                             |
| character_set_server     | utf8                             |
| character_set_system     | utf8                             |
| character_sets_dir       | /usr/local/share/mysql/charsets/ |
+--------------------------+----------------------------------+
8 rows in set (0.01 sec)</pre>

Конечно, придётся создать новую таблицу.

<a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://fastandclever.ru/gnu-linux/pereklyuchaem-kodirovku-mysql-5-5-v-ubuntu-12-04-na-utf-8/" >Источник</a>