---
id: 197
title: Видеонаблюдение в Ubuntu Server
date: 2013-09-13T07:10:32+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=197
permalink: /ubuntu-server-video-surveillance/
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
  - 2726289186
categories:
  - Сервер
tags:
  - linux
  - видеонаблюдение
  - сервер
---
Продолжаю цикл статей про сервер на убунте. Какой умный дом без видеонаблюдения за каждым углом? Тем более, что это так просто сделать и это тратит так мало ресурсов процессора.

В этом действительно нет ничего сложного, сделаем всё с помощью <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://sourceforge.net/projects/mjpg-streamer/"  target="_blank">mjpeg-streamer</a>. Я пробовал также вариант с ffmpeg/ffserver, в новых версиях убунты они стали называться avconv. Однако, я столкнулся со следующей проблемой &#8212; видео накапливается в буфере, и выходит наружу со скоростью полтора-два раза меньше. То есть, спустя пару минут работы такого видеосервера появляется задержка примерно в минуту. Что будет спустя час, я не проверял &#8212; снёс и установил mjpeg-streamer  <img src="http://catethysis.ru/wp-includes/images/smilies/icon_smile.gif" alt=":)" class="wp-smiley" />Удивительно, но правка конфигов, переход на сверх-убогое качество видео, изменение значений fps ничего не дали.

Скачиваем сборку mjpg-streamer. С ней были проблемы, вот <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/https://www.dropbox.com/s/8mo6cpl92y0f909/mjpeg-streamer_fixed.deb" >отремонтированная версия</a>.
  
Устанавливаем: sudo apt-get install libjpeg62 && sudo dpkg &#8212;install mjpeg-streamer_fixed.deb
  
Запускаем: sudo mjpg\_streamer -i &#171;input\_uvc.so -d /dev/video0&#8243; -o &#171;output_http.so -p 8091&#8243;

Просмотр видео по адресу &#171;ip сервера&#187;:8091/?action=stream, встраивать в html можно так: <img src=&#187;http://192.168.1.10:8091/?action=stream&#187;/>

Ссылки: <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://habrahabr.ru/post/118945/" >1</a>, <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://dineradmin.wordpress.com/2011/07/05/479/" >2</a>.