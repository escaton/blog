---
id: 677
title: Hello world на CUDA
date: 2013-11-25T15:57:54+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=677
permalink: /cuda-hello-world/
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
  - 2726264325
categories:
  - CUDA
  - Руководства
  - С нуля
tags:
  - c
  - cuda
---
В сети сравнительно мало информации о CUDA, особенный дефицит helloworld\`ов. Без теории перейдём сразу к делу (теория потом). Для начала нужно установить Visual studio версии 2008, 2010 или 2012, а так же <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/https://developer.nvidia.com/cuda-downloads" >CUDA SDK</a>. Всё нужное эти парни установят сами, и даже создадут папку с примерами. Поехали, самый первый пример!

<!--more-->

## 1. Произведение чисел



<pre><code class="cpp">using namespace std;

__global__ void add(const int a, const int b, int *c)
{
	*c = a * b;
}

int main(void)
{
	int size = sizeof(int);
	int *gpu_c; cudaMalloc((void**)&gpu_c, size);
	int cpu_c;

	add&lt;&lt;&lt;1, 1&gt;&gt;&gt;(4, 6, gpu_c);

	cudaMemcpy(&cpu_c, gpu_c, size, cudaMemcpyDeviceToHost);
	printf("4 * 6 = %dn", cpu_c);
	cudaFree(gpu_c);
	scanf("");
}
</code></pre>

Что всё это значит? Сначала заводим указатель gpu_c. Функция cudaMalloc выделяет блок памяти размером size **в памяти видеокарты**, и передаёт адрес этого блока в gpu\_c &#8212; теперь gpu\_c стал указателем на кусок памяти видеокарты. Далее, выполняем функцию add с параметрами 4, 6 и gpu_c. Также задаём параметры выполнения в угловых скобках &#8212; количество блоков и количество потоков в блоке (нам пока достаточно одного потока в одном блоке).

Функция add получает параметры 4, 6 и gpu_c. Выполняется она именно на видеокарте, и забегая вперёд скажем что пример не очень правилен &#8212; потому что параметры 4 и 6 будут захардкожены внутрь функции add ещё на этапе компиляции. По-честному нужно формировать объекты в памяти компьютера, потом копировать эти объекты в память видеокарты и передавать функции add указатели на них.

После выполнения функции копируем результат, лежащий по адресу gpu\_c, из видеопамяти в память компьютера, по адресу  &cpu\_c. Выводим результат на экран и освобождаем занятую память видеокарты. Теперь сделаем более честно, с копированием в ГПУ и обратно.

<pre><code class="cpp">using namespace std;

__global__ void add(const int *a, const int *b, int *c)
{
	*c = *a * *b;
}

int main(void)
{
	int size = sizeof(int);
	int cpu_a = 4; int *gpu_a; cudaMalloc((void**)&gpu_a, size);
	int cpu_b = 6; int *gpu_b; cudaMalloc((void**)&gpu_b, size);
	int cpu_c = 0; int *gpu_c; cudaMalloc((void**)&gpu_c, size);

	cudaMemcpy(gpu_a, &cpu_a, size, cudaMemcpyHostToDevice);
	cudaMemcpy(gpu_b, &cpu_b, size, cudaMemcpyHostToDevice);
	add&lt;&lt;&lt;1, 1&gt;&gt;&gt;(gpu_a, gpu_b, gpu_c);
	cudaMemcpy(&cpu_c, gpu_c, size, cudaMemcpyDeviceToHost);

	printf("%d * %d = %dn", cpu_a, cpu_b, cpu_c);
	cudaFree(gpu_a);
	cudaFree(gpu_b);
	cudaFree(gpu_c);
	scanf("");
}</code></pre>

Всё понятно &#8212; по такому же принципу создаём cpu\_a и cpu\_b, потом gpu\_a и gpu\_b и отводим под них память в видеокарте. Копируем их содержимое в видеокарту, выполняем расчёт (в расчётную функцию теперь передаём адреса) и копируем результат в процессор.

Обратите внимание на последний аргумент функции cudaMemcpy &#8212; направление переноса. Дальше всё как раньше, выводим и освобождаем память.

## 2. Произведение векторов

Супер, пойдём расширяться &#8212; применим, наконец, главную фишку CUDA, массивную параллельность. Кстати, в предыдущих примерах сам расчёт занимал 29 микросекунд &#8212; очень медленно, CPU вычисляет гораздо быстрее. Но параллельность скоро проявит себя во всей красе. Найдём одновременно сотню произведений!

<pre><code class="cpp">using namespace std;

__global__ void add(const int *a, const int *b, int *c)
{
	int i = threadIdx.x;
	c[i] = a[i] * *b;
}

int main(void)
{
	int count = 100;
	int size = sizeof(int) * count;
	int *cpu_a = (int *)malloc(size);	int *gpu_a; cudaMalloc((void**)&gpu_a, size);
	int  cpu_b = 5;						int *gpu_b; cudaMalloc((void**)&gpu_b, sizeof(int));
	int *cpu_c = (int *)malloc(size);	int *gpu_c; cudaMalloc((void**)&gpu_c, size);

	for(int i=0; i&lt;count; i++) cpu_a[i]=i;

	cudaMemcpy(gpu_a,  cpu_a, size,			cudaMemcpyHostToDevice);
	cudaMemcpy(gpu_b, &cpu_b, sizeof(int),	cudaMemcpyHostToDevice);

	add&lt;&lt;&lt;1, count&gt;&gt;&gt;(gpu_a, gpu_b, gpu_c);

	cudaMemcpy(cpu_c, gpu_c, size, cudaMemcpyDeviceToHost);

	for(int i=0; i&lt;count; i++)
		printf("%d * %d = %dn", cpu_a[i], cpu_b, cpu_c[i]);
	free(cpu_a);	cudaFree(gpu_a);
					cudaFree(gpu_b);
	free(cpu_c);	cudaFree(gpu_c);
	scanf("");
}
</code></pre>

Основное нововведение здесь &#8212; передача в функцию add количества потоков, равного 100. А в функции add, соответственно, нужно как-то различать элементы массива, и мы обращаемся к отдельным элементам по индексу `threadIdx.x. `Здесь нужно сделать отступление про зарезервированные переменные. А самое классное то, что вычисление 100 произведений заняло те же 29 микросекунд!

## 3. Произведение вектора и столбца

Пойдём ещё дальше, в двумерные массивы. Сделаем таблицу умножения от 1 до 10.

<pre><code class="cpp">using namespace std;

__global__ void add(const int *a, const int *b, int *c)
{
	int i = threadIdx.x;
	int j = blockIdx.x;
	int k = blockDim.x * j + i;
	c[k] = a[i] * b[j];
}

int main(void)
{
	int count = 10;
	int size = sizeof(int) * count;
	int *cpu_a = (int *)malloc(size);			int *gpu_a; cudaMalloc((void**)&gpu_a, size);
	int *cpu_b = (int *)malloc(size);			int *gpu_b; cudaMalloc((void**)&gpu_b, size);
	int *cpu_c = (int *)malloc(size * count);	int *gpu_c; cudaMalloc((void**)&gpu_c, size * count);

	for(int i=0; i&lt;count; i++) cpu_a[i]=i+1;
	for(int i=0; i&lt;count; i++) cpu_b[i]=i+1;

	cudaMemcpy(gpu_a, cpu_a, size, cudaMemcpyHostToDevice);
	cudaMemcpy(gpu_b, cpu_b, size, cudaMemcpyHostToDevice);

	add&lt;&lt;&lt;count+1, count&gt;&gt;&gt;(gpu_a, gpu_b, gpu_c);

	cudaMemcpy(cpu_c, gpu_c, size * count, cudaMemcpyDeviceToHost);
	printf("   ");
	for(int j=0; j&lt;count; j++)
		printf("|%3d ", cpu_b[j]);
	printf("n-----------------------------------------------------n");
	for(int i=0; i&lt;count; i++) {
		printf("%2d ", cpu_a[i]);
		for(int j=0; j&lt;count; j++)
			printf("|%3d ", cpu_c[i*count+j]);
		printf("n");
	}
	free(cpu_a);	cudaFree(gpu_a);
	free(cpu_b);	cudaFree(gpu_b);
	free(cpu_c);	cudaFree(gpu_c);
	cudaDeviceReset();
	scanf("");
}</code></pre>

Код выведет вам симпатичную таблицу произведений.

<img class="alignnone" alt="Таблица произведений чисел на CUDA" src="http://static.catethysis.ru/files/cuda_mul_table.png" width="660" height="342" />

Стоит ли говорить, что вычисляется она за те же 20-30 микросекунд? Кстати, вот код микросекундомера:

<pre><code class="cpp">#include "windows.h"

inline long long gettimeus()
{
    static LARGE_INTEGER ClockPerSecond = { 0 };
    if( ClockPerSecond.QuadPart == 0 ) QueryPerformanceFrequency( &ClockPerSecond );
    LARGE_INTEGER li;
    QueryPerformanceCounter( &li );
    return li.QuadPart * 1000000LL / ClockPerSecond.QuadPart;
}

// Использование:
long long tm = -gettimeus();
/*
* Исследуемая функция
*/
tm += gettimeus();
</code></pre>

Говорим спасибо товарищу <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://unixforum.org/index.php?showtopic=104834&view=findpost&p=979036" >NickLion</a>.

Разберём код. Принципиально нового здесь тоже ничего нет, разве что наконец-то мы выйдем за пределы одного блока (на самом деле никакой необходимости в этом не было, смотрите следующую главу). Создаём 10 блоков по 10 потоков на блок, засовываем массивы множителей в память видеокарты (и они попадают в кеш), и указываем функции add способ адресации этих массивов.

В данном примере номер элемента в массиве A будет соответствовать номеру потока в блоке, а <..> в массиве B <..> номеру блока. Конечно, мы могли назначить и любое другое соответствие, важно только потом правильно (обратным соответствием) вытащить нужные элементы из cpu_c. В том числе, мы вполне могли остаться и в одном блоке, и использовать плоский массив C.

## Масштабируемость

Есть ли предел распараллеливанию? Есть, и это 1024 потока на блок, и 65536 блоков на процессор в случае GTX650 (подробнее в следующей главе). Да, вы действительно можете посчитать 67 миллионов произведений (или сумм, или чего-то более сложного) за 30 микросекунд <img src="http://catethysis.ru/wp-includes/images/smilies/icon_smile.gif" alt=":)" class="wp-smiley" />

Важно понимать, что оно не вычисляется &#171;друг за другом&#187; или ещё как-то &#8212; именно параллельно. Даже не хочется называть это параллельностью (к тому же HyperThreading знатно опошлил этот термин), потому что это уже выглядит как функциональное программирование &#8212; имеем огромный массив данных, и применяем на этот массив некую общую операцию, которая &#171;под капотом&#187; выполнится над каждым элементом.

## Информация о видеокарте

Пока мы не знаем, сколько на самом деле потоков можно запустить&#8230; да и вообще, эти примеры скорее напоминали поведение слепого котёнка. Давайте получим от видеокарты информацию об её возможностях и разберёмся, что они нам дают. Для получения информации применяется функция cudaGetDeviceProperties. Выведем на экран все сообщаемые ей константы.

<pre><code class="cpp">cudaDeviceProp deviceProp;
cudaGetDeviceProperties(&deviceProp, 0);
printf("Device name: %sn", deviceProp.name);
printf("Total global memory: %dn", deviceProp.totalGlobalMem);
printf("Shared memory per block: %dn", deviceProp.sharedMemPerBlock);
printf("Registers per block: %dn", deviceProp.regsPerBlock);
printf("Warp size: %dn", deviceProp.warpSize);
printf("Memory pitch: %dn", deviceProp.memPitch);
printf("Max threads per block: %dn", deviceProp.maxThreadsPerBlock);

printf("Max threads dimensions: x = %d, y = %d, z = %dn",
	deviceProp.maxThreadsDim[0],
	deviceProp.maxThreadsDim[1],
	deviceProp.maxThreadsDim[2]);

printf("Max grid size: x = %d, y = %d, z = %dn",
	deviceProp.maxGridSize[0],
	deviceProp.maxGridSize[1],
	deviceProp.maxGridSize[2]);

printf("Clock rate: %dn", deviceProp.clockRate);
printf("Total constant memory: %dn", deviceProp.totalConstMem);
printf("Compute capability: %d.%dn", deviceProp.major, deviceProp.minor);
printf("Texture alignment: %dn", deviceProp.textureAlignment);
printf("Device overlap: %dn", deviceProp.deviceOverlap);
printf("Multiprocessor count: %dn", deviceProp.multiProcessorCount);

printf("Kernel execution timeout enabled: %sn",
	deviceProp.kernelExecTimeoutEnabled ? "true" : "false");
scanf("");</code></pre>

<img class="alignnone" alt="Свойства видеокарты, полученные с помощью cudaGetDeviceProperties" src="http://static.catethysis.ru/files/cuda_device_prop.png" width="660" height="342" />

Здесь нас интересуют параметры Max threads dimensions, Max grid size и Multiprocessor count.

## Обмен ОЗУ ↔ видеопамять

Зачастую узким местом является передача из ОЗУ в видеопамять и обратно. Предыдущий пример с таблицей произведений показывает по 60 мкс на передачу каждого массива в видеопамять, 19 мкс на вычисления и 130 мкс на получение массива обратно из видеопамяти. Многовато, не находите?

## 4. Заполнение массива в видеопамяти

Но почему бы не заполнять исходные массивы не в ОЗУ, а прямо в видеопамяти? Модифицируем предыдущий пример таким образом:

<pre><code class="cpp">__global__ void fill(int *a, int *b)
{
	int i = threadIdx.x;
	a[i] = i + 1;
	b[i] = i + 1;
}

__global__ void add(const int *a, const int *b, int *c)
{
	int i = threadIdx.x;
	int j = blockIdx.x;
	int k = blockDim.x * j + i;
	c[k] = a[i] * b[j];
}

int main(void)
{
	int count = 10;
	int size = sizeof(int) * count;
	int *cpu_a = (int *)malloc(size);			int *gpu_a; cudaMalloc((void**)&gpu_a, size);
	int *cpu_b = (int *)malloc(size);			int *gpu_b; cudaMalloc((void**)&gpu_b, size);
	int *cpu_c = (int *)malloc(size * count);	int *gpu_c; cudaMalloc((void**)&gpu_c, size * count);

	fill&lt;&lt;&lt;1, count&gt;&gt;&gt;(gpu_a, gpu_b);
	add&lt;&lt;&lt;count, count&gt;&gt;&gt;(gpu_a, gpu_b, gpu_c);

	cudaMemcpy(cpu_a, gpu_a, size, cudaMemcpyDeviceToHost);
	cudaMemcpy(cpu_b, gpu_b, size, cudaMemcpyDeviceToHost);
	cudaMemcpy(cpu_c, gpu_c, size * count, cudaMemcpyDeviceToHost);

	printf("   ");
	for(int j=0; j&lt;count; j++)
		printf("|%3d ", cpu_b[j]);
	printf("n-----------------------------------------------------n");
	for(int i=0; i&lt;count; i++) {
		printf("%2d ", cpu_a[i]);
		for(int j=0; j&lt;count; j++)
			printf("|%3d ", cpu_c[i*count+j]);
		printf("n");
	}
	printf("n%lld us. %lld us. %lld us.n", tm2, tm, tm3);
	free(cpu_a);	cudaFree(gpu_a);
	free(cpu_b);	cudaFree(gpu_b);
	free(cpu_c);	cudaFree(gpu_c);
	cudaDeviceReset();
}
</code></pre>

В таком варианте заполнение массива занимает 29 мкс, вычисление 9 мкс (видимо, за счёт кеширования), а копирование всех трёх массивов в ОЗУ &#8212; 200 мкс. Тут мы попробовали написание двух разных CUDA-функций и запоминание данных между их вызовами в видеопамяти. В очевидной оптимизации (избавление от массивов A и B) соответствующие тайминги упадут до 20 / 120 мкс.

Общий принцип, которым стоит руководствоваться &#8212; общение с ОЗУ должно быть сведено к минимуму. Например, максимум данных генерировать и хранить внутри видеокарты. Совершать внутри видеокарты не только map, но и reduce &#8212; т.е. выводить наружу не весь массив, а необходимую выжимку из него.

В статье про [скорость видеопамяти](http://catethysis.ru/index.php/%d0%ba%d0%be%d0%bf%d0%b8%d1%80%d0%be%d0%b2%d0%b0%d0%bd%d0%b8%d0%b5-%d0%b4%d0%b0%d0%bd%d0%bd%d1%8b%d1%85-gpu-cpu/ "Копирование данных GPU  CPU") написано подробнее, и приведены результаты тестов.

## 5. Произведение матриц

<pre><code class="cpp">__global__ void mul(const int *a, const int *b, int *c, const int n, const int ay)
{
	int k, s=0;
	for(k=0; k&lt;n; k++) s+=a[k + blockIdx.x * n] * b[threadIdx.x + k * ay];
	c[blockDim.x * blockIdx.x + threadIdx.x] = s;
}

int main(void)
{
	int ax = 3, ay = 2;
	int bx = 2, by = 3;
	int *cpu_a = (int *)malloc(ax*ay);	int *gpu_a; cudaMalloc((void**)&gpu_a, ax*ay*sizeof(int));
	int *cpu_b = (int *)malloc(bx*by);	int *gpu_b; cudaMalloc((void**)&gpu_b, bx*by*sizeof(int));
	int *cpu_c = (int *)malloc(bx*ay);	int *gpu_c; cudaMalloc((void**)&gpu_c, bx*ay*sizeof(int));

	cpu_a[0 + ax * 0] = 2;
	cpu_a[1 + ax * 0] = 5;
	cpu_a[2 + ax * 0] = 1;
	cpu_a[0 + ax * 1] = 3;
	cpu_a[1 + ax * 1] = 4;
	cpu_a[2 + ax * 1] = 0;

	cpu_b[0 + bx * 0] = 6;
	cpu_b[1 + bx * 0] = 2;
	cpu_b[0 + bx * 1] = 5;
	cpu_b[1 + bx * 1] = 3;
	cpu_b[0 + bx * 2] = 1;
	cpu_b[1 + bx * 2] = 8;

	cudaMemcpy(gpu_a, cpu_a, ax*ay*sizeof(int), cudaMemcpyHostToDevice);
	cudaMemcpy(gpu_b, cpu_b, bx*by*sizeof(int), cudaMemcpyHostToDevice);

	mul&lt;&lt;&lt;bx, ay&gt;&gt;&gt;(gpu_a, gpu_b, gpu_c, ax, ay);

	cudaMemcpy(cpu_c, gpu_c, bx*ay*sizeof(int), cudaMemcpyDeviceToHost);

	for(int y=0; y&lt;bx*ay; y++) printf("%dn", cpu_c[y]);

	free(cpu_a);	cudaFree(gpu_a);
	free(cpu_b);	cudaFree(gpu_b);
	free(cpu_c);	cudaFree(gpu_c);
	cudaDeviceReset();
}</code></pre>

Функция CUDA теперь сложнее предыдущих &#8212; в ней есть цикл. Вообще говоря, от цикла можно избавиться, и выполнять сначала вычисление всевозможных произведений элементов, а потом в другой функции &#8212; сложение всего полученного.

Прочитайте также про реализацию [аудио-кроссовера на CUDA](http://catethysis.ru/index.php/%d0%ba%d0%b8%d1%85-%d1%84%d0%b8%d0%bb%d1%8c%d1%82%d1%80-%d0%bd%d0%b0-cuda/ "Аудио–кроссовер на CUDA (черех КИХ–фильтры)").