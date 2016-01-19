---
id: 2380
title: Использование codec2 для сжатия звука
date: 2015-07-21T20:20:53+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2380
permalink: /using-codec2-for-voice-shrinking/
ratings_users:
  - 1
ratings_score:
  - 5
ratings_average:
  - 5
wp_noextrenallinks_mask_links:
  - 0
dsq_thread_id:
  - 3956683488
categories:
  - Без рубрики
---
Кодек codec2, про который я писал в [одном из прошлых постов](http://catethysis.ru/codec2_and_mac/ "Голосовой кодек codec2 и его установка на Mac"), предоставляет удобное API для потокового сжатия звука. Я написал простую тестовую программу для демонстрации его использования в реальной жизни.

Codec2 использует разные параметры дискретизации для достижения разной степени сжатия &#8212; в частности, длину чанка (количество семплов на фрейм) и длину сжатого фрейма. Поэтому сначала мы инициализируем кодек на требуемую степень сжатия, и он сообщает нам свои параметры &#8212; какого размера должны быть кусочки данных, которые мы передаем в кодек, и какой длины будет сжатый фрейм.

<!--more-->

После инициализации открываем исходный бинарный файл, и начинаем читать из него данные требуемыми кусочками. Передаем прочитанный кусочек в кодек, забираем из него результат сжатия и записываем его в выходной файл.

Я использую аудиофайл из примеров, приложенных к кодеку.

Для проверки результата тут же раскодируем фрейм обратно, и запишем в третий файл. Там будет лежать звук, только прошедший сжатие/разжатие кодеком, и мы сможем оценить качество звука.

В конце закроем файлы, освободим кодек и выведем статистику процесса.

<pre><code class="cpp">#include "codec2.h"
#include "dump.h"
#include "inttypes.h"

int main()
{
    struct CODEC2 *codec2 = codec2_create(CODEC2_MODE_1200);

    int samples_per_frame = codec2_samples_per_frame(codec2);
    int bits_per_frame    = codec2_bits_per_frame   (codec2);

    int16_t *inbuf  = (int16_t *) malloc(sizeof(int16_t) * samples_per_frame);
    int16_t *outbuf = (int16_t *) malloc(sizeof(int16_t) * samples_per_frame);
    uint8_t *bits   = (uint8_t *) malloc(sizeof(uint8_t) * bits_per_frame   );

    FILE *f_in  = fopen("hts1a_in.raw",  "rb");
    FILE *f_c2  = fopen("hts1a.c2",      "wb");
    FILE *f_out = fopen("hts1a_out.raw", "wb");

    uint16_t frames = 0;

    while(!feof(f_in)) {
        fread (inbuf,  sizeof(int16_t), samples_per_frame, f_in);

        codec2_encode(codec2, bits,  inbuf);
        fwrite(bits,   sizeof(uint8_t), bits_per_frame,    f_c2);

        codec2_decode(codec2, outbuf, bits);
        fwrite(outbuf, sizeof(int16_t), samples_per_frame, f_out);

        frames++;
    }

    free(inbuf);
    free(outbuf);
    free(bits);
    codec2_destroy(codec2);

    fclose(f_in);
    fclose(f_c2);
    fclose(f_out);

    printf("%d frames, %d bytes in, %d bytes c2, %d c2 bitrate, %d c2z bitrate", frames, frames * samples_per_frame / 8, 
        frames * bits_per_frame, (8000 * bits_per_frame) / samples_per_frame);
}</code></pre>