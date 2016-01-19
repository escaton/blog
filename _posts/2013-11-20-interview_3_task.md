---
id: 568
title: Собеседование / 3 задание
date: 2013-11-20T03:41:52+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=568
permalink: /interview_3_task/
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
  - 2726265269
categories:
  - JavaScript
tags:
  - javascript
  - собеседование
---
## Задание

Напишите функцию, которая из произвольного входящего массива выберет все комбинации чисел, сумма которых будет равняться 10.

## Уточнения

Некоторые моменты в задании не оговорены, поэтому будем считать что:

  1. порядок комбинаций и чисел в комбинации не важен.
  2. если во входящем массиве есть повторения &#8212; примем их за разные элементы.

<span style="line-height: 1.5;">Сразу сделаем функцию для поиска произвольной суммы &#8212; это несложно, но потом может пригодиться.</span>

## Тестовые значения

Формат: входящий массив / требуемая сумма => массив всех комбинаций.

<pre>[ 7, 10, 2, 5, 3 ] / 10 =&gt; [ [ 10 ], [ 3, 7 ], [ 2, 3, 5 ] ]
[ 7, 10, 2, 5, 3, 1 ] / 10 =&gt; [ [ 10 ], [ 3, 7 ], [ 2, 3, 5 ], [ 1, 2, 7 ] ]
[ 7, 10, 2, 5, 3, 3 ] / 10 =&gt; [ [ 10 ], [ 3, 7 ], [ 3, 7 ], [ 2, 3, 5 ], [ 2, 3, 5 ] ] //повторения
[ 6 ] / 10 =&gt; [ ]
[ 28 ] / 10 =&gt; [ ]</pre>

## Алгоритм работы

Задача сводится к рекурсии, ведь если мы используем в комбинации какой-то элемент E — то требуемая сумма уменьшается на значение E, и нужно провести поиск таких же комбинаций уже для массива без этого элемента.

Идём в цикле по всем элементам массива. Используя какой-то элемент E входящего массива, мы убираем его из рассмотрения, и уменьшаем требуемую сумму на его значение. Получив новый массив (с выколотым элементом E) и новую требуемую сумму, мы:

  1. если сумма равна 0 — нашли конечный элемент цепочки комбинации
  2. если сумма не равна 0 или новый массив равен [] — отбрасываем всю цепочку
  3. иначе — повторяем тот же процесс для новых массива и суммы.

В конце функции нужно также передать обратно сам этот элемент E.
  
Поскольку у меня нет строгого доказательства этого алгоритма, проверим его результат работы автоматизированными тестами &#8212; для большого количества случайных входных данных сравним результаты этого алгоритма и &#171;глупого&#187; алгоритма (простое перечисление всевозможных комбинаций значений, и проверка их сумм), и будем считать это достаточным доказательством.

Вообще говоря, задача является модификацией известной задачи о ранце, и мой вариант решения похож на метод ветвей и границ.

## Листинг программы



<pre><code class="javascript">/*
Быстрый алгоритм
*/
function find_optimized (task) {
	var results=[], new_tasks=[];
	for(i in task.ar)
		// Нашли элемент = требуемой сумме? Это будет концом цепочки.
		if(task.sum==task.ar[i]) results.push([task.ar[i]]); else
		// Если поиск небесполезен - попробуем поискать, начиная с текущего элемента
		if((task.ar.length-1&gt;i)&&(task.sum&gt;task.ar[i])) {
			// Рекурсия с новой (меньшей) суммой и входным массивом с выколотым текущим элементом.
			sub_array=find_optimized( {prev: task.ar[i], sum: task.sum-task.ar[i], ar: task.ar.slice(i*1+1)});
			// Складываем в тот же плоский массив результаты поиска
			for(i in sub_array[1]) results.push([sub_array[0]].concat(sub_array[1][i]));
		}
	// Если не на вершине стека - вернём предыдущий элемент цепочки. Если что-то нашли - вернём ещё и массив результатов.
	return ((results.length==0) ? task.prev:(task.prev==undefined ? results:[task.prev, results]));
}

/*
Медленный, но гораздо более простой алгоритм для сравнения результатов
*/
function find_silly (task) {
	var sub_arrays=[{ar: task.ar, processed: false}], i=0, full_processed=false;
	// Просто перечисляем всевозможные комбинации. Нашли в sub_arrays какой-нибудь массив A - разбиваем
	// его на все подмассивы без одного элемента, и вставляем результат обратно в sub_arrays. Сам массив A
	// помечаем "обработанным".
	while(!full_processed) {
		if(!sub_arrays[i].processed) {
			for (j in sub_arrays[i].ar)
				sub_arrays.push({ar: sub_arrays[i].ar.slice(0, j).concat(sub_arrays[i].ar.slice(j*1+1)),
					processed: (sub_arrays[i].ar.length&gt;2?false:true)});
			sub_arrays[i].processed=true;
		}
		full_processed=true;
		for(j in sub_arrays)
			full_processed=full_processed&sub_arrays[j].processed;
		i++;
	}
	// Чистим массив от повторений с помощью вспомогательного объекта
	var hash={};
	for(i in sub_arrays) hash[sub_arrays[i].ar]=null;
	sub_arrays=[];
	for(i in hash) {
		ar=i.split(',').map(function(value) { return value*1; });
		if(ar.reduce(function(previousValue, currentValue){
			return previousValue+currentValue;
		})==task.sum) sub_arrays.push(ar);
	}
	return sub_arrays;
}

task = {sum: 10, ar: [7, 10, 2, 5, 3, 1]};

array_optimized=find_optimized(task);
array_silly=find_silly(task);

console.log(array_optimized);
console.log(array_silly);</code></pre>

## Юнит-тест

<pre><code class="javascript">var test = function () {
	total_test=true;
	for(test_i=0; test_i&lt;10; test_i++)
	{
		task={sum: Math.round(Math.random()*20), ar: []}
		len=2+Math.round(Math.random()*4);
		for(j=0;j&lt;1*len;j++) task.ar.push(1+Math.round(Math.random()*10));

		array_optimized=find_optimized(task);
		array_silly=find_silly(task);
		for(i in array_optimized) {
			found=false;
			for(j in array_silly)
				for(k in array_silly[j]) found&#038;=(array_silly[j][k]==array_optimized[i][k]);
			total_test&#038;=found;
		}
	}
	return (total_test==0);
}</code></pre>

Сравниваем результаты работы быстрого метода и точного метода. Код проходит тесты на наборе из 100 случайных заданий - с большой вероятностью можно утверждать, что алгоритм и код правилен.

## <span style="line-height: 1.3;">Скорость работы</span>

Проверим скорость алгоритмов с помощью <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://jsperf.com/ya-2-optimized/7" >jsperf.com</a> — умный алгоритм в сто раз быстрее на массиве из 5 чисел.

Сложность алгоритма — не более O(2<span class="upperline">n</span>).


  
<button onclick="test3()">Тест</button>

<div class="test_console" id="console3">
  Нажмите кнопку "тест"
</div>