---
id: 2031
title: Восстановление работоспособности примеров от ST
date: 2014-10-21T14:08:05+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2031
permalink: /repair_st_examples/
ratings_users:
  - 5
ratings_score:
  - 20
ratings_average:
  - 4
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 3139849246
categories:
  - STM32
  - Справочник
tags:
  - STM32
  - глюк
---
Маленькая заметка: если вы скачали с сайта ST старые [примеры](http://catethysis.ru/stm32-discovery-boards/ "STM32 — обзор плат Discovery") для плат Discovery и пытаетесь запустить их в новом IAR &#8212; появляется туча ошибок типа

<pre>Error[Pe147]: declaration is incompatible with "__nounwind __interwork __softfp void __set_PSP(unsigned long)" (declared at core_cm3.h 1094 
Error[Pe147]: declaration is incompatible with "__nounwind __interwork __softfp void __set_MSP(unsigned long)" (declared at core_cm3.h 1114 
Error[Pe147]: declaration is incompatible with "__nounwind __interwork __softfp unsigned long __get_PSP(void)" (declared at core_cm3.h 1084 
Error[Pe147]: declaration is incompatible with "__nounwind __interwork __softfp unsigned long __REV16(unsigned long)" core_cm3.h 1124 
Error[Pe147]: declaration is incompatible with "__nounwind __interwork __softfp unsigned long __RBIT(unsigned long)" core_cm3.h 1134 
Error[Pe147]: declaration is incompatible with "__nounwind __interwork __softfp unsigned long __STREXB(unsigned char, core_cm3.h 1175 
Error[Pe147]: declaration is incompatible with "__nounwind __interwork __softfp unsigned long __STREXH(unsigned short, core_cm3.h 1186</pre>

Проблема в том, что в IAR появилась своя собственная встроенная библиотека CMSIS, а те примеры рассчитаны на использование своей библиотеки, которая лежит в папке Libraries/CMSIS. В старом IAR она компилировалась, а в новом &#8212; нет, и обязательно нужно использовать встроенную.

<!--more-->

Решение простое:

  1. В дереве проекта в папке CMSIS удаляем подключенный файл core_cm3.c: выделяем файл
  
    [<img class="alignnone size-full wp-image-2032" src="http://catethysis.ru/wp-content/uploads/2014/10/core_cm3_delete.png" alt="core_cm3_delete" width="220" height="238" />](http://catethysis.ru/wp-content/uploads/2014/10/core_cm3_delete.png)
  
    Нажимаем delete, на предупреждение отвечаем &#171;Да&#187;.
  2. Заходим в свойства проекта: правой кнопкой по проекту на панели Workspace слева, пункт Options. Здесь: C/C++ compiler -> Preprocessor -> Additional include directories.
  
    [<img class="alignnone size-large wp-image-2033" src="http://catethysis.ru/wp-content/uploads/2014/10/coresupport_delete.png" alt="coresupport_delete" width="550" height="514" />](http://catethysis.ru/wp-content/uploads/2014/10/coresupport_delete.png)
  
    Удаляем строку &#171;$PROJ\_DIR$\..\..\..\..\Libraries\CMSIS\CM3\CoreSupport&#187; (там IAR искал файл core\_cm3.h)
  3. Только что мы отключили CMSIS (исходник и заголовки), поставляющийся вместе с проектом. Теперь подключаем встроенный в IAR CMSIS: в свойствах проекта General options -> Library Configuration -> CMSIS -> ставим галочку Use CMSIS.
  
    [<img class="alignnone size-large wp-image-2034" src="http://catethysis.ru/wp-content/uploads/2014/10/use_cmsis.png" alt="use_cmsis" width="550" height="514" />](http://catethysis.ru/wp-content/uploads/2014/10/use_cmsis.png)

Project -> Rebuild All &#8212; и проект успешно компилируется.