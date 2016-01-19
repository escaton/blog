---
id: 2206
title: Raspberry Pi 2 Model B
date: 2015-02-03T14:12:43+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2206
permalink: /raspberry-pi-2-model-b/
ratings_users:
  - 1
ratings_score:
  - 5
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 3480916322
categories:
  - Без рубрики
---
Raspberry Pi Foundation объявила о выпуске новой версии малинки, она получила название Raspberry Pi 2 Model B. Новая плата, по видимому, сохранит стоимость $35, но по оценке Ибена Аптона (главы фонда), она будет в 6 раз мощнее благодаря новому процессору Broadcom BCM2836. Он имеет четыре 900 МГц ядра ARMv7 Cortex-A7 и видеоядра Broadcom VideoCore IV 250 МГц. Теперь на плате будет распаян 1 гигабайт ОЗУ. Внешне она довольно мало отличается от старой Model B:

[<img class="alignnone size-large wp-image-2207" src="http://catethysis.ru/wp-content/uploads/2015/02/db08133a9565f73cc722c169e764b62a-1024x690.jpg" alt="db08133a9565f73cc722c169e764b62a" width="604" height="406" />](http://catethysis.ru/wp-content/uploads/2015/02/db08133a9565f73cc722c169e764b62a.jpg)

<!--more-->Старая версия Raspberry Pi B+, 

<a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://habrahabr.ru/company/medgadgets/blog/229749/" >источник</a>

Новая Pi 2 Model B очень похожа на неё:

[<img class="alignnone size-large wp-image-2209" src="http://catethysis.ru/wp-content/uploads/2015/02/raspberry-pi-2-model-b-7-1024x681.jpg" alt="raspberry-pi-2-model-b-7" width="604" height="401" />](http://catethysis.ru/wp-content/uploads/2015/02/raspberry-pi-2-model-b-7.jpg)
  
Новая версия Raspberry Pi 2 Model B, <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://www.cnet.com/pictures/unboxing-the-supercharged-35-raspberry-pi-2/6/" >источник</a>

Как видим, размеры платы и расположение всех элементов осталось прежним, так что старые корпуса (купленные или распечатанные на 3D-принтере) можно не выбрасывать, и приспособить для новой платы: она по-прежнему имеет размер банковской карты.

Однако, в глаза бросается разительное отличие: в первой версии был использован процессор BCM2835 в BGA PoP корпусе:

[<img class="alignnone size-large wp-image-2210" src="http://catethysis.ru/wp-content/uploads/2015/02/bga-pop-1024x610.jpg" alt="bga pop" width="604" height="359" />](http://catethysis.ru/wp-content/uploads/2015/02/bga-pop.jpg)
  
Чип BCM2835 в PoP-корпусе, <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://cmsc411.com/hardware" >источник</a>

Этот корпус позволял разместить чип RAM-памяти прямо на процессоре, что избавляло дизайнера платы от необходимости вести десятки высокоскоростных дифференциальных линий по плате от процессора к памяти, да ещё и с необходимостью уравнивать длину разных линий, рисуя дорожками &#171;змеек&#187;.

[<img class="alignnone size-full wp-image-2211" src="http://catethysis.ru/wp-content/uploads/2015/02/6y1d.png" alt="6y1d" width="868" height="776" />](http://catethysis.ru/wp-content/uploads/2015/02/6y1d.png)
  
Уравнивание длин дорожек, <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://www.eevblog.com/forum/altium/easy-way-to-generate-matched-length-traces/" >источник</a>

В итоге разработчики получали более простую плату, но одновременно с тем увеличение стоимости микросхем (PoP-версии процессора и памяти дороже обычных), и удорожание монтажа. Так или иначе, в новой версии платы они отказались от такого дизайна, использовав обычные BGA-чипы, и память теперь распаяна с нижней стороны платы недалеко от процессора:

[Raspberry Pi Foundation объявила о выпуске новой версии малинки, она получила название Raspberry Pi 2 Model B. Новая плата, по видимому, сохранит стоимость $35, но по оценке Ибена Аптона (главы фонда), она будет в 6 раз мощнее благодаря новому процессору Broadcom BCM2836. Он имеет четыре 900 МГц ядра ARMv7 Cortex-A7 и видеоядра Broadcom VideoCore IV 250 МГц. Теперь на плате будет распаян 1 гигабайт ОЗУ. Внешне она довольно мало отличается от старой Model B:

[<img class="alignnone size-large wp-image-2207" src="http://catethysis.ru/wp-content/uploads/2015/02/db08133a9565f73cc722c169e764b62a-1024x690.jpg" alt="db08133a9565f73cc722c169e764b62a" width="604" height="406" />](http://catethysis.ru/wp-content/uploads/2015/02/db08133a9565f73cc722c169e764b62a.jpg)

<!--more-->Старая версия Raspberry Pi B+, 

<a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://habrahabr.ru/company/medgadgets/blog/229749/" >источник</a>

Новая Pi 2 Model B очень похожа на неё:

[<img class="alignnone size-large wp-image-2209" src="http://catethysis.ru/wp-content/uploads/2015/02/raspberry-pi-2-model-b-7-1024x681.jpg" alt="raspberry-pi-2-model-b-7" width="604" height="401" />](http://catethysis.ru/wp-content/uploads/2015/02/raspberry-pi-2-model-b-7.jpg)
  
Новая версия Raspberry Pi 2 Model B, <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://www.cnet.com/pictures/unboxing-the-supercharged-35-raspberry-pi-2/6/" >источник</a>

Как видим, размеры платы и расположение всех элементов осталось прежним, так что старые корпуса (купленные или распечатанные на 3D-принтере) можно не выбрасывать, и приспособить для новой платы: она по-прежнему имеет размер банковской карты.

Однако, в глаза бросается разительное отличие: в первой версии был использован процессор BCM2835 в BGA PoP корпусе:

[<img class="alignnone size-large wp-image-2210" src="http://catethysis.ru/wp-content/uploads/2015/02/bga-pop-1024x610.jpg" alt="bga pop" width="604" height="359" />](http://catethysis.ru/wp-content/uploads/2015/02/bga-pop.jpg)
  
Чип BCM2835 в PoP-корпусе, <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://cmsc411.com/hardware" >источник</a>

Этот корпус позволял разместить чип RAM-памяти прямо на процессоре, что избавляло дизайнера платы от необходимости вести десятки высокоскоростных дифференциальных линий по плате от процессора к памяти, да ещё и с необходимостью уравнивать длину разных линий, рисуя дорожками &#171;змеек&#187;.

[<img class="alignnone size-full wp-image-2211" src="http://catethysis.ru/wp-content/uploads/2015/02/6y1d.png" alt="6y1d" width="868" height="776" />](http://catethysis.ru/wp-content/uploads/2015/02/6y1d.png)
  
Уравнивание длин дорожек, <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://www.eevblog.com/forum/altium/easy-way-to-generate-matched-length-traces/" >источник</a>

В итоге разработчики получали более простую плату, но одновременно с тем увеличение стоимости микросхем (PoP-версии процессора и памяти дороже обычных), и удорожание монтажа. Так или иначе, в новой версии платы они отказались от такого дизайна, использовав обычные BGA-чипы, и память теперь распаяна с нижней стороны платы недалеко от процессора:

](http://catethysis.ru/wp-content/uploads/2015/02/raspberry-pi-2-model-b-3.jpg) 

Микросхема памяти в Raspberry Pi 2 Model B, <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://www.cnet.com/pictures/unboxing-the-supercharged-35-raspberry-pi-2/7/" >источник</a>

На нижней стороне платы и раньше были компоненты, поэтому добавление чипа памяти на нижнюю сторону несильно удорожило этот этап производства. В целом, выглядит так что разработчики очень хотели сохранить старую стоимость, и с трудом влезли в эти цифры. Опять же, при столь массовом производстве (продано почти 5 миллионов экземпляров различных версий платы) экономия десяти центов приносит чистую прибыль в полмиллиона долларов, поэтому я уверен что всё что можно было удешевить — удешевлено или выкинуто. По-моему, существенный стимул для разработчика: заменил дорогой разъём от TE Connectivity на китайский (но не самый китайский, чтобы не нарваться на рекламации от клиентов) — купил особняк  <img src="http://catethysis.ru/wp-includes/images/smilies/icon_smile.gif" alt=":)" class="wp-smiley" />Вот за это я и люблю массовое производство.

Старая версия довольно плохо справлялась с функциями медиацентра, по заявлениям некоторых юзеров она годилась только для сёрфинга интернета. Но похоже что с новой версией получится добиться плавности воспроизведения.

Плата уже продаётся в <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://www.element14.com/community/community/raspberry-pi/raspberrypi2" >element14</a>, правда всё что было уже заказали.