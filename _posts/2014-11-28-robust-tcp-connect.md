---
id: 2105
title: Устойчивое, самовосстанавливающееся TCP-соединение
date: 2014-11-28T16:51:25+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2105
permalink: /robust-tcp-connect/
ratings_users:
  - 1
ratings_score:
  - 5
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 3270777104
categories:
  - Без рубрики
tags:
  - json-коннект
---
В случае построения системы из необслуживаемых сервера и клиентов необходимо обеспечить надёжность соединения между ними, добавив самовосстановление/переподключение после потери связи. Нужно отслеживать эту ситуацию и на сервере, и на клиенте.

В качестве модельного проекта я вновь использую систему из статьи [&#171;JSON-транспорт между микроконтроллером и сервером&#187;](http://catethysis.ru/json-transport/ "JSON-транспорт между микроконтроллером и сервером"). Подробное описание процесса установки TCP-соединения &#8212; в статье [&#171;Установка TCP-соединения в стеке lwIP&#187;](http://catethysis.ru/lwip_tcp_connect/ "Установка TCP-соединения в стеке lwIP"), обязательно прочитайте её, а то будет непонятно.

<!--more-->

## Клиент

Во-первых, назначим функцию-обработчик ошибок:

<pre><code class="cpp">tcp_err(TCPSockJSON, json_client_err);</code></pre>

Эта функция (json\_client\_err) будет пытаться снова поднять соединение с сервером:

<pre><code class="cpp">static void json_client_err(void *arg, err_t err)
{
	LOG("JSON transport error\n");
	json_status = 0;
	setTimeout(InitJSON, 1000);
}</code></pre>

Функция setTimeout ставит в расписание выполнение функции InitJSON через 1000 миллисекунд. Эти асинхронные действия назначаются так:

<pre><code class="cpp">struct struct_async_task {
	uint32_t timeout;
	void (* async)(void);
} async_task;

void setTimeout(void (* async)(void), uint32_t delay)
{
	async_task.timeout = MS_TIMER + delay;
	async_task.async = async;
}</code></pre>

И обрабатываются вызовом функции MakeAsyncTasks() по прерываниям от системного таймера. Переменная MS_TIMER инкрементируется каждую миллисекунду и служит таймштампом. В этой реализации пока можно назначить только одно асинхронное задание.

<pre><code class="cpp">void MakeAsyncTasks()
{
	if(async_task.timeout &gt; MS_TIMER) {
		async_task.async();
		async_task.timeout = 0;
	}
}</code></pre>

Также нам потребуется глобальный флаг, говорящий о наличии связи с сервером. При успешном подключении мы устанавливаем его, а после ошибки сбрасываем.

<pre><code class="cpp">int json_status = 0;

static err_t json_connected(void *arg, struct tcp_pcb *pcb, err_t err)
{
	json_status = 1;
	return err;
}</code></pre>

Все функции отправки данных теперь нужно обвязать условием if(json_status) { &#8230; }.

Теперь при потере связи клиент будет уходить в начальное состояние и ежесекундно пытаться вновь связаться с сервером вплоть до успеха.

## Сервер

По сути, в коде сервера на node.js нужно лишь добавить обработчик ошибки, который может к примеру просто сообщать об ошибке в лог.

<pre><code class="javascript">socket.on('error', function(error) {
	console.log('Error:', error);
});</code></pre>

Больше действий не требуется.

## Тест

Для проверки можно выключить клиент и включить снова. Сервер напишет в логе об ошибке, и снова примет подключение клиента.

Теперь выключим сервер, заранее открыв лог клиента (у меня он сделан по telnet). При падении связи клиент напишет ошибку, и спустя секунду попробует подключиться снова. Если не запускать сервер &#8212; клиент так и будет раз в секунду пытаться подключиться.

Как только сервер будет запущен вновь, клиент успешно к нему подключится.