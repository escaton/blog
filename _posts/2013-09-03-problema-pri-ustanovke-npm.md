---
id: 37
title: Проблема при установке npm (решено)
date: 2013-09-03T00:53:29+00:00
author: catethysis
layout: post
guid: http://192.168.1.10/wordpress/?p=37
permalink: /problema-pri-ustanovke-npm/
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
  - 2802329772
categories:
  - Node.js
tags:
  - apt
  - linux
  - node.js
  - глюк
  - сервер
---
Я установил nodejs из стандартного репозитория, при попытке установки на него npm оказалось, что версия nodejs слишком старая (0.8), и npm недоустановился. После удаления Nodejs пытался удалить npm, он отказался удаляться. Попытка установки его заново тоже не сработала.

****Проблема**:** sudo apt-get install npm перечисляет пакеты и пишет что они в состоянии held. Удаление npm даёт тот же результат.

**Решение:** sudo aptitude install npm.

Видимо, aptitude работает на более глубоком уровне, а apt-get &#8212; лишь оболочка над ним.