---
id: 1781
title: Цифровой барометр BMP180
date: 2014-06-28T23:46:00+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=1781
permalink: /bmp180-digital-barometer-stm32/
ratings_users:
  - 6
ratings_score:
  - 30
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 2802858761
categories:
  - Без рубрики
tags:
  - i2c
  - STM32
  - датчики
  - электроника
---
[<img class="alignnone size-full wp-image-1979" src="http://catethysis.ru/wp-content/uploads/2014/06/bmp180.png" alt="bmp180" width="398" height="300" />](http://catethysis.ru/wp-content/uploads/2014/06/bmp180.png)

Барометр BMP180 производит компания Bosch, и это значит что на него можно положиться! BMP180 &#8212; измеритель абсолютного давления, построенный по пьезорезистивной схеме, он имеет низкий шум и высокую линейность, а также высокую скорость установки показаний. Он является преемником более старого барометра BMP085, и обеспечивает более высокую точность.

На его кристалле расположен MEMS-датчик в виде гибкой кремниевой мембраны, закрывающей камеру со стандартным давлением. На мембране расположены тензодатчики, которые включены по схеме моста, и изменяют своё сопротивление при изгибе мембраны. Таким образом, изгиб мембраны зависит от разности между окружающим давлением и давлением в камере, и выходной сигнал с тензомоста зависит от давления.

Параметры мембраны и резисторов зависят от температуры, поэтому на кристалле расположен цифровой термометр, показания которого можно использовать как для компенсации данных барометра, так и сами по себе. Не используйте для компенсации данных барометра температуру от других термометров! Термометр в BMP180 расположен на самом измерительном кристалле, он измеряет температуру чувствительного элемента &#8212; поэтому его показания наиболее близки к температуре барометра и точны.

Поскольку барометр &#8212; точное микроэлектромеханическое устройство, всевозможные погрешности при изготовлении влияют на его показания. Поэтому каждый экземпляр барометра калибруется на заводе, и во внутреннюю EEPROM-память записываются 11 калибровочных коэффициентов.

Выходной интерфейс барометра BMP180 &#8212; I2C, что делает работу с ним простой и удобной.

<!--more-->

## Алгоритм получения данных

**Калибровочные коэффициенты. **Первое, что нужно сделать &#8212; запросить все 11 калибровочных коэффициентов. Каждый из них имеет размер 2 байта, они находятся в памяти начиная с адреса 0xAA.
  
**Измерение температуры.** Теперь нужно измерить температуру, для старта измерения &#8212; запишем 0x2E в регистр 0xF4, и подождём 4.5 миллисекунд. После этого можно считать показания в виде 2-байтового слова, начиная с регистра 0xF6.
  
**Измерение давления. **Записываем 0x34 в регистр 0xF4, точно так же ждём 4.5 миллисекунд и считываем два байта, начиная с 0xF6.
  
**Компенсация температуры.** Мы считали &#171;сырые&#187; данные, которые требуют дальнейших преобразований. Для температуры преобразование несложное, всего 9 действий.

<img class="alignnone size-large wp-image-1783" src="http://catethysis.ru/wp-content/uploads/2014/06/temp_compensation.png" alt="temp_compensation" width="187" height="88" />

В результате получается целое число &#8212; десятые доли градуса.

Для давления преобразование гораздо более сложное, впрочем я немного упростил его.

<img class="alignnone size-full wp-image-1782" src="http://catethysis.ru/wp-content/uploads/2014/06/pressure_compensation.png" alt="pressure_compensation" width="317" height="359" />

Самое главное &#8212; все вычисления ведутся в целых числах, а значит быстро и без потери точности.

## Программа

<pre><code class="cpp">#include "stm32f10x_conf.h"

void I2C_init(void)
{
	RCC_APB1PeriphClockCmd(RCC_APB1Periph_I2C1, ENABLE);
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOB | RCC_APB2Periph_AFIO , ENABLE);

	GPIO_InitTypeDef  GPIO_InitStructure;
	GPIO_InitStructure.GPIO_Pin =  GPIO_Pin_6 | GPIO_Pin_7;
	GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_OD;
	GPIO_Init(GPIOB, &GPIO_InitStructure);

	I2C_InitTypeDef  I2C_InitStructure;
	I2C_InitStructure.I2C_Mode = I2C_Mode_I2C;
	I2C_InitStructure.I2C_DutyCycle = I2C_DutyCycle_16_9;
	I2C_InitStructure.I2C_OwnAddress1 = 1;
	I2C_InitStructure.I2C_Ack = I2C_Ack_Enable;
	I2C_InitStructure.I2C_AcknowledgedAddress = I2C_AcknowledgedAddress_7bit;
	I2C_InitStructure.I2C_ClockSpeed = 100000;

	I2C_Cmd(I2C1, ENABLE);
	I2C_Init(I2C1, &I2C_InitStructure);
	I2C_AcknowledgeConfig(I2C1, ENABLE);
}

void I2C_write(uint8_t data, uint8_t address)
{
	I2C_GenerateSTART(I2C1, ENABLE);
	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_MODE_SELECT));
	I2C_Send7bitAddress(I2C1, 0xEF, I2C_Direction_Transmitter);
	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_TRANSMITTER_MODE_SELECTED));
	I2C_SendData(I2C1, address);
	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_BYTE_TRANSMITTED));
	I2C_SendData(I2C1, data);
	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_BYTE_TRANSMITTED));
	I2C_GenerateSTOP(I2C1, ENABLE);
}

uint8_t I2C_read(uint8_t address)
{
	uint8_t data;
	while(I2C_GetFlagStatus(I2C1, I2C_FLAG_BUSY));
	I2C_GenerateSTART(I2C1, ENABLE);
	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_MODE_SELECT));
	I2C_Send7bitAddress(I2C1, 0xEF, I2C_Direction_Transmitter);
	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_TRANSMITTER_MODE_SELECTED));
	I2C_SendData(I2C1, address);
	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_BYTE_TRANSMITTED));
	I2C_GenerateSTART(I2C1, ENABLE);
	while(!I2C_CheckEvent(I2C1, I2C_EVENT_MASTER_MODE_SELECT));
	I2C_Send7bitAddress(I2C1, 0xEF, I2C_Direction_Receiver);
	while(!I2C_CheckEvent(I2C1,I2C_EVENT_MASTER_BYTE_RECEIVED));
	data = I2C_ReceiveData(I2C1);
	I2C_AcknowledgeConfig(I2C1, DISABLE);
	I2C_GenerateSTOP(I2C1, ENABLE);
	return data;
}

void main()
{
	I2C_init();
	
	//Read compensation registers
	 int16_t AC1 = 0, AC2 = 0, AC3 = 0; 
	uint16_t AC4 = 0, AC5 = 0, AC6 = 0;
	 int16_t B1 = 0, B2 = 0, MB = 0, MC = 0, MD = 0;
	AC1 = I2C_read(0xAA)*256 + I2C_read(0xAB);
	AC2 = I2C_read(0xAC)*256 + I2C_read(0xAD);
	AC3 = I2C_read(0xAE)*256 + I2C_read(0xAF);
	AC4 = I2C_read(0xB0)*256 + I2C_read(0xB1);
	AC5 = I2C_read(0xB2)*256 + I2C_read(0xB3);
	AC6 = I2C_read(0xB4)*256 + I2C_read(0xB5);
	 B1 = I2C_read(0xB6)*256 + I2C_read(0xB7);
	 B2 = I2C_read(0xB8)*256 + I2C_read(0xB9);
	 //MB = I2C_read(0xBA)*256 + I2C_read(0xBB);
	 MC = I2C_read(0xBC)*256 + I2C_read(0xBD);
	 MD = I2C_read(0xBE)*256 + I2C_read(0xBF);
	 
	//Start temperature measurement
	I2C_write(0x2E, 0xF4);
	//Wait to measurement
	for(volatile uint32_t del = 0; del&lt;10000; del++);
	//Read uncompensated temperature value
	uint32_t UT = I2C_read(0xF6)*256 + I2C_read(0xF7);
	
	//Start pressure measurement
	I2C_write(0x34, 0xF4);
	//Wait to measurement
	for(volatile uint32_t del = 0; del&lt;10000; del++);
	//Read uncompensated pressure value
	uint32_t UP = I2C_read(0xF6)*256 + I2C_read(0xF7);
	
	//temparature compensation
	int32_t X1 = (UT - AC6) * AC5 / 32768;
	int16_t X2 = MC * 2048 / (X1 + MD);
	int16_t B5 = X1 + X2;
	int16_t T = (B5 + 8) / 16;

	//pressure compensation
	int16_t B6 = B5 - 4000;
	int16_t B3 = ((AC1*4 + (B2*B6 / 4096 + AC2)*B6 / 2048) + 2) / 4;
	X1 = (AC3 + 2*B1*B6)*B6 / 8192 / 65536 + 2;
	uint16_t B4 = AC4*(unsigned long)(X1/4 + 32768) / 32768;
	uint32_t B7 = ((unsigned long)UP - B3) * 50000;
	int32_t P = (B7&lt;0x8000000 ? B7*2/B4 : B7/B4*2);
	P = P + ((3038*(P/256)*(P/256) - 7357*P) / 65536 + 3791) / 16;
	
	while(1);
}</code></pre>

Итоговые значения &#8212; в переменных T и P.