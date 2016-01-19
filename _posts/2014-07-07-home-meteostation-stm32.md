---
id: 1869
title: Домашняя метеостанция на STM32 и Node.js
date: 2014-07-07T20:44:46+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=1869
permalink: /home-meteostation-stm32/
ratings_users:
  - 3
ratings_score:
  - 15
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 2824793039
categories:
  - Без рубрики
tags:
  - 1-wire
  - dht22
  - ds18b20
  - nodejs
  - STM32
  - датчики
  - метеостанция
  - погода
  - температура
  - электроника
---
После того, как мы [научились измерять температуру](http://catethysis.ru/stm32-1-wire-18b20/), следующий логичный шаг &#8212; домашняя метеостанция. Этот проект станет одной из частей будущей системы &#171;умный дом&#187;, и первое действие которое я хотел бы автоматизировать &#8212; включение/выключение кондиционера в зависимости от температуры. Но для начала просто выведем температуру и прочие параметры на веб-странице, доступ к которой открыт со всех устройств в домашней сети &#8212; её смогут наблюдать все жители дома.

Система состоит из двух частей &#8212; измеритель и сервер. Измерителем служит STM32 с подключенными термодатчиками DS18B20 и BMP180, она в цикле считывает результаты измерений, проводит их первичную обработку и отправляет по UART в сервер. Между ней и сервером стоит преобразователь FT232, который предоставляет серверу более удобный интерфейс USB.

Сервер &#8212; это мой домашний сервер на линуксе, на котором работает скрипт на node.js: он принимает измеренные данные, формирует веб-страницу с измерениями и даёт этой странице [аяксовый](http://catethysis.ru/simple_ajax_example/ "Простой пример использования AJAX") хендл для постоянного обновления показаний.

<!--more-->

## Сервер

Логика сервера разделена на две части: отдельно стоит отдача страницы измерений, со всякими красивостями, оформлением и кодом постоянного обновления показаний. Эту страницу наиболее логично отдавать через nginx &#8212; она статична и редко изменяется. Постоянно меняющиеся свежие показания страница забирает со специального адреса, который обслуживает уже node.js &#8212; скрипт читает данные из последовательного порта, обрабытывает их и передаёт в виде JSON-массива странице. Для начала сделаем просто отображение последнего измерения, а потом начнём складывать данные в [архив погодных наблюдений](http://catethysis.ru/stm32_nodejs_meteostation_with_mysql_log/).

Такая архитектура очень удобна, она позволяет менять вид, логику и оформление страницы показаний без малейшего вмешательства в код передачи данных. Более того, на адрес с источником данных может подключиться не только эта страница, но и любой другой компьютер или устройство &#8212; к примеру, андроид-приложение или сервис вроде IFTTT &#8212; и всё это без изменений кода источника данных. Единственное, что скоро понадобится там сделать &#8212; начать вести лог измерений, для отображения истории и изменений параметров во времени. Также, возможно, нужно приделать туда небольшой аналитический модуль, который как в старину будет предсказывать погоду по показаниям барометра. Потом ещё прикрутим отправку показаний в &#171;[народный мониторинг](http://catethysis.ru/weather_station_narodmon/)&#171;.

**Конфигурация nginx**

<pre><code class="nginx">server {
        listen 80;
        server_name termo.catethysis.ru;

        expires max;
        add_header Cache-Control public;

        root /termo;
        index index.htm;

        location /termo {
                # IP и порт, на которых висит node.js
                proxy_pass http://localhost:850;
                proxy_set_header Host $host;
        }
}</code></pre>

**Код веб-страницы**

<pre><code class="html">&lt;meta charset = "utf8"&gt;
&lt;title&gt;Домашняя метеостанция&lt;/title&gt;
&lt;script&gt;
window.onload = function() {
    xmlhttp = new XMLHttpRequest();
    setInterval(function() {
        xmlhttp.open('GET', '/thermo?p='+Math.random(), false);
        xmlhttp.send(null);
        if(xmlhttp.status == 200) {
        data = JSON.parse(xmlhttp.responseText);
            document.getElementById('temp1').innerHTML = data[0].substr(0, 4);
            document.getElementById('temp2').innerHTML = data[1];
            document.getElementById('press1').innerHTML = Math.round(data[2]/133.3);
            document.getElementById('press2').innerHTML = data[2];
        }
    }, 500);
}
&lt;/script&gt;
&lt;style&gt; span { font-weight: bold; } &lt;/style&gt;
&lt;body&gt;
Температура за окном:  &lt;span id = "temp1"&gt;&lt;/span&gt;°C&lt;br&gt;
Температура в комнате: &lt;span id = "temp2"&gt;&lt;/span&gt;°C&lt;br&gt;
Давление: &lt;span id = "press1"&gt;&lt;/span&gt; мм. рт. ст. / &lt;span id = "press2"&gt;&lt;/span&gt; Па&lt;br&gt;
&lt;/body&gt;</code></pre>

**Код скрипта на node.js**

<pre><code class="javascript">var http = require('http');
var express = require('express');
var app = express();

var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var serialPort = new SerialPort("/dev/ttyUSB0", {
  baudrate: 9600,
  parser: serialport.parsers.readline("\r\n")
});

thermodata = [];
serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {
    thermodata = data.split(' ');
  });
});

app.get('/thermo', function (req, res) {
    res.end(JSON.stringify(thermodata));
});

app.listen(9380);</code></pre>

## Измеритель

Измеритель сравнительно прост &#8212; это плата STM32VLDiscovery, к которой подключены два датчика и конвертер FT232. Оба датчика я ранее рассматривал в других статьях: это [цифровой I2C барометр BMP180](http://catethysis.ru/bmp180-digital-barometer-stm32/ "Цифровой барометр BMP180") и [1-Wire термометр DS18B20](http://catethysis.ru/stm32-1-wire-18b20/ "STM32: Шина 1-Wire и термометр DS18B20"). Барометр подключен по I2C и находится в комнате, непосредственно около платы [Discovery](http://catethysis.ru/stm32-discovery-boards/ "STM32 — обзор плат Discovery"), а DS18B20 подключен по витой паре длиной 5 метров и выведен за окно. Интерфейс 1-Wire позволяет увеличивать длину линии связи до десятков метров, но при этом следует учитывать несколько моментов, которые я описал в статье [1-Wire Tips\`n\`Tricks](http://catethysis.ru/1-wire-tipsntricks/ "Tips`n`tricks по шине 1-Wire"). Код подключения длинный, но довольно простой &#8212; он полностью состоит из примеров работы с DS18B20, BMP180 и [UART](http://catethysis.ru/stm32-uart-usart/ "STM32 → UART / USART").

**Код программы для STM32**

<pre><code class="cpp">
void delay(uint32_t del)
{
	for(volatile uint32_t i = 0; i&lt;del; i++);
}

void send_presence()
{
 	GPIOA-&gt;ODR = GPIO_Pin_3;
	delay(100);
	GPIOA-&gt;ODR = 0;
	delay(3500); //420us
	GPIOA-&gt;ODR = GPIO_Pin_3;
}
	
void one_wire_write_bit(uint8_t bit)
{
	GPIOA-&gt;ODR = 0;
	delay(bit ? 150 : 500);
	GPIOA-&gt;ODR = GPIO_Pin_3;
	delay(bit ? 650 : 200);
}

uint8_t one_wire_read_bit()
{
	uint8_t bit = 0;
	GPIOA-&gt;ODR = 0;
	delay(80);
	GPIOA-&gt;ODR = GPIO_Pin_3;
	delay(50);
	GPIOA-&gt;CRL &= ~GPIO_CRL_MODE3;
	GPIOA-&gt;CRL &= ~GPIO_CRL_CNF3;
	GPIOA-&gt;CRL |=  GPIO_CRL_CNF3_0;
	bit = (GPIOA-&gt;IDR&GPIO_Pin_3?1:0);
	GPIOA-&gt;CRL |=  GPIO_CRL_MODE3;
	GPIOA-&gt;CRL |=  GPIO_CRL_CNF3_0;
	delay(600);
	return bit;
}

void one_wire_write_byte(uint8_t data)
{
	for(uint8_t i = 0; i&lt;8; i++)
		one_wire_write_bit(data&gt;&gt;i & 1);
}

void init_one_wire()
{
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE);

	GPIO_InitTypeDef  GPIO_InitStructure;
	GPIO_InitStructure.GPIO_Pin =  GPIO_Pin_3;
	GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_OD;
	GPIO_Init(GPIOA, &GPIO_InitStructure);
}

void I2C_init(void)
{
	RCC_APB1PeriphClockCmd(RCC_APB1Periph_I2C1, ENABLE);
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB | RCC_APB2Periph_AFIO , ENABLE);

	GPIO_InitTypeDef  GPIO_InitStructure;
	GPIO_InitStructure.GPIO_Pin =  GPIO_Pin_6 | GPIO_Pin_7;
	GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_OD;
	GPIO_Init(GPIOB, &GPIO_InitStructure);

	I2C_InitTypeDef  I2C_InitStructure;
	I2C_InitStructure.I2C_Mode = I2C_Mode_I2C;
	I2C_InitStructure.I2C_DutyCycle = I2C_DutyCycle_16_9;
	I2C_InitStructure.I2C_OwnAddress1 = 1;
	I2C_InitStructure.I2C_Ack = I2C_Ack_Enable;
	I2C_InitStructure.I2C_AcknowledgedAddress = I2C_AcknowledgedAddress_7bit;
	I2C_InitStructure.I2C_ClockSpeed = 100000;

	I2C_Cmd(I2C1, ENABLE);
	I2C_Init(I2C1, &I2C_InitStructure);
	I2C_AcknowledgeConfig(I2C1, ENABLE);
}

void I2C_write(uint8_t data, uint8_t address)
{
	I2C_GenerateSTART(I2C1, ENABLE);
	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_MODE_SELECT));
	I2C_Send7bitAddress(I2C1, 0xEF, I2C_Direction_Transmitter);
	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_TRANSMITTER_MODE_SELECTED));
	I2C_SendData(I2C1, address);
	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_BYTE_TRANSMITTED));
	I2C_SendData(I2C1, data);
	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_BYTE_TRANSMITTED));
	I2C_GenerateSTOP(I2C1, ENABLE);
}

uint8_t I2C_read(uint8_t address)
{
	uint8_t data;
	while(I2C_GetFlagStatus(I2C1, I2C_FLAG_BUSY));
	I2C_GenerateSTART(I2C1, ENABLE);
	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_MODE_SELECT));
	I2C_Send7bitAddress(I2C1, 0xEF, I2C_Direction_Transmitter);
	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_TRANSMITTER_MODE_SELECTED));
	I2C_SendData(I2C1, address);
	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_BYTE_TRANSMITTED));
	I2C_GenerateSTART(I2C1, ENABLE);
	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_MODE_SELECT));
	I2C_Send7bitAddress(I2C1, 0xEF, I2C_Direction_Receiver);
	while(!I2C_CheckEvent(I2C1,I2C_EVENT_MASTER_BYTE_RECEIVED));
	data = I2C_ReceiveData(I2C1);
	I2C_AcknowledgeConfig(I2C1, DISABLE);
	I2C_GenerateSTOP(I2C1, ENABLE);
	return data;
}

void UART_init()
{
	RCC-&gt;APB2ENR|= RCC_APB2ENR_USART1EN | RCC_APB2ENR_IOPAEN | RCC_APB2ENR_AFIOEN;
	GPIOA-&gt;CRH &= !GPIO_CRH_CNF9;
	GPIOA-&gt;CRH |=  GPIO_CRH_CNF9_1 | GPIO_CRH_MODE9_0;
	USART1-&gt;BRR = 0x9C4;
	USART1-&gt;CR1 |= USART_CR1_TE | USART_CR1_UE;
}

void USART1_Send(char chr) {
	while(!(USART1-&gt;SR & USART_SR_TC));
	USART1-&gt;DR = chr;
}

void USART1_Send_String(char* str) {
	int i=0;
	while(str[i])
		USART1_Send(str[i++]);
}

float get_ds18b20_temp()
{
	send_presence();
	delay(5500);
	one_wire_write_byte(0xCC);
	one_wire_write_byte(0x4E);
	one_wire_write_byte(0x4B);
	one_wire_write_byte(0x46);
	one_wire_write_byte(0x5F);

	send_presence();
	delay(5500);
	one_wire_write_byte(0xCC);
	one_wire_write_byte(0x44);
	delay(6000000);
	
	send_presence();
	delay(5500);
	one_wire_write_byte(0xCC);
	one_wire_write_byte(0xBE);
	delay(4000);
	uint16_t data = 0;
	for(uint8_t i = 0; i&lt;16; i++) data += (uint16_t)one_wire_read_bit()&lt;&lt;i;
	return data/16.0;
}

void read_bmp180(int16_t *t, uint32_t *p)
{
	//Read compensation registers
	 int16_t AC1 = 0, AC2 = 0, AC3 = 0; 
	uint16_t AC4 = 0, AC5 = 0, AC6 = 0;
	 int16_t B1 = 0, B2 = 0, MB = 0, MC = 0, MD = 0;
	AC1 = I2C_read(0xAA)*256 + I2C_read(0xAB);
	AC2 = I2C_read(0xAC)*256 + I2C_read(0xAD);
	AC3 = I2C_read(0xAE)*256 + I2C_read(0xAF);
	AC4 = I2C_read(0xB0)*256 + I2C_read(0xB1);
	AC5 = I2C_read(0xB2)*256 + I2C_read(0xB3);
	AC6 = I2C_read(0xB4)*256 + I2C_read(0xB5);
	 B1 = I2C_read(0xB6)*256 + I2C_read(0xB7);
	 B2 = I2C_read(0xB8)*256 + I2C_read(0xB9);
	 //MB = I2C_read(0xBA)*256 + I2C_read(0xBB);
	 MC = I2C_read(0xBC)*256 + I2C_read(0xBD);
	 MD = I2C_read(0xBE)*256 + I2C_read(0xBF);
	 
	//Start temperature measurement
	I2C_write(0x2E, 0xF4);
	//Wait to measurement
	for(volatile uint32_t del = 0; del&lt;10000; del++);
	//Read uncompensated temperature value
	uint32_t UT = I2C_read(0xF6)*256 + I2C_read(0xF7);
	
	//Start pressure measurement
	I2C_write(0x34, 0xF4);
	//Wait to measurement
	for(volatile uint32_t del = 0; del&lt;10000; del++);
	//Read uncompensated pressure value
	uint32_t UP = I2C_read(0xF6)*256 + I2C_read(0xF7);
	
	//temparature compensation
	int32_t X1 = (UT - AC6) * AC5 / 32768;
	int16_t X2 = MC * 2048 / (X1 + MD);
	int16_t B5 = X1 + X2;
	int16_t T = (B5 + 8) / 16;

	//pressure compensation
	int16_t B6 = B5 - 4000;
	int16_t B3 = ((AC1*4 + (B2*B6 / 4096 + AC2)*B6 / 2048) + 2) / 4;
	X1 = (AC3 + 2*B1*B6)*B6 / 8192 / 65536 + 2;
	uint16_t B4 = AC4*(unsigned long)(X1/4 + 32768) / 32768;
	uint32_t B7 = ((unsigned long)UP - B3) * 50000;
	int32_t P = (B7</code></pre>

&nbsp;

Нужно будет ещё подключить [датчик влажности DHT22](http://catethysis.ru/dht22-moisture-termometer-stm32/ "Датчик температуры и влажности DHT22"), но неясно сможет ли он работать на такой длинной линии. Возможно, придётся прибегать к каким-то ухищрениям вроде конвертера его интерфейса в 1-Wire, сделанном на простейшем [STM32F050](http://catethysis.ru/stm32f050f4p6/ "ARM-микроконтроллер STM32F050F4P6").