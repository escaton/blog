---
id: 852
title: STM32 → UART / USART
date: 2013-12-26T06:35:46+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=852
permalink: /stm32-uart-usart/
notely:
  - 
  - 
  - 
wp_noextrenallinks_mask_links:
  - 0
  - 0
  - 0
ratings_users:
  - 4
  - 4
  - 4
ratings_score:
  - 20
  - 20
  - 20
ratings_average:
  - 5
  - 5
  - 5
dsq_thread_id:
  - 2726264519
categories:
  - STM32
  - Справочник
tags:
  - STM32
  - электроника
---
Классический &#171;Hello world&#187; интерфейс, до сих пор применяющийся для связи МК и [датчиков](http://catethysis.ru/tag/sensors/), подключения к компьютеру и просто для отладки. Рассмотрим его использование.

Сделаем такую полезную вещь &#8212; при поступлении в USART символа &#8216;1&#8217; включаем светодиод на плате, при поступлении символа &#8216;2&#8217; &#8212; выключаем. Одновременно отсылаем обратно в USART новое состояние светодиода. Используем асинхронный режим работы USART, с применением сигналов RxD и TxD.

<!--more-->

## Регистры USART

#### Регистр состояния USART_SR

<img class="alignnone" src="http://static.catethysis.ru/files/STM32_registers/USART_SR.png" alt="Регистр USART_SR микроконтроллера STM32F100" width="1573" height="195" />

CTS &#8212; сигнал о переключении контакта CTS
  
LBD &#8212; обнаружен сигнал BREAK в режиме LIN
  
TXE &#8212; данные отправлены в передатчик, регистр данных опустел
  
TC &#8212; данные переданы, передача завершена
  
RXNE &#8212; данные приняты, регистр данных полон
  
IDLE &#8212; обнаружен сигнал IDLE
  
ORE &#8212; ошибка: переполнение входного буфера &#8212; приняты новые данные, а старые ещё не прочитаны
  
NE &#8212; обнаружение шума на линии
  
FE &#8212; рассинхронизация, сильный шум на линии или принят сигнал BREAK
  
PE &#8212; ошибка контроля чётности принятых данных

#### Регистр состояния USART_DR

<img src="http://static.catethysis.ru/files/STM32_registers/USART_DR.png" alt="Регистр USART_DR микроконтроллера STM32F100" width="1573" height="195" />

В 9 младших битах содержатся данные. При получении  байта отсюда можно прочитать принятые данные, для отправки нужно записать данные в этот регистр.

#### Регистр состояния USART_BRR

<img src="http://static.catethysis.ru/files/STM32_registers/USART_BRR.png" alt="Регистр USART_BRR микроконтроллера STM32F100" width="1573" height="195" />

DIV_Mantissa &#8212; целая часть значения USARTDIV
  
DIV_Fraction &#8212; дробная часть значения USARTDIV

USARTDIV = DIV\_Mantissa + DIV\_Fraction/16.
  
Baud rate = F\_clk/(DIV\_Fraction\*16) = F\_clk/(DIV\_Mantissa\*16 + DIV\_Fraction) = F\_clk/USART_BRR.

К примеру, при тактовой частоте 24МГц нужна скорость 9600 бод. Делим 24000000 на 9600, это равно 2500 = 0x9C4. Именно такое значение нужно положить в регистр BRR. Вот таблица значений BRR в зависимости от частоты процессора и требуемого бодрейта. Белые &#8212; точные значения (погрешность 0%), жёлтые &#8212; менее точные (погрешность 0 &#8212; 0.1%), красные &#8212; самые неточные (погрешность 0.1 &#8212; 0.3%). Однако, даже красные значения можно применять в хобби-устройствах.
  
[<img class="alignnone  wp-image-1315" src="http://catethysis.ru/wp-content/uploads/2013/12/BRR1.png" alt="BRR" width="638" height="200" />](http://catethysis.ru/wp-content/uploads/2013/12/BRR1.png)

#### Регистр состояния USART_CR1

<img src="http://static.catethysis.ru/files/STM32_registers/USART_CR1.png" alt="Регистр USART_CR1 микроконтроллера STM32F100" width="1573" height="195" />

UE &#8212; включение USART: 0 &#8212; выключен, 1 &#8212; включен.
  
M &#8212; длина слова данных: 0 &#8212; 8 бит, 1 &#8212; 9 бит. Не должен меняться во время приёма/передачи.
  
WAKE &#8212; способ пробуждения модуля USART
  
PCE &#8212; включение контроля чётности для приёма и передачи. Делает старший бит (8 или 9) битом чётности.
  
PS &#8212; полярность бита чётности
  
PEIE &#8212; включение прерывания по установке бита PE регистра SR, т.е. при ошибке чётности
  
TXEIE &#8212; включение прерывания по установке бита TXE регистра SR, т.е. при начале передачи данных
  
TCIE &#8212; включение прерывания по установке бита TC регистра SR, т.е. при окончании передачи данных
  
RXNEIE &#8212; включение прерывания по установке бита ORE регистра SR, т.е. при переполнении входного буфера
  
IDLEIE &#8212; включение прерывания по установке бита IDLE регистра SR, т.е. при приёме сигнала IDLE
  
TE &#8212; включение передатчика
  
RE &#8212; включение приёмника
  
RWU &#8212; перевод приёмника в спящий режим: 0 &#8212; активный, 1 &#8212; спящий
  
SBK &#8212; передача сигнала BREAK. Сбрасывается железом после передачи.

#### Регистр состояния USART_CR2

<img src="http://static.catethysis.ru/files/STM32_registers/USART_CR2.png" alt="Регистр USART_CR2 микроконтроллера STM32F100" width="1573" height="195" />

LINEN &#8212; включение режима LIN
  
STOP &#8212; программирование количества стоповых бит. 00 &#8212; 1 бит, 01 &#8212; 0.5 бит, 10 &#8212; 2 бит, 11 &#8212; 1.5 бит.
  
CLKEN &#8212; использование пина CK, включение синхронного режима
  
CPOL &#8212; полярность сигналов пина CK: 0 &#8212; высокое значение при передаче, 1 &#8212; низкое.
  
CPHA &#8212; фаза сигналов CK: 0 &#8212; первый перепад CK в первый бит передачи, 1 &#8212; второй.
  
LBCL &#8212; передача сигнала CK по передаче последнего бита (MSB)
  
LBDIE &#8212; включение прерывания по установке бита LBD регистра SR
  
LBDL &#8212; длина сигнала BREAK в LIN: 0 &#8212; 10, 1 &#8212; 11
  
ADD &#8212; адрес узла USART

#### Регистр состояния USART_CR3

<img src="http://static.catethysis.ru/files/STM32_registers/USART_CR3.png" alt="Регистр USART_CR3 микроконтроллера STM32F100" width="1573" height="195" />

CTSIE &#8212; включение прерывания по установке бита CTS регистра SR
  
CTSE &#8212; включение сигнала CTS, т.е. аппаратного управления потоком
  
RTSE &#8212; включение сигнала RTS и генерирование прерывания по установке бита RTS
  
DMAT &#8212; использование [DMA](http://catethysis.ru/stm32_dma/ "STM32 → DMA") для передачи
  
DMAR &#8212; использование [DMA](http://catethysis.ru/stm32_dma/ "STM32 → DMA") для приёма
  
SCEN &#8212; включение режима Smartcard
  
NACK &#8212; использование сигнала NACK для режима Smartcard
  
HDSEL &#8212; полудуплексный режим для однопроводного режима
  
IRLP &#8212; выбор режима пониженного потребления IrDA
  
IREN &#8212; включение режима IrDA
  
EIE &#8212; включение прерывания при возникновении ошибки

## STM32VLDiscovery + USART1/USART2/USART3

Перед началом работы с USART нужно [включить ножки GPIO](http://catethysis.ru/stm32-%e2%86%92-%d0%bf%d0%be%d1%80%d1%82%d1%8b-gpio/ "STM32 → Порты GPIO") на вход и на выход:

USART1: PA9/TxD + PA10/RxD
  
USART2: PA2/TxD + PA3/RxD
  
USART3: PB10/TxD + PB11/RxD

<pre><code class="cpp">#include "stm32f10x.h"

int main(void)
{
  // Настраиваем ножку PC8 в режим выхода на светодиод на плате
  GPIO_InitTypeDef GPIO_InitStructure;
  RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOC, ENABLE);
  GPIO_InitStructure.GPIO_Pin = GPIO_Pin_8;
  GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;
  GPIO_InitStructure.GPIO_Speed = GPIO_Speed_2MHz;
  GPIO_Init(GPIOC, &GPIO_InitStructure);

  // Включаем модули USART1 и GPIOA, а также включаем альтернативные функции выходов
  RCC-&gt;APB2ENR|= RCC_APB2ENR_USART1EN | RCC_APB2ENR_IOPAEN | RCC_APB2ENR_AFIOEN;
  // Контакт PA9 будет выходом с альтернативной функцией, а контакт PA10 - входом
  GPIOA-&gt;CRH &= !GPIO_CRH_CNF9;
  GPIOA-&gt;CRH  |= GPIO_CRH_CNF9_1 | GPIO_CRH_MODE9_0 | GPIO_CRH_CNF10_0;
  // Настраиваем регистр тактирования, скорость составит 9600 бод (при тактовой частоте 24 МГц)
  USART1-&gt;BRR = 0x9C4;
  // Выключаем TxD и RxD USART
  USART1-&gt;CR1 |= USART_CR1_TE | USART_CR1_RE;
  // Запускаем модуль USART
  USART1-&gt;CR1 |= USART_CR1_UE;
  // Разрешаем прерывание по приёму информации с RxD
  USART1-&gt;CR1 |= USART_CR1_RXNEIE;
  // Назначаем обработчик для всех прерываний от USART1
  NVIC_EnableIRQ(USART1_IRQn);
  USART1_Send_String("Start\r\n");
  // Бесконечный цикл
  while(1);
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

// Обработчик всех прерываний от USART1
void USART1_IRQHandler(void) {
  // Выясняем, какое именно событие вызвало прерывание. Если это приём байта в RxD - обрабатываем.
  if (USART1-&gt;SR & USART_SR_RXNE) {
    // Сбрасываем флаг прерывания
    USART1-&gt;SR&=~USART_SR_RXNE; 

    // Получаем принятый байт
    if(USART1-&gt;DR=='1') {
      GPIO_SetBits(GPIOC, GPIO_Pin_9);
      // Отправляем обратно строку "On" с переводом строки
      USART1_Send_String("On\r\n");      
    }

    if(USART1-&gt;DR=='2') {
      GPIO_ResetBits(GPIOC, GPIO_Pin_9);
      USART1_Send_String("Off\r\n");
    }

  }
}</code></pre>

Аналогично &#8212; для USART2 и 3.

<img class="alignnone" src="http://static.catethysis.ru/files/STM32VLDiscovery_USART.jpg" alt="Подключение платы STM32VLDiscovery к компьютеру через USART" />

В случае, если все стандартные контакты USART уже заняты, можно перенаправить их на другие &#8212; это называется ремаппинг. USART1 в таком случае переходит на PB6/TxD + PB7/RxD, а USART3 &#8212; на PC10/TxD + PC11/RxD. USART2 нельзя ремапнуть на другие пины.

Код изменяется совсем немного: всё, что нужно сделать &#8212; это добавить строку AFIO->MAPR |= AFIO\_MAPR\_USART1_REMAP; и конечно переписать код включения портов ввода-вывода на новые пины:

<pre><code class="cpp">RCC-&gt;APB2ENR|= RCC_APB2ENR_USART1EN | RCC_APB2ENR_IOPBEN | RCC_APB2ENR_AFIOEN;
AFIO-&gt;MAPR  |= AFIO_MAPR_USART1_REMAP;
GPIOB-&gt;CRL  |= GPIO_CRL_CNF6_1 | GPIO_CRL_MODE6_0 | GPIO_CRL_CNF7_0;</code></pre>

Можно скачать готовый проект (для IAR) с этим примером &#8212; <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://static.catethysis.ru/files/USART_Example.zip" >USART_Example.zip</a>.

Теперь можно совместить USART и таймеры, и сделать [сервомотор, управляемый с компьютера](http://catethysis.ru/index.php/stm32-%d1%83%d0%bf%d1%80%d0%b0%d0%b2%d0%bb%d0%b5%d0%bd%d0%b8%d0%b5-%d1%81%d0%b5%d1%80%d0%b2%d0%be%d0%bc%d0%be%d1%82%d0%be%d1%80%d0%be%d0%bc-%d1%81-%d0%ba%d0%be%d0%bc%d0%bf%d1%8c%d1%8e%d1%82%d0%b5/ "STM32: управление сервомотором с компьютера").
  
Многие сетевые девайсы имеют консоль, доступную по COM-порту &#8212; в [статье про UART консоль](http://catethysis.ru/stm32-uart-console/ "STM32: Консоль на UART") я рассказываю как сделать так же.