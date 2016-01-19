---
id: 2102
title: Установка TCP-соединения в стеке lwIP
date: 2014-11-28T15:11:36+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2102
permalink: /lwip_tcp_connect/
ratings_users:
  - 5
ratings_score:
  - 25
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 3270650969
categories:
  - Без рубрики
tags:
  - json-коннект
---
Разберём процесс установки TCP-соединения в стеке lwIP по шагам, на примере кода из статьи [&#171;JSON-транспорт между микроконтроллером и сервером&#187;](http://catethysis.ru/json-transport/ "JSON-транспорт между микроконтроллером и сервером"). Я буду сначала писать код, а потом давать к нему комментарии.

<!--more-->

## Инициализация

<pre><code class="cpp">void InitJSON()
{
	struct ip_addr server_ip;
	IP4_ADDR(&server_ip, 192,168,1,152);
	struct tcp_pcb *TCPSockJSON;
	
	TCPSockJSON = tcp_new();
	tcp_recv(TCPSockJSON, json_receive);
	tcp_sent(TCPSockJSON, json_client_sent);
	tcp_connect(TCPSockJSON, &server_ip, 9090, json_connected);
}</code></pre>

Стек lwIP устроен по принципу конечного автомата. При наступлении определённых событий (подключение, приём данных, ошибки) он вызывает функции-обработчики этих событий, и на старте вы должны передать ему адреса этих функций.

Структура TCPSockJSON &#8212; ядро соединения, именно в ней будут лежать все настройки и состояние подключения. Она будет передана во все функции-обработчики событий. Первое что нужно сделать &#8212; проинициализировать её функцией lwIP tcp_new.

Далее расставляем обработчики интересующих нас событий. Это будут:

  * Успешное подключение &#8212; обработчик json_connected
  * Приём данных &#8212; обработчик json_receive
  * Передача данных &#8212; обработчик json\_client\_sent

Функция tcp\_connect подключается к серверу (IP = &server\_ip, порт = 9090) и сразу вызывает обработчик json_connected.

## Обработчик подключения

<pre><code class="cpp">static err_t json_connected(void *arg, struct tcp_pcb *pcb, err_t err)
{
	char *string = "{\"hop\": 0}";
	LWIP_UNUSED_ARG(arg);
	if(err == ERR_OK)
	{
		tcp_write(pcb, string, strlen(string), 0);
		tcp_output(pcb);
	}
	return err;
}</code></pre>

Сразу после подключения проверяем ошибки, и если всё ОК &#8212; передаём серверу строку &#171;{&#171;hop&#187;: 0}&#187;. Это &#8212; приветственная строка, сообщение &#171;я включился и со мной всё нормально&#187;. Здесь можно просто передать какой-нибудь статус устройства, к примеру.

Для записи данных в буфер передачи используем функцию tcp\_write, ей требуется сокет, строка и её длина. Для реальной передачи данных &#8212; функция tcp\_output. Вы можете накопить в буфере много данных после нескольких вызовов функции tcp\_write, и потом отправить всё одним пакетом с помощью tcp\_output.

lwIP вызывает обработчики по цепочке, поэтому в конце обязательно передаём ошибку дальше: return err.

## Приём данных

<pre><code class="cpp">static err_t json_receive(void *arg, struct tcp_pcb *pcb, struct pbuf *p, err_t err)
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
}</code></pre>

Снова проверяем ошибки, если их нет &#8212; обрабатываем принятые данные.

Сами данные лежат в поле p->payload, а их длина &#8212; в p->len. Мы знаем что принимаем от сервера не абстрактные данные, а именно строку &#8212; и чтобы сделать из этого нормальную строку, просто добавим в её конце (по адресу p->len) терминирующий ноль. Это не очень правильно, потому что так мы лезем прямо в структуру p, и можем испортить данные, лежащие сразу за строкой. Лучше скопировать строку через memcpy.

Далее парсим принятый текст в JSON функцией библиотеки cJSON (cJSON_Parse), и обработаем его нашей функцией processServerJSON.

Забрав все данные, скажем lwIP что данные получены и их можно стирать и принимать новые. Для этого вызовем функцию tcp_recved. Потом просто освободим память, занимаемую буфером p.

В случае ошибок при приёме &#8212; вызовем нашу функцию json\_client\_close.

В конце &#8212; передадим код ошибки дальше.

## Закрытие соединения

<pre><code class="cpp">static void json_client_close(struct tcp_pcb *pcb)
{
	tcp_arg(pcb, NULL);
	tcp_sent(pcb, NULL);
	tcp_close(pcb);
}</code></pre>

Сбросим обработчики состояний (передав NULL в качестве адресов обработчиков) и закроем соединение функцией tcp_close. Всё просто.

## Обработка принятых данных

<pre><code class="cpp">static void processServerJSON(struct tcp_pcb *pcb, cJSON *json)
{
	cJSON *json_out = cJSON_CreateObject();
	cJSON_AddNumberToObject(json_out, "data", 500);

	char *json_string = cJSON_Print(json_out);
	tcp_write(pcb, json_string, strlen(json_string), 0);
	tcp_output(pcb);
	free(json_string);
	cJSON_Delete(json_out);
	cJSON_Delete(json);
}</code></pre>

Принимаем готовый объект cJSON, создаём новый объект cJSON, добавляем в него поле data и превращаем его в строку.

Для передачи &#8212; снова вызываем tcp\_write/tcp\_output.

В конце &#8212; ни в коем случае не забывайте удалять весь мусор! К примеру, код с неудалёнными cJSON-объектами проработает всего лишь в течение 500 циклов приёма/передачи и память закончится.

Забыв об освобождении строки json_string вы обеспечите падение после 2-3 тысяч циклов приёма-передачи.

## Обработчик передачи

<pre><code class="cpp">static err_t json_client_sent(void *arg, struct tcp_pcb *pcb, u16_t len)
{
	LWIP_UNUSED_ARG(arg);
	return ERR_OK;
}</code></pre>

Просто передаём код ошибки дальше, никаких действий здесь не требуется.