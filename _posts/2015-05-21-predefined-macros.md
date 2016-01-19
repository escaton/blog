---
id: 2343
title: Predefined macros в компиляторе IAR
date: 2015-05-21T09:59:02+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2343
permalink: /predefined-macros/
ratings_users:
  - 1
ratings_score:
  - 5
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 3779340529
categories:
  - Без рубрики
---
Во многих компиляторах C есть такая штука как predefined macros — предзаданные (встроенные) макросы.

Как и обычные макросы, их раскрывает препроцессор на самом первом этапе сборки кода. Поэтому эти макросы рассматриваются именно с позиции конкретного файла исходного кода, и конкретной текущей строки.

Среди них макросы даты и времени:

  * \_\_DATE\_\_ — текущая дата в формате &#171;May 20 2015&#8243;. Дни меньше 10 числа месяца будут дополнены пробелом слева.
  * \_\_TIME\_\_ — текущее время в формате &#171;13:20&#8243;. В IAR это только часы и минуты, а в GCC добавлены секунды.

Дата и время, конечно же, текущие на момент трансляции файла.

И макросы, указывающие на файл и строку в нём:

  * \_\_MODULE\_\_ — короткое имя текущего файла, типа того как указывается в директиве #include.
  * \_\_FILE\_\_ — полный путь к текущему файлу. Не короткое имя, как в \_\_MODULE\_\_, а именно полный путь.
  * \_\_LINE\_\_ — номер строки, вместо этого макроса подставляется номер строки в которой он находится, в виде десятичного числа. Необычный макрос, который изменяется (инкрементируется) с каждой новой строкой.

Макросы \_\_FILE\_\_ и \_\_LINE\_\_ очень удобны для отладки, поскольку вы можете выводить отладочные сообщения или сообщения об ошибках сразу с прямым указанием на положение ошибочного места в коде. Это может выглядеть, например, так:

<pre>printf("Serious error occurred in file %s, line %d\n", __FILE__, __LINE__);</pre>

Я думаю, что их можно сразу добавить в функцию [DEBUG_PRINTF для Syslog](http://catethysis.ru/telnet-console/ "Отладочная консоль через Telnet") — можно будет в веб-интерфейсе логгера видеть файл и строку для каждого сообщения.

Также есть (менее применимые) макросы, указывающие на архитектуру и модель процессора, для которого ведётся сборка. Это:

  * _\_TARGET\_ARCH_xx и
  * _\_TARGET\_CPU_xx

Это самые полезные предопределённые макросы, а об остальных макросах вы можете прочитать на <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0041c/Babbacdb.html" >сайте ARM</a>.