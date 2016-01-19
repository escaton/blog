---
id: 332
title: Подсветка синтаксиса — highlight.js / node.js
date: 2013-09-24T04:56:30+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=332
permalink: /highlight-js-node-js/
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
  - 2728661988
categories:
  - Модули node.js
  - Обзоры
tags:
  - node.js
  - модули
---
Для красивой подсветки кода в приложениях на node.js можно использовать библиотеку highlight.js.

<!--more-->

Страница на <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/https://github.com/isagalaev/highlight.js" >github</a>, страница на <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/https://nodejsmodules.org/pkg/highlight.js" >nodejsmodules</a>, <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://softwaremaniacs.org/soft/highlight/" >сайт библиотеки</a>, <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://softwaremaniacs.org/soft/highlight/download/" >скачать</a>.

Пример использования:

<pre>var hljs = require("highlight.js");
var text = "var array = []; array.push(5); console.log(array[0]);";
html = hljs.highlight('javascript', text).value;
console.log(html);</pre>

Этот код вернёт строку &#171;<span>var</span> array = []; array.push(<span>5</span>); console.log(array[<span>0</span>]);&#187;, что в сочетании с соответствующим css (например, <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://yandex.st/highlightjs/7.3/styles/monokai.min.css" >monokai</a> из репозитория яндекса) даст подсвеченный код. Можно указывать язык (первый параметр в функции highlight), а можно воспользоваться автоопределением языка, вызвав функцию highlightAuto(код).

Можно её использовать и в браузерном javascript, по умолчанию она раскрашивает всё в тегах <pre><code>..</code></pre>. Подключается командами:

<pre>&lt;link rel="stylesheet" href="styles/default.css"&gt;
&lt;script src="highlight.pack.js"&gt;&lt;/script&gt;
&lt;script&gt;hljs.initHighlightingOnLoad();&lt;/script&gt;</pre>

Браузерный модуль есть в <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://api.yandex.ru/jslibs/libs.xml#highlightjs" >репозитории яндекса</a>.

Есть и <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://wordpress.org/plugins/wp-highlightjs/"  target="_blank">модуль для WordPress</a> на основе этой библиотеки.