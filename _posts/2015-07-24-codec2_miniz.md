---
id: 2423
title: 'Сжать сжиматель: codec2 + miniz'
date: 2015-07-24T22:03:55+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2423
permalink: /codec2_miniz/
ratings_users:
  - 1
ratings_score:
  - 5
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 3968143060
categories:
  - Без рубрики
tags:
  - сжатие звука
---
Кодек [codec2](http://catethysis.ru/codec2_and_mac/ "Голосовой кодек codec2 и его установка на Mac"), про который я [писал недавно](http://catethysis.ru/using-codec2-for-voice-shrinking/ "Использование codec2 для сжатия звука"), обладает одной приятной особенностью: он прекрасно сжимается архиватором! Это может показаться странным, но похоже что код на его выходе имеет высокую степень похожести, которая даёт архиватору простор для выделения повторяющихся элементов.

Я обнаружил это, когда просто из любопытства попытался сжать полученный в [прошлой статье](http://catethysis.ru/using-codec2-for-voice-shrinking/ "Использование codec2 для сжатия звука") *.c2-файл стандартным линуксовым gzip:
  
voice.c2 &#8212; 2448 байт (2.04 сек * 1200 байт/сек)
  
voice.c2.gz &#8212; 461 байт
  
Очень сильное сжатие, более 5 раз! Итоговый битрейт добрался до умопомрачительных 225 байт/сек. Я был так удивлён, что быстрей побежал реализовывать это сам.

Я использую стандартный метод DEFLATE, который реализован в [библиотеке miniz](http://catethysis.ru/deflate/ "Сжатие данных в микроконтроллере, DEFLATE и библиотека miniz"). Но есть один ньюанс: нам необходимо сохранить &#171;поточность&#187; кодека. Я собираюсь использовать кодек для сжатия голоса, передачи его и воспроизведения в реальном времени, значит я не могу дожидаться окончания записи всего сигнала, и только потом сжимать. Нужно научиться сжимать данные так же потоково.

<!--more-->

## Первый вариант (наивный)

Будем сжимать каждый фрейм, полученный от codec2, и записывать результат в файл.

<pre><code class="cpp">#include 
#include "codec2.h"
#include "dump.h"
#include "miniz.c"

int main()
{
    struct CODEC2 *codec2 = codec2_create(CODEC2_MODE_1200);

    int samples_per_frame = codec2_samples_per_frame(codec2);
    int bits_per_frame    = codec2_bits_per_frame   (codec2);

    int16_t *inbuf  = (int16_t *) malloc(sizeof(int16_t) * samples_per_frame);
    int16_t *outbuf = (int16_t *) malloc(sizeof(int16_t) * samples_per_frame);
    uint8_t *bits   = (uint8_t *) malloc(sizeof(uint8_t) * bits_per_frame   );

	FILE *f_in  = fopen("voice.raw",     "rb");
	FILE *f_c2  = fopen("voice.c2",      "wb");
	FILE *f_c2z = fopen("voice.c2z",     "wb");
	FILE *f_out = fopen("voice_out.raw", "wb");

    unsigned long comp_len = 200;
    uint8_t pComp[100] = { 0 };

    uint16_t frames = 0, gzipped = 0;

    while(!feof(f_in)) {
        fread (inbuf,  sizeof(int16_t), samples_per_frame, f_in);

        codec2_encode(codec2, bits,  inbuf);
        fwrite(bits,   sizeof(uint8_t), bits_per_frame,    f_c2);

        compress2(&pComp[1], &comp_len, (const uint8_t *)bits, bits_per_frame, MZ_UBER_COMPRESSION);
        pComp[0] = (uint8_t) comp_len;
        fwrite(pComp,  sizeof(uint8_t), comp_len + 1,      f_c2z);

        codec2_decode(codec2, outbuf, bits);
        fwrite(outbuf, sizeof(int16_t), samples_per_frame, f_out);

        frames++;
        gzipped += comp_len;
    }

    free(inbuf);
    free(outbuf);
    free(bits);
    codec2_destroy(codec2);

    fclose(f_in);
    fclose(f_c2);
    fclose(f_c2z);
    fclose(f_out);

    printf("%d frames, %d bytes in, %d bytes c2, %d bytes c2z, %d c2 bitrate, %d c2z bitrate", frames, frames * samples_per_frame / 8, 
        frames * bits_per_frame, gzipped, (8000 * bits_per_frame) / samples_per_frame, gzipped / (frames * samples_per_frame / 8000));

    return 0;
}</code></pre>

Размер полученного файла &#8212; 3060 байт против изначальных 2448. Мда, какое-то не очень эффективное сжатие <img src="http://catethysis.ru/wp-includes/images/smilies/icon_smile.gif" alt=":)" class="wp-smiley" />

Почему так получилось? Размер каждого фрейма — всего 48 байт, на таких размерах сжатие практически всегда работает плохо, бОльшую часть файла занимает словарь. К тому же внутри самого фрейма почти нет повторяющейся информации.

## Второй вариант (накопительный)

Так какая-то фигня получается. Наверное, надо сохранять словарь между фреймами, да и вообще накапливать каждый новый фрейм в буфере.

У архиватора miniz есть несколько режимов накопления информации:

  * Z_FINISH — стандартный режим: передаём пакет данных и тут же завершаем процесс, забираем сжатый пакет.
  * Z\_NO\_FLUSH — режим накопления данных: просто добавляем во внутренний буфер архиватора новые данные.
  * Z_FLUSH — передаём архиватору ещё один пакет и сбрасываем в выходной буфер текущее состояние. Словарь НЕ сбрасывается! Следующие переданные пакеты будут архивироваться с использованием старого словаря, при необходимости он конечно будет пополняться.

Попробуем накапливать данные во внутреннем буфере (привожу только изменившуюся часть кода):

<pre><code class="cpp">z_stream gzip_stream;
memset(&gzip_stream, 0, sizeof(gzip_stream));
gzip_stream.next_out = &pComp[1];
gzip_stream.avail_out = 50000;
deflateInit(&gzip_stream, MZ_UBER_COMPRESSION);

while(!feof(f_in)) {
	fread (inbuf,  sizeof(int16_t), samples_per_frame, f_in);

	codec2_encode(codec2, bits,  inbuf);
	fwrite(bits,   sizeof(uint8_t), bits_per_frame,    f_c2);

	gzip_stream.next_in = (const uint8_t *)bits;
	gzip_stream.avail_in = bits_per_frame;
	
	deflate(&gzip_stream, Z_NO_FLUSH);
	
	frames++;
}

deflate(&gzip_stream, Z_FINISH);
pComp[0] = gzip_stream.total_out;

fwrite(pComp, sizeof(uint8_t), gzip_stream.total_out + 1, f_c2z);
deflateEnd(&gzip_stream);</code></pre>

Результат: 473 байт, примерно как в обычном линуксовом gzip. Но всё равно это не так так весело &#8212; мы получаем архив только после завершения записи звука.

## Третий вариант (потоковый)

Сжимать отдельные фреймы — невыгодно, но сохраняется поточность. Сжимать весь полученный файл — очень выгодно, но поточность теряется. Значит, нужно найти компромисс. Я предлагаю сжимать 5 фреймов подряд. Так мы увеличим &#171;пинг&#187;, т.е. задержку передачи голоса, но она составит всего 20мс * 5 = 100мс, совершенно терпимая для связи величина.

Используем третий режим работы архиватора miniz, Z\_FLUSH. Я предлагаю четыре пакета данных накапливать в режиме Z\_NO\_FLUSH, а пятый добавлять в режиме Z\_FLUSH и сбрасывать полученный архив наружу.

<pre><code class="cpp">z_stream gzip_stream;
memset(&gzip_stream, 0, sizeof(gzip_stream));
gzip_stream.next_out = &pComp[1];
gzip_stream.avail_out = 50000;
deflateInit(&gzip_stream, MZ_UBER_COMPRESSION);

while(!feof(f_in)) {
	fread (inbuf,  sizeof(int16_t), samples_per_frame, f_in);

	codec2_encode(codec2, bits,  inbuf);
	fwrite(bits,   sizeof(uint8_t), bits_per_frame,    f_c2);

	gzip_stream.next_in = (const uint8_t *)bits;
	gzip_stream.avail_in = bits_per_frame;
	
	if(frames % 5)
		deflate(&gzip_stream, Z_NO_FLUSH);
	else {
		deflate(&gzip_stream, Z_SYNC_FLUSH);
		pComp[0] = gzip_stream.total_out;
		fwrite(pComp, sizeof(uint8_t), gzip_stream.total_out + 1, f_c2z);
	}
	
	frames++;
}

deflate(&gzip_stream, Z_FINISH);
pComp[0] = gzip_stream.total_out;

fwrite(pComp, sizeof(uint8_t), gzip_stream.total_out + 1, f_c2z);
deflateEnd(&gzip_stream);</code></pre>

Результат: 765 байт, очень хорошо. Это не так классно как в прошлом варианте, зато сохраняется поточность кодека.

## Четвёртый вариант (надёжный)

Очередная проблема: все наши пакеты используют общий, постоянно растущий словарь. Стоит потеряться хотя бы одному пакету — все следующие будет невозможно распаковать, они будут битыми.

Поэтому давайте каждую секунду (т.е. каждый десятый пакет FLUSH) полностью перезапускать архивирование: добавляем последний пакет данных с пометкой Z_FINISH, записываем полученные данные в файл и перезапускаем архиватор командой deflateReset. Так мы создаём что-то вроде &#171;опорного кадра&#187;.

<pre><code class="cpp">z_stream gzip_stream;
memset(&gzip_stream, 0, sizeof(gzip_stream));
gzip_stream.next_out = &pComp[1];
gzip_stream.avail_out = 50000;
deflateInit(&gzip_stream, MZ_UBER_COMPRESSION);

while(!feof(f_in)) {
	fread (inbuf,  sizeof(int16_t), samples_per_frame, f_in);

	codec2_encode(codec2, bits,  inbuf);
	fwrite(bits,   sizeof(uint8_t), bits_per_frame,    f_c2);

	gzip_stream.next_in = (const uint8_t *)bits;
	gzip_stream.avail_in = bits_per_frame;
	if(frames % 5)
		deflate(&gzip_stream, Z_NO_FLUSH);
	else {
		if(frames % 50)
			deflate(&gzip_stream, Z_SYNC_FLUSH);
		else
			deflate(&gzip_stream, Z_FINISH);

		pComp[0] = gzip_stream.total_out;
		fwrite(pComp, sizeof(uint8_t), gzip_stream.total_out + 1, f_c2z);

		if(frames % 50 == 0) deflateReset(&gzip_stream);
	}
	frames++;
}

deflate(&gzip_stream, Z_FINISH);
pComp[0] = gzip_stream.total_out;

fwrite(pComp, sizeof(uint8_t), gzip_stream.total_out + 1, f_c2z);
deflateEnd(&gzip_stream);</code></pre>

Результат: 1225 байт = 600 байт/сек. Похоже, это лучший вариант, сочетающий надёжность передачи и небольшой битрейт.

## Выводы и комментарии

При постоянной динамической подстройке параметров в четвёром варианте можно добиться даже меньше чем 512 байт/секунду, это что-то вроде психологического предела. Например, при высоком качестве канала связи можно делать опорные кадры гораздо реже, а то и вовсе делать их по запросу: к каждому фрейму добавлять CRC, и если она не сошлась &#8212; запрашивать сброс буфера.

Это хорошо масштабируется и при передаче двум слушателям: даже если один абонент принял фрейм, а второй нет &#8212; второй запросит сброс буфера, и новый опорный фрейм придёт обоим слушателям, перезапустив распаковку у обоих с нуля. Нет смысла хранить отдельные состояния для каждого адресата, это кратно увеличит расход памяти, и не даст существенных преимуществ.

В итоге мы получили аудиокодек, годный для передачи голоса по радио с битрейтом менее 512 байт в секунду.