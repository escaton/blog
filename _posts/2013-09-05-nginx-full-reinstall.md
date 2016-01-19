---
id: 75
title: Полная переустановка nginx (решено)
date: 2013-09-05T23:16:41+00:00
author: catethysis
layout: post
guid: http://192.168.1.10/?p=75
permalink: /nginx-full-reinstall/
notely:
  - 
  - 
  - 
wp_noextrenallinks_mask_links:
  - 0
  - 0
  - 0
ratings_users:
  - 7
  - 7
  - 7
ratings_score:
  - 35
  - 35
  - 35
ratings_average:
  - 5
  - 5
  - 5
dsq_thread_id:
  - 2726443948
categories:
  - nginx
tags:
  - apt
  - linux
  - nginx
  - глюк
  - сервер
---
После очередного эксперимента с nginx мне оказалось проще переустановить его заново, чем отменять правки всех конфигурационных файлов. Однако, нужно правильно обойтись с конфигами.

<!--more-->

**Проблема:** после переустановки nginx пишет &#171;Restarting nginx: nginx: [emerg] open() &#171;/etc/nginx/nginx.conf&#187; failed (2: No such file or directory)&#187;.

**Решение:** чисто удалить nginx и [переустановить](http://catethysis.ru/index.php/%d1%83%d1%81%d1%82%d0%b0%d0%bd%d0%be%d0%b2%d0%ba%d0%b0-nginx-%d0%bd%d0%b0-ubuntu-%d0%b8-%d0%bd%d0%b0%d1%81%d1%82%d1%80%d0%be%d0%b9%d0%ba%d0%b0-%d0%b5%d0%b3%d0%be-%d0%b4%d0%bb%d1%8f-%d1%80%d0%b0%d0%b1/ "Установка nginx на ubuntu и настройка его для работы с PHP") его с ключом &#8212;reinstall:

<pre>#удаляем nginx и все связанные пакеты
sudo apt-get remove nginx*

#удаляем рабочие директории и логи
sudo rm -rf /etc/nginx/ /usr/sbin/nginx /usr/share/man/man1/nginx.1.gz

#удаляем остатки nginx из базы apt
sudo apt-get --purge autoremove nginx && sudo dpkg --purge nginx

#устанавливаем nginx заново с чистыми конфигами
sudo apt-get -o DPkg::options::=--force-confmiss --reinstall install nginx</pre>

Так можно переустанавливать и другие приложения.

<a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://serverfault.com/questions/317191/how-to-install-nginx-and-install-the-configuration-files-too"  target="_blank">Источник</a>