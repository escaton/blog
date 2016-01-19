---
id: 1845
title: 'STM32: RFID-ридер'
date: 2014-08-05T23:05:39+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=1845
permalink: /stm32_rfid_reader/
ratings_users:
  - 2
ratings_score:
  - 10
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 2818084814
categories:
  - STM32
  - Готовые девайсы
tags:
  - i2c
  - rfid
  - STM32
  - датчики
  - электроника
---
<img class="alignnone size-full wp-image-1846" src="http://catethysis.ru/wp-content/uploads/2014/07/sl-030.png" alt="sl-030" width="210" height="211" />

RFID-ридер &#8212; это устройство чтения бесконтактных карт. Существует несколько разных стандартов карт, различающихся частотой передачи &#8212; но наиболее распространены карты на 13.56 МГц. Причём NFC сюда тоже относится, это существенно улучшенная старая технология RFID: увеличена скорость и введён режим point-to-point, т.е. два устройства NFC могут общаться друг с другом &#8212; но она обратно совместима с RFID. Примеры RFID-устройств:

  * карты метро
  * пропуска для прохода на работу
  * NFC-теги

RFID &#8212; Radio Frequency IDentification. Слово &#171;идентификация&#187; указывает на обязательную передачу каких-либо данных (более того, ещё и уникальных) &#8212; то есть всякие противокражные метки в книжных, одёжных и других магазинах не относятся к RFID, это просто резонаторы на определённую частоту. Там установлена такая же печатная антенна и конденсатор &#8212; они образуют резонансный контур, настроенный на эту частоту. Ворота на выходе из магазина содержат резонансный контур с высокой добротностью на эту же частоту и питающий его генератор. Когда в поле контура появляется второй контур, забирающий его энергию &#8212; добротность резко падает, и простейшая схема в воротах реагирует на это включением сирены.

Ещё один, гораздо более интересный пример RFID-тега &#8212; это загранпаспорта нового образца. В них содержится такой же тег, только с большой памятью &#8212; в ней хранятся ваши данные и даже фотография. Его мы тоже обязательно прочитаем <img src="http://catethysis.ru/wp-includes/images/smilies/icon_smile.gif" alt=":)" class="wp-smiley" />

Всё это прямо-таки вызывает зуд в руках, хочется быстрее что-нибудь сделать! Давайте для начала прочитаем карту метро &#8212; ведь именно она первой приходит на ум при слове &#171;RFID&#187;.

<!--more-->

Я использую модуль SL-030, и надо сказать что это не эталонная реализация RFID-ридера. Он использует популярную микросхему RFID-ридера от NXP &#8212; RC522, но к ней подключен какой-то 51-микроконтроллер, он общается с ридером и предоставляет свой интерфейс наружу &#8212; то есть, зачем-то разработчики сделали преобразование эталонного I2C в свой I2C, ещё и с поломанным протоколом общения. Но это не сможет нас остановить!

Для начала разберёмся с подключением. На этой картинке хорошо видны выводы модуля SL-030.

<img class="alignnone size-full wp-image-1846" src="http://catethysis.ru/wp-content/uploads/2014/07/sl-030.png" alt="sl-030" width="210" height="211" />

Vcc &#8212; питание, 5 вольт
  
In &#8212; вход WakeUp, пробуждение модуля из спящего режима
  
SDA &#8212; линия данных интерфейса I2C
  
SCL &#8212; линия тактов интерфейса I2C
  
OUT &#8212; выход, сигнал &#171;карта обнаружена&#187;
  
GND &#8212; земля

Процесс общения с модулем довольно прост, в простейшем и распространённейшем случае вам достаточно двух команд:
  
1. Запрос ID карты: запись в ридер последовательности 0x01 0x01 &#8212; команда на чтение.
  
2. Чтение ответа: чтение из ридера последовательности данных с типом карты и её номером.

Небольшое отступление.
  
Даже в рамках одного стандарта (13.56 МГц) есть несколько разных типов RFID-тегов. Они различаются длиной номера ID (4 или 7 байт) и размером внутренней памяти: 64, 1024 или 4096 байт, а у более экзотических карт есть ещё и зашифрованный внутренний раздел. Ридер SL-030 определяет этот тип и шифрует его в поле Type, но я уверен что вам практически всегда будут попадаться карты Ultralight &#8212; SL-030 называет их &#171;Тип 3&#8243;.

Необходимо отметить что ридер имеет аппаратный адрес 0x50, зачем-то его сделали таким же как у микросхем памяти. Есть две перемычки, замыкание которых изменяет этот адрес.
  
Команда запроса ID: 0x50 0x01 0x01.
  
Ответ: 0x51 длина 0x01 статус ID_карты тип
  
ID_карты может быть разной длины, поэтому вам необходимо в процессе получения ответа понимать поле &#171;длина&#187; и читать именно столько оставшихся байт. Поле &#171;тип&#187; имеет длину один байт.

Код чтения, написанный на скорую руку. Отправляемая команда &#8212; в массиве rfid\_command, принятый ответ &#8212; в поле rfid\_reply.

<pre><code class="cpp">void I2C_init(I2C_TypeDef* I2Cx, uint32_t speed)
{
 RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB | RCC_APB2Periph_AFIO, ENABLE);
 GPIO_InitTypeDef GPIO_InitStructure;
 GPIO_InitStructure.GPIO_Speed = GPIO_Speed_2MHz;
 GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_OD;
 GPIO_InitStructure.GPIO_Pin = GPIO_Pin_6 | GPIO_Pin_7;
 GPIO_Init(GPIOB, &GPIO_InitStructure);
 
 RCC_APB1PeriphClockCmd(I2Cx == I2C1 ? RCC_APB1Periph_I2C1 : RCC_APB1Periph_I2C2, ENABLE);
 I2C_InitTypeDef I2C_InitStructure;
 I2C_StructInit(&I2C_InitStructure);
 I2C_InitStructure.I2C_ClockSpeed = speed;
 I2C_InitStructure.I2C_OwnAddress1 = 1;
 I2C_InitStructure.I2C_Ack = I2C_Ack_Enable;
 I2C_Init(I2Cx, &I2C_InitStructure);
 I2C_Cmd(I2Cx, ENABLE);
}

void I2C_RFID_burst_write(I2C_TypeDef* I2Cx, uint8_t HW_address, uint8_t n_data, uint8_t *data)
{
 I2C_GenerateSTART(I2Cx, ENABLE);
 while(!I2C_CheckEvent(I2Cx, I2C_EVENT_MASTER_MODE_SELECT));
 I2C_Send7bitAddress(I2Cx, HW_address, I2C_Direction_Transmitter);
 while(!I2C_CheckEvent(I2Cx, I2C_EVENT_MASTER_TRANSMITTER_MODE_SELECTED));
 while(n_data--) {
 I2C_SendData(I2Cx, *data++);
 while(!I2C_CheckEvent(I2Cx, I2C_EVENT_MASTER_BYTE_TRANSMITTED));
 }
 I2C_GenerateSTOP(I2Cx, ENABLE);
 while(I2C_GetFlagStatus(I2Cx, I2C_FLAG_BUSY));
}

void I2C_RFID_burst_read(I2C_TypeDef* I2Cx, uint8_t HW_address, uint8_t n_data, uint8_t *data)
{
 while(I2C_GetFlagStatus(I2Cx, I2C_FLAG_BUSY));
 I2C_GenerateSTART(I2Cx, ENABLE);
 while(!I2C_CheckEvent(I2Cx, I2C_EVENT_MASTER_MODE_SELECT));
 I2C_Send7bitAddress(I2Cx, HW_address, I2C_Direction_Receiver);
 while (!I2C_CheckEvent(I2Cx, I2C_EVENT_MASTER_RECEIVER_MODE_SELECTED));
 I2C_AcknowledgeConfig(I2Cx, ENABLE);
 while(n_data--) {
 if(!n_data) I2C_AcknowledgeConfig(I2Cx, DISABLE);
 while (!I2C_CheckEvent(I2Cx, I2C_EVENT_MASTER_BYTE_RECEIVED));
 *data++ = I2C_ReceiveData(I2Cx);
 }
 I2C_AcknowledgeConfig(I2Cx, DISABLE);
 I2C_GenerateSTOP(I2Cx, ENABLE);
 while(I2C_GetFlagStatus(I2Cx, I2C_FLAG_BUSY));
}

void delay()
{
 for(volatile uint32_t del = 0; del&lt;250000; del++);
}

void main()
{
 uint8_t rfid_command[2] = {0x01, 0x01}, rfid_reply[11] = { 0 };

 I2C_init(I2C1, 100000);
 delay();
 I2C_RFID_burst_write(I2C1, 0xA0, 2, rfid_command);
 delay();
 I2C_RFID_burst_read(I2C1, 0xA0, 11, rfid_reply);
 
 while(1);
}</code></pre>

Прочитав карту метро, я принял такой ответ: 0A 01 00 34 D0 A6 49 A3 E4 36 03. Разбираем:

  * 0A &#8212; длина ответа, 10 байт
  * 01 &#8212; статус, 01 = карта вставлена (00 означал бы что карты нет)
  * 00 34 D0 A6 49 A3 36 &#8212; номер карты, он уникален и именно по этому номеру карты различаются
  * 03 &#8212; тип карты, Mifare Ultralight.

Другая карта имела номер 00 34 CC C0 A9 79 C2 36 03. Совсем другой (кроме первых двух байт), что позволяет сделать вывод что они действительно уникальны, а первые два байта &#8212; номер партии или номер заказчика.

В принципе, этого уже достаточно для реализации системы контроля и управления доступом (СКУД) &#8212; вы можете:

  1. повесить на дверь такой ридер и электромеханический замок
  2. написать простейшую программу, которая будет сравнивать номер приложенной карты с массивом разрешённых карт и управлять замком
  3. сделать простенькую индикацию и сигнал тревоги
  4. и входить в помещение по карте! Я думаю, ваши соседи удивятся.

Только наверное не стоит так делать доступ в квартиру.