---
id: 1000
title: Установка FreeRTOS на STM32F100 / VLDiscovery в IAR
date: 2014-02-23T04:27:21+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=1000
permalink: /freertos_stm32f100_iar/
notely:
  - 
  - 
  - 
wp_noextrenallinks_mask_links:
  - 0
  - 0
  - 0
ratings_users:
  - 3
  - 3
  - 3
ratings_score:
  - 15
  - 15
  - 15
ratings_average:
  - 5
  - 5
  - 5
dsq_thread_id:
  - 2726264807
categories:
  - Руководства
  - С нуля до RTOS
tags:
  - FreeRTOS
  - RTOS
  - STM32
---
[<img class="alignnone size-full wp-image-1997" src="http://catethysis.ru/wp-content/uploads/2014/02/FreeRTOSlogov1.jpg" alt="FreeRTOSlogov1" width="707" height="265" />](http://catethysis.ru/wp-content/uploads/2014/02/FreeRTOSlogov1.jpg)

За 15 шагов успешно установим FreeRTOS на STM32F100 в IAR и помигаем светодиодом. Я использовал плату [STM32VLDiscovery](http://catethysis.ru/stm32-discovery-boards/ "STM32 — обзор плат Discovery") для этой статьи.

<!--more-->

**1.** Скачиваем архив с <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://sourceforge.net/projects/freertos/files/latest/download?source=files" >последней версией FreeRTOS</a>.

**2.** После распаковки &#8212; появляются папки FreeRTOS (нам нужна именно она), FreeRTOS+ и пара readme-файлов. Где-то у себя создаём папку FreeRTOS_test, в ней &#8212; подпапку FreeRTOS, в ней &#8212; папки source и include. Здесь будет лежать вся FreeRTOS.

**3.** Скачиваем <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://www.st.com/st-web-ui/static/active/en/st_prod_software_internet/resource/technical/software/firmware/stsw-stm32078.zip" >примеры </a>от ST для платы STM32VLDiscovery.

**4.** В папку source копируем:

  1. из FreeRTOS/Source &#8212; все c-файлы (croutine, event_groups, list, queue, tasks, timers);
  2. из FreeRTOS/Source/portable/IAR/ARM_CM3 &#8212; port.c (не закрывайте пока эту папку), это &#8212; железо-специфичные функции, т.е. HAL;
  3. из FreeRTOS/Source/portable/MemMang &#8212; heap2.c (модуль управления кучей).

**5.** В папку include копируем:

  1. из FreeRTOS/Source/include &#8212; все h-файлы (croutine, event\_groups, FreeRTOS, list, mpu\_wrappers, portable, projdefs, queue, semphr, StackMacros, task, timers);
  2. из FreeRTOS/Source/portable/IAR/ARM_CM3 &#8212; portmacro.h (тоже HAL).

**6.** В корень копируем:

  1. из FreeRTOS/Demo/CORTEX\_STM32F100\_Atollic/Libraries &#8212; папки CMSIS и STM32F10x\_StdPeriph\_Driver (стандартная библиотека периферии)
  2. из FreeRTOS/Demo/CORTEX\_STM32F100\_Atollic/Simple\_Demo\_Source &#8212; FreeRTOSConfig.h, stm32f10x\_conf.h, stm32f10x\_it.c, stm32f10x\_it.h, system\_stm32f10x.c (конфигурация FreeRTOS, обработчики прерываний и настройка кристалла);
  3. из FreeRTOS/Source/portable/IAR/ARM_CM3 &#8212; portasm.s (опять HAL);
  4. из stm32vldiscovery\_package/Libraries/CMSIS/CM3/DeviceSupport/ST/STM32F10x/startup/iar &#8212; startup\_stm32f10x\_md\_vl.s (файл настройки кристалла).

<span style="line-height: 1.5;">Можно скачать </span><a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://static.catethysis.ru/files/FreeRTOS_test_dirStruct.rar" style="line-height: 1.5;" >архив </a><span style="line-height: 1.5;">с этими файлами.</span>

**7.** Создаём новый workspace и проект в IAR. Настройки проекта понятны &#8212; приложение C -> main, архитектура ARM. Сохраняем в папку проекта (корень, FreeRTOS\_test) сначала проект FreeRTOS\_test.eww, потом (Ctrl-S) &#8212; воркспейс FreeRTOS_test.ewp.

Получается такая структура папок: в корне лежат **файлы**: файлы проекта (.ewp и .ewd), FreeRTOSConfig.h, main.c, файлы .s (startup\_stm&#8230; и portasm), stm32f10x\_conf.h, stm32f10x\_it.h и system\_stm32f10x.c и **папки**: FreeRTOS, CMSIS и STM32F10x\_StdPeriph\_Driver.
  
В папке FreeRTOS &#8212; папки include и sources, в папке CMSIS &#8212; папка CM3, в папке STM32F10x\_StdPeriph\_Driver &#8212; папки inc и src.

**8.** Формируем в окне Workspace (слева) такую структуру папок: FreeRTOS, CMSIS, StdPeriphDriver, Startup, User. Папки добавляются так: щёлчок правой кнопкой мыши по свободному месту -> Add -> Add Group&#8230;

**9.** В группы добавляем файлы:

  1. В CMSIS: из CMSIS/CM3/CoreSupport &#8212; core\_cm3.c, из корня &#8212; system\_stm32f10x.c;
  2. В FreeRTOS: из FreeRTOS/source &#8212; все файлы;
  3. В Startup: из корня &#8212; файл startup\_stm32f10x\_md_vl.s и portasm.s;
  4. В StdPeriphLib: из STM32F10x\_StdPeriph\_Driver/src &#8212; файлы stm32f10x\_rcc.c и stm32f10x\_gpio.c;
  5. В User: переносим main.c из корня проекта, не добавляем файл &#8212; а переносим строчку &#171;main.c&#187;, которая находится чуть ниже под &#171;user&#187;.

Структура файлов проекта готова.

**10.** Правим настройки проекта (щелчок правой кнопкой мыши по самой верхней строчке FreeRTOS_test &#8212; Debug*, она выделена жирным) -> Options:

  1. General options -> Target -> Processor variant: выбираем &#171;Device&#187;, справа &#8212; кнопка со списком. Нажимаем, выбираем ST-> STM32F100 -> ST STM32F100xB.
  2. General options -> Library Configuration -> CMSIS: ставим галочку CMSIS.
  3. C/C++ compiler -> Preprocessor -> Additional include directories. Добавляем такие строки: 
    <pre>$PROJ_DIR$
$PROJ_DIR$/FreeRTOS/sources
$PROJ_DIR$/FreeRTOS/include
$PROJ_DIR$/CMSIS/CM3/DeviceSupport/ST/STM32F10x
$PROJ_DIR$/STM32F10x_StdPeriph_Driver/src
$PROJ_DIR$/STM32F10x_StdPeriph_Driver/inc
</pre>
    
    В Defined symbols (ниже) добавляем USE\_STDPERIPH\_DRIVER.</li> 
    
      * Debugger -> Setup -> Driver: выбираем ST-LINK.
      * Debugger -> Download: устанавливаем галочку Use flash loader(s);
      * Debugger -> ST-LINK -> Reset: Connect during reset, Interface: SWD.</ol> 
    
    **11.** Открываем main.c, пишем такой код:
    
    <pre><code class="cpp">#include "FreeRTOS.h"
#include "task.h"
#include "queue.h"
#include "stm32f10x.h"
#include "stm32f10x_gpio.h"
#include "stm32f10x_rcc.h"

/*
 Инициализация всего. В данном случае - периферии: включаем ножку PC9 как выход.
*/
void vFreeRTOSInitAll()
{
  GPIO_InitTypeDef GPIO_InitStructure;

  RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOC, ENABLE);
  GPIO_InitStructure.GPIO_Speed = GPIO_Speed_2MHz;
  GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;
  GPIO_InitStructure.GPIO_Pin = GPIO_Pin_9;
  GPIO_Init(GPIOC, &GPIO_InitStructure);
}

/*
 Задание vBlinkTask - единственная задача в этой программе. В бесконечном цикле 
 переключаем состояние ножки PC9, и вызываем функцию задержки на 100 тиков ядра.
*/
void vBlinkTask (void *pvParameters)
{
    while(1)
    {
	GPIOC-&gt;ODR ^= GPIO_Pin_9;
        vTaskDelay(100); //Только такие задержки можно использовать в FreeRTOS. Забудьте про обычные долгие пустые циклы!
    }
}

int main()
{
  //Вызываем функцию инициализации всего
  vFreeRTOSInitAll();

  //Создаём процесс: ссылка на функцию-обработчик, название, размер стека, передаваемые параметры, приоритет, хендл созданного процесса.
  xTaskCreate(vBlinkTask, "BlinkTask", configMINIMAL_STACK_SIZE, NULL, tskIDLE_PRIORITY + 1, NULL);

  //Запускаем шедулер - диспетчер задач. Он будет следить за приоритетами, переключением задач, ошибками и прочим.
  vTaskStartScheduler();
}

/*
 Секция обработчиков системных событий:
  ошибка MallocFailed - не удалось выделить память, скорее всего закончилась свободная память;
  ошибка StackOverflow - переполнение стека вызовов. Бесконечная рекурсия или выделение слишком большой переменной;
  событие Idle - вызывается каждый тик ядра RTOS.

Ошибки "обрабатываются" падением в бесконечный цикл. Очевидно, это лучше чем пытаться продолжать
программу с неверными данными. На самом деле, лучше вызывать стандартный обработчик HARD_FAULT.

Событие Idle обрабатывается пустой процедурой. В этом примере нам не нужно дополнительно что-то делать каждый тик.
*/
void vApplicationMallocFailedHook( void )
{
  for( ;; );
}

void vApplicationStackOverflowHook( TaskHandle_t pxTask, char *pcTaskName )
{
  for( ;; );
}

void vApplicationIdleHook( void )
{
}</code></pre>
    
    **12.** В FreeRTOSConfig.h (можно добраться из FreeRTOS.h) закомментируем 73 строку, с ошибкой &#171;Ensure <&#8230;>.bat has been executed&#187;. Нам уже не нужно выполнять этот bat, мы сами проделали его работу.
    
    **13.** Там же, в FreeRTOSConfig.h в 97 строке (#define configTOTAL\_HEAP\_SIZE) изменяем 7 \* 1024 на 5 \* 1024.
    
    **14.** В stm32f10x.h (к нему можно добраться из system\_stm32f10x.c, он там в #include) раскомментируем 53 строку, #define STM32F10X\_MD_VL. Этот дефайн можно было добавить и в шаге 10.3 в Defined symbols.
    
    **15.** Выполняем Project -> Rebuild All, прошиваем программу в микроконтроллер (Ctrl + D). Работает!
    
    Можно скачать <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://static.catethysis.ru/files/FreeRTOS_test.rar" >готовый проект</a> с этим примером.
    
    Итак, что мы сделали?
    
      * Провели все нужные настройки нового проекта;
      * Подключили к проекту FreeRTOS;
      * Настроили параметры самого FreeRTOS &#8212; конкретный кристалл и объём доступной памяти;
      * Создали main.c с инициализацией ядра FreeRTOS, инициализацией периферии и заданием (&#171;воркером&#187;);
      * Добавили обработчики ошибок (три функции vApplicationXXX) &#8212; без этих обработчиков программа не соберётся, они специально <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://www.freertos.org/FreeRTOS_Support_Forum_Archive/June_2010/freertos_IAR_tasks.c_linker_error_3731401.html" >оставлены на усмотрение пользователя</a>.
    
    Другие статьи цикла:
  
    [1. Порты ввода–вывода](http://catethysis.ru/index.php/stm32-from_zero_to_rtos-1_gpio/ "STM32 — с нуля до RTOS. 1: Порты ввода–вывода")
  
    [2. Таймер и прерывания](http://catethysis.ru/index.php/stm32-from_zero_to_rtos-2_timers/ "STM32 — с нуля до RTOS. 2: Таймер и прерывания")
  
    [3. Выходы таймера](http://catethysis.ru/index.php/stm32-from_zero_to_rtos-3_timer_outputs/ "STM32 — с нуля до RTOS. 3: Выходы таймера")
  
    [4. Внешние прерывания и NVIC](http://catethysis.ru/index.php/stm32-from_zero_to_rtos-4_exti_nvic/ "STM32 — с нуля до RTOS. 4: Внешние прерывания и NVIC")
  
    5. Устанавливаем FreeRTOS