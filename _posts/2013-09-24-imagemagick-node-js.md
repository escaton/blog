---
id: 333
title: Работа с изображениями — imagemagick / node.js
date: 2013-09-24T05:14:09+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=333
permalink: /imagemagick-node-js/
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
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 2728109400
categories:
  - Модули node.js
tags:
  - node.js
  - модули
---
Известная линуксовая консольная программа imagemagick есть и в виде модуля для node.js. Список её возможностей широк и впечатляющ: ресайз картинок с различными параметрами, геометрические трансформации, доступ к EXIF (просмотр и редактирование), а также рисование и добавление водяных знаков.

<!--more-->

Для начала, установим её командой npm install imagemagick. Использовать её просто:

<pre>//Подключаем
var imagic = require('imagemagick');

//Ресайзим
imagic.resize({ srcPath: path, dstPath: path_m, width: 1621, filter: 'Point' }, function(err, stdout, stderr){
    if (err) throw err;
});

//Читаем EXIF, параметр "дата/время съёмки"
imagic.readMetadata(path, function(err, metadata)
{
    if (err) throw err;
    capture_time=metadata.exif.dateTimeOriginal;
});</pre>