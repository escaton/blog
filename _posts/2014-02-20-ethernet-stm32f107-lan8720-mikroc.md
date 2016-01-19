---
id: 981
title: Ethernet на STM32F107 + LAN8720 в MikroC
date: 2014-02-20T14:35:10+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=981
permalink: /ethernet-stm32f107-lan8720-mikroc/
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
notely:
  - 
  - 
  - 
wp_noextrenallinks_mask_links:
  - 0
  - 0
  - 0
dsq_thread_id:
  - 2728153522
categories:
  - STM32
tags:
  - ethernet
  - mikroc
  - электроника
---
В MikroC хорошая библиотека работы с Ethernet, но справка по ней крайне глупая и с ошибками. Примеров так и вообще практически нет (веб-сервер не в счёт, там не разберёшься с нуля).

На форуме они отвечают тоже довольно медленно, и я потратил три дня на то, чтобы разобраться как сделать TCP-клиент, подключающийся к компьютеру-серверу.

<!--more-->

<pre><code class="cpp">/*
 Это всё можно вынести в заголовочный файл
*/
#include "__NetEthInternal_STM32.h"

unsigned char myMacAddr[6] = {0x00, 0x24, 0xB5, 0x86, 0x79, 0x5f}; // my MAC address
unsigned char myIpAdd[4] = {192, 168, 1, 59 }; // my IP addr
unsigned char rmtIpAdd[4] = {192, 168, 1, 148 }; // remote IP addr
unsigned char gwIpAddr[4] = {192, 168, 1, 1 }; // gateway IP address
unsigned char ipMask[4] = {255, 255, 255, 0 }; // network mask
unsigned char dnsIpAddr[4] = {192, 168, 1, 1 }; // DNS server IP address

SOCKET_Intern_Dsc *sock;

void init_TCP(unsigned int port)
{
  Net_Ethernet_Intern_Init(myMacAddr,myIpAdd,_ETHERNET_FULLDUPLEX, &_GPIO_MODULE_ETHERNET);
  Net_Ethernet_Intern_confNetwork(ipMask, gwIpAddr, dnsIpAddr);
  Net_Ethernet_Intern_stackInitTCP();

  delay_ms(5000);

  Net_Ethernet_Intern_connectTCP(rmtIpAdd, port, 12100, &sock);
}

void SendTCP(char *str)
{
  Net_Ethernet_Intern_putStringTCP(str, sock);
  Net_Ethernet_Intern_startSendTCP(sock);
}

void processEthernet()
{
  Net_Ethernet_Intern_doPacket();
}
/*
 Конец библиотеки
*/

unsigned int Net_Ethernet_Intern_UserUDP(UDP_Intern_Dsc *socket)
{
  return 0;
}

void Net_Ethernet_Intern_UserTCP(SOCKET_Intern_Dsc *socket)
{
  char buffer[50];
  if(socket-&gt;dataLength)
  {
    Net_Ethernet_Intern_getBytes(buffer, 0xFFFF, socket-&gt;dataLength-1);
    SendTCP(strcat("Echo: ", strcat(buffer, "rn")));
  }
}

void main()
{
  int i=0;
  init_TCP(10700);
  while(1)
  {
    if(i++%400==200)
      SendTCP("Hellorn"); // Конечно, в реальной жизни это нужно вызывать из какого-то прерывания
    delay_ms(1);
    processEthernet();
  }
}
</code></pre>

Для проверки работы &#8212; запустите на компьютере тестовый сервер netcat: nc -l -v -p 10700. Этот пример делает следующее:

  * конфигурирует сетевой модуль (MAC-адрес 00-24-B5-86-79-5F, IP-адрес 192.168.1.59, шлюз и DNS &#8212; 192.168.1.1, подсеть 255.255.255.0)
  * инициирует TCP-связь с 192.168.1.148, порт 10700
  * постоянно отправляет сообщения &#171;Hello&#187;
  * отвечает на запросы (напишите в консоли что-нибудь и нажмите Enter).

Ключевой момент &#8212; задержка после инициализации стека, перед подключением к серверу. Без такой задержки функция connectTCP зависала намертво.

Конечно, появляется вопрос к MikroElectronica &#8212; почему функция connectTCP так небезопасно написана? В справке они предлагают вызывать её в цикле, пока подключение не увенчается успехом &#8212; но это ничего не даст, как вы понимаете. Первый же вызов connectTCP без предварительной задержки зависает.

По уму, нужно не делать фиксированную задержку &#8212; а опрашивать модуль Ethernet на предмет успешной инициализации, и только после этого один раз пробовать подключиться к серверу. Однако, функции для опроса состояния Ethernet они не предоставляют.

Чем плоха фиксированная задержка? В силу разных факторов, вроде загруженности сети или чего-то ещё (тяжело сказать, не видя код стека) инициализация сетевого модуля и стека может задержаться. В моём примере 5 секунд хватает не всегда, и приходится перезагружать контроллер.