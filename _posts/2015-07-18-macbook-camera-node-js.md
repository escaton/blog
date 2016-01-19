---
id: 2364
title: Фотография с вебкамеры MacBook в Node.js
date: 2015-07-18T13:37:09+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2364
permalink: /macbook-camera-node-js/
ratings_users:
  - 1
ratings_score:
  - 5
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 3949383506
categories:
  - Node.js
  - Модули node.js
---
Существует модуль <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/https://github.com/danyshaanan/imagesnapjs" >imagesnap.js</a>, который включает вебкамеру MacBook, делает с неё фотографию и сохраняет её в файл. Он является враппером над imagesnap, и конечно работает только в OSX. Использование очень простое:

<pre><code class="js">var imagesnapjs = require('imagesnapjs'), fs = require('fs');

var filename = '/Users/catethysis/webcam/webcam.jpg';

fs.exists(filename, function (exists) {
	if(exists)
		fs.unlinkSync(filename);

	imagesnapjs.capture(filename, { cliflags: '-w 2'}, function(err) {
		console.log(err ? err : 'Success!');
	});
});
</code></pre>

Он не перезаписывает существующий файл, поэтому я сначала проверяю наличие файла, и если он есть &#8212; удаляю его.

К недостаткам модуля можно отнести скудную документацию, и возможность съёмки только фотографий, но это ограничение самой утилиты imagesnap. Для видео вам скорее всего понадобится <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/https://github.com/wearefractal/camera"  rel="nofollow">https://github.com/wearefractal/camera</a>.