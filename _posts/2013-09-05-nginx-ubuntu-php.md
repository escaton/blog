---
id: 73
title: Установка nginx на ubuntu и настройка его для работы с PHP
date: 2013-09-05T23:06:45+00:00
author: catethysis
layout: post
guid: http://192.168.1.10/?p=73
permalink: /nginx-ubuntu-php/
ratings_users:
  - 4
  - 4
  - 4
ratings_score:
  - 20
  - 20
  - 20
ratings_average:
  - 5
  - 5
  - 5
dsq_thread_id:
  - 2726263055
wp_noextrenallinks_mask_links:
  - 0
categories:
  - nginx
tags:
  - linux
  - nginx
  - сервер
---
Я занимаюсь разработкой сайтов на node.js, поэтому давно ушёл от Apache. Поначалу использовал сам node.js в качесте веб-сервера, но это неправильно, да и не очень удобно отдавать им статику.

Недавно мне понадобилось разместить на том же сервере этот блог, а WordPress работает на PHP &#8212; значит, нужно каким-то образом их связывать. Вариант с проксированием через nginx запросов в апач отпал почти сразу &#8212; nginx должен работать на 80 порту, а апач соответственно на каком-то другом. Однако, вордпресс по каким-то причинам не работает на портах, отличных от 80 и 443. К тому же, сервер у меня слабенький, и я не могу позволить себе роскошь держать два запущенных веб-сервера.

Поэтому пробуем другую конфигурацию: nginx работает на 80 порту, и сам обрабатывает PHP вместо Apache. Запросы к блогу он будет отправлять в PHP-код через враппер fast_cgi, а запросы к node.js-сайту &#8212; отправлять в node.js.

<!--more-->

Я пытался сделать это в течение трёх дней, находил странные сложные решения, но в итоге нашёл простой выход.

<pre>sudo apt-get update

sudo apt-get install nginx php5-fpm
sudo nano /etc/php5/fpm/php.ini #cgi.fix_pathinfo=0

#https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install python-software-properties
sudo apt-get install nodejs
sudo apt-get install php5 phpmyadmin
sudo mkdir /var/www
sudo ln -s /usr/share/phpmyadmin /var/www/phpmyadmin

#Теперь есть nginx, nodejs, php и php5-fpm. Ставим wordpress (+mysql)
sudo apt-get install mysql-server php5-mysql</pre>

В nginx создаём файл конфигурации блога:

<pre>sudoedit /etc/nginx/sites-enabled/wordpress</pre>

<pre>server {
 listen 80;
 root /var/www;
 index index.php index.html index.htm;
 server_name catethysis.ru;
 location / {
  try_files $uri $uri/ /index.php?q=$uri&$args;
 }
 error_page 404 /404.html;
 error_page 500 502 503 504 /50x.html;
 location = /50x.html {
  root /usr/share/nginx/www;
 }
# pass the PHP scripts to FastCGI server listening on 127.0.0.1:9$
 location ~ .php$ {
  #fastcgi_pass 127.0.0.1:9000;
  #With php5-fpm:
  fastcgi_pass unix:/var/run/php5-fpm.sock;
  fastcgi_index index.php;
  include fastcgi_params;
 }
}</pre>

И файл конфигурации сайта:

<pre>sudoedit /etc/nginx/sites-enabled/novokosino</pre>

<pre>server {
 listen 80;
 server_name novokosino.tk;
 root /var/www;
 index index.php index.html index.htm;
# server_name 129.168.1.10;
 location / {
 # IP и порт, на которых висит node.js
  proxy_pass http://localhost:7880;
  proxy_set_header Host $host;
 }
}</pre>

Перезагружаем сервера:

<pre>sudo service php5-fpm restart
sudo nginx -s reload</pre>

Не забудьте добавить соответствующие записи в DNS. Всё работает.