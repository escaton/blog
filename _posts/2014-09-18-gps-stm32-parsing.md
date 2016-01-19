---
id: 1972
title: Парсинг GPS-сообщений на STM32
date: 2014-09-18T13:59:38+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=1972
permalink: /gps-stm32-parsing/
ratings_users:
  - 3
ratings_score:
  - 13
ratings_average:
  - 4.33
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 3029443773
categories:
  - STM32
tags:
  - STM32
  - датчики
---
Все GPS-приёмники имеют интерфейс UART для выдачи навигационных данных. Иногда присутствуют какие-то дополнительные интерфейсы &#8212; бинарный UART или USB, но текстовый UART (9600-8N1) есть всегда.

Навигационные сообщения кодируются специальным протоколом NMEA-0183, который очень просто устроен:

<pre>Формат всех сообщений:
$ТИП_СООБЩЕНИЯ(5 символов),данные_через_запятую*CRC(2 символа)&lt;CR&gt;&lt;LF&gt;

Пример сообщений от GPS с координатами положения:
$GPGGA,091209.000,5575.9722,N,03761.7777,E,1,6,1.41,303.4,M,29.1,M,,*5C
$GPRMC,125504.049,A,5575.9722,N,03761.7777,E,0.06,25.82,200906,,,*17</pre>

Символы GP в начале типов сообщений &#8212; знак принадлежности данных к системе GPS. Если приёмник поддерживает систему ГЛОНАСС &#8212; префикс изменится на GN.

Самое интересное &#8212; это координаты места, они передаются в сообщениях:

  * GPGGA/GNGGA (последнее определённое местоположение и точное время)
  * GPRMC/GNRMC (минимум данных, достаточный для определения положения + точное время)
  * GPGLL/GNGLL (координаты на плоскости)

Любой GPS-приёмник обязательно передаёт хотя бы одно из этих сообщений, в которых содержатся координаты. Сообщения GGA и RMC дополнительно содержат сведения о точности и числе видимых спутников.

Благодаря тому что это текстовый протокол, разбор этих сообщений на STM32 довольно прост &#8212; нужно лишь определить начало строки и скормить эту строку парсеру sscanf, который разбирает строку по заданному шаблону. Вот пример разбора сообщения GPGGA:

<pre><code class="cpp">char *nmea = "$GPGGA,091209.000,5575.9722,N,03761.7777,E,1,6,1.41,303.4,M,29.1,M,,*5C";
float lat, lon, lat_seconds, lon_seconds, HDOP, height;
char lat_sign, lon_sign, height_units;
int h, m, s, ms, lat_degrees, lat_minutes, lon_degrees, lon_minutes, precision, satellites;
char pos[100];
sscanf(nmea, "$GPGGA,%2d%2d%2d.%3d,%f,%c,%f,%c,%d,%d,%f,%f,%c", &h, &m, &s, &ms, &lat, 
 &lat_sign, &lon, &lon_sign, &precision, &satellites, &HDOP, &height, &height_units);
lat_degrees = (int)(lat/100.0); lat = lat - lat_degrees*100;
lat_minutes = (int)lat; lat_seconds = (lat - lat_minutes)*60;
lon_degrees = (int)(lon/100.0); lon = lon - lon_degrees*100;
lon_minutes = (int)lon; lon_seconds = (lon - lon_minutes)*60;

sprintf(pos, "time: %02d:%02d:%02d.%03d; lat: %02d%c%02d'%02.3f\"%c; lon: %02d%c%02d'%02.3f\"%c; \
 height: %3.1f%c; %d satellites", h, m, s, ms, lat_degrees, 0xB0, lat_minutes, lat_seconds,
 lat_sign, lon_degrees, 0xB0, lon_minutes, lon_seconds, lon_sign, height, height_units,
 satellites);</code></pre>

Разбор происходит в функции sscanf, которая выделяет в переданной ей строке элементы шаблона &#8212; строки, целые и дробные числа &#8212; и складывает их в соответствующие переменные. Дальше я делаю простой разбор этих значений, перевожу дробные значения координат в градусы, минуты и секунды, и вывожу их в красивом виде в строку pos:

<pre>pos = "time: 09:12:09.000; lat: 55°45'20.9916"N; lon: 37°37'3.6228"E; height: 303.4 M; 6 satellites"</pre>