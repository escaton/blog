---
id: 2368
title: Бот для telegram на node.js
date: 2015-07-19T14:27:17+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2368
permalink: /node-js-telegram-bot/
ratings_users:
  - 2
ratings_score:
  - 10
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 3949016660
categories:
  - Node.js
---
В мессенджере Telegram появилась возможность создать бота &#8212; с его помощью вы можете отвечать на сообщения в телеграме, рассылать уведомления, добавлять к сообщениям картинки и так далее.

Пользователи node.js уже подготовили npm-пакет, с которым всё становится ещё проще.

Сначала создаём бота. Стучимся к @botfather, говорим ему /newbot, пишем имя бота и его юзернейм (он должен заканчиваться на _bot).

Теперь у вас есть бот, и @botfather сообщает ссылку для поиска бота и его http-токен. Токен понадобится нам дальше как ключ для API. В своём телеграм-аккаунте вы можете найти своего бота и добавиться к нему в друзья.

<!--more-->

Теперь к программированию. Установите npm-пакет:

<pre>npm install node-telegram-bot-api</pre>

Создайте скрипт:

<pre><code class="js">var TelegramBot = require('node-telegram-bot-api');
var token = 'токен_вашего_бота';
var bot = new TelegramBot(token, {polling: true});

bot.on('message', function (msg) {
    var chatId = msg.chat.id;
    console.log(msg);
    bot.sendMessage(chatId, "Hello!", {caption: "I'm a bot!"});
});</code></pre>

Сохраните его под именем app.js, и запустите его в node.js:

<pre>node app</pre>

Всё, бот работает. Напишите что-нибудь ему в телеграме, он ответит &#171;Hello!&#187;.

[<img class="alignnone size-full wp-image-2370" src="http://catethysis.ru/wp-content/uploads/2015/07/Снимок-экрана-2015-07-19-в-13.26.26.png" alt="Снимок экрана 2015-07-19 в 13.26.26" width="1824" height="1468" />](http://catethysis.ru/wp-content/uploads/2015/07/Снимок-экрана-2015-07-19-в-13.26.26.png)

Пару слов об API. Во-первых, есть два варианта запуска бота: polling и WebHook. В режиме WebHook сервер телеграма будет дёргать вашего бота каждый раз при поступлении запроса. К сожалению, этот режим требует https-подключения и валидного (не self-signed) сертификата https. У меня такого нет.

В режиме polling бот будет сам раз в секунду ходить на сервер телеграма и забирать новые данные. Этот режим таких ограничений нет, поэтому он гораздо проще для начала экспериментов &#8212; единственное, реакция будет не мгновенной, а в среднем с пол-секундной задержкой. Надеюсь, это не будет проблемой.

Давайте попробуем сделать что-то более интересное: пускай бот после получения запроса &#171;photo&#187; снимает фотографию камерой макбука и отправляет её. Для съёмки нам потребуется модуль imagesnap.js.

<pre><code class="js">var TelegramBot = require('node-telegram-bot-api');
var imagesnapjs = require('imagesnapjs'), fs = require('fs');

var token = 'токен_вашего_бота';
var filename = '/Users/catethysis/telegram/webcam.jpg';

var bot = new TelegramBot(token, {polling: true});

bot.on('message', function (msg) {
    var chatId = msg.chat.id;
    console.log(msg);
    if(msg.text == 'photo')
        fs.exists(filename, function (exists) {
            if(exists)
                fs.unlinkSync(filename);
            imagesnapjs.capture(filename, { cliflags: '-w 2'}, function(err) {
                console.log(err ? err : 'Success!');
                bot.sendPhoto(chatId, filename, {caption: "It's your photo!"});
            });
    });
});</code></pre>

[<img class="alignnone size-full wp-image-2369" src="http://catethysis.ru/wp-content/uploads/2015/07/Снимок-экрана-2015-07-19-в-13.25.03.png" alt="Снимок экрана 2015-07-19 в 13.25.03" width="1824" height="1468" />](http://catethysis.ru/wp-content/uploads/2015/07/Снимок-экрана-2015-07-19-в-13.25.03.png)