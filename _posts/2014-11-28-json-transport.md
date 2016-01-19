---
id: 2099
title: JSON-транспорт между микроконтроллером и сервером
date: 2014-11-28T14:30:04+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2099
permalink: /json-transport/
ratings_users:
  - 2
ratings_score:
  - 10
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 3270393916
categories:
  - JavaScript
  - Node.js
  - STM32
  - Сервер
tags:
  - json-коннект
---
Для обмена сообщениями между сервером и клиентом очень удобен формат JSON. Это простой текстовый формат в стиле javascript-объектов, который уже практически стал стандартом для передачи информации в интернете.

Я уверен что он идеально подходит на роль транспорта данных между компьютером-сервером и микроконтроллером-клиентом. Попробую заразить вас своей уверенностью!

Как всегда, сначала рассмотрим его плюсы и минусы.

<!--more-->

**pros:**

  * Текстовый, а значит легко читаемый и отлаживаемый &#8212; даже на уровне TCPDump/Wireshark.
  * Гораздо более простой и &#171;чистый&#187;, чем многословный XML. Его легче читать.
  * Позволяет передать любой объект JavaScript без циклических ссылок.
  * Напрямую обрабатывается в JavaScript безопасным образом (невозможны XSS).

**cons:**

  * Текстовый, а значит заведомо более объёмный, чем любой бинарный протокол.
  * ??? А нет больше недостатков!

Единственный его видимый недостаток обходится с помощью сжатия, обычно алгоритом Deflate (gzip). На небольших сообщениях эффект не столь заметен, но при передаче большого количества данных удастся сжать данные в несколько раз, обычно в 2-3 раза.

## Сервер

В качестве сервера я, конечно, использую Node.js. Он работает на javascript, и умеет работать с JSON &#171;из коробки&#187;.

## Клиент

Ранее я успешно [поднял Ethernet с использованием стека lwIP](http://catethysis.ru/lwip_tcp_connect/ "Установка TCP-соединения в стеке lwIP") на микроконтроллере LM3S. Именно такую систему я использую сейчас для тестов.

В качестве парсера JSON на микроконтроллере я применил библиотеку [cJSON](http://catethysis.ru/mcu_json_parse/ "Разбор JSON на микроконтроллере — библиотека cJSON").

## Тесты

Очень интересует нагрузочный тест, который проверит всё:

  * Приём и разбор JSON-сообщения
  * Изменение принятых данных
  * Сборку их обратно в JSON и отправку на сервер

### Клиент

На клиентской стороне будет происходить следующее:

  1. Подключение к серверу и отправка приветственного сообщения
  2. Приём сообщения от сервера
  3. Разбор, изменение (добавление поля &#171;data&#187;) и сборка сообщения обратно с помощью cJSON
  4. Отправка сообщения на сервер

Вот код этой части клиента:

<pre><code class="cpp">static void json_client_close(struct tcp_pcb *pcb)
{
	tcp_arg(pcb, NULL);
	tcp_sent(pcb, NULL);
	tcp_close(pcb);
}

static err_t json_client_sent(void *arg, struct tcp_pcb *pcb, u16_t len)
{
	LWIP_UNUSED_ARG(arg);
	return ERR_OK;	
}

static void processServerJSON(struct tcp_pcb *pcb, cJSON *json)
{
	cJSON *json_out = cJSON_CreateObject();
	cJSON_AddNumberToObject(json_out, "data", 500);

	char *json_string = cJSON_Print(json_out);
	tcp_write(pcb, json_string, strlen(json_string), 0);
	tcp_output(pcb);
	free(json_string);
	cJSON_Delete(json_out);
	cJSON_Delete(json);
}

static err_t json_receive(void *arg, struct tcp_pcb *pcb, struct pbuf *p, err_t err)
{
	LWIP_UNUSED_ARG(arg);
	
	if(err == ERR_OK && p != NULL)
	{
		char *string = p-&gt;payload;
		string[p-&gt;len] = 0;
		
		processServerJSON(pcb, cJSON_Parse(string));
		
		tcp_recved(pcb, p-&gt;tot_len);
		pbuf_free(p);
	}
	else
		json_client_close(pcb);
	return ERR_OK;
}

static err_t json_connected(void *arg, struct tcp_pcb *pcb, err_t err)
{
	char *string = "{\"hop\": 0}";
	LWIP_UNUSED_ARG(arg);
	if(err == ERR_OK)
	{
		tcp_write(pcb, string, strlen(string), 0);
		tcp_output(pcb);
	}
	return err;
}

void InitJSON()
{
	struct ip_addr server_ip;
	IP4_ADDR(&server_ip, 192,168,1,152);
	struct tcp_pcb *TCPSockJSON;
	
	TCPSockJSON = tcp_new();
	tcp_recv(TCPSockJSON, json_receive);
	tcp_sent(TCPSockJSON, json_client_sent);
	tcp_connect(TCPSockJSON, &server_ip, 7521, json_connected);
}</code></pre>

### Сервер

Сервер предоставит порт для подключения. После приёма приветственного сообщения от клиента он ответит клиенту сообщением {&#171;hop&#187;: 1}.

На все следующие сообщения сервер будет отвечать тем же сообщением с инкрементированным полем &#171;hop&#187;.

Код сервера:

<pre><code class="javascript">var net = require('net');

var old_hop = 0, hop = 0, k = 0, time = 0, i = 0;

profiler = function() {
	old_time = time;
	time = new Date();
	console.log('' + Math.round(1000 * ((hop - old_hop) / (time - old_time))) + '\r');
	old_hop = hop;
}

net.createServer(function(socket) {
	console.log('server connected, ip: ', socket.remoteAddress);
	socket.on('end', function() {
		console.log('server disconnected');
	});
	socket.on('error', function(error) {
		console.log('Error:', error);
	});
	socket.on('data', function(data) {
		try {
			data = JSON.parse(data);
		}
		catch(e) {}
		data.hop++;
		socket.write(JSON.stringify(data));
		hop++;
		if(!k) { setInterval(profiler, 1000); time = new Date(); k = 1; }
	});
}).listen(7521, function() {
	console.log('server bound');
});</code></pre>

Таким образом, после подключения сервер и клиент начинают обмениваться JSON-сообщениями на максимально возможной скорости. В код сервера я добавил простенький профайлер, который измеряет количество принятых сообщений в секунду.

По результатам измерений скорость обмена оказалась равной около 4.3 тысяч сообщений в секунду. Очень высокая скорость, которой достаточно для любых моих задач.