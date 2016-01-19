---
id: 2553
title: Калькуляторы
date: 2015-09-10T02:16:27+00:00
author: Catethysis
layout: page
guid: http://catethysis.ru/?page_id=2553
wp_noextrenallinks_mask_links:
  - 0
ratings_users:
  - 0
ratings_score:
  - 0
ratings_average:
  - 0
---
<div id="bitbanding">
  <h2>
    BitBanding
  </h2>
  
  <p>
    Виртуальные регистры для доступа к отдельным битам реальных регистров. Подробное описание &#8212; в статье про <a title="BitBanding в ARM Cortex — доступ к битам регистров" href="http://catethysis.ru/bitbanding_arm_cortex/">битбэндинг на ARM</a>.
  </p>
  
  <div id="input_reg" class="bitbanding_fields">
    Регистр<br /> <input id="bb_input_reg" maxlength="10" size="12" type="text" value="0x40020300" onkeyup="bb_forward()" />
  </div>
  
  <div id="input_bit" class="bitbanding_fields">
    Бит<br /> <input id="bb_input_bit" maxlength="2" size="2" type="text" value="0" onkeyup="bb_forward()" />
  </div>
  
  <div id="bb_arrow" class="bitbanding_fields">
    →
  </div>
  
  <div id="output_reg" class="bitbanding_fields">
    BitBand регистр<br /> <input id="bb_output_reg" maxlength="10" size="12" type="text" value="0x42406000" />
  </div>
  
  <pre><code id="bitbanding_code" class="cpp">*(uint32_t*)0x42406000 = 1; //bit set
*(uint32_t*)0x42406000 = 0; //bit reset</code></pre>
</div>



## Генератор массива из бинарного файла — bin2h online

Описание генератора — в статье про [вставку файлов в прошивку](http://catethysis.ru/inserting_files_to_firmware/ "Вставка файлов в прошивку"). Готовый файл (header) скачивайте по ссылке, выделенной жирным.
  



<input type="file" id="converter_selector" onchange="handleFileSelect(event)" /> 

<div id="converter_div">
  <div id="converter_result">
    <b><a id="converter_result_file" download="data.h">Скачать файл</a></b><br /> <span id="converter_input_file_size"></span><br /> <span id="converter_result_file_size"></span>
  </div>
  
  <div id="converter_params_width">
    <b>Ширина данных</b><br /> <input type="radio" name="converter_width" group="converter_width" class="converter_width" disabled id="converter_width_byte" value="8" checked="true" onchange="processData()" />1 байт<br /> <input type="radio" name="converter_width" group="converter_width" class="converter_width" disabled id="converter_width_2byte" value="16" onchange="processData()" />2 байта<br /> <input type="radio" name="converter_width" group="converter_width" class="converter_width" disabled id="converter_width_4byte" value="32" onchange="processData()" />4 байта
  </div>
  
  <div id="converter_params_endianness">
    <b>Направление</b><br /> <input type="radio" name="converter_endianness" group="converter_endianness" class="converter_endianness" disabled id="converter_endianness_msb" value="0" checked="true" onchange="processData()" />MSB сначала<br /> <input type="radio" name="converter_endianness" group="converter_endianness" class="converter_endianness" disabled id="converter_endianness_lsb" value="1" onchange="processData()" />LSB сначала
  </div>
  
  <div id="converter_params_misc">
    <b>Другие опции</b><br /> <input type="checkbox" name="converter_minimize" class="converter_minimize" disabled id="converter_minimize" value="1" onchange="processData()" />Минимизировать<br /> <input type="checkbox" name="converter_uint" class="converter_uint" disabled id="converter_uint" value="1" onchange="processData()" />stdint
  </div>
</div>

<div>
  <textarea id="converter_text" rows="8" cols="100" spellcheck="false" autocomplete="off" readonly>Выберите файл.</textarea>
</div>


  


## Анализатор map-файлов

<input type="file" id="converter_selector" onchange="handleMapFileSelect(event)" />

<div id="map_data">
  <h3>
    Занимаемая память
  </h3>
  
  <div id="summary_code_size">
    <div class="summary_label">
      Код во флеше:
    </div>
    
    <div class="summary_data" id="code_size_value">
    </div>
  </div>
  
  <div id="summary_data_size">
    <div class="summary_label">
      Данные во флеше:
    </div>
    
    <div class="summary_data" id="data_size_value">
    </div>
  </div>
  
  <div id="summary_rom_size" >
    <div class="summary_label">
      Данные в ОЗУ:
    </div><div class="summary_data" id= "rom_size_value">
  </div>
</div>

### Самые большие модули (функции и данные)

<div class="charts" id="myChart1">
</div></div>