---
id: 191
title: Звуковой lossless-кодек
date: 2013-09-12T22:10:13+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=191
permalink: /lossless-audio-codec/
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
  - 2758614927
categories:
  - Программирование
tags:
  - звук
  - кодек
  - микроконтроллеры
  - передача данных
---
Для передачи звука по CAN нам необходимо уместить его в полосу 1 МБит/с. Но двухканальный 16-битный звук с частотой дискретизации 44.1 кГц требует 1.41 МБит/с. Плохое решение проблемы &#8212; передавать один канал, либо уменьшить дискретизацию, либо уменьшить разрядность. Хорошее решение &#8212; написать кодек, который без потерь качества сможет устранить избыточную информацию.

<!--more-->

### Устранение избыточности

Где в звуке содержится лишняя информация? Звук &#8212; это не последовательность случайных сигналов, это довольно гладкая функция. Значит, мы можем вместо  значения нового отсчёта записывать <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://ru.wikipedia.org/wiki/%D0%94%D0%B5%D0%BB%D1%8C%D1%82%D0%B0-%D0%BA%D0%BE%D0%B4%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5"  target="_blank">разницу с предыдущим отчётом</a>. Тогда весь звуковой поток превратится в &#171;значение первого отсчёта + массив разностей&#187;.

Тут мы не придумали ничего нового, это давно известно в виде &#171;<a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://ru.wikipedia.org/wiki/%D0%94%D0%B8%D1%84%D1%84%D0%B5%D1%80%D0%B5%D0%BD%D1%86%D0%B8%D0%B0%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F_%D0%B8%D0%BC%D0%BF%D1%83%D0%BB%D1%8C%D1%81%D0%BD%D0%BE-%D0%BA%D0%BE%D0%B4%D0%BE%D0%B2%D0%B0%D1%8F_%D0%BC%D0%BE%D0%B4%D1%83%D0%BB%D1%8F%D1%86%D0%B8%D1%8F"  target="_blank">ДИКМ/DPCM</a>&#171;. Однако сейчас у нас нет никакого выигрыша, мы же храним разности в прежнем виде.

### Хранение остатков

Теперь нужно рассмотреть, какова амплитуда этих разностей. По моим измерениям, на обычных звуковых файлах она не превышает 10% от амплитуды звука. Значит, мы можем сэкономить минимум три бита на хранении этих амплитуд (поскольку 2^3 = 8, а у нас разница даже больше &#8212; 10). Более того, можно обрабатывать кусочек звука (чанк) заранее, и динамически настраивать степень экономии битов. Важно, что мы ничего не потеряли в звуке &#8212; просто устранили избыточную информацию.

### Сжатие остатков

Теперь массив разностей составляют почти случайные величины. Однако, их тоже можно немного сжать каким-либо <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://ru.wikipedia.org/wiki/%D0%AD%D0%BD%D1%82%D1%80%D0%BE%D0%BF%D0%B8%D0%B9%D0%BD%D0%BE%D0%B5_%D0%BA%D0%BE%D0%B4%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5"  target="_blank">энтропийным кодером</a>, хотя бы даже <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://algolist.manual.ru/compress/standard/huffman.php"  target="_blank">алгоритмом Хаффмана</a>.

После всех манипуляций битрейт звука уменьшился на 30%, и составил 0,99 МБит/с. Этого достаточно для передачи по CAN, а самое главное что алгоритмы довольно легки, и их (особенно декодирование) можно реализовать даже на слабых микроконтроллерах.

### Методы улучшения кодека

  1. Нужно воспользоваться корреляцией между каналами, и хранить не отдельно правый и левый каналы, а их полусумму и полуразность.
  2. Можно ещё сильнее воспользоваться гладкостью функций, и описать отчёты квадратичной или кубической функцией. Такое описание будет гораздо лучше себя вести на пиках звукового давления, т.е. на максимумах волн. Обычному ДИКМ придётся сильно увеличивать значение разности в этих моментах. Вполне возможно, что это даст ещё 1-2 бита экономии.
  3. Для кодирования остатков лучше воспользоваться каким-либо специализированным кодером, например использовать <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://ru.wikipedia.org/wiki/%D0%A1%D0%B6%D0%B0%D1%82%D0%B8%D0%B5_%D0%B7%D0%B2%D1%83%D0%BA%D0%B0_%D0%B1%D0%B5%D0%B7_%D0%BF%D0%BE%D1%82%D0%B5%D1%80%D1%8C#.D0.9A.D0.BE.D0.B4.D0.B8.D1.80.D0.BE.D0.B2.D0.B0.D0.BD.D0.B8.D0.B5._.D0.90.D0.BB.D0.B3.D0.BE.D1.80.D0.B8.D1.82.D0.BC_.D0.A0.D0.B0.D0.B9.D1.81.D0.B0"  target="_blank">коды Райса</a>.