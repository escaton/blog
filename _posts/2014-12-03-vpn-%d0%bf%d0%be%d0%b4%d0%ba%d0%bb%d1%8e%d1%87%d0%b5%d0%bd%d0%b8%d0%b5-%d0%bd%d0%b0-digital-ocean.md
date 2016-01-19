---
id: 2125
title: VPN-подключение на Digital Ocean
date: 2014-12-03T18:52:01+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2125
permalink: /vpn-%d0%bf%d0%be%d0%b4%d0%ba%d0%bb%d1%8e%d1%87%d0%b5%d0%bd%d0%b8%d0%b5-%d0%bd%d0%b0-digital-ocean/
ratings_users:
  - 1
ratings_score:
  - 5
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 3286830148
categories:
  - Сервер
---
Пару месяцев назад я пытался установить VPN-сервер на свой сервер в Нидерландах, но потратив час, я так и не смог добиться успеха. Сегодня <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://habrahabr.ru/company/infopulse/blog/183628/" >наткнулся</a> на отличный скрипт, который делает всё это за три минуты.

<!--more-->

## Установка VPN-сервера

Создаёте скрипт:

<pre>sudoedit vpn.sh</pre>

Копируете туда:

<pre><span class="shebang">#!/bin/bash</span>
<span class="keyword">echo</span> <span class="string">"Select on option:"</span>
<span class="keyword">echo</span> <span class="string">"1) Set up new PoPToP server AND create one user"</span>
<span class="keyword">echo</span> <span class="string">"2) Create additional users"</span>
read x
<span class="keyword">if</span> test <span class="variable">$x</span> -eq 1; <span class="keyword">then</span>
    <span class="keyword">echo</span> <span class="string">"Enter username that you want to create (eg. client1 or john):"</span>
    read u
    <span class="keyword">echo</span> <span class="string">"Specify password that you want the server to use:"</span>
    read p
 
<span class="comment"># get the VPS IP</span>
ip=`ifconfig eth0 | grep <span class="string">'inet addr'</span> | awk {<span class="string">'print $2'</span>} | sed s/.*://`
 
<span class="keyword">echo</span>
<span class="keyword">echo</span> <span class="string">"Downloading and Installing PoPToP"</span>
apt-get update
apt-get install pptpd
 
<span class="keyword">echo</span>
<span class="keyword">echo</span> <span class="string">"Creating Server Config"</span>
cat &gt; /etc/ppp/pptpd-options &lt;&lt;END
name pptpd
refuse-pap
refuse-chap
refuse-mschap
require-mschap-v2
require-mppe-128
ms-dns 8.8.8.8
ms-dns 8.8.4.4
proxyarp
nodefaultroute
lock
nobsdcomp
END
 
<span class="comment"># setting up pptpd.conf</span>
<span class="keyword">echo</span> <span class="string">"option /etc/ppp/pptpd-options"</span> &gt; /etc/pptpd.conf
<span class="keyword">echo</span> <span class="string">"logwtmp"</span> &gt;&gt; /etc/pptpd.conf
<span class="keyword">echo</span> <span class="string">"localip <span class="variable">$ip</span>"</span> &gt;&gt; /etc/pptpd.conf
<span class="keyword">echo</span> <span class="string">"remoteip 10.1.0.1-100"</span> &gt;&gt; /etc/pptpd.conf
 
<span class="comment"># adding new user</span>
<span class="keyword">echo</span> <span class="string">"<span class="variable">$u</span> * <span class="variable">$p</span> *"</span> &gt;&gt; /etc/ppp/chap-secrets
 
<span class="keyword">echo</span>
<span class="keyword">echo</span> <span class="string">"Forwarding IPv4 and Enabling it on boot"</span>
cat &gt;&gt; /etc/sysctl.conf &lt;&lt;END
net.ipv4.ip_forward=1
END
sysctl -p
 
<span class="keyword">echo</span>
<span class="keyword">echo</span> <span class="string">"Updating IPtables Routing and Enabling it on boot"</span>
iptables -t nat -A POSTROUTING -j SNAT --to <span class="variable">$ip</span>
<span class="comment"># saves iptables routing rules and enables them on-boot</span>
iptables-save &gt; /etc/iptables.conf
 
cat &gt; /etc/network/<span class="keyword">if</span>-pre-up.d/iptables &lt;&lt;END
<span class="shebang">#!/bin/sh</span>
iptables-restore &lt; /etc/iptables.conf
END
 
chmod +x /etc/network/<span class="keyword">if</span>-pre-up.d/iptables
cat &gt;&gt; /etc/ppp/ip-up &lt;&lt;END
ifconfig ppp0 mtu 1400
END
 
<span class="keyword">echo</span>
<span class="keyword">echo</span> <span class="string">"Restarting PoPToP"</span>
/etc/init.d/pptpd restart
 
<span class="keyword">echo</span>
<span class="keyword">echo</span> <span class="string">"Server setup complete!"</span>
<span class="keyword">echo</span> <span class="string">"Connect to your VPS at <span class="variable">$ip</span> with these credentials:"</span>
<span class="keyword">echo</span> <span class="string">"Username:<span class="variable">$u</span> ##### Password: <span class="variable">$p</span>"</span>
 
<span class="comment"># runs this if option 2 is selected</span>
<span class="keyword">elif</span> test <span class="variable">$x</span> -eq 2; <span class="keyword">then</span>
    <span class="keyword">echo</span> <span class="string">"Enter username that you want to create (eg. client1 or john):"</span>
    read u
    <span class="keyword">echo</span> <span class="string">"Specify password that you want the server to use:"</span>
    read p
 
<span class="comment"># get the VPS IP</span>
ip=`ifconfig venet0:0 | grep <span class="string">'inet addr'</span> | awk {<span class="string">'print $2'</span>} | sed s/.*://`
 
<span class="comment"># adding new user</span>
<span class="keyword">echo</span> <span class="string">"<span class="variable">$u</span> * <span class="variable">$p</span> *"</span> &gt;&gt; /etc/ppp/chap-secrets
 
<span class="keyword">echo</span>
<span class="keyword">echo</span> <span class="string">"Addtional user added!"</span>
<span class="keyword">echo</span> <span class="string">"Connect to your VPS at <span class="variable">$ip</span> with these credentials:"</span>
<span class="keyword">echo</span> <span class="string">"Username:<span class="variable">$u</span> ##### Password: <span class="variable">$p</span>"</span>
 
<span class="keyword">else</span>
<span class="keyword">echo</span> <span class="string">"Invalid selection, quitting."</span>
<span class="keyword">exit</span>
<span class="keyword">fi</span></pre>

Делаете его исполняемым и запускаете:

<pre>sudo chmod +x vpn.sh
./vpn.sh</pre>

На первый вопрос отвечаете &#171;1&#187; (нам нужно установить сервер и создать первого юзера), указываете имя нового юзера и пароль, после скачивания и установки сервера он сообщит эти данные ещё раз, чтобы вы могли их записать.

## Подключение клиента

На всех моих рабочих и домашних компьютерах винда (кроме виртуалки с убунтой), поэтому расскажу как подключаться  в винде.

&#171;Центр управления сетями и общим доступом&#187; -> &#171;Создание и настройка нового подключения или сети&#187; -> &#171;Подключение к рабочему месту&#187; -> &#171;Использовать моё подключение к интернету&#187; -> В поле &#171;Адрес в интернете&#187; указываете IP сервера. После долгого процесса создания соединения подключаетесь к нему и вводите имя юзера и пароль.

Проверяете, зайдя к примеру на 2ip.ru &#8212; адрес должен смениться на адрес вашего сервера.