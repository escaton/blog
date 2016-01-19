---
id: 1734
title: 'STM32: Консоль на UART'
date: 2014-06-18T19:23:37+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=1734
permalink: /stm32-uart-console/
ratings_users:
  - 3
ratings_score:
  - 15
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 2775422841
categories:
  - STM32
  - Готовые девайсы
tags:
  - STM32
  - электроника
---
Сегодня в комментариях меня попросили продемонстрировать пример консоли — и я сделал UART–консоль на STM32.
  
Поддерживаются команды:

  * echo [text] — отправка text;
  * get leds — возвращается текущее состояние светодиодов;
  * set leds \[LED1\] \[LED2\] — устанавливается состояние светодиодов, и дублируется текстом;
  * help — отображается справка по командам

[<img class="alignnone size-full wp-image-1735" src="http://catethysis.ru/wp-content/uploads/2014/06/led_console.png" alt="led_console" width="690" height="317" />](http://catethysis.ru/wp-content/uploads/2014/06/led_console.png)

<!--more-->

<pre><code class="cpp">#include "stm32f10x_conf.h"
#include "string.h"
#include "stdio.h"

void USART1_Send(char chr) {
    while(!(USART1-&gt;SR & USART_SR_TC));
    USART1-&gt;DR = chr;
}

void USART1_Send_String(char* str) {
    int i=0;
    while(str[i])
        USART1_Send(str[i++]);
}

char *prompt = "\r\n&gt; ";

int main()
{
    GPIO_InitTypeDef GPIO_InitStructure;
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOC, ENABLE);
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_8 | GPIO_Pin_9;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_2MHz;
    GPIO_Init(GPIOC, &GPIO_InitStructure);

    // Включаем модули USART1 и GPIOA, а также включаем альтернативные функции выходов
    RCC-&gt;APB2ENR|= RCC_APB2ENR_USART1EN | RCC_APB2ENR_IOPAEN | RCC_APB2ENR_AFIOEN;
    // Контакт PA9 будет выходом с альтернативной функцией, а контакт PA10 - входом
    GPIOA-&gt;CRH &= !GPIO_CRH_CNF9;
    GPIOA-&gt;CRH |=  GPIO_CRH_CNF9_1 | GPIO_CRH_MODE9_0 | GPIO_CRH_MODE9_1 | GPIO_CRH_CNF10_0;
    // Настраиваем регистр тактирования, скорость составит 9600 бод (при тактовой частоте 24 МГц)
    USART1-&gt;BRR = 0x1D4C;//1302;//0x1458;//0x9C4;
    // Выключаем TxD и RxD USART
    USART1-&gt;CR1 |= USART_CR1_TE | USART_CR1_RE;
    // Запускаем модуль USART
    USART1-&gt;CR1 |= USART_CR1_UE;
    // Разрешаем прерывание по приёму информации с RxD
    USART1-&gt;CR1 |= USART_CR1_RXNEIE;
    // Назначаем обработчик для всех прерываний от USART1
    NVIC_EnableIRQ(USART1_IRQn);
    // Приветствие
    USART1_Send_String("Start\r\n");
    USART1_Send_String(prompt);

    // Бесконечный цикл
    while(1);
}

int LED1, LED2;

void processCommand(char *cmd)
{
    // Обрабатываем запрос
    char answer[20]="";
    // Команда echo
    if(strncmp(cmd, "echo ", 5) == 0)
        // отправляем строку запроса, начиная с 5 символа (т.е. после "echo ") - работа с указателями.
        USART1_Send_String(cmd + 5);
    
    // Запрос состояния светодиодов
    if(strncmp(cmd, "get leds", 8) == 0)
    {
        sprintf(answer, "LEDs state: %s, %s", (LED1 ? "On" : "Off"), (LED2 ? "On" : "Off"));
        USART1_Send_String(answer);
    }
    
    // Установка состояния светодиодов
    if(strncmp(cmd, "set leds", 8) == 0)
    {
        sscanf(cmd + 9, "%d, %d", &LED1, &LED2); // берём командную строку, начиная с 9 символа и читаем в ней два integer
        GPIO_WriteBit(GPIOC, GPIO_Pin_8, (LED1 ? Bit_SET : Bit_RESET));
        GPIO_WriteBit(GPIOC, GPIO_Pin_9, (LED2 ? Bit_SET : Bit_RESET));
        sprintf(answer, "LEDs state: %s, %s", (LED1?"On":"Off"), (LED2?"On":"Off"));
        USART1_Send_String(answer);
    }
    
    // Справка по существующим функциям
    if(strncmp(cmd, "help", 4) == 0)
        USART1_Send_String("Help on our LED controller\r\n  \echo [text] - print text\r\n  get leds - get LEDs state\r\n  \
set leds [LED1] [LED2] - set LEDs state, 0(off)/1(on)\r\n  \help - this help");
    
    USART1_Send_String(prompt);
}

char received[50], rec_len=0;

// Обработчик всех прерываний от USART1
void USART1_IRQHandler(void) {
  // Выясняем, какое именно событие вызвало прерывание. Если это приём байта в RxD - обрабатываем.
    if (USART1-&gt;SR & USART_SR_RXNE) {
        // Сбрасываем флаг прерывания
        USART1-&gt;SR&=~USART_SR_RXNE;
        short unsigned int dat = USART1-&gt;DR;
        // Обработка запроса
        if(dat==13)
        {
            USART1_Send_String(prompt);
            received[rec_len++]=0; // делаем нуль-терминированную строку
            // отправляем принятую команду на обработку
            processCommand(received);
            // очищаем буфер приёма
            rec_len=0;
        }
        else
        {
            // Эхо, чтобы не печатать вслепую
            USART1_Send(dat);
            // Складываем символ в приёмный буфер
            received[rec_len++]=dat;
        }
    }
}</code></pre>

Код использует инициализацию UART и некоторые функции приёма-передачи из [основной статьи по UART в STM32](http://catethysis.ru/stm32-uart-usart/ "STM32 → UART / USART"), и пару новых функций обработки консоли.

Суть работы довольно проста, вся первичная обработка проходит в прерывании по приёму символа в UART:

  1. Из UART принимается символ;
  2. Если принят не &#171;перевод строки&#187;, то принятый символ складывается в буфер (массив char);
  3. Если &#171;перевод строки&#187; — заканчиваем строку нулём (функции работы со строками из strings.h принимают нуль–терминированные строки), вызываем функцию обработки принятой строки и опустошаем буфер.

Функция обработки проверяет первые символы строки. Если найдена одна из управляющих команд (_help_, _set leds_, _get leds_, _echo_) — делается соответствующее действие. Там есть небольшая хитрость: чтобы начать обработку строки с 5 символа — нужно инкрементировать строку на 5, потому что строка это указатель. Если мы инкрементируем указатель на 5 — он начинает указывать на ячейку памяти, смещённую на 5 относительно первоначальной.

Проверка команды делается функцией strncmp, которая сравнивает первые n символов двух строк. Если они равны — функция возвращает 0.