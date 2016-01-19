---
id: 249
title: Отдача статики на nginx
date: 2013-09-20T23:55:51+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=249
permalink: /nginx-static-content/
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
  - 2727958797
categories:
  - nginx
tags:
  - linux
  - nginx
  - сервер
---
Статический контент сайта &#8212; это картинки, css и js файлы, а также вложения в постах, т.е. всё то что не предполагает частого изменения.

Желательно, во-первых, обрабатывать их в [nginx](http://catethysis.ru/index.php/%d1%83%d1%81%d1%82%d0%b0%d0%bd%d0%be%d0%b2%d0%ba%d0%b0-nginx-%d0%bd%d0%b0-ubuntu-%d0%b8-%d0%bd%d0%b0%d1%81%d1%82%d1%80%d0%be%d0%b9%d0%ba%d0%b0-%d0%b5%d0%b3%d0%be-%d0%b4%d0%bb%d1%8f-%d1%80%d0%b0%d0%b1/ "Установка nginx на ubuntu и настройка его для работы с PHP"), а не складывать на плечи node.js &#8212; потому что nginx имеет богатые средства кеширования и удобную подстановку заголовков.
  
Также стоит отдавать их с отдельного поддомена &#8212; потому что это удобнее, а при расширении сайта можно будет весь этот поддомен переместить на другой сервер и другой IP &#8212; и получить возможность параллельной загрузки статических файлов, а значит значительное ускорение загрузки сайта. А там уже рукой подать до CDN.

Для этого заводим отдельный &#171;сервер&#187; в конфигурации nginx:

<pre>server {
        listen 80;

        server_name static.catethysis.ru;

        location ~* .(jpg|jpeg|gif|png|ico|css|zip|rar|pdf)$ {
                root /var/www/static;
                error_page 404 = 404;
        }
}</pre>

И перезагружаем nginx (sudo nginx -s reload).
  
Теперь можно создать папку /var/www/static/files и поместить туда какой-нибудь файл. Он станет доступен по адресу <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://static.catethysis.ru/files/lm2596.pdf" >http://static.catethysis.ru/files/lm2596.pdf</a>.

Файлы можно хранить и во вложенной папке, например так: <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://static.catethysis.ru/files/tags/javascript.png" >http://static.catethysis.ru/files/tags/javascript.png</a>.