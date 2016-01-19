---
id: 67
title: Сломался список пакетов apt (решено)
date: 2013-09-03T06:23:00+00:00
author: catethysis
layout: post
guid: http://192.168.1.10/wordpress/?p=67
permalink: /apt-repair/
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
  - 2730634304
categories:
  - Linux
tags:
  - apt
  - глюк
---
При попытке удаления пакета вылезло сообщение &#171;Списки пакетов или файл состояния не могут быть открыты или прочитаны.&#187;.

****Проблема**:** любое действие с apt (install, remove, update) вызывает появление сообщения:

<pre>user@server:/$ sudo apt-get update
Чтение списков пакетов… Ошибка!
E: Ошибка чтения - read (5: Input/output error)
E: Problem opening /var/lib/apt/lists/ru.archive.ubuntu.com_ubuntu_dists_raring-updates_main_binary-amd64_Packages
E: Списки пакетов или файл состояния не могут быть открыты или прочитаны.</pre>

**Решение:** удаляем все загруженные пакеты и обновляем базу пакетов:

<pre>sudo rm /var/lib/apt/lists/* -f
sudo apt-get update</pre>