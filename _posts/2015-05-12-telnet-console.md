---
id: 2316
title: Отладочная консоль через Telnet
date: 2015-05-12T09:50:19+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2316
permalink: /telnet-console/
wp_noextrenallinks_mask_links:
  - 0
ratings_users:
  - 2
ratings_score:
  - 10
ratings_average:
  - 5
dsq_thread_id:
  - 3756461640
categories:
  - Linux
  - STM32
  - Программирование
  - Справочник
---
Самый удобный способ для вывода отладочной информации — это Telnet. Конечно, он обязательно требует наличия интерфейса Ethernet, но если он в девайсе уже есть, то телнетом просто грех не воспользоваться: его очень просто добавить к проекту. Если сети нету — воспользуйтесь примером из статьи [консоль через UART](http://catethysis.ru/stm32-uart-console/).

Сначала пару слов о протоколе. Первые описания интерфейса появились ещё в 1968 году в RFC под номером 15 — редко встретишь упоминания настолько раннего RFC, это однозначно говорит о том что протокол очень прост и был крайне востребован ещё на заре развития IT. Потом, в 1983 вышел уже RFC 854, благодаря которому протокол стал утверждён и вошёл в перечень стандартов STD 8, один из первых стандартов IETF.

Это поистине простейший из всех протоколов передачи данных, он представляет собой простой текст, передающийся по порту 23 (TCP). Конечно, связь дуплексная (одновременно могут передавать и принимать оба участника), причём на низком уровне нет различия между сервером и клиентом, протокол симметричен.
  
Другая особенность — telnet это просто &#171;труба для данных&#187;, никаких изменений в данные он не вносит (за исключением управляющих последовательностей).

На самом деле, единственное что нужно помнить про telnet — перенос строки делается обязательно двумя символами: CRLF или /r/n или #10#13. Первый символ переводит каретку к началу строки, второй передвигает каретку на следующую строку.

<!--more-->

## Запуск

Используем стек lwIP, и чтобы понять написанное дальше, предлагаю сначала прочесть [статью об установке TCP-подключения в стеке lwIP](http://catethysis.ru/lwip_tcp_connect/).

Для запуска telnet вам, как и в любой другой сетевой активности через стек lwIP, нужно:

  1. создать в lwIP TCP-сокет, настроить его на прослушивание 23 порта, и ждать подключения. После подключения нужно:
  2. проверить, не работает ли уже другое подключение (это защита от множественных подключений по Telnet, что может привести к перерасходу памяти и это просто потенциальный вектор атаки на приложение)
  3. настроить функции-обработчики событий приёма, опроса (в ней мы будем передавать данные) и ошибки
  4. поставить флаг наличия подключения

Поскольку пример сделан только на передачу (ведение логов не требует обратной реакции) — обработчик приёма будет просто принимать данные и тут же забывать их. Мы не можем оставить его пустым, потому что lwIP будет копить все пришедшие данные, что в итоге неминуемо приведёт к падению от нехватки памяти. Чтобы избежать этого — обработчик будет сбрасывать буфер приёма.

Передача сделана через поллинг (нас постоянно спрашивают, нет ли у нас чего на передачу) — поэтому функция передачи будет сделана не слишком очевидно (на первый взгляд):

  * Функция записи сообщения в лог будет просто добавлять текст к строчке, хранящейся в памяти — это буфер
  * По приходу очередного запроса модуль telnet проверит длину буфера, и если он не пуст — отправит данные в сеть и очистит буфер. Поллинг происходит достаточно часто, чтобы в обычной ситуации буфер не переполнялся, но тем не менее при быстрой передаче большого количества данных часть данных может потеряться. Это расплата за простоту кода.

## Добавляем удобство

Всё хорошо, да не очень. Хочется ведь не просто строчки отправлять, а форматировать их в стиле printf, чтобы иметь возможность удобно логировать события с текстом, переменными и их модификаторами. Каждый раз при вызове функции логирования подготавливать строчку через sprintf вручную слишком муторно, высока вероятность ошибки, и плюс дикий перерасход памяти. Но ведь у нас уже есть строка-буфер в памяти, можно сразу писать туда!

Поэтому можно сделать функцию, которая будет принимать аргументы (такие же, как у функции printf) и сама вызывать sprintf, который сложит результат в буфер. Заодно проконтролируем длину строки, чтобы не записать туда сразу слишком много, с помощью snprintf.

Можно оформить это в виде макроса, который примет переменное число аргументов и сразу передаст их в функцию sprintf, вместе с адресом буфера:

<pre><code class="cpp">#define DEBUG_PRINTF(...) snprintf(&DebugBuffer[strlen(DebugBuffer)], DEBUG_BUF_LEN - strlen(DebugBuffer) - 1, __VA_ARGS__)</code></pre>

## Код

**debug_socket.c**

<pre><code class="cpp">struct tcp_pcb *DebugTCPSock;
char DebugBuffer[DEBUG_BUF_LEN];
int DebugBufLen = 0;
bool    fDebugStartConnection = true;
bool    fDebugConnected = false;
bool    fSendingDebugFrame = false;

static void DebugConnErr(void *arg, err_t err)
{
  LWIP_UNUSED_ARG(err);
  LWIP_UNUSED_ARG(arg);
}

static void DebugCloseConn(struct tcp_pcb *pcb)
{
    err_t err;

    tcp_arg(pcb, NULL);
    tcp_sent(pcb, NULL);
    tcp_recv(pcb, NULL);
    
    err = tcp_close(pcb);
}

static err_t DebugRecv(void *arg, struct tcp_pcb *pcb, struct pbuf *p, err_t err)
{
    bool closeconn = false;
    if ((err == ERR_OK) && (p != NULL))
    {
        if (p-&gt;tot_len != 0)
            if (*((char *) p-&gt;payload) == 0x1B)
                closeconn = true;
        
        tcp_recved(pcb, p-&gt;tot_len);
        pbuf_free(p);
    }   else
        closeconn = true;  
      
    if (closeconn)  
    {
        fDebugStartConnection = true;
        DebugCloseConn(pcb);
    }
    return(ERR_OK);
}

static err_t DebugPoll(void *arg, struct tcp_pcb *pcb)
{
    LWIP_UNUSED_ARG(arg);
    int err;
    
    fSendingDebugFrame = false;

    if (fDebugConnected)
    {   
        DebugBufLen  = strlen(DebugBuffer);
        if (DebugBufLen != 0)
            fSendingDebugFrame = true;
    }
    else
        DebugCloseConn(pcb);

    if (fSendingDebugFrame)
    {
        err = tcp_write(pcb, DebugBuffer, DebugBufLen, 0);
        if (err != ERR_OK)
        {
            if (err == ERR_CONN)    
            {
                fDebugStartConnection = true;
                DebugCloseConn(pcb);
            }
        }   else
            tcp_output(pcb);

        DebugBuffer[0] = 0;     
        fSendingDebugFrame = false;
    }
    return ERR_OK;
}

static err_t DebugSockAccept(void *arg, struct tcp_pcb *pcb, err_t err)
{
    LWIP_UNUSED_ARG(arg);
    LWIP_UNUSED_ARG(err);
    
    if (!fDebugConnected)
    {
        tcp_arg(pcb, NULL);
        tcp_recv(pcb, DebugRecv);
        tcp_err(pcb, DebugConnErr);
        tcp_poll(pcb, DebugPoll, 1);
        fDebugConnected = true;
        DebugBuffer[0] = 0;
        return ERR_OK;
    }   else
        return ERR_MEM;
}

void DebugSockInit(void)
{
    DebugTCPSock = tcp_new();
    tcp_bind(DebugTCPSock, IP_ADDR_ANY, 23);
    DebugTCPSock = tcp_listen(DebugTCPSock);
    tcp_accept(DebugTCPSock, DebugSockAccept);
}</code></pre>

**debug_socket.h**

<pre><code class="cpp">#include 
#include 
#include 
#define  DEBUG_BUF_LEN  512

extern char DebugBuffer[DEBUG_BUF_LEN];
extern bool fDebugConnected;
extern bool fDebugStartConnection;

#define DEBUG_PRINTF(...) if (fDebugConnected)  snprintf(&DebugBuffer[strlen(DebugBuffer)], DEBUG_BUF_LEN - strlen(DebugBuffer) - 1, __VA_ARGS__)
void DebugSockInit(void);</code></pre>

## Подключение к Telnet/Чтение логов

Самый распространённый Windows Telnet-клиент это Putty. Из коробки он хорош, но есть ещё более удобное дополнение putty-nd, которое включает удобный менеджер конфигураций и самое главное — ТАБЫ! Это действительно очень удобно, когда попробуете — поймёте, и я сейчас не понимаю как мог сидеть на обычном путти без табов. Ещё есть кнопки перезапуска сессии, что тоже часто пригождается.

В линуксе всё проще, ставите netcat и можете хоть выводить на экран, хоть grep-ать на экран по нужному слову, хоть писать в файл. Команда для вывода на экран:

<pre>nc 192.168.1.100 23</pre>

где 192.168.1.100 — адрес вашего девайса, а 23 — порт телнета. Netcat нравится мне немного больше чем путти, потому что в нём можно быстро нажать Ctrl-C и вывод остановится, в путти же такой (очень нужной иногда!) возможности нет. И конечно, если отладка проходит на другой стороне земли (я отлаживал так девайсы на Ямайке), то кроме netcat на местном сервере никаких вариантов больше нет. Можно сразу записать вывод netcat в файл, [запаковать его и отправить себе по почте](http://catethysis.ru/%d0%b1%d1%8d%d0%ba%d0%b0%d0%bf-%d0%b1%d0%bb%d0%be%d0%b3%d0%b0-%d0%b2-%d0%bf%d0%be%d1%87%d1%82%d1%83/ "Бэкап блога в почту").

Однако, скоро вы устанете от необходимости вести &#171;онлайн&#187; запись вручную, и захотите чего-то более удобного. И такой вариант передачи отладочных логов есть — это SysLog. С его помощью можно вести постоянную запись логов со всех подключенных девайсов в файл или в базу. Написав отображалку этих событий из базы, вы получите удобный инструмент для записи и исследования логов работы ваших устройств. Про Syslog я расскажу в следующей статье.