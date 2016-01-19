---
id: 1015
title: Разбор JSON на микроконтроллере — библиотека cJSON
date: 2014-02-24T02:21:17+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=1015
permalink: /mcu_json_parse/
ratings_users:
  - 2
  - 2
  - 2
ratings_score:
  - 9
  - 9
  - 9
ratings_average:
  - 4.5
  - 4.5
  - 4.5
notely:
  - 
  - 
  - 
wp_noextrenallinks_mask_links:
  - 0
  - 0
  - 0
dsq_thread_id:
  - 2733442851
categories:
  - Библиотеки
tags:
  - ethernet
  - json-коннект
  - STM32
---
У меня появилась необходимость общаться с сервером через JSON-сообщения. Генерировать я их научился очевидным образом &#8212; ручной сборкой сообщения через sprintf. Однако мне нужно было ещё и разбирать ответ сервера, и чтобы не городить самописный парсер, попробовал найти готовые решения.

Благо, <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://json.org/" >тут</a> целых 17 готовых парсеров JSON в C. Некоторые (такие как YAJL) не захотели собираться с пол-пинка, да и странно выглядит когда решение такой довольно простой задачи разбивают на 10 модулей. Поэтому был выбран парсер <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://sourceforge.net/projects/cjson/" >cJSON</a>, который умещается в два файла.

<!--more-->

## Использование cJSON

Использовать его крайне просто. Подключаем .h в инклуды, .c в дерево проекта, создаём строку JSON, например: char text1[]=&#187;{&#171;type&#187;: 1, &#171;value&#187;: {&#171;counters&#187;: &#171;abc&#187;}}&#187;; Для парсинга &#8212; вызываем метод JSON_Parse (он создаёт дерево сообщения), и складываем его вывод в переменную типа cJSON.

Теперь по дереву можно легко передвигаться методом cJSON\_GetObjectItem. Этот метод возвращает новый объект cJSON, то есть для того чтобы добраться до листа &#8212; нужно вложить несколько cJSON\_GetObjectItem друг в друга.

Получив, наконец, искомый лист (имеющий тип cJSON) &#8212; переводим его в строку методом cJSON_Print. Он возвращает char*, то есть его можно выводить в sprintf и подобных функциях (советую почитать исходный код &#8212; он простой, и может прояснить некоторые вопросы). Единственная проблема, которая на самом деле не является проблемой &#8212; все значения возвращаются в виде строк, но эти строки легко преобразовать в нужные числа, boolean и так далее.

## Код

<pre><code class="cpp">#include &lt;stdio.h&gt;
#include &lt;string.h&gt;
#include &lt;stdlib.h&gt;
#include "cJSON.h"

int state=0;

void json_work(char *text)
{
	cJSON *json=cJSON_Parse(text);
  char *out=cJSON_Print(cJSON_GetObjectItem(cJSON_GetObjectItem(json, "value"), "counters"));
  //Теперь имеем строку out
  cJSON_Delete(json);
  free(out);
}

void initGPIO()
{
  GPIO_InitTypeDef GPIO_InitStructure;

  RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOC, ENABLE);
  GPIO_InitStructure.GPIO_Speed = GPIO_Speed_2MHz;
  GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;
  GPIO_InitStructure.GPIO_Pin = GPIO_Pin_8;
  GPIO_Init(GPIOC, &GPIO_InitStructure);  
  GPIO_WriteBit(GPIOC, GPIO_Pin_8, Bit_RESET);
}

int i=0;

int main(void)
{
  char json[]="{"type": 1, "value": {"counters": 150}}";	

  initGPIO();

  while(1)
  {
    for(i=0; i&lt;1000; i++)
      json_work(json); //0.3 мс на весь разбор
    GPIOC-&gt;ODR ^= GPIO_Pin_8;
    state=1-state;
  }
}</code></pre>

Код никак не использует вытащенное значение, но тем не менее успешно делает это 1000 раз для определения времени работы. На плате STM32-VLDiscovery с процессором STM32F100 у меня получилось около 0.3мс на один цикл разбора.