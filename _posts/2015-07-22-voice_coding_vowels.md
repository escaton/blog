---
id: 2391
title: Сжатие голоса — гласные звуки
date: 2015-07-22T17:23:19+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2391
permalink: /voice_coding_vowels/
ratings_users:
  - 3
ratings_score:
  - 15
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 3959509390
categories:
  - Без рубрики
tags:
  - сжатие звука
---
Чем меньше битрейт потока данных, тем дальше можно его передать. Если получится сжать голос до 1-2 кБ/с, можно будет общаться на расстоянии до 25км (с использованием трансивера CC1125). Давайте попробуем разработать голосовой кодек самостоятельно, без использования готовых решений вроде [codec2](http://catethysis.ru/using-codec2-for-voice-shrinking/ "Использование codec2 для сжатия звука").

Как устроен голос? В нём можно выделить несколько элементов:

  * гласные звуки
  * согласные — шумовые — взрывные: п, к, т&#8230;
  * согласные — шумовые — фрикативные/свистящие: с, ш, щ, ф, в&#8230;
  * согласные — сонорные — дрожащие: р
  * согласные — сонорные — носовые: м, н

Гласные звуки можно рассматривать как музыкальные — это чистый тон + его обертоны различной амплитуды. Согласные звуки — это шумовые звуки с разным тембром и сонорные (тон + шум).

Гласные и согласные здорово различаются по своей информативности, сравните:
  
**гласные**: .и..ио.ы .и..ио.ы .и..ио.ы а.ы. .о.
  
**согласные**: м.лл..н. м.лл..н. м.лл..н. .л.х р.з

Ирония заключается в том, что гласные звуки очень легко описать небольшим набором параметров. В них нет частот, некратных частоте основного тона, поэтому всё описание сводится до нескольких значений: частота основного тона + амплитуды гармоник. Причём частота доминанты должна быть измерена точно (с точностью до 16 бит), а вот амплитуды гармоник терпят и очень сильную децимацию — поэтому каждую амплитуду можно сжать до 1 байта или даже полубайта.

Давайте начнём с гласных, раз уж их так легко описать. Я разрабатывал алгоритм на Питоне, просто потому что в нём это реально быстро и просто.

<!--more-->

## Чтение звукового файла

Я записал звук &#171;а&#187; в собственном исполнении и в исполнении девушки, и сохранил его в сыром виде с дикретизацией 8кГц в виде 16-битных знаковых целых с помощью Audacity. Сделаем функцию для чтения такого файла:

<pre><code class="python">from struct import *

def read_file(filename):
	f = open(filename, "rb")
	chunk = f.read(2)
	raw_input = []
	while chunk:
		raw_input.append(unpack('&lt;h', chunk)[0])
		chunk = f.read(2)
	f.close()
	return raw_input

raw_input = read_file("a_cat_m_8k_200.raw")[0:800]</code></pre>

Я сохраняю только 800 отсчётов, т.е. 100мс звука — на таком отрезке ещё можно принять сигнал стационарным, неизменяющимся. Следующие фреймы потом проанализируем очередными проходами алгоритма. Построим осциллограмму полученного звука:

<pre><code class="python">import matplotlib.pyplot as plt
plt.plot(cepstrum[0:100], 'r')
plt.grid(b=True, which='major', color='b', linestyle='-')
plt.show()</code></pre>

[<img class="alignnone size-full wp-image-2393" src="http://catethysis.ru/wp-content/uploads/2015/07/raw.png" alt="raw" width="1004" height="418" />](http://catethysis.ru/wp-content/uploads/2015/07/raw.png)

## Построение спектра

Вычислим преобразование Фурье для полученного звука. Фурье возвращает комплексную амплитуду, из которой можно вычислить амплитуду и фазу. Ухо практически нечувствительно к фазе, поэтому мы можем сэкономить половину битрейта, полностью устранив её — оставим только амплитуду, вычислив её функцией abs.

<pre><code class="python">import cmath
	
def dft(fnList):
	pi2 = cmath.pi * 2.0
	N = len(fnList)
	FmList = []
	for m in range(N):
		Fm = 0.0
		for n in range(N): Fm += fnList[n] * cmath.exp(- 1j * pi2 * m * n / N)
		FmList.append(abs(Fm / N))
	return FmList

spectrum = dft(raw_input)

plt.plot(spectrum[0:400], 'r')</code></pre>

<img class="alignnone size-full wp-image-2394" src="http://catethysis.ru/wp-content/uploads/2015/07/spectrum.png" alt="spectrum" width="987" height="415" />

Красивый спектр, правда? Увеличим интересующий нас фрагмент:

<img class="alignnone size-full wp-image-2395" src="http://catethysis.ru/wp-content/uploads/2015/07/spectrum_zoom.png" alt="spectrum_zoom" width="987" height="423" />

Хорошо виден основной тон и его обертоны, спектр имеет периодическую структуру.
  
Положение каждого пика определяется соотношением: freq = samples / period. Абсцисса пика равна отношению длины фрейма в семплах (в нашем случае 800) к периоду волны.

Правда, есть одна проблема: если взять чистый синус с частотой, не попадающей в выбранную частотную сетку, то после преобразования Фурье он превратится не в дельта-импульс (единичный всплеск), а в какую-то размазанную фигуру:

[<img class="alignnone size-full wp-image-2407" src="http://catethysis.ru/wp-content/uploads/2015/07/petal.png" alt="petal" width="577" height="110" />](http://catethysis.ru/wp-content/uploads/2015/07/petal.png)

Чтобы уменьшить этот эффект, необходимо применить к сигналу так называемое &#171;окно&#187;. Я умножу сигнал на окно Хэннинга.

[<img class="alignnone size-full wp-image-2408" src="http://catethysis.ru/wp-content/uploads/2015/07/hanning.png" alt="hanning" width="252" height="56" />](http://catethysis.ru/wp-content/uploads/2015/07/hanning.png)

<pre><code class="python">raw_input = [amp * 1.8 * (0.5 - 0.5 * math.cos(2*3.1415*i/len(raw_input))) for i, amp in enumerate(raw_input)]</code></pre>

Красная линия — спектр исходного сигнала, зелёная — спектр сигнала с окном Хэннинга:

[<img class="alignnone size-full wp-image-2410" src="http://catethysis.ru/wp-content/uploads/2015/07/spectrum_hanning1.png" alt="spectrum_hanning" width="928" height="421" />](http://catethysis.ru/wp-content/uploads/2015/07/spectrum_hanning1.png)

Стало гораздо лучше: пики выделены сильнее, их полуширина меньше и в спектре меньше шума.

## Построение кепстра

Здесь уже видно всё, что нам нужно, но как программно найти пики и их амплитуды? Проходить обычным поиском локального максимума — неблагодарное дело: пики могут быть слегка сдвинуты, дублированы, и так мы найдём только целую часть периода, а он может быть дробным. Как же нам тогда определить этот период? Тем же способом, как мы определяли периоды в исходном звуковом сигнале, преобразованием Фурье. Только нужно сначала логарифмировать наш спектр, чтобы сильнее выделить пики.

[<img class="alignnone size-full wp-image-2412" src="http://catethysis.ru/wp-content/uploads/2015/07/logstrum1.png" alt="logstrum" width="964" height="417" />](http://catethysis.ru/wp-content/uploads/2015/07/logstrum1.png)

И применить к этому преобразование Фурье:

<pre><code class="python">def calc_cepstrum(spectrum):
	return dft([math.log(amp) for i, amp in enumerate(spectrum)])
cepstrum = calc_cepstrum(spectrum)
plt.plot(cepstrum[0:100], 'b')</code></pre>

<img class="alignnone size-full wp-image-2411" src="http://catethysis.ru/wp-content/uploads/2015/07/cepstrum1.png" alt="cepstrum" width="971" height="415" />

То, что мы построили, называется прикольным словом &#171;кепстр&#187; (Cepstrum) — из названия понятно, что это является чем-то вроде обращения спектра.

## Поиск фундаментальной частоты

В нём нам нужен только первый пик, чьё положение будет в точности равно периоду искомого основного тона. Мы найдём этот пик обычным поиском глобального максимума, ограничив область поиска частотами 80..270 Гц, т.к. именно в этом диапазоне лежат основные частоты голосов взрослых людей. В нашем случае это диапазон периодов 30..100 (8000/270..8000/80).

<pre><code class="python">import numpy as np
fund_freq = len(cepstrum) / (np.argmax(cepstrum[30:100]) + 30.0)
print 8000 * fund_freq / len(cepstrum)</code></pre>

<pre>&gt; 112.676</pre>

В моём случае фундаментальная частота была равна 113Гц, а у моей девушки — ровно 200Гц, что хорошо соотносится с цитатой из Википедии:

<pre><em>Голос типичного взрослого мужчины имеет фундаментальную частоту (нижнюю) от 85 до 155 Гц, типичной взрослой женщины от 165 до 255 Гц.</em></pre>

## Запись обертонов

Всё, теперь можно вернуться к спектру, пройти по всем гармоникам найденной основной частоты и записать их амплитуду. Я немного расширяю диапазоны частот обертонов, чтобы найти сумму всего пика (ведь пики размазаны из-за несовпадения сетки частот с основной частотой).

<pre><code class="python">harms = []
for i in range(1, 10): harms.append(int(sum([spectrum[int(round(i * fund_freq)) + j] for j in range (-1, +1) ])))
print harms</code></pre>

<pre>&gt; [952, 915, 1111, 674, 803, 898, 988, 879, 463]</pre>

Даже девятая гармоника имеет амплитуду, сравнимую с амплитудой основной частоты, поэтому нужно записать довольно много обертонов, минимум 8-10. С другой стороны, нам достаточно ограничиться полосой в 4кГц, более высокие гармоники уже не так нужны для передачи голоса.

## Упаковка параметров

Для описания одного фрейма с голосом (10мс в нашем случае) требуется:

  * фундаментальная частота — 2 байта
  * N * амплитуда обертона — N/2 байт

Обычно достаточно не более 10 обертонов, то есть характеристика займёт 2 + 5 = 7 байт. Исходный фрейм весил 1600 байт, то есть степень сжатия составляет ~230 раз. Но нужно понимать, что так мы сжали только гласные звуки, ещё остались согласные — которые, как назло, передают куда больше информации.

## Распаковка звука и сравнение

Разжатие звука обратно можно было бы сделать через обратное преобразование Фурье, но сделаем ещё проще — сгенерируем синусоиды нужных частот и амплитуд, и сложим их все друг с другом.

<pre><code class="python">out = []
for i in range(0, 800):
	out.append((harms[0] * math.sin(2 * 3.1415926 * i * 1 / (len(cepstrum) / fund_freq)) + 
				harms[1] * math.sin(2 * 3.1415926 * i * 2 / (len(cepstrum) / fund_freq)) + 
				harms[2] * math.sin(2 * 3.1415926 * i * 3 / (len(cepstrum) / fund_freq)) + 
				harms[3] * math.sin(2 * 3.1415926 * i * 4 / (len(cepstrum) / fund_freq)) + 
				harms[4] * math.sin(2 * 3.1415926 * i * 5 / (len(cepstrum) / fund_freq)) + 
				harms[5] * math.sin(2 * 3.1415926 * i * 6 / (len(cepstrum) / fund_freq)) + 
				harms[6] * math.sin(2 * 3.1415926 * i * 7 / (len(cepstrum) / fund_freq))) * 3)
# print out[0:100]
f = open("a_cat_m_8k_200.out", "wb")
for i in range(0, 800):
	f.write(pack('&lt;h', out[i]))
f.close()</code></pre>

Откроем в Audacity исходный файл и восстановленный, и сравним осциллограммы:

[<img class="alignnone size-full wp-image-2398" src="http://catethysis.ru/wp-content/uploads/2015/07/waveforms.png" alt="waveforms" width="904" height="336" />](http://catethysis.ru/wp-content/uploads/2015/07/waveforms.png)

И спектры:

<img class="alignnone size-full wp-image-2397" src="http://catethysis.ru/wp-content/uploads/2015/07/spectrums.png" alt="spectrums" width="907" height="335" />

Довольно похоже. На слух тоже похоже, причём 10 гармоник звучат гораздо лучше, чем 8.