---
id: 739
title: 'Копирование данных GPU  CPU'
date: 2013-12-11T05:22:55+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=739
permalink: /cuda-gpu-cpu-data-transfer/
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
dsq_thread_id:
  - 2730342750
categories:
  - CUDA
  - Исследования
tags:
  - c
  - cuda
---
Лимитирующим фактором в любых вычислениях на видеокарте является передача данных из ОЗУ в видеокарту и обратно. Попробуем оценить это время.

## Скорость передачи ОЗУ ↔ видеопамять

Попробуем измерить скорость передачи данных &#171;в&#187; и &#171;из&#187; видеопамяти. Код очень прост &#8212; используем только функцию cudaMemcpy.

    int count = 65536 * 1024 * 4;
    int size = sizeof(int) * count;
    
    int *cpu_a = (int *)malloc(size);	int *gpu_a; cudaMalloc((void**)&gpu_a, size);
    
    for(int i = 0; i < count; i++) cpu_a[i]=1;
    
    printf("size: %.3f GBn", size/1024.0/1024.0/1024.0);
    
    long long tm1 = -gettimeus();
    cudaMemcpy(gpu_a, cpu_a, size, cudaMemcpyHostToDevice);
    tm1 += gettimeus();	
    printf("DRAM -> GDRAM: %lld ms. speed: %.3f GB/sn", tm1/1000, size/tm1/1000.0);
    
    long long tm2 = -gettimeus();
    cudaMemcpy(cpu_a, gpu_a, size, cudaMemcpyDeviceToHost);
    tm2 += gettimeus();
    printf("DRAM <- GDRAM: %lld ms. speed: %.3f GB/sn", tm2/1000, size/tm2/1000.0);
    
    free(cpu_a);	cudaFree(gpu_a);
    

<img alt="Скорость копирования между памятью компьютера и видеокарты" src="http://static.catethysis.ru/files/cuda_memcpy_speed.png" width="660" height="342" />

Как видим, скорость примерно равна 4 гигабайтам в секунду или 32 гигабитам/с (при измерении скорости интерфейсов всегда используют только десятичные приставки). Много это или мало? Да честно говоря, не очень много. Однако, на пути данных есть несколько интерфейсов, и какой-то из них может оказаться бутылочным горлышком. Перечислим их все:

Видеопамять GDDR5 имеет скорость 80 Гб/с;
  
Интерфейс PCI-Express 3.0 x16 &#8212; 128 Гб/с;
  
Измеренная скорость передачи DRAM -> DRAM составила 27 Гб/с;
  
Похоже, производительность упёрлась в скорость ОЗУ.

**UPD:**
  
Очень большую роль играет выбор порта PCI-Express. Эксперименты проводились на чипсете Z77 и видеокарте GTX650. Если вставить её в &#171;PCI-Express1&#8243; &#8212; скорость обмена будет около 4 ГБ/с и выше. Если же использовать порт &#171;PCI-Express2&#8243; &#8212; скорость упадёт до 1.5-1.7 ГБ/с. Для работы с CUDA используйте только PCI-Express1!