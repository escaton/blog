---
id: 764
title: Функциональные методы в JavaScript
date: 2013-12-12T06:08:04+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=764
permalink: /javascript-functional-methods/
notely:
  - 
  - 
  - 
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
  - 2749266754
categories:
  - JavaScript
tags:
  - javascript
---
SIMD-операции над массивами: forEach, map, reduce.

<!--more-->

## forEach

Синтаксис: [].forEach(callback[, thisArg]). Функция callback принимает параметры element, index и array.

## map

Синтаксис: [].map(callback[, thisArg]). Функция callback принимает параметры element, index и array.

#### Примеры

Возведение в квадрат всех элементов массива:
  
[1,2,3].map(function(a) { return a*a; });

Массив с кодами символов:
  
Array.prototype.map.call(&#171;Hello World&#187;, function(x) { return x.charCodeAt(0); })

#### Примечания

Не забывайте про [уловки map](http://catethysis.ru/index.php/javascript-tipsntricks/ "JavaScript tips`n`tricks"):
  
([&#8216;1&#8242;, &#8216;2&#8217;, &#8216;3&#8217;]).map(parseInt) // [1, NaN, NaN]
  
([1, 2, 3]).map(toString) // [undefined, undefined, undefined]
  
Map передаёт в callback-функцию три параметра (item, index, list), а parseInt и toString вторым параметром принимают основание системы счисления.

## reduce

Синтаксис: [].reduce(callback[, initialValue]). Функция callback принимает параметры previousValue, currentValue, index и array.

Функция последовательно вызывается для каждого существующего элемента массива, с нулевого и до последнего (слева направо). Есть функция reduceRight, идущая в обратном направлении, с последнего элемента до нулевого.

#### Примеры

Сложение всех элементов массива:
  
[1,2,3].reduce(function(a, b) { return a+b; });

Join массива в строку, тот же код callback:
  
[&#8216;a&#8217;, &#8216;bc&#8217;, &#8216;def&#8217;].reduce(function(a, b) { return a+b; });

Сделать массив одномерным:
  
[[1, 5], [10, 8, 9 ] ].reduce(function(a, b) { return a.concat(b); });

**Матстатистика:**

<pre><code class="javascript">var arr=[1,2,3];

//Среднее значение массива (матожидание):
var mean=arr.reduce(function(a, b) { return a+b; })/arr.length;

//Среднеквадратичное отклонение:
var std_deviation=Math.sqrt(arr.reduce(function(a, b) {
	var dev = b - mean;
	return a+dev*dev;
})/arr.length);
</code></pre>

#### Примечания

Нужно помнить, что первый параметр функции callback &#8212; это значение суммы, поэтому для сложения значений массива объектов нужно писать так: [{x:1},{x:2},{x:4}].arr.reduce(function(a,b){return {x: a.x + b.x};}) &#8212; накапливаем сумму в объекте с полем x. Можно сделать иначе, объявлять начальное значение: [{x:1}, {x:2}, {x:4}].reduce(function (a, b) { return a + b.x; }, 0);

Для получения суммы квадратов чисел можно сделать так: [1,2,3].map(function(a) { return a\*a; }).reduce(function(a, b) {return a+b; }); а можно так: [1,2,3].reduce(function(a, b) { return a+b\*b; });