---
id: 322
title: Парсим html — cheerio / node.js
date: 2013-09-23T09:16:30+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=322
permalink: /cheerio-node-js/
ratings_users:
  - 3
  - 3
  - 3
ratings_score:
  - 11
  - 11
  - 11
ratings_average:
  - 3.67
  - 3.67
  - 3.67
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 2727892043
categories:
  - Модули node.js
  - Руководства
tags:
  - node.js
  - модули
---
Cheerio — это один из самых быстрых html DOM парсеров вообще, и самый быстрый парсер на платформе node.js. Он создаёт DOM-дерево страницы, и предоставляет удобный jQuery-like интерфейс для работы с этим деревом.

Страница на <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/https://github.com/MatthewMueller/cheerio/"  target="_blank">github</a>, страница на <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/https://nodejsmodules.org/pkg/cheerio/"  target="_blank">nodejsmodules</a>. Устанавливается командой npm install cheerio.

<!--more-->

Простой пример работы с ним (понадобится модуль request для загрузки страниц):

<pre>var request = require('request'), cheerio = require('cheerio');

//Загружаем страницу
request({uri:'http://www.amazon.com/', method:'GET', encoding:'binary'},
    function (err, res, page) {
        //Передаём страницу в cheerio
        var $=cheerio.load(page);
        //Идём по DOM-дереву обычными CSS-селекторами
        img_src=$('div.s9a3 &gt; div &gt; div &gt; a &gt; div &gt; div &gt; img').attr("src");
        console.log(img_src);
    });</pre>

Вся навигация производится CSS-селекторами, однако есть возможность использования XPath для более удобного выбора. К слову сказать, приведённый пример выполняется довольно быстро: я проводил бенчмарк на процессоре Atom 330, и при 100 прогонах теста один прогон занимал ровно 100 миллисекунд. Приемлемая скорость, особенно если учесть что страница amazon.com немаленькая, и мы делаем довольно сложный вложенный запрос.

Видимо, модуль использует JiT-компиляцию, хранение вычисленных значений, какой-то кеш и прочие плюшки динамического программирования, а так же следит за использованием памяти &#8212; поэтому с ростом числа циклов время выполнения сокращается: 1 прогон &#8212; 770 мс, 10 прогонов &#8212; 170 мс, 100 &#8212; 100 мс, 1000 &#8212; 90 мс.

После выбора элемента можно что-то с ним сделать &#8212; прочитать его html-код либо какой-то отдельный атрибут, найти его детей или соседей, а также добавить/убрать классы. Всё это реализовано в cheerio:

**.attr()** — стандартный <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://api.jquery.com/attr/"  target="_blank">синтаксис attr</a>, как в jQuery:

<p style="padding-left: 30px;">
  $().attr(prop) = val или $().attr(prop, val) устанавливает свойству prop значение val; val = $().attr(prop) читает значение свойства prop в переменную val. Установку свойств можно комбинировать: $().attr({prop1: val1, prop2: val2}).
</p>

<p style="padding-left: 30px;">
  Дополнительно функция $().attr(prop, val) возвращает сам этот элемент, можно тут же прочитать, например, его html-код: elem_html = $().attr(prop, val).html();
</p>

**.html()** возвращает html-код, а .html(&#8216;some html code&#8217;) заменяет содержимое элемента DOM-дерева переданным кодом.

**.data()** возвращает объект с перечнем всех свойств элемента, а .data(prop) &#8212; значение конкретного свойства.

**.addClass()** и **.removeClass()** работают полностью как в jQuery &#8212; добавляют и удаляют указанный класс к элементу.

**.next()** и **.prev()** возвращают соседей &#8212; предыдущий и следующий элементы дерева.