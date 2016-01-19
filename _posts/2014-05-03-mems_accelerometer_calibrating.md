---
id: 1369
title: Обработка данных MEMS-акселерометра
date: 2014-05-03T16:58:46+00:00
author: catethysis
layout: post
guid: http://catethysis.ru/?p=1369
permalink: /mems_accelerometer_calibrating/
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
  - 2726423049
categories:
  - Квадрокоптер
tags:
  - датчики
  - квадрокоптер
---
<img class="alignnone" src="http://static.catethysis.ru/files/MEMS_g_plot_small.png" alt="" width="747" height="737" />

MEMS-акселерометры &#8212; очень дешёвые устройства, но к сожалению они имеют сравнительно высокий шум, а также теряют калибровку по осям. Поэтому принятый сигнал нужно обработать &#8212; профильтровать и привести к стандартным осям. Аппноут <a target="_blank" rel="nofollow" href="http://catethysis.ru/goto/http://static.catethysis.ru/files/AN3192.pdf" >AN3192</a> на датчик LSM303DLH рассказывает о хорошем методе калибровки &#8212; провести измерения известных ускорений по осям и вычислить коррекционную матрицу. Реализуем этот алгоритм на языке R!

<!--more-->

## Измерения

Всё, что нам нужно сделать &#8212; поставить плату в разные положения (пузом вверх, пузом вниз, ну и так же для двух остальных осей) и измерить все три ускорения в течение 5-10 секунд. Я проводил по 300 измерений в каждом положении. Таким образом мы получили &#171;наблюдаемые значения&#187; (кстати, это терминология из фильтра Калмана, который ещё впереди). Они довольно шумные, но самое главное что они в &#171;неправильной&#187; системе координат. Почему она неправильная? Потому что каждый датчик имеет:

  * ненулевое смещение: меряем &#171;0&#187; &#8212; а он выдает не &#171;0&#187;
  * неединичный масштаб: к примеру, измерили 0 и 1 м/с2 &#8212; а разница между выданными значениями не равна 1.

Важнее даже не равенство масштаба единице, а разный масштаб по разным осям. Куча факторов влияет на эти отклонения &#8212; температура, удары, старение, просто случайное отклонение, напряжение питания. Устранить их очень сложно, гораздо проще измерить их влияние и скомпенсировать его. Если мы сейчас возьмём датчик и будем им крутить в воздухе &#8212; все значения лягут на эллипсоид. Смещение значений датчика даст сдвиг эллипсоида по осям, а разный масштаб приведёт к разным длинам полуосей эллипсоида. Но самое поганое &#8212; датчик может быть установлен на плату не точно горизонтально, и тогда эллипсоид будет ещё и повёрнут.

## Теория

Вряд ли есть необходимость в сильном углублении в теорию, скажу лишь что нам необходимо вычислить коррекционную матрицу вида

<img class="alignnone" src="http://static.catethysis.ru/files/MEMS_corr_matrix.png" alt="" />

в которой диагональ (ACC\_11, ACC\_22, ACC\_33) показывает масштаб по трём осям, нижняя строка (ACC\_10, ACC\_20, ACC\_30) показывает сдвиг по осям, а остальные значения компенсируют неточность пайки датчика (поворот эллипсоида вокруг осей). Сделать это проще всего с помощью метода наименьших квадратов, который сводится к простой формуле:

<img class="alignnone" src="http://static.catethysis.ru/files/MEMS_corr_calc.png" alt="" />

Мда, без вывода эта формула смотрится просто магически. Суть метода &#8212; подбор таких коррекционных значений, которые сводят к минимуму сумму квадратов отклонений всех <span style="text-decoration: underline;">экспериментальных</span> точек от <span style="text-decoration: underline;">теоретических</span>. Матрица w &#8212; это реальные значения, к которым мы стремимся. К примеру, в положении &#171;пузом вверх&#187; это [0, 0, 1].

## Калибровка

Итак, я подготовил скрипт на R, который сначала получает данные &#171;известных&#187; ускорений. len &#8212; количество точек в калибровочных измерениях, acquire &#8212; функция забирания данных с COM-порта, она принимает название (номер) порта.

<pre>len=300;
calib=array(0, c(3, 3, len, 6))
acquire=function(com, len, transp) { temp=array(as.double(scan(file = com, n = 9*len, quiet = "true", skip = 1)), c(3, 3, len)); if(transp) { for(i in 1:len) temp[,,i]=t(temp[,,i]) }; return(temp); }</pre>

Нужно последовательно собрать данные в 6 положениях платы:

  1. Пузом вверх
  2. Пузом вниз
  3. Боком (на котором разъём SWD) вверх (юзерский USB около стола)
  4. Боком вниз (т.е. разъём SWD около стола)
  5. Низом (там, где компас со светодиодами) вверх
  6. Низом вниз

В каждом положении выполняйте соответствующую строчку из этого списка:

<pre>calib[,,,1]=acquire(4, len, TRUE)
calib[,,,2]=acquire(4, len, TRUE)
calib[,,,3]=acquire(4, len, TRUE)
calib[,,,4]=acquire(4, len, TRUE)
calib[,,,5]=acquire(4, len, TRUE)
calib[,,,6]=acquire(4, len, TRUE)</pre>

Калибровочные данные готовы. По ним проводится расчёт матрицы X, и она выводится в консоль.

<pre>w=rbind(t(rbind(calib[3,,,1],1)), t(rbind(calib[3,,,2],1)), t(rbind(calib[3,,,3],1)), t(rbind(calib[3,,,4],1)), t(rbind(calib[3,,,5],1)), t(rbind(calib[3,,,6],1)))
y=rbind(t(array(c(0,0,1), c(3,len))), t(array(c(0,0,-1), c(3,len))), t(array(c(0,1,0), c(3,len))), t(array(c(0,-1,0), c(3,len))), t(array(c(1,0,0), c(3,len))), t(array(c(-1,0,0), c(3,len))));
x=solve(t(w)%*%w)%*%t(w)%*%y</pre>

В моём случае получилась такая коррекционная матрица:

<pre>&gt; x
         [,1]           [,2]           [,3]
[1,]  9.681204e-04   6.032174e-06  -3.443519e-06
[2,]  1.435535e-05  -9.796286e-04   1.303020e-05
[3,] -8.583223e-06  -1.976647e-06   9.610175e-04
[4,]  9.075191e-03  -1.673895e-02   5.152653e-02</pre>

## Использование

Откалибровав датчик, вы можете использовать матрицу x для коррекции данных акселерометра &#8212; просто допишите к пришедшему вектору 1 и умножьте его на x. Точно так же можно умножить несколько векторов &#8212; составьте из них матрицу (с &#171;1&#187; в 4 столбце), умножьте её на x и получите матрицу с корректными векторами. Однако, калибровка будет очень точна только ближайшие полчаса. Потом она будет просто точна. Теперь, для проверки, нужно собрать данные реального эксперимента &#8212; покрутите плату в руках, как можно равномернее и без ускорений.

<pre>len_exp=3000;
data=acquire(4, len_exp, TRUE)</pre>

Можно увеличить количество измерений, я использовал 30 тысяч, но это довольно долго и мучительно. Также я провожу очистку данных от выбросов (критерий 3*sigma)

<pre>data3_clean=array(0, c(3,3,len_exp));
acc1=cbind(t(data3[3,,]), 1)%*%x; r=acc1[,1]^2+acc1[,2]^2+acc1[,3]^2; mean(r); sd(r)/(len^0.5)/mean(r)*100; mean=mean(r); sd=sd(r); j=0; for(i in 1:len_exp) if(abs(r[i]-mean)&lt;3*sd) {j=j+1; data3_clean[,,j]=data3[,,i]}; j; data3_clean=array(data3_clean, c(3,3,j)); acc=cbind(t(data3_clean[3,,]), 1)%*%x library(rgl) plot3d(acc[,1], acc[,2], acc[,3], col="red", size=3, type="l", lwd=1)</pre>

Нужна библиотека rgl, её можно взять в CRAN. В результате отобразится картина вектора g. У меня получилась такая мохнатая штука:

#### Перед калибровкой

[<img class="alignnone size-full wp-image-1377" src="http://catethysis.ru/wp-content/uploads/2014/05/MEMS_raw_g.png" alt="MEMS_raw_g" width="776" height="748" />](http://catethysis.ru/wp-content/uploads/2014/05/MEMS_raw_g.png)

#### После калибровки

<img class="alignnone" src="http://static.catethysis.ru/files/MEMS_g_plot.png" alt="" width="747" height="737" />

А ещё вы увидите среднее значение длины вектора (в моём случае &#8212; 1.006 &#8212; очень близко к 1) и среднего отклонения в процентах (у меня &#8212; 0.7%, это прекрасное значение для эксперимента &#171;на коленках&#187;). Ещё раз, весь скрипт:

<pre>len=300;
calib=array(0, c(3, 3, len, 6))
calib[,,,1]=acquire(4, len, TRUE)
calib[,,,2]=acquire(4, len, TRUE)
calib[,,,3]=acquire(4, len, TRUE)
calib[,,,4]=acquire(4, len, TRUE)
calib[,,,5]=acquire(4, len, TRUE)
calib[,,,6]=acquire(4, len, TRUE)
w=rbind(t(rbind(calib[3,,,1],1)), t(rbind(calib[3,,,2],1)), t(rbind(calib[3,,,3],1)), t(rbind(calib[3,,,4],1)), t(rbind(calib[3,,,5],1)), t(rbind(calib[3,,,6],1)))
y=rbind(t(array(c(0,0,1), c(3,len))), t(array(c(0,0,-1), c(3,len))), t(array(c(0,1,0), c(3,len))), t(array(c(0,-1,0), c(3,len))), t(array(c(1,0,0), c(3,len))), t(array(c(-1,0,0), c(3,len))))
x=solve(t(w)%*%w)%*%t(w)%*%y


len_exp=3000
data2_clean=array(0, c(3, 3, len_exp))
acc1=cbind(t(data2[3,,]), 1)%*%x
r=acc1[,1]^2+acc1[,2]^2+acc1[,3]^2
mean(r)
sd(r)/(len^0.5)/mean(r)*100
mean=mean(r)
sd=sd(r)
j=0
# убираем выбросы
for(i in 1:len_exp) if(abs(r[i]-mean)&lt;3*sd) {j=j+1; data2_clean[,,j]=data2[,,i]}
data2_clean=array(data2_clean, c(3,3,j))
acc=cbind(t(data2_clean[3,,]), 1)%*%x
plot3d(acc[,1], acc[,2], acc[,3], col="red", size=3, type="l", lwd=1)</pre>

Мы не делали фильтрацию, это и не было нашей задачей. Здесь мы только устраняли систематическую погрешность, а случайную погрешность будет устранять фильтр Калмана на следующем шаге.

**Статьи цикла:
  
** 1. [Начинаем проект квадрокоптера](http://catethysis.ru/quadrocopter_intro/ "Начинаем проект квадрокоптера")
  
2. [Выбор деталей](http://catethysis.ru/multicopter_parts_choose/ "Выбор деталей квадрокоптера")
  
3. [Заказ деталей на Hobbyking.com](http://catethysis.ru/multicopter_parts_order_hobbyking/ "Заказ деталей для квадрокоптера на Hobbyking.com")
  
4. [Управление положением квадрокоптера](http://catethysis.ru/quadrotor_position_control/ "Управление положением квадрокоптера")
  
5. [Получение данных с MEMS-акселерометра](http://catethysis.ru/%d0%b8%d0%bd%d0%b5%d1%80%d1%86%d0%b8%d0%b0%d0%bb%d1%8c%d0%bd%d1%8b%d0%b9-%d0%b4%d0%b0%d1%82%d1%87%d0%b8%d0%ba-%d1%81-usb-%d0%b8%d0%bd%d1%82%d0%b5%d1%80%d1%84%d0%b5%d0%b9%d1%81%d0%be%d0%bc/ "Инерциальный датчик с USB–интерфейсом")
  
6. Калибровка и обработка сигнала MEMS-акселерометра