---
id: 1833
title: Github и библиотеки для STM32
date: 2014-07-03T10:34:20+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=1833
permalink: /github-stm32-libraries/
wp_noextrenallinks_mask_links:
  - 0
ratings_users:
  - 0
ratings_score:
  - 0
ratings_average:
  - 0
dsq_thread_id:
  - 2814086487
categories:
  - Без рубрики
tags:
  - STM32
---
Начну с цитаты с хабрахабра: &#171;Для хранения вещей, похожих на код, удобно использовать гитхаб&#187;. Я использую гитхаб около полутора лет, но до сегодняшнего дня там было не очень интересно. Однако теперь редкая моя статья обходится без кода, и с каждой статьёй он всё больше и больше &#8212; да и на самом деле, крайне неудобно писать код в админке вордпресса: после каждого сохранения страницы код проходит через довольно кривой парсер, который может внезапно съесть все переводы строк, или распознать знак &#171;больше&#187; как закрывающий тег &#8212; в итоге, после каждого редактирования таких статей приходилось ещё по два-три раза пересохранять статью, чтобы пройти через парсер без потерь.

С другой стороны, я продолжу публиковать небольшие куски кода непосредственно в статьях, потому что так легче читать &#8212; всё перед глазами. Но большие фрагменты кода, особенно библиотеки, я буду публиковать на гитхабе и давать ссылку.

## Цель

Последнее время я думал о создании простых библиотек для STM32, упрощающих некоторые муторные вещи. Первой такой библиотекой стала [itacone](http://catethysis.ru/stm32-itacone-library/ "Библиотека для STM32 — itacone"), но её разработка пока что застряла &#8212; я не придумал красивую архитектуру, чтобы библиотека не выглядела как спагетти-код.

Два дня назад я начал коммиты в репозиторий <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/https://github.com/Catethysis/stm32_i2c" >stm32-i2c,</a> который предоставляет библиотеку функций для модуля I2C, встроенного в STM32. Сейчас там находятся функции инициализации I2C, а также приёма и передачи одного и нескольких бит. Я провожу эксперименты с RFID-ридером RC522, результатом которых станет статья и коммит в репозиторий с функцией получения ID смарт-карты.

Думаю, в будущем я волью все эти будущие библиотеки в [itacone](http://catethysis.ru/stm32-itacone-library/ "Библиотека для STM32 — itacone"), который станет вместилищем всех полезных штуковин для STM32. В Itacone пока лежат простые функции работы с GPIO и получения UniqueID.