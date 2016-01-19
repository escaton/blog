---
id: 1328
title: Мини-сервер на Ubuntu
date: 2013-09-02T21:09:02+00:00
author: catethysis
layout: post
guid: http://192.168.1.10/wordpress/?p=4
permalink: /mini-server-na-ubuntu/
notely:
  - Уникальность текста 89% / 100%. Удовлетворительная уникальность текста.
  - Уникальность текста 89% / 100%. Удовлетворительная уникальность текста.
  - Уникальность текста 89% / 100%. Удовлетворительная уникальность текста.
wp_noextrenallinks_mask_links:
  - 0
  - 0
  - 0
ratings_users:
  - 2
  - 2
  - 2
ratings_score:
  - 10
  - 10
  - 10
ratings_average:
  - 5
  - 5
  - 5
dsq_thread_id:
  - 2729690756
categories:
  - Сервер
tags:
  - linux
  - сервер
---
Начинаю цикл постов про создание сервера на Убунту. Чем он отличается от сотен таких же? Да ничем, наверное. Тем не менее, возможно вы прочитаете здесь что-то полезное для вас.

Была сделана попытка сделать его как можно дешевле: многие компоненты найдены просто в шкафу. Материнская плата &#8212; Intel D945GCLF2, имеет на борту процессор Atom 330 (два ядра с гипертредингом); 4 виртуальных слабеньких ядра &#8212; вполне достаточно для начала.

### Список задач, которые будет выполнять сервер:

  * Файлохранилище (фильмы, музыка, фотографии, рабочие файлы и т.д.), с шифрованным доступом снаружи;
  * Хостинг пары сайтов (этот блог и <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://novokosino.tk" >novokosino.tk</a>);
  * Мозг умного дома;
  * Джаббер-сервер;
  * Медиасервер (под этим я понимаю mpd и подобные штуки);
  * Учёт и маршрутизация трафика + балансирование/резервирование по нескольким интернет-подключениям;
  * Почтовый сервер;
  * VPN-сервер;
  * Tor/I2P-прокси.

Вообще, в итоге хотелось бы провести эксперимент сетевой независимости &#8212; воплотить все сервисы, которыми я пользуюсь у гугла (кроме поиска, конечно), дропбокса и прочих на своём сервере.

### Начинка сервера

Материнская плата &#8212; Intel D945GCLF2
  
Процессор &#8212; Intel Atom 330
  
Память &#8212; 2ГБ DDR2-800.
  
Жёсткий диск &#8212; Samsung HD204UI

Материнская плата имеет 1 гигабитный сетевой порт на микросхеме RTL8111.

Жёсткий диск разбит на три раздела &#8212; /, swap и /home:

<pre>user@server:/$ mount | grep sda
/dev/sda1 on / type ext2 (rw,errors=remount-ro)
/dev/sda6 on /home type reiserfs (rw)

user@server:~$ df -h | grep sda
Filesystem Size Used Avail Use% Mounted on
/dev/sda1   19G 2,0G   16G  12% /
/dev/sda6  1,8T 738G  1,1T  41% /home

user@server:~$ swapon -s
Filename       Type Size Used Priority
/dev/sda5 partition 4,7G    0       -1</pre>