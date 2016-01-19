---
id: 758
title: JavaScript tips`n`tricks
date: 2013-12-12T05:10:48+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=758
permalink: /javascript-tipsntricks/
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
  - 2737554008
categories:
  - JavaScript
  - Исследования
tags:
  - javascript
---
### Условное выполнение

вместо if(success) obj.start(); else obj.stop();
  
obj\[success?&#8217;start':&#8217;stop&#8217;\]();
  
или success?obj.start():obj.stop();

### Подстановки в шаблоне

text = text.split(&#8216;{&#8216; + i + &#8216;}&#8217;).join(replacements[i])

<!--more-->

### Генерирование случайных строчек

s+=String.fromCharCode(Math.floor(26+Math.random()*50)); в цикле.
  
Можно гораздо проще:
  
Math.random().toString(33).substr(2); &#8212; в методе Number.toString параметр означает основание системы счисления.

### Генерирование битовых масок

(123).toString(2) // 111011
  
Битовая маска в массиве: (123).toString(2).split(&#187;).reverse().map(function(item) { return +item; });

### Что быстрее &#8212; проверять равенство строчек или boolean?

<a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://jsperf.com/string-vs-bool-equals" >http://jsperf.com/string-vs-bool-equals</a>
  
строчки быстрее, но всего на 20%. Когда удобнее &#8212; можно ограничится строчками вместо булевского флага.

### Что быстрее &#8212; конкатенация строк или join?

<a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://jsperf.com/catethysis-concat/2" >http://jsperf.com/catethysis-concat/2</a>
  
конкатенация гораздо быстрее, однако join хардкод-символов не сильно медленнее. Хотя их проще сразу упаковать в строчку.

### Уловки map

([&#8216;1&#8242;, &#8216;2&#8217;, &#8216;3&#8217;]).map(parseInt) // [1, NaN, NaN]
  
([1, 2, 3]).map(toString) // [undefined, undefined, undefined]

Map передаёт три параметра (item, index, list), а parseInt и toString вторым параметром принимают основание системы счисления.

### Сгруппировать слова из одинаковых букв

<pre><code class="javascript">var in_words=['абв', 'днш', 'вба'];

var sorted_words=[];
in_words.forEach(function(item, index) {
	sorted_words.push(item.split('').sort().join(''));
});

console.log(sorted_words); // ['абв', 'днш', 'абв']

var hash={};
for(var i in sorted_words) hash[sorted_words[i]]=1;
var unique_words=Object.keys(hash); // ['абв', 'днш']

var out_words=[];

for(var i in unique_words) {
	var out_word=[];
	for(var j in sorted_words)
		if(unique_words[i]==sorted_words[j])
			out_word.push(in_words[j]);
	out_words.push(out_word);
}

console.log(out_words);</code></pre>

### Двоичный хеш

Для объединения большого количества массивов с элементами из небольшого списка удобнее не объединять в цикле массивы, а заранее назначить двоичный хеш каждому массиву, и объединять хеши побитовым И. Хеш из простых чисел не работает, поскольку содержит неоднозначные соответствия хеш<->массив.

### <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://JSperf.com/" >JSperf.com</a>

Очень удобен для выбора оптимальной реализации алгоритма.

### Удаление дубликатов

    var hash={};
    for(var i in arr) hash[arr[i]]=1;
    var unique_arr=Object.keys(hash);