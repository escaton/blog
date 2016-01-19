---
id: 595
title: Собеседование / 2 задание
date: 2013-11-23T13:05:50+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=595
permalink: /interview_2_task/
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
  - 2726264271
categories:
  - JavaScript
tags:
  - javascript
  - собеседование
---
Задание оставляет недосказанность &#8212; нужно ли просто ограничивать темп вызовов функции (и отклонять лишние), или же необходимо складывать все вызовы в очередь и выполнять их с некоторым темпом. А в случае очереди, нужно ли ожидать окончания выполнения предыдущего задания, или речь только о количестве вызовов?

Рассмотрим все варианты.

## Ограничение темпа вызовов и reject лишних запросов

Самый хороший вариант для разнообразных интерфейсных функций &#8212; например, реакция на события mouseMove и подобные действия пользователя: передаём вызов функции некому обработчику, а он проверяет, сколько времени прошло после предыдущего вызова. Если прошло более N времени, вызываем функцию; если же нет, возвращаем отказ.
  
Видимо, именно о таком варианте шла речь в задании.



<pre><code class="javascript">var CallController = function (interval) {
	free = true;
	this.rareCall = function (callback) {
		if(free) {
			free = false;
			callback();
			this.timer=setTimeout(function() { free = true; }, interval);
			return true;
		}
		else return false;
	}
}

var callController = new CallController(500);

callController.rareCall(function() { console.log('Вызвалось'); });
callController.rareCall(function() { console.log('Не вызвалось'); });
setTimeout(function() {
	callController.rareCall(function() {console.log('Вызвалось, потому что прошёл таймаут'); });
}, 1000);
</code></pre>


  
<button onclick="test1()">Тест</button>

<div class="test_console" id="console1">
  Нажмите кнопку &#171;тест&#187;
</div>

### Два контроллера

Также, конечно, нас интересует ситуация с несколькими исполнительными функциями, имеющими разные периоды. К примеру, одна функция может 2 раза в секунду что-то обновлять в интерфейсе, а другая &#8212; раз в 5 секунд лазить на сервер и забирать какие-то новые данные. Или, если мы пишем чат &#8212; каждую секунду проверяем наличие новых сообщений, и каждую минуту &#8212; проверяем доступность остальных участников чата. Проверим работоспособность контроллера из прошлого листинга такими вызовами:

<pre><code class="javascript">
var callController1 = new CallController(500);
var callController2 = new CallController(700);

callController1.rareCall(function() { console.log('№1 Вызвалось'); });
callController2.rareCall(function() { console.log('№2 Вызвалось'); });
callController1.rareCall(function() { console.log('№1 Не вызвалось'); });
callController2.rareCall(function() { console.log('№2 Не вызвалось'); });
setTimeout(function() {
	callController1.rareCall(function() {
		console.log('№1 Вызвалось, потому что прошёл таймаут');
	});
}, 1000);
setTimeout(function() {
	callController2.rareCall(function() {
		console.log('№2 Вызвалось, потому что прошёл таймаут');
	});
}, 1500);
</code></pre>


  
<button onclick="test11()">Тест</button>

<div class="test_console" id="console11">
  Нажмите кнопку &#171;тест&#187;
</div>

## Очередь вызовов

Такой вариант хорошо подходит, например, для запросов к неким API, в т.ч. для уменьшения нагрузки на сервер API. Например, мне нужно было получить очень много разнообразной информации от Инстаграма, причём не просто подряд идущие страницы, а каждый раз что-то новое, в зависимости от содержания предыдущей загруженной страницы. Здесь нужно ожидать окончания предыдущего запроса.

Реализация такова: создаём очередь запросов &#8212; массив, каждый элемент которого является объектом с полями &#171;url&#187; и &#171;callback&#187;. При обработке читаем первый элемент очереди, загружаем с помощью request заданный url.
  
По окончанию работы request, т.е. в его коллбеке, проверяем успешность выполнения запроса (функцию проверки успешности также можно передать в конструкторе). Если успешно &#8212; удаляем верхний (только что исполненный) элемент очереди и выполняем заданный коллбек, если нет &#8212; сообщаем об ошибке, а верхний элемент оставляем.
  
В любом случае, ставим таймаут на следующий шаг обработчика, и начинаем с начала.

Вариант с паузой после **начала** запроса отличается только тем, что таймаут ставим не в коллбеке request, а параллельно с ним, т.е. в функции чтения очереди.

<pre><code class="javascript">function Pecker(interval) {
	queue = { jobs: [] };

	next=1;

	this.request = function (callback) {
		queue.jobs.push(callback);
		this.process();
	}

	this.process = function (a) {
		if(next==1)  // флаг next означает, что можно выполнять следующее задание.
			if(queue.jobs.length&gt;0) {
				next=0;
				queue.jobs[0]();
				queue.jobs.splice(0, 1);
			}
	}

	setInterval( function (process) { return function() {
		next=1;
		process();
	}}(this.process), interval);
};

var pecker = new Pecker(500);

pecker.request(function() { console.log('1 вызов'); });
pecker.request(function() { console.log('2 вызов'); });
pecker.request(function() { console.log('3 вызов'); });</code></pre>

К этому коду достаточно легко прикрутить vow/promises для определения, допустим, окончания всех операций, в том числе с передачей всех данных в обработчик vow.all.
  
В примере позволю себе реверанс в сторону Just for Fun Линуса Торвальдса.
  

  
<button onclick="test2()">Тест</button>

<div class="test_console" id="console2">
  Нажмите кнопку &#171;тест&#187;
</div>

[Следующее задание (все подмассивы с суммой = 10)](http://catethysis.ru/index.php/%d1%81%d0%be%d0%b1%d0%b5%d1%81%d0%b5%d0%b4%d0%be%d0%b2%d0%b0%d0%bd%d0%b8%d0%b5-3-%d0%b7%d0%b0%d0%b4%d0%b0%d0%bd%d0%b8%d0%b5/ "Собеседование / 3 задание")