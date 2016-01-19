---
id: 2680
title: Разбор .svd-файлов из IAR (описания регистров STM32)
date: 2015-09-12T02:57:59+00:00
author: Catethysis
layout: post
guid: http://catethysis.ru/?p=2680
permalink: /iar_svd_files/
wp_noextrenallinks_mask_links:
  - 0
ratings_users:
  - 1
ratings_score:
  - 5
ratings_average:
  - 5
dsq_thread_id:
  - 4124053229
categories:
  - Node.js
  - STM32
---
Для одной задумки с битбэндингом мне потребовался полный список регистров всех модулей STM32. Моя старшая сестра (лень вперёд меня родилась) запретила мне рыскать по даташитам на все контроллеры и выписывать данные о регистрах, поэтому в IARе нашлись файлы вида stm32f100xx.svd.

Это xml-файл с кучей инфы про модули STM: модули, их регистры, начальные значения и отдельные биты регистров, прерывания. Про каждую сущность есть сводка, например каждый модуль имеет название, описание и стартовый адрес.
  
Для регистров и битов тоже есть название, описание и смещение относительно базового адреса.
  
Прерывания &#8212; название, описание и номер.

Инфы много, она полезная, и можно не парсить даташиты. Будем парсить этот файл &#8212; перетащим его в js, оставим только нужные данные, и превратим относительные адреса в абсолютные.

<!--more-->

Используем модуль fs для доступа к файлам и xml2js для импорта xml.

<pre><code class="javascript">var fs = require('fs');

fs.readFile(__dirname + '/STM32F100xx.svd', function(err, data) {
  (new require('xml2js').Parser()).parseString(data, function (err, result) {
    _mod = {};
    result.device.peripherals[0].peripheral.forEach(function(elem) {
      if(elem.$) {
        base = _mod[elem.$.derivedFrom];
        for(i in base) if(!elem[i]) elem[i] = JSON.parse(JSON.stringify(base[i]));
        delete elem.$;
      }
      elem.description[0] = elem.description[0].replace(/[\r\n]/g, '').replace(/[ ]+/g, ' ');
      _mod[elem.name[0]] = elem;
      delete elem.name;
    });
    modules = _mod;

    groups = {};
    for(module_name in modules) {
      module = modules[module_name];
      (function(baseAddress) { module.registers[0].register.map(function(elem) {
        elem.address = '0x' + (1 * elem.addressOffset[0] + baseAddress).toString(16);
      })})(1 * module.baseAddress[0]);
      if(!groups[module.groupName]) groups[module.groupName] = {};
      groups[module.groupName][module_name] = module;
    }

    modules_groups = {};
    for(group_name in groups) {
      modules_groups[group_name] = [];
      for(module_name in groups[group_name])
        modules_groups[group_name].push({name: module_name, desc: groups[group_name][module_name].description[0].replace(/[\r\n]/g, '').replace(/[ ]+/g, ' ')});
    }

    registers = {};
    for(module_name in modules) {
      module = modules[module_name];
      registers[module_name] = [];
      module.registers[0].register.forEach(function(register) {
        regs = {};
        ['name', 'description', 'address', 'fields'].forEach(function(elem) {
          regs[elem] = register[elem];
        });
        regs.description = register.description[0].replace(/[\r\n]/g, '').replace(/[ ]+/g, ' ');
        regs.fields = register.fields[0].field.forEach(function(field){field.desc=field.description[0].replace(/[\r\n]/g,'').replace(/[ ]+/g, ' '); });
        registers[module_name].push(regs);
      });
    }
  });
});</code></pre>

После разбора файла можно сохранить массивы modules и registers в файлы, либо использовать как-то ещё.