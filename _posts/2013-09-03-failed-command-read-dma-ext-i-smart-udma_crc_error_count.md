---
id: 35
title: 'failed command: READ DMA EXT и SMART / UDMA_CRC_Error_Count (решено)'
date: 2013-09-03T00:45:44+00:00
author: catethysis
layout: post
guid: http://192.168.1.10/wordpress/?p=35
permalink: /failed-command-read-dma-ext-i-smart-udma_crc_error_count/
notely:
  - Уникальность текста 81% / 67%. Удовлетворительная уникальность текста. Возможно, рерайт.
  - Уникальность текста 81% / 67%. Удовлетворительная уникальность текста. Возможно, рерайт.
  - Уникальность текста 81% / 67%. Удовлетворительная уникальность текста. Возможно, рерайт.
wp_noextrenallinks_mask_links:
  - 0
  - 0
  - 0
ratings_users:
  - 1
  - 1
  - 1
ratings_score:
  - 5
  - 5
  - 5
ratings_average:
  - 5
  - 5
  - 5
dsq_thread_id:
  - 2729915314
categories:
  - Linux
tags:
  - linux
  - глюк
---
После аварийного завершения работы (случайного отключения линии +12 вольт) в консоль стали постоянно (раз в секунду) сыпаться такие сообщения:

<pre>[ 2727.401739] ata3.00: configured for UDMA/33
[ 2727.404361] ata3: EH complete
[ 2728.630577] ata3.00: exception Emask 0x0 SAct 0x0 SErr 0x0 action 0x6
[ 2728.634722] ata3.00: BMDMA stat 0x26
[ 2728.638424] ata3.00: failed command: READ DMA EXT
[ 2728.642090] ata3.00: cmd 25/00:20:38:20:3d/00:00:3a:00:00/e0 tag 0 dma 16384 in
[ 2728.642090]          res 51/84:18:40:20:3d/84:00:3a:00:00/e0 Emask 0x30 (host bus error)
[ 2728.649486] ata3.00: status: { DRDY ERR }
[ 2728.653151] ata3.00: error: { ICRC ABRT }
[ 2728.656827] ata3: soft resetting link</pre>

Параметр UDMA\_CRC\_Error_Count (№199) в SMART постоянно растёт, обмен с диском крайне медленный. Это не значит, что винт умирает, вероятнее всего причина в  плохом кабеле; чемпионы по этим ошибкам &#8212; кабели AsLink. Если замена кабеля не дала эффект, попробуйте пару других кабелей &#8212; купите новый, или найдите заведомо исправный, или вообще проверьте диск на другом компьютере. Подчёркиваю, что скорее всего (по опыту людей с форумов) проблема именно в кабеле или контактах.

****Проблема**:** появление в консоли множества сообщений  failed command: READ DMA EXT и рост значения параметра SMART UDMA\_CRC\_Error_Count.

**Решение:** заменить кабель SATA.

<a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://forum.ixbt.com/topic.cgi?id=11:37977" >Источник</a>