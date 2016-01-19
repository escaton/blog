---
id: 788
title: API Instagram
date: 2013-12-12T10:34:35+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=788
permalink: /api-instagram/
notely:
  - 
  - 
  - 
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
  - 2727872228
categories:
  - JavaScript
tags:
  - javascript
---
Сначала &#8212; общие слова об API инстаграма.

API построено по принципу RESTful, т.е. ответы на запросы в формате JSON. Есть ограничение на темп запросов &#8212; не выше 5 тысяч запросов в час, таким образом один запрос в секунду будет гарантированно допустимым пределом.

Каждый ответ состоит из полей meta (общая информация о статусе запроса), data (запрошенные данные) и, если все данные не влезли в одну страницу, pagination с адресом следующей страницы данных.

<!--more-->

Практически во всех запросах можно регулировать количество полей данных с помощью параметра count.

Перед выполнением запросов нужно настроить привилегии доступа.

## Пользователи

**GET** https://api.instagram.com/v1**/users/_user-id_/** &#8212; информация о пользователе
  
**GET** https://api.instagram.com/v1**/users/self/feed/** &#8212; лента пользователя
  
**GET** https://api.instagram.com/v1**/users/_user-id_/media/recent/** &#8212; свежие фотографии пользователя
  
**GET** https://api.instagram.com/v1**/users/self/media/liked/** &#8212; фотографии, которые лайкнул юзер
  
**GET** https://api.instagram.com/v1**/users/search/?q=_name_** &#8212; поиск пользователя по нику

## Связи

**GET** https://api.instagram.com/v1**/users/_user-id_/follows/** &#8212; список фолловеров юзера
  
**GET** https://api.instagram.com/v1**/users/_user-id_/followed-by/** &#8212; список подписчиков на юзера
  
**GET** https://api.instagram.com/v1**/users/self/requested-by/** &#8212; список желающих фолловить юзера
  
**GET** https://api.instagram.com/v1**/users/_user-id_/relationship/** &#8212; информация о взаимоотношениях с пользователем user-id
  
**POST** https://api.instagram.com/v1**/users/_user-id_/**relationship/**** &#8212; изменить взаимоотношения с пользователем user-id

## Фотографии

**GET** https://api.instagram.com/v1**/media/_media-id_/** &#8212; информация о фотографии
  
**GET** https://api.instagram.com/v1**/media/search/** &#8212; поиск фотографий, сделанных недалеко от определённого места
  
**GET** https://api.instagram.com/v1**/media/popular/** &#8212; поиск популярных фотографий

## Комментарии

**GET** https://api.instagram.com/v1**/media/_media-id_/comments/** &#8212; список комментариев к фотографии
  
**POST **https://api.instagram.com/v1**/media/_media-id_/comments/** &#8212; послать комментарий к фотографии. Доступно только по запросу.
  
**DEL **https://api.instagram.com/v1**/media/_media-id_/comments/comment-id**/ &#8212; удалить свой комментарий к фотографии.

## Лайки

**GET** https://api.instagram.com/v1**/media/_media-id_/likes/ **- список лайков к фотографии
  
**POST **https://api.instagram.com/v1**/media/_media-id_/likes/ **- лайкнуть фотографию
  
**DEL **https://api.instagram.com/v1**/media/_media-id_/likes/ **- удалить свой лайк к фотографии

## Теги

**GET** https://api.instagram.com/v1**/tags/_tag-name_/ **- информация о теге
  
**GET** https://api.instagram.com/v1**/tags/**_tag-name_/**media/recent/ **- список последниx фотографий с тегом
  
**GET** https://api.instagram.com/v1**/tags/search/**?q=_name_** **- поиск тегов

## Места

**GET** https://api.instagram.com/v1**/locations/_location-id_/ **- информация о месте
  
**GET** https://api.instagram.com/v1**/**locations/_location-id_****/**media/recent/ **- список последниx фотографий с места
  
**GET** https://api.instagram.com/v1**/**locations**/search/**?q=_name_** **- поиск мест по координатам или по id форсквера.

## География

**GET** https://api.instagram.com/v1**/geographies/{geo-id}/media/recent/ **- список последних фотографий с точки с определёнными координатами.