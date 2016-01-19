---
id: 2432
title: RFID-ридер с экранчиком на STM32
date: 2015-07-26T10:23:17+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2432
permalink: /stm32_rfid_lcd_reader/
wp_noextrenallinks_mask_links:
  - 0
ratings_users:
  - 1
ratings_score:
  - 5
ratings_average:
  - 5
dsq_thread_id:
  - 3970470139
categories:
  - STM32
  - Без рубрики
  - Готовые девайсы
---
Мы уже умеем использовать [знакосинтезирующий ЖК-экран WH1602](http://catethysis.ru/stm32_wh1602/ "STM32 и ЖК-экран WH1602") и [RFID-ридер SL-030](http://catethysis.ru/stm32_rfid_reader/ "STM32: RFID-ридер"). Настало время соединить их вместе, и сделать простую и полезную штуку — ридер RFID-карт с экранчиком.
  
У ридера есть специальный выход OUT, на котором появляется ноль всякий раз, когда он обнаруживает карту. Сразу после этого можно послать ему запрос на чтение номера — сделаем это в EXTI прерывании.

[<img class="alignnone size-full wp-image-2435" src="http://catethysis.ru/wp-content/uploads/2015/07/wh1602-rfid.jpg" alt="wh1602-rfid" width="1430" height="886" />](http://catethysis.ru/wp-content/uploads/2015/07/wh1602-rfid.jpg)

В остальном код очень прост и по сути является суммой тех двух примеров.

<!--more-->

<pre><code class="cpp">#include "stm32f4xx.h"
#include "stm32f4xx_gpio.h"
#include "stm32f4xx_rcc.h"
#include "stm32f4xx_i2c.h"
#include 
#include 
#include "stdio.h"

#define  LCM_OUT_SET    GPIOA-&gt;BSRRL
#define  LCM_OUT_RST    GPIOA-&gt;BSRRH
#define  LCM_PIN_RS     GPIO_Pin_0
#define  LCM_PIN_EN     GPIO_Pin_1
#define  LCM_PIN_D4     GPIO_Pin_4
#define  LCM_PIN_D5     GPIO_Pin_5
#define  LCM_PIN_D6     GPIO_Pin_6
#define  LCM_PIN_D7     GPIO_Pin_7
#define  LCM_PIN_MASK  ((LCM_PIN_RS | LCM_PIN_EN | LCM_PIN_D7 | LCM_PIN_D6 | LCM_PIN_D5 | LCM_PIN_D4))

void delay(__IO uint32_t nCount)
{
    volatile uint32_t del = nCount * 1000;
    while(del--);
}

void PulseLCD()
{
    LCM_OUT_SET = LCM_PIN_EN; delay(20);
    LCM_OUT_RST = LCM_PIN_EN; delay(20);
}

void SendByte(char byte, int IsData)
{
    LCM_OUT_RST = LCM_PIN_MASK;
    LCM_OUT_SET = byte & 0xF0;
 
    if (IsData) LCM_OUT_SET = LCM_PIN_RS;
    else        LCM_OUT_RST = LCM_PIN_RS;
    
    PulseLCD();
    LCM_OUT_RST = LCM_PIN_MASK;
    LCM_OUT_SET = (byte & 0x0F) &lt;&lt; 4;
 
    if (IsData) LCM_OUT_SET = LCM_PIN_RS;
    else        LCM_OUT_RST = LCM_PIN_RS;
 
    PulseLCD();
}

void SendCmd(char cmd)
{
    SendByte(cmd, 0);
}

void SendChar(char chr)
{
    SendByte(chr, 1);
}

void LCD_setPos(char Row, char Col)
{
    SendCmd(0x80 | ( (Row % 2) ? 0x40 : 0 ) | Col + (Row &gt; 1) * 20);
}

void LCD_clear()
{
    SendCmd(0x01);
    SendCmd(0x02);
}

void LCD_hide()
{
    SendCmd(0x08);
}

void LCD_show()
{
    SendCmd(0x0C);
}

void LCD_init(void)
{
    RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOA, ENABLE);

    GPIO_InitTypeDef GPIO_InitStructure;
    GPIO_InitStructure.GPIO_Pin = LCM_PIN_MASK;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_OUT;
    GPIO_InitStructure.GPIO_OType = GPIO_OType_PP;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_InitStructure.GPIO_PuPd = GPIO_PuPd_NOPULL;
    GPIO_Init(GPIOA, &GPIO_InitStructure);
    
    LCM_OUT_SET = LCM_PIN_MASK;
    delay(50);
    LCM_OUT_SET = LCM_PIN_D5;
    PulseLCD();
    SendCmd(0x28);
    LCD_hide();
    SendCmd(0x06);
}

void LCD_printStr(char *text)
{
    while (*text != 0) SendChar(*text++);
}

void I2C_init(I2C_TypeDef* I2Cx, uint32_t speed)
{
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_I2C1, ENABLE);
    RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOB, ENABLE);

    GPIO_InitTypeDef GPIO_InitStructure;
    I2C_InitTypeDef I2C_InitStructure;
 
    I2C_InitStructure.I2C_ClockSpeed = 100000; 
    I2C_InitStructure.I2C_Mode = I2C_Mode_I2C;
    I2C_InitStructure.I2C_DutyCycle = I2C_DutyCycle_2;
    I2C_InitStructure.I2C_OwnAddress1 = 0x00;
    I2C_InitStructure.I2C_Ack = I2C_Ack_Disable;
    I2C_InitStructure.I2C_AcknowledgedAddress = I2C_AcknowledgedAddress_7bit;
    I2C_Init(I2C1, &I2C_InitStructure);

    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_6 | GPIO_Pin_7;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF;            
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_InitStructure.GPIO_OType = GPIO_OType_OD;
    GPIO_InitStructure.GPIO_PuPd = GPIO_PuPd_UP;
    GPIO_Init(GPIOB, &GPIO_InitStructure);
 
    GPIO_PinAFConfig(GPIOB, GPIO_PinSource6, GPIO_AF_I2C1);
    GPIO_PinAFConfig(GPIOB, GPIO_PinSource7, GPIO_AF_I2C1);

    I2C_Cmd(I2C1, ENABLE);
}

void delay1()
{
    for(volatile uint32_t del = 0; del&lt;250000; del++);
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

void EXTI1_IRQHandler(void)
{
    if(EXTI-&gt;PR & (1 &lt;&lt; 1))
    {
        EXTI-&gt;PR = (1 &lt;&lt; 1);
        
        I2C_init(I2C1, 100000);
        delay1();
        uint8_t rfid_command[2] = {0x01, 0x01}, rfid_reply[11] = { 0 };
        I2C_RFID_burst_write(I2C1, 0xA0, 2, rfid_command);
        delay1();
        I2C_RFID_burst_read(I2C1, 0xA0, 11, rfid_reply);
        
        char s[30];
        LCD_setPos(2, 0);
        sprintf(s, "%02X %02X %02X %02X %02X %02X %02X", rfid_reply[9], rfid_reply[8], rfid_reply[7], rfid_reply[6], rfid_reply[5], rfid_reply[4], rfid_reply[3]);
        LCD_printStr(s);
        LCD_show();
    }
}

void EXTI_init(void)
{
    RCC-&gt;APB2ENR |= 0x00004000;
    NVIC_EnableIRQ(EXTI1_IRQn);
    NVIC_SetPriority(EXTI1_IRQn, 15);
    SYSCFG-&gt;EXTICR[0] = SYSCFG_EXTICR1_EXTI1_PB;
    EXTI-&gt;FTSR = 0x00000002;
    EXTI-&gt;IMR = 0x00000002;
}

int main(void)
{
    EXTI_init();
    
    LCD_init();
    LCD_clear();
    LCD_hide();
    LCD_setPos(0, 0);
    LCD_printStr("Insert RFID card...");
    LCD_show();
    
    while(1);
}</code></pre>