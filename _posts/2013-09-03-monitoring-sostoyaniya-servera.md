---
id: 28
title: Мониторинг состояния сервера
date: 2013-09-03T00:08:52+00:00
author: catethysis
layout: post
guid: http://192.168.1.10/wordpress/?p=28
permalink: /monitoring-sostoyaniya-servera/
notely:
  - Уникальность текста 83% / 100%. Удовлетворительная уникальность текста.
  - Уникальность текста 83% / 100%. Удовлетворительная уникальность текста.
  - Уникальность текста 83% / 100%. Удовлетворительная уникальность текста.
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
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 2732406312
categories:
  - Сервер
tags:
  - linux
  - сервер
---
Поскольку мы взяли курс на максимальную тишину и экономичность сервера, встаёт вопрос о контроле температуры и прочих параметров.

В первую очередь, нужно следить за температурой процессора и жёсткого диска. Получить информацию о процессоре нам поможет утилита sensors (sudo apt-get install lm-sensors && sudo sensors-detect && sensors). Для жёсткого диска используем hddtemp (sudo apt-get install hddtemp && hddtemp).

Я подготовил простенький скрипт, который даст возможность удобно получать эту информацию:

<pre>sensors | sed -n '3,1p' | awk '{print "Процессор - " $3}' &gt; temp.data
sudo hddtemp /dev/sda | awk '{print "Винчестер - " $4}' &gt;&gt; temp.data</pre>

Его можно записать в cron, и иметь возможность постоянно следить за показаниями:

sudo crontab -e
  
в конце добавить \*/1 \* \* \* * /путь к скрипту/gettemp