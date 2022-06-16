// Добавить цвет фона окна сообщений в настройки

// Функции VNDS
var vnds_interpreter = function()
{
	this.is_expand_text = false;      // Флаг расширения при выводе текста - опция @ команды text
	this.prev_text = '';              // Предыдущий (уже выведенный) текст (для опций @ и + команды text)
	this.cur_text = '';               // Текущий (уже выведенный) текст (для опций @ и + команды text)
	this.is_load_game = false;        // Флаг, была ли выполнена загрузка сохранённой игры или нет (для опций @ и + команды text)
	this.sound_timeout;               // Переменная для хранения идентификатора таймаута воспроизведения звука
	this.sfx_timeout;                 // Переменная для хранения идентификатора таймаута воспроизведения звукового эффекта
	this.text_timeout;                // Переменная для хранения идентификатора таймаута вывода текста
	this.text_interval;               // Переменная для хранения идентификатора интервала вывода текста
	this.relay_interval;              // Переменная для хранения идентификатора интервала цикличного вывода изображений
	this.delay_timeout;               // Переменная для хранения идентификатора таймаута команды delay
	this.pause_interval;              // Переменная для хранения идентификатора интервала задержки
	this.music_interval;              // Переменная для хранения идентификатора интервала музыки
	this.is_first_check_jump = false; // Признак первого перехода после начала действия команды check
	this.is_pause = false;            // На паузе ли игра (вызвано меню, например)

	this.init = function()
	{
		this.game =
		{
			dir: null,                    // Путь к директории с файлами игры
			full_name: null,              // Полное наименование игры, взятое из файла info.txt (title)
			short_name: null,             // Короткое наименование игры, взятое из названия директории игры
			resolution:                   // Разрешение игры, взятое из файла img.ini
			{
				width: null,                // ширина (width)
				height: null,               // высота (height)
				ratio: null                 // отношение высоты к ширине (height / width)
			},
			font: null,                   // Название шрифта для окна сообщений, взятое из файла info.txt (font)
			text_size: null,              // Размер шрифта для окна сообщений, взятый из файла info.txt (text_size)
			line_height: null,            // Высота строки для окна сообщений, взятая из файла info.txt (line_height)
			bg_color: null,               // Цвет фона окна сообщений, взятый из файла info.txt (bg_color)
			icons:                        // Иконки игры, взятые из директории игры
			{
				small: null,                // иконка маленькая (icon)
				big: null                   // иконка большая (icon-high)
			},
			thumbs:                       // Превьюшки игры, взятые из директории игры
			{
				small: null,                // превьюшка для кнопки выбора игры (thumbnail)
				big: null                   // превьюшка для фона меню игры (thumbnail-high)
			},
			local_variables: {},          // Массив локальных переменных
			selected: null,               // Последнее значение переменной selected
			script_name: null,            // Название текущего скрипта
			script_lines: [],             // Список строк текущего скрипта
			script_line_num: null,        // Номер текущей строки скрипта
			sfx:                          // Текущий звуковой эффект
			{
				file: null,                 // имя файла звукового эффекта
				volume: null                // громкость звукового эффекта
			},
			sound:                        // Текущий воспроизводящийся звук
			{
				file: null,                 // имя файла звук
				volume: null                // громкость звук
			},
			music:                        // Текущая воспроизводящаяся музыка
			{
				file: null,                 // имя файла музыки
				volume: null                // громкость музыки
			},
			video: null,                  // Текущее воспроизводящееся видео
			background:                   // Текущий фон
			{
				file: null,                 // имя файла фона или код цвета
				x: null,                    // координата x
				y: null,                    // координата y
				filters: null               // строка фильтров, применённых к фону
			},
			relay:                        // Изображения для цикличного вывода
			{
				files: [],                  // массив имён файлов изображений для цикличного вывода
				delay: null,                // время показа каждого изображения
				speed: null                 // задержка при смене изображений
			},
			sprites:                      // Массив отображающихся в текущий момент спрайтов
			{                             // индекс массива - имя спрайта без расширения
				name: null,                 // идентификатор спрайта
				file: null,                 // имя файла спрайта
				x: null,                    // координата x
				y: null,                    // координата y
				filters: null               // строка фильтров, применённых к спрайту
			},
			animation:                    // Действующая анимация
			{
				name: null,                 // название анимации
				strength: null              // сила анимации
			}
		};
	}

/*====================================================================================================
	Смена цвета фона подложки (это не фон, а то, что под ним)
	bgcolor [код цвета]

	[код цвета] - код цвета в шестнадцатеричной системе счисления, начинается с "#"

  ====================================================================================================*/

	this.bgcolor = function(params, command_name = 'BGCOLOR')
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.resolve('Отсутствуют параметры функции ' + command_name);
			return df.promise();
		}
		let params_list = this.get_params_list(params);
		if ((params_list.length != 1) || (params_list[0].indexOf('#') != 0))
		{
			df.resolve('Неверные параметры функции ' + command_name);
			return df.promise();
		}
		let background = params_list[0];
		$('#info_bg_color').text(background);
		if (!is_hex_color(background))
		{
			df.resolve('Неверное значение цвета в функции ' + command_name + ': ' + background);
			return df.promise();
		}
		let $game_screen = $('#game_screen');
		$('#game_screen').css('background-color', background);
		df.resolve();
		return df.promise();
	}

/* bgc - синоним функции bgcolor */
	this.bgc = function(params)
	{
		let df = this.bgcolor(params, 'BGC');
		return df;
	}


/*====================================================================================================
	Вывод изображения или цвета в качестве фона, с удалением всех спрайтов
	bgload [имя файла или код цвета] [выравнивание X] [выравнивание Y] [эффект] [длительность]
	bgload [имя файла или код цвета] [длительность]

	[имя файла] - имя графического файла в директории "background"

	[код цвета] - код цвета в шестнадцатеричной системе счисления, начинается с "#"

	[эффект] - dissolve (по умолчанию), slide, flip

	[длительность] - без единиц измерения - фреймы, "ms" - миллисекунды, "s" - секунды

	[is_remove_sprites] - удалять или нет имеющиеся спрайты
  ====================================================================================================*/

	this.bgload = function(params, command_name = 'BGLOAD', is_remove_sprites = true)
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.resolve('Отсутствуют параметры функции ' + command_name);
			return df.promise();
		}
		let params_list = this.get_params_list(params);
		if (config.is_check)
			config.is_skip = true;

		let _this = this;
		$.each(params_list, function(key, value)
		{
			params_list[key] = _this.get_var(value);
			if (params_list[key] === false)
				return df.resolve('Неизвестная переменная функции ' + command_name + ': ' + value);
		});
		if (df.state() === 'resolved')
			return df.promise();

		let effect_speed = 0;
		let effect_name;
		let filters_list = ['none', 'brightness', 'blur', 'grayscale', 'saturate', 'sepia', 'invert', 'opacity'];
		let effects_list = ['dissolve', 'slide', 'flip'];
		let background;
		let params_index = 0;

		if (is_image_file(params_list[params_index]) || (is_hex_color(params_list[params_index])))
			background = params_list[params_index++];

		let position_x = ['left', 'right', 'center'];
		let position_y = ['top', 'bottom', 'center'];
		let x = 'center'
		let y = 'center';
		if (params_list.length - params_index >= 2)
		{			
			let param = params_list[params_index].toLowerCase();
			if ((effects_list.indexOf(param) === -1) && (filters_list.indexOf(param) === -1)) // Если осталось больше одного параметра и следующий параметр не эффект и не фильтр, значит следом идут координаты
			{
				x = param;
				if (x.indexOf('px') !== -1)
				{
					x = x.slice(0, -2); // переводим пиксели в проценты
					if ($.isNumeric(x))
						x = x * 100 / this.game.resolution.width;
				}
				else if (x.indexOf('%') !== -1)
					x = x.slice(0, -1); // ничего не переводим - уже проценты
				else if ($.isNumeric(x))
					x = x * 100 / 256; // переводим DS в проценты
				if (!$.isNumeric(x) && (position_x.indexOf(x) === -1))
				{
					df.resolve('Неверные X-координаты в функции ' + command_name + ': ' + x);
					return df.promise();
				}
				params_index++;
				y = params_list[params_index].toLowerCase();
				if (y.indexOf('px') !== -1)
				{
					y = y.slice(0, -2); // переводим пиксели в проценты
					if ($.isNumeric(y))
						y = y * 100 / this.game.resolution.width;
				}
				else if (y.indexOf('%') !== -1)
					y = y.slice(0, -1); // ничего не переводим - уже проценты
				else if ($.isNumeric(y))
					y = y * 100 / 192; // переводим DS в проценты

				if (!$.isNumeric(y) && (position_y.indexOf(y) === -1))
				{
					df.resolve('Неверные Y-координаты в функции ' + command_name + ': ' + y);
					return df.promise();
				}

				if ($.isNumeric(x))
					x += '%';

				if ($.isNumeric(y))
					y += '%';
				params_index++;
			}
		}
		let filters_css = '', filters_str = '';
		while ((params_list.length - params_index > 0) && (filters_list.indexOf(params_list[params_index].toLowerCase()) !== -1))
		{
			let filter_name = params_list[params_index++].toLowerCase();
			filters_str += filter_name + ' ';
			let filter_strength = 50;
			if ((params_list.length - params_index > 0) && (params_list[params_index].indexOf('%') !== -1))
			{
				filter_strength = params_list[params_index].slice(0, -1);
				if ((!$.isNumeric(filter_strength)) || (filter_strength < 0) || (filter_strength > 200))
				{
					df.resolve('Неверное значение силы фильтра в функции ' + command_name + ': ' + params_list[params_index]);
					return df.promise();
				}
				filters_str += params_list[params_index] + ' ';
				params_index++;
			}
			if (filter_name === 'blur')
				filter_strength = Math.ceil(filter_strength / 10) + 'px';
			else
				filter_strength = filter_strength + '%';
			filters_css += filter_name + '(' + filter_strength + ') ';
		}
		if (filters_css === '')
			filters_css = 'none';
		if (params_list.length - params_index > 0)
		{
			param = params_list[params_index].toLowerCase();
			if (effects_list.indexOf(param) !== -1)
			{
				effect_name = param;
				params_index++;
			}
		}
		if (params_list.length - params_index > 0) 
		{
			effect_speed = get_duration(params_list[params_index]);
			if (effect_speed === false)
			{
				df.resolve('Неверное значение длительности эффекта в функции ' + command_name + ': ' + params_list[params_index]);
				return df.promise();
			}
			params_index++;
		}
		if (params_list.length - params_index > 0)
		{
			df.resolve('Неверные параметры функции ' + command_name);
			return df.promise();
		}
		if (config.is_skip)
			effect_speed = 0;
		$('#info_background').text(background);
		if (background !== undefined) // Если имя файла фона определено и отличается от текущего, то создаём фон
		{
			if (background.indexOf('#') === 0) // Если значение параметра фона начинается с "#", то это цвет
			{
				$('#info_bg_color').text(background);
				if (!is_hex_color(background))
					df.resolve('Неверное значение цвета в функции ' + command_name + ': ' + background);
				draw_bg(_this, df,
				{
					file: background,
					x: x,
					y: y,
					filters_css: filters_css,
					filters_str: filters_str
				}, effect_name, effect_speed, is_remove_sprites);
			}
			else // Иначе - файл
			{
				let filename = this.game.dir + '/background/' + escape(background);
				let _this = this;
				$.get(filename)
					.fail(function()
					{
						df.resolve('Файл<br>' + filename + '<br> не найден');
					})
					.done(function()
					{
						draw_bg(_this, df,
						{
							file: background,
							x: x,
							y: y,
							filters_css: filters_css,
							filters_str: filters_str
						}, effect_name, effect_speed, is_remove_sprites);
					});
			}
		}
		else
		{
			if (this.game.background.file === undefined)
			{
				df.resolve('Отсутствует имя файла или цвет фона в функции ' + command_name);
				return df.promise();
			}
			draw_bg(_this, df,
			{
				file: this.game.background.file,
				x: x,
				y: y,
				filters_css: filters_css,
				filters_str: filters_str
			}, effect_name, effect_speed, is_remove_sprites);
		}
		return df.promise();

		function draw_bg(obj, df, background, effect_name, effect_speed, is_remove_sprites)
		{
			if (is_remove_sprites)
			{
				obj.cleartext();
				obj.setimg('~');
			}
			let $game_screen = $('#game_screen');
			let handle = $game_screen.prop('onclick');
			$game_screen.off('click');
			let $background = $('#background');
			$background.css(
			{
				'-webkit-transition': 'none',
				'transition': 'none'
			});
			if (effect_name === 'dissolve')
			{
				$background.stop().fadeOut(effect_speed / 2, function()
				{
					set_background(_this, $(this), background);
					$(this).fadeIn(effect_speed / 2, function()
						{
							if (is_hex_color(background.file))
								$game_screen.css('background-color', background);
							$game_screen.on('click', handle);
							return df.resolve();
						});
				});
			}
			else if (effect_name === 'slide')
			{
				$background.stop().slideUp(effect_speed, function()
				{
					set_background(_this, $(this), background);
					$(this).slideDown(effect_speed, function()
					{
						if (is_hex_color(background.file))
							$game_screen.css('background-color', background);
						$game_screen.on('click', handle);
						return df.resolve();
					});
				});
			}
			else if (effect_name === 'flip')
			{
				$background.stop().animate({'width': 'toggle'}, effect_speed, function()
				{
					set_background(_this, $(this), background);
					$(this).animate({'width': 'toggle'}, effect_speed, function()
					{
						if (is_hex_color(background.file))
							$game_screen.css('background-color', background);
						$game_screen.on('click', handle);
						return df.resolve();
					});
				});
			}
			else
			{
				if ((_this.game.background.x !== background.x) || (_this.game.background.y !== background.y))
				{
					$background.css(
					{
						'-webkit-transition': 'ease-in-out ' + effect_speed + 'ms',
						'transition': 'ease-in-out ' + effect_speed + 'ms'
					});
				}
				set_background(_this, $background, background);
				if (is_hex_color(background.file))
					$game_screen.css('background-color', background);
				$game_screen.on('click', handle);
				return df.resolve();
			}

			function set_background(_this, obj, background)
			{
				_this.game.background =
				{
					file: background.file,
					x: background.x,
					y: background.y,
					filters: background.filters_str
				};
				obj.css(
				{
					'top': 0,
					'left': 0,
					'-webkit-filter': background.filters_css,
					'filter': background.filters_css,
					'-webkit-transform': 'translateZ(0)',
					'transform': 'translateZ(0)'
				});
				if (is_hex_color(background.file))
					obj.css('background', background.file);
				else
					obj.css(
					{
						'background-image': 'url(' + _this.game.dir + '/background/' + background.file + ')',
						'background-size': 'cover',
						'background-repeat': 'no-repeat',
						'background-position': background.x + ' ' + background.y
					});
			}
		}
	}

/* bg - синоним функции bgload */
	this.bg = function(params)
	{
		let df = this.bgload(params, 'BG', false);
		return df;
	}


/*====================================================================================================
	Вывод изображения в качестве спрайта
	setimg [идентификатор] [имя файла] [координата X] [координата Y] [эффект] [длительность]
	setimg [идентификатор/имя файла] ~ [длительность] - удаление спрайта
	setimg * ~ [длительность] или setimg ~ [длительность] - удаление всех спрайтов

	[идентификатор] - начинается с буквы, содержит только буквы и знак "_", имена команд использовать нельзя.
	[имя файла] - имя графического файла в директории "foreground"
	
	[координата X] [координата Y] - координаты спрайта по x и y,
	без единиц измерения - в системе координат Nintendo DS, "px" - пиксели, "%" - проценты

	[фильтр] - фильтры: brightness, blur, grayscale, saturate, sepia, invert, opacity

	[сила] - сила фильтра в процентах (0%-100%)

	[эффект] - на текущий момент один - dissolve, он же по умолчанию
	
	[длительность] - без единиц измерения - фреймы, "ms" - миллисекунды, "s" - секунды
  ====================================================================================================*/

	this.setimg = function(params, command_name = 'SETIMG')
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.resolve('Отсутствуют параметры функции ' + command_name);
			return df.promise();
		}
		let params_list = this.get_params_list(params);
		if (config.is_check)
			config.is_skip = true;

		let _this = this;
		$.each(params_list, function(key, value)
		{
			params_list[key] = _this.get_var(value);
			if (params_list[key] === false)
				return df.resolve('Неизвестная переменная функции ' + command_name + ': ' + value);
		});
		if (df.state() === 'resolved')
			return df.promise();

		let params_index = 0;
		let effect_speed = 0;
		let effect_name = 'dissolve';
		let filters_list = ['none', 'brightness', 'blur', 'grayscale', 'saturate', 'sepia', 'invert', 'opacity'];
		let effects_list = ['dissolve'];
		if ((params_list[params_index] === '~') || (params_list[params_index] === '*'))  // Удаление всех спрайтов
		{
			params_index++;
			if (params_list[params_index] === '~')
				params_index++;
			if (params_list[params_index] !== undefined)
			{
				if (effects_list.indexOf(params_list[params_index].toLowerCase()) !== -1) // Если эффект "dissolve", то просто читаем следующий параметр
					params_index++;
				if (params_list.length - params_index > 0)
				{
					effect_speed = get_duration(params_list[params_index]);
					if (effect_speed === false)
					{
						df.resolve('Неверное значение длительности эффекта в функции ' + command_name + ': ' + params_list[params_index]);
						return df.promise();
					}
					params_index++;
				}
				else
					effect_speed = config.effect_speed;
				if (params_list.length - params_index > 0)
				{
					df.resolve('Неверные параметры функции ' + command_name);
					return df.promise();
				}
			}
			if (config.is_skip) // Проверка на скип здесь, чтобы выполнились все проверки синтаксиса команды выше
				effect_speed = 0;

			let $sprites = $('#sprites');
			$sprites.find('img').each(function()
			{
				if (effect_speed !== 0)
				{
					$(this)
						.stop(true, true)
						.fadeOut(effect_speed, function()
						{
							$(this).remove();
						});
				}
				else
					$(this).remove();
			});
			this.game.sprites = {};
			$('#info_sprites').text('~');
			df.resolve();
			return df.promise();
		}

		let sprite_name;
		if (!is_image_file(params_list[params_index])) // Если первый параметр не имя файла, значит идентификатор
			sprite_name = params_list[params_index++].replace('@', '');

		if (sprite_name === undefined) // Если идентификатора не было
		{
			if (!is_image_file(params_list[params_index])) // ...и если первый параметр не имя файла (т.е. идентификатор получить невозможно)
			{
				df.resolve('Отсутствует имя файла спрайта в функции ' + command_name);
				return df.promise();
			}
			sprite_name = params_list[params_index].replace(/\/|\.|\-/g, '_');
		}
		let regexp = /^([A-Za-z0-9_]+)$/i;
		if (!regexp.test(sprite_name))
		{
			df.resolve('Неверный идентификатор спрайта в функции ' + command_name + ': ' + sprite_name);
			return df.promise();
		}
		sprite_name = 'img_' + sprite_name;
		let sprite_file;
		if (is_image_file(params_list[params_index])) // Если следующий параметр имя файла
			sprite_file = params_list[params_index++];

		let $sprite_name;

		if (params_list[params_index] === '~') // Если после идентификатора или имени файла идёт команда удаления спрайта
		{
			params_index++;
			if (params_list[params_index] !== undefined)
			{
				if (effects_list.indexOf(params_list[params_index].toLowerCase()) !== -1) // Если эффект "dissolve", то просто читаем следующий параметр
					params_index++;
				if (params_list.length - params_index > 0)
				{
					effect_speed = get_duration(params_list[params_index]);
					if (effect_speed === false)
					{
						df.resolve('Неверное значение длительности эффекта в функции ' + command_name + ': ' + params_list[params_index]);
						return df.promise();
					}
					params_index++;
				}
				if (params_list.length - params_index > 0)
				{
					df.resolve('Неверные параметры функции ' + command_name);
					return df.promise();
				}
			}
			if (config.is_skip) // Проверка на скип здесь, чтобы выполнились все проверки синтаксиса команды выше
				effect_speed = 0;

			if (effect_speed > config.auto_text_pause)
				effect_speed = config.auto_text_pause;

			$sprite_name = $('#temp_' + sprite_name);
			if ($sprite_name.length > 0)
			{
				$sprite_name.remove();
				effect_speed = 0;
			}
			$sprite_name = $('#' + sprite_name);
			if ($sprite_name.length === 0)
			{
				df.resolve('Неверный идентификатор спрайта в функции ' + command_name + ': ' + sprite_name);
				return df.promise();
			}
			$('#info_sprites').text(sprite_name + ' ~');
			if (effect_speed !== 0) // Если задержка указана
			{
				$sprite_name
					.stop(true, true)
					.fadeOut(effect_speed, function()
					{
						$sprite_name.remove();
						delete(_this.game.sprites[sprite_name]);
					});
				df.resolve();
				return df.promise();
			}
			else // Если задержка не указана
			{
				$sprite_name.remove();
				delete(this.game.sprites[sprite_name]);
				df.resolve();
				return df.promise();
			}
		}
		else
		{
			$sprite_name = $('#temp_' + sprite_name);
			if ($sprite_name.length > 0)
				$sprite_name.remove();
		}

		let position_x = ['left', 'right', 'left-side', 'right-side', 'left-in', 'right-in', 'left-out', 'right-out', 'center'];
		let position_y = ['top', 'bottom', 'top-side', 'bottom-side', 'top-in', 'bottom-in', 'top-out', 'bottom-out', 'center'];
		let x, y;
		if ((params_list.length - params_index > 1) && (filters_list.indexOf(params_list[params_index].toLowerCase()) === -1) && (effects_list.indexOf(params_list[params_index].toLowerCase()) === -1)) // Если осталось больше одного параметра и следующий параметр не эффект, значит следом идут координаты
		{
			x = params_list[params_index].toLowerCase();
			if (x.indexOf('px') !== -1)
			{
				x = x.slice(0, -2); // переводим пиксели в проценты
				if ($.isNumeric(x))
					x = x * 100 / this.game.resolution.width;
			}
			else if (x.indexOf('%') !== -1)
				x = x.slice(0, -1); // ничего не переводим - уже проценты
			else if ($.isNumeric(x))
				x = x * 100 / 256; // переводим DS в проценты
			if (!$.isNumeric(x) && (position_x.indexOf(x) === -1))
			{
				df.resolve('Неверные X-координаты в функции ' + command_name + ': ' + x);
				return df.promise();
			}
			params_index++;
			y = params_list[params_index].toLowerCase();
			if (y.indexOf('px') !== -1)
			{
				y = y.slice(0, -2); // переводим пиксели в проценты
				if ($.isNumeric(y))
					y = y * 100 / this.game.resolution.width;
			}
			else if (y.indexOf('%') !== -1)
				y = y.slice(0, -1); // ничего не переводим - уже проценты
			else if ($.isNumeric(y))
				y = y * 100 / 192; // переводим DS в проценты

			if (!$.isNumeric(y) && (position_y.indexOf(y) === -1))
			{
				df.resolve('Неверные Y-координаты в функции ' + command_name + ': ' + y);
				return df.promise();
			}

			if ($.isNumeric(x))
				x += '%';
			else if (x === 'left-in')
				x = 0;
			else if (x === 'right-out')
				x = '100%';

			if ($.isNumeric(y))
				y += '%';
			else if (y === 'top-in')
				y = 0;
			else if (y === 'bottom-out')
				y = '100%';
			params_index++;
		}
		else
		{
			if (this.game.sprites[sprite_name] !== undefined)
			{
				x = this.game.sprites[sprite_name].x;
				y = this.game.sprites[sprite_name].y;
			}
			else
			{
				x = 'center';
				y = 'center';
			}
		}
		let filters_css = '', filters_str = '';
		while ((params_list.length - params_index > 0) && (filters_list.indexOf(params_list[params_index].toLowerCase()) !== -1))
		{
			let filter_name = params_list[params_index++].toLowerCase();
			filters_str += filter_name + ' ';
			let filter_strength = 50;
			if ((params_list.length - params_index > 0) && (params_list[params_index].indexOf('%') !== -1))
			{
				filter_strength = params_list[params_index].slice(0, -1);
				if ((!$.isNumeric(filter_strength)) || (filter_strength < 0) || (filter_strength > 200))
				{
					df.resolve('Неверное значение силы фильтра в функции ' + command_name + ': ' + params_list[params_index]);
					return df.promise();
				}
				filters_str += params_list[params_index] + ' ';
				params_index++;
			}
			if (filter_name === 'blur')
				filter_strength = Math.ceil(filter_strength / 10) + 'px';
			else
				filter_strength = filter_strength + '%';
			filters_css += filter_name + '(' + filter_strength + ') ';
		}
		if (filters_css === '')
			filters_css = 'none';

		if (params_list.length - params_index > 0)
		{
			param = params_list[params_index].toLowerCase();
			if (effects_list.indexOf(param) !== -1)
			{
				effect_name = param;
				params_index++;
			}
		}
		if (params_list.length - params_index > 0) 
		{
			effect_speed = get_duration(params_list[params_index]);
			if (effect_speed === false)
			{
				df.resolve('Неверное значение длительности эффекта в функции ' + command_name + ': ' + params_list[params_index]);
				return df.promise();
			}
			params_index++;
		}

		if (params_list.length - params_index > 0)
		{
			df.resolve('Неверные параметры функции ' + command_name);
			return df.promise();
		}
		if (config.is_skip) // Проверка на скип здесь, чтобы выполнились все проверки синтаксиса команды выше
			effect_speed = 0;

		$('#info_sprites').text(sprite_name + ' ' + sprite_file);

		if (sprite_file !== undefined) // Если имя файла спрайта определено и отличается от текущего, то создаём спрайт
		{
			let sprite_path = this.game.dir + '/foreground/' + escape(sprite_file);

			$.get(sprite_path)
				.fail(function()
				{
					df.resolve('Файл<br>' + sprite_path + '<br> не найден');
				})
				.done(function()
				{
					draw_sprite(_this, df,
					{
						name: sprite_name,
						path: sprite_path,
						file: sprite_file,
						x: x,
						y: y,
						filters_css: filters_css,
						filters_str: filters_str
					}, effect_speed);
				});
		}
		else // Если имя файла не определено, то просто перемещаем спрайт
		{
			if (this.game.sprites[sprite_name] === undefined)
				df.resolve('Неверный идентификатор спрайта в функции ' + command_name + ': ' + sprite_name);
			else
			{
				draw_sprite(_this, df,
				{
					name: sprite_name,
					file: this.game.sprites[sprite_name].file,
					x: x,
					y: y,
					filters_css: filters_css,
					filters_str: filters_str
				}, effect_speed);
			}
		}
		return df.promise();

		// Функция вывода спрайта
		function draw_sprite(obj, df, sprite, effect_speed)
		{
			let $game_screen = $('#game_screen');
			let handle = $game_screen.prop('onclick');
			$game_screen.off('click');
			let $sprite_name = $('#' + sprite.name);
			let x = sprite.x;
			let y = sprite.y;
			if (sprite.path === undefined) // Если ссылка на новый файл спрайта не передана, то такой спрайт уже существует - просто двигаем его
			{
				if ((sprite.x === 'right') || (sprite.x === 'right-side'))
					x = 75 - (50 * $sprite_name.width() / resolution.width) + '%';
				else if (sprite.x === 'right-in')
					x = 100 - (100 * $sprite_name.width() / resolution.width) + '%';
				else if ((sprite.x === 'left') || (sprite.x === 'left-side'))
					x = 25 - (50 * $sprite_name.width() / resolution.width) + '%';
				else if (sprite.x === 'left-out')
					x = -(100 * $sprite_name.width() / resolution.width) + '%';
				else if (sprite.x === 'center')
					x = 50 - (50 * $sprite_name.width() / resolution.width) + '%';

				if ((sprite.y === 'bottom') || (sprite.y === 'bottom-side'))
					y = 75 - (50 * $sprite_name.height() / resolution.height) + '%';
				else if (sprite.y === 'bottom-in')
					y = 100 - (100 * $sprite_name.height() / resolution.height) + '%';
				else if ((sprite.y === 'top') || (sprite.y === 'top-side'))
					y = 25 - (50 * $sprite_name.height() / resolution.height) + '%';
				else if (sprite.y === 'top-out')
					y = -(100 * $sprite_name.height() / resolution.height) + '%';
				else if (sprite.y === 'center')
					y = 50 - (50 * $sprite_name.height() / resolution.height) + '%';

				obj.game.sprites[sprite.name] =
				{
					name: sprite.name,
					file: sprite.file,
					x: sprite.x,
					y: sprite.y,
					filters: filters_str
				};
				$sprite_name
					.stop(true, true)
					.css(
					{
						'-webkit-filter': filters_css,
						'filter': filters_css,
						'-webkit-transform': 'translateZ(0)',
						'transform': 'translateZ(0)'
					})
					.animate(
					{
						'left': x,
						'top': y
					}, effect_speed);
				$game_screen.on('click', handle);
				return df.resolve();
			}
			else // Если ссылка таки была передана, загружаем спрайт
			{
				let $sprite_name = $('#' + sprite.name);
				if ($sprite_name.length > 0)
				{
					$sprite_name.attr('id', 'temp_' + sprite.name);
					$('<img />')
						.attr('id', sprite.name)
						.insertAfter('#temp_' + sprite.name);
				}
				else
				{
					$('<img />')
						.attr('id', sprite.name)
						.appendTo($('#sprites'));
				}
				$('#' + sprite.name)
					.attr('src', sprite.path)
					.one('load', function()
					{
						let width = $(this).width() / obj.game.resolution.width * 100;
						let height = $(this).height() / obj.game.resolution.height * 100;

						if ((sprite.x === 'right') || (sprite.x === 'right-side'))
							x = (75 - width / 2) + '%';
						else if (sprite.x === 'right-in')
							x = (100 - width) + '%';
						else if ((sprite.x === 'left') || (sprite.x === 'left-side'))
							x = (25 - width / 2) + '%';
						else if (sprite.x === 'left-out')
							x = -width + '%';
						else if (sprite.x === 'center')
							x = (50 - width / 2) + '%';

						if ((sprite.y === 'bottom') || (sprite.y === 'bottom-side'))
							y = (75 - height / 2) + '%';
						else if (sprite.y === 'bottom-in')
							y = (100 - height) + '%';
						else if ((sprite.y === 'top') || (sprite.y === 'top-side'))
							y = (25 - height / 2) + '%';
						else if (sprite.y === 'top-out')
							y = -height + '%';
						else if (sprite.y === 'center')
							y = (50 - height / 2) + '%';

						obj.game.sprites[sprite.name] =
						{
							name: sprite.name,
							file: sprite.file,
							x: sprite.x,
							y: sprite.y,
							filters: filters_str
						};
						$(this)
							.stop(true, true)
							.css(
							{
								'visibility': 'visible',
								'width': width + '%',
								'height': height + '%',
								'left': x,
								'top': y,
								'-webkit-filter': filters_css,
								'filter': filters_css,
								'-webkit-transform': 'translateZ(0)',
								'transform': 'translateZ(0)'
							})
							.animate({'opacity': 0.75}, effect_speed * 0.75, function() // В этом месте fadeIn и fadeTo работают некорректно
							{
								$('#temp_' + sprite.name).fadeOut(effect_speed * 0.5, function()
								{
									$(this).remove();
								});
								$(this).animate({'opacity': 1}, effect_speed * 0.25);
							});
						$game_screen.on('click', handle);
						return df.resolve();
					});
			}
		}
	}

/* img - синоним функции setimg */
	this.img = function(params)
	{
		let df = this.setimg(params, 'IMG');
		return df;
	}

/* sprite - синоним функции setimg */
	this.sprite = function(params)
	{
		let df = this.setimg(params, 'SPRITE');
		return df;
	}

/*====================================================================================================
	Цикличная смена набора изображений
	relay [имя файла 1] [имя файла 2] [имя файла 3] [задержка] [эффект] [длительность]
	relay ~

	[имя файла N] - имена файлов изображений

	[задержка] - время вывода каждого изображения, без единиц измерения - фреймы, "ms" - миллисекунды, "s" - секунды
	
	[эффект] - на текущий момент один - dissolve, он же по умолчанию
	
	[длительность] - без единиц измерения - фреймы, "ms" - миллисекунды, "s" - секунды
  ====================================================================================================*/

	this.relay = function(params, command_name = 'RELAY')
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.resolve('Отсутствуют параметры функции ' + command_name);
			return df.promise();
		}
		let params_list = this.get_params_list(params);
		let _this = this;
		$.each(params_list, function(key, value)
		{
			params_list[key] = _this.get_var(value);
			if (params_list[key] === false)
				return df.resolve('Неизвестная переменная функции ' + command_name + ': ' + value);
		});
		if (df.state() === 'resolved')
			return df.promise();

		let effect_speed;
		let images_list = [];
		let params_index = 0;
		if (params_list[params_index] !== '~')
		{
			while ((params_list[params_index] !== undefined) && (is_image_file(params_list[params_index])))
			{
				images_list.push(params_list[params_index++]);
			}
			if (images_list.length === 0)
			{
				df.resolve('Отсутствует имя файла изображения в функции ' + command_name + ': ' + params_list[params_index]);
				return df.promise();
			}
		}
		else
			images_list[params_index++] = '~';

		if (images_list[0] !== '~')
		{
			if (params_list.length - params_index > 0)
			{
				image_delay = get_duration(params_list[params_index]);
				if (image_delay === false)
				{
					df.resolve('Неверное значение длительности вывода в функции ' + command_name + ': ' + params_list[params_index]);
					return df.promise();
				}
			}
			else
			{
				df.resolve('Неверные параметры функции ' + command_name);
				return df.promise();
			}
			params_index++;
		}

		if ((params_list.length - params_index > 0) && (params_list[params_index] === 'dissolve'))
			params_index++;

		if (params_list.length - params_index > 0)
		{
			effect_speed = get_duration(params_list[params_index]);
			if (effect_speed === false)
			{
				df.resolve('Неверное значение длительности эффекта в функции ' + command_name + ': ' + params_list[params_index]);
				return df.promise();
			}
			params_index++;
		}

		if ((images_list[0] !== '~') && (params_list.length - params_index > 0))
		{
			df.resolve('Неверные параметры функции ' + command_name);
			return df.promise();
		}

		let $relay = $('#relay');
		if (images_list[0] === '~')
		{
			clearInterval(this.relay_interval);
			this.relay_interval = undefined;
			this.game.relay.files = [];
			this.game.relay.delay = null;
			this.game.relay.speed = null;
			$relay.stop().fadeOut(effect_speed, function()
			{
				$(this).css({'background-image': ''});
			});
			df.resolve();
			return df.promise();
		}

		this.game.relay.files = images_list;
		this.game.relay.delay = image_delay;
		this.game.relay.speed = effect_speed;
		if (this.relay_interval !== undefined)
		{
			$relay.stop().fadeTo(effect_speed / 2, 0, function()
			{
				$(this).css(
				{
					'background-image': 'url(' + _this.game.dir + '/foreground/' + escape(images_list[0]) + ')'
				});
				$(this).fadeTo(effect_speed / 2, 1);
			});
		}
		else
		{
			$relay.css(
			{
				'background-image': 'url(' + _this.game.dir + '/foreground/' + escape(images_list[0]) + ')'
			});
			$relay.stop().fadeTo(effect_speed, 1);
		}
		let i = 1;
		clearInterval(this.relay_interval);
		this.relay_interval = setInterval(function()
		{
			$relay.stop().fadeTo(effect_speed / 2, 0, function()
			{
				$(this).css(
				{
					'background-image': 'url(' + _this.game.dir + '/foreground/' + escape(images_list[i++]) + ')'
				});
				$(this).fadeTo(effect_speed / 2, 1);
				if (i >= images_list.length) 
					i = 0;
			});
		}, image_delay);
		df.resolve();
		return df.promise();
	}

/* rel - синоним функции relay */
	this.rel = function(params)
	{
		let df = this.relay(params, 'REL');
		return df;
	}

/*====================================================================================================
	Применить эффект к изображению спрайта или фона
	effect [идентификатор/имя файла] [эффект] [сила] [длительность]
	effect [идентификатор/имя файла/*] ~
	effect ~

	[идентификатор] - существующий идентификатор изображения или "bg" для фона
	[имя файла] - имя файла спрайта, если для него не указан идентификатор
	Вместо идентификатора можно использовать символ "*" - это значит "все спрайты"

	[эффект] - эффекты: h-shake, v-shake, zoom-in, zoom-out, hop, rotate-left, rotate-right

	[сила] - сила эффекта в процентах (0%-100%)

	[длительность] - без единиц измерения - фреймы, "ms" - миллисекунды, "s" - секунды
	Если не указана, то будет действовать либо до команды отмены, либо до команды смены изображения
  ====================================================================================================*/

	this.effect = function(params, command_name = 'EFFECT')
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.resolve('Отсутствуют параметры функции ' + command_name);
			return df.promise();
		}
		let params_list = this.get_params_list(params);
		let _this = this;
		$.each(params_list, function(key, value)
		{
			params_list[key] = _this.get_var(value);
			if (params_list[key] === false)
				return df.resolve('Неизвестная переменная функции ' + command_name + ': ' + value);
		});
		if (df.state() === 'resolved')
			return df.promise();

		let params_index = 0;
		let image_name, effect_name;
		let effects_list = ['zoom-in', 'zoom-out', 'h-shake', 'v-shake', 'hop', 'rotate-left', 'rotate-right'];
		let param = params_list[params_index].replace(/\/|\./g, '_'); // Получаем первый параметр
		if (effects_list.indexOf(param.toLowerCase()) === -1) // Если это не эффект, значит идентификатор изображения
		{
			image_name = param;
			image_name = image_name.replace('@', 'img_');
			params_index++;
		}
		if ((image_name !== undefined) && (image_name !== '~') && (image_name !== '*') && (image_name.toLowerCase() !== 'bg') && (this.game.sprites[image_name] === undefined))
		{
			df.resolve('Неверный идентификатор или имя файла спрайта в функции ' + command_name);
			return df.promise();
		}
		let transform_css = '';
		let effect_prop, effect_ease;
		let effect_strength = 0;
		let effect_speed;
		let effect_speed_mult = 1;
		if (image_name === '~')
		{
			if (params_list.length > 1)
			{
				df.resolve('Неверные параметры функции ' + command_name);
				return df.promise();
			}
			image_name = undefined;
			effect_name = '~';
		}
		else
		{
			while ((params_list.length - params_index > 0) && (effects_list.indexOf(params_list[params_index].toLowerCase()) !== -1))
			{
				effect_name = params_list[params_index++].toLowerCase();
				if ((params_list.length - params_index > 0) && (params_list[params_index].indexOf('%') !== -1))
				{
					effect_strength = params_list[params_index].slice(0, -1);
					if ((!$.isNumeric(effect_strength)) || (effect_strength < 0) || (effect_strength > 100))
					{
						df.resolve('Неверное значение силы эффекта в функции ' + command_name + ': ' + params_list[params_index]);
						return df.promise();
					}
					params_index++;
					if (effect_strength === 0)
						continue;

					switch (effect_name)
					{
						case 'h-shake':
							effect_prop = 'left';
							effect_strength = Math.ceil(effect_strength / 20);
							effect_ease = 'linear';
							break;
						case 'v-shake':
							effect_prop = 'top';
							effect_strength = Math.ceil(effect_strength / 20);
							effect_ease = 'linear';
							break;
						case 'hop':
							effect_prop = 'top';
							effect_strength = Math.ceil(effect_strength / 3);
							effect_ease = 'swing';
							effect_speed_mult = effect_strength / 3;
							break;
						case 'rotate-left':
							effect_strength = -1 * Math.ceil(effect_strength * 3.6);
							transform_css += 'rotate(' + effect_strength + 'deg) '
							break;
						case 'rotate-right':
							effect_strength = Math.ceil(effect_strength * 3.6);
							transform_css += 'rotate(' + effect_strength + 'deg) '
							break;
						case 'zoom-in':
							effect_strength = (100 + Number(effect_strength)) / 100;
							transform_css += 'scale(' + effect_strength + ') '
							break;
						case 'zoom-out':
							effect_strength = (100 - Number(effect_strength)) / 100;
							transform_css += 'scale(' + effect_strength + ') '
							break;
					}
				}
			}
		}
		if (params_list.length - params_index > 0) // Если есть ещё параметры, значит следующий - длительность эффекта, иначе - бесконечно
		{
			effect_speed = get_duration(params_list[params_index]);
			if (effect_speed === false)
			{
				df.resolve('Неверное значение длительности эффекта в функции ' + command_name + ': ' + params_list[params_index]);
				return df.promise();
			}
		}
		let $images = []; // Массив объектов, к которым будет применяться эффект
		if (image_name === undefined)
		{
			$images = push_bg($images);
			$images = push_all_sprites($images);
		}
		else if (image_name.toLowerCase() === 'bg')
			$images = push_bg($images);
		else if (image_name.toLowerCase() === '*')
			$images = push_all_sprites($images);
		else
			push_one_sprite($images, image_name);

		let $game_screen = $('#game_screen');
		let handle = $game_screen.prop('onclick');
		$game_screen.off('click');
		if (!config.is_check)
		{
			if (effect_name === '~')
				stop_all_img_effects($images);
			else
				start_effect($images, effect_prop, effect_strength, effect_ease, effect_speed_mult, transform_css, effect_speed);
		}
		$game_screen.on('click', handle);
		df.resolve();
		return df.promise();

		function push_bg($images)
		{
			$images.push($('#background'));
			return $images;
		}
		
		function push_one_sprite($images, image_name)
		{
			$images.push($('#' + image_name));
			return $images;
		}

		function push_all_sprites($images)
		{
			$('#sprites').find('img').each(function()
			{
				$images.push($(this));
			});
			return $images;
		}
	}

/* eff - синоним функции effect */
	this.eff = function(params)
	{
		let df = this.effect(params, 'EFF');
		return df;
	}



/*====================================================================================================
	Выполнить анимацию
	animation [анимация] [сила]
	animation ~

	[анимация] - анимация: snow

	[сила] - сила анимации в процентах (0-100)
  ====================================================================================================*/

	this.animation = function(params, command_name = 'ANIMATION')
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.resolve('Отсутствуют параметры функции ' + command_name);
			return df.promise();
		}
		let params_list = this.get_params_list(params);
		if ((params_list.length < 1) || (params_list.length > 3))
		{
			df.resolve('Неверные параметры функции ' + command_name);
			return df.promise();
		}
		let _this = this;
		$.each(params_list, function(key, value)
		{
			params_list[key] = _this.get_var(value);
			if (params_list[key] === false)
				return df.resolve('Неизвестная переменная функции ' + command_name + ': ' + value);
		});
		if (df.state() === 'resolved')
			return df.promise();

		let anim_name = params_list[0].toLowerCase();
		let anim_strength;
		if (anim_name === '~')
		{
			if (params_list.length > 1)
			{
				df.resolve('Неверные параметры функции ' + command_name);
				return df.promise();
			}
		}
		else
		{
			let anims_list = ['snow', 'fog'];
			if (anims_list.indexOf(anim_name) === -1)
			{
				df.resolve('Неизвестное значение анимации в функции ' + command_name + ': ' + anim_name);
				return df.promise();
			}
			if (params_list.length > 2) // Если есть ещё параметры, значит следующий - сила анимации, иначе - 100
			{
				df.resolve('Неверные параметры функции ' + command_name);
				return df.promise();
			}
			if (params_list.length === 2)
			{
				anim_strength = params_list[1];
				if (anim_strength.indexOf('%') !== -1) // Если есть символ процента, то выпиливаем его
					anim_strength = anim_strength.slice(0, -1);
				if ((!$.isNumeric(anim_strength)) || (anim_strength < 0) || (anim_strength > 100))
				{
					df.resolve('Неверное значение силы анимации в функции ' + command_name + ': ' + params_list[1]);
					return df.promise();
				}
			}
			else
				anim_strength = 100;
		}
		this.game.animation.name = anim_name;
		this.game.animation.strength = anim_strength;
		$('#info_animation').text(anim_name);

		let $game_screen = $('#game_screen');
		let handle = $game_screen.prop('onclick');
		$game_screen.off('click');
		if (!config.is_check)
		{
			switch (anim_name)
			{
				case '~':
					stop_animation();
					break;
				case 'snow':
					animation_snow(anim_strength);
					break;
				case 'fog':
					animation_fog(anim_strength);
					break;
			}
		}
		$game_screen.on('click', handle);
		df.resolve();
		return df.promise();
	}

/* anim - синоним функции animation */
	this.anim = function(params)
	{
		let df = this.animation(params, 'ANIM');
		return df;
	}


/*====================================================================================================
	Пауза
	delay [длительность]

	[длительность] - без единиц измерения - фреймы, "ms" - миллисекунды, "s" - секунды
  ====================================================================================================*/

	this.delay = function(params, command_name = 'DELAY')
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + params);
		let df = $.Deferred();
		let delay = this.get_var(params);
		if (delay === false)
		{
			df.resolve('Неизвестная переменная функции ' + command_name + ': ' + params);
			return df.promise();
		}
		delay = get_duration(delay);
		if (!$.isNumeric(delay))
		{
			df.resolve('Неверное значение задержки в функции ' + command_name + ': ' + delay);
			return df.promise();
		}
		this.prev_text = this.cur_text;
		this.save(0);
		$('#message_box_next').hide();
		$('#message_box_text').css('cursor', 'default');
		$('#sprites').css('cursor', 'default');
		if (config.is_skip)
			delay = config.skip_text_pause;
		else if (config.is_check)
			delay = 0;
		let _this = this;
		this.delay_timeout = setTimeout(function()
		{
			if (_this.is_pause)
			{
				_this.pause_interval = setInterval(function()
				{
					if (!_this.is_pause)
					{
						clearInterval(_this.pause_interval);
						df.resolve();
					}
				}, 1000);
			}
			else
				df.resolve();
		}, delay);
		return df.promise();
	}

/* pause - синоним функции delay */
	this.pause = function(params)
	{
		let df = this.delay(params, 'PAUSE');
		return df;
	}

/* wait - синоним функции delay */
	this.wait = function(params)
	{
		let df = this.delay(params, 'WAIT');
		return df;
	}


/*====================================================================================================
	Воспроизведение звука
	sound [имя файла] [количество] [громкость]
	sound ~ - остановить воспроизведение

	[имя файла] - имя звукового файла в директории "sound"

	[количество] - число повторов звука, по умолчанию - 1; -1 - беспрерывное воспроизведение до выполнения команды остановки
	
	[громкость] - громкость звука в процентах
  ====================================================================================================*/

	this.sound = function(params, command_name = 'SOUND')
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.resolve('Отсутствуют параметры функции ' + command_name);
			return df.promise();
		}
		let params_list = this.get_params_list(params);
		let max_param_count;
		let $sound;
		if (command_name === 'SFX')
		{
			$sound = $('#sfx');
			max_param_count = 2;
		}
		else
		{
			$sound = $('#sound');
			max_param_count = 3;
		}
		if (params_list.length > max_param_count)
		{
			df.resolve('Неверные параметры функции ' + command_name);
			return df.promise();
		}
		let _this = this;
		$.each(params_list, function(key, value)
		{
			params_list[key] = _this.get_var(value);
			if (params_list[key] === false)
				return df.resolve('Неизвестная переменная функции ' + command_name + ': ' + value);
		});
		if (df.state() === 'resolved')
			return df.promise();

		let sound_file;
		let sound_iterations = 1;
		let params_index = 0;
		if ((params_list[params_index].toLowerCase().search(/mp3|ogg|aac|wma/) !== -1) || (params_list[params_index] === '~'))
			sound_file = params_list[params_index++];
		if (((command_name === 'SFX') && (sound_file === undefined)) || ((command_name !== 'SFX') && (!sound_file) && (!this.game.sound.file)))
		{
			df.resolve('Отсутствует имя файла звука в функции ' + command_name);
			return df.promise();
		}
		let sound_volume = config.sound_volume;
		for (; params_index < params_list.length; params_index++) // Если следующий параметр не эффект, то длительность или громкость, а эффект по умолчанию - easy
		{
			if (params_list[params_index].indexOf('%') !== -1)
			{
				sound_volume = params_list[params_index].slice(0, -1);
				if ((!$.isNumeric(sound_volume)) || (sound_volume < 0) || (sound_volume > 100) || (sound_file === '~'))
				{
					df.resolve('Неверное значение громкости в функции ' + command_name + ': ' + params_list[params_index]);
					return df.promise();
				}
				sound_volume = Number(sound_volume) * config.sound_volume / 100;
			}
			else
			{
				if (command_name === 'SFX')
					return df.resolve('Неверное значение громкости в функции ' + command_name + ': ' + params_list[params_index]);
				else
				{
					if (!$.isNumeric(params_list[params_index]))
					{
						df.resolve('Неверное значение количества повторов в функции ' + command_name + ': ' + sound_iterations);
						return df.promise();
					}
					else
						sound_iterations = Number(params_list[params_index]);
				}
			}
		}
		if (config.is_skip) // Проверка на скип здесь, чтобы выполнились все проверки синтаксиса команды выше
			effect_speed = 0;
		stop_sound(this, command_name, $sound, sound_file);
		start_sound(this, command_name, $sound, sound_file, sound_iterations, sound_volume);
		df.resolve();
		return df.promise();

		function start_sound(_this, command_name, $sound, sound_file, sound_iterations, sound_volume)
		{
			if (sound_file === undefined)
			{
				if (config.is_check)
					return;
				if (command_name === 'SFX')
				{
					_this.game.sfx.volume = sound_volume;
					$('#info_sfx').text(_this.game.sfx.file + ' ' + sound_volume);
				}
				else
				{
					_this.game.sound.volume = sound_volume;
					$('#info_sound').text(_this.game.sound.file + ' ' + sound_volume);
				}
				$sound.prop('volume', sound_volume);
			}
			else if (sound_file !== '~')
			{
				if (command_name === 'SFX')
				{
					_this.game.sfx =
					{
						file: sound_file,
						volume: sound_volume
					};
					$('#info_sfx').text(sound_file + ' ' + sound_volume);
				}
				else
				{
					_this.game.sound =
					{
						file: sound_file,
						volume: sound_volume
					};
					$('#info_sound').text(sound_file + ' ' + sound_volume);
				}
				let filename = _this.game.dir + '/sound/' + escape(sound_file);
				$.get(filename)
					.fail(function()
					{
						show_warning('Файл<br>' + filename + '<br> не найден'); // Здесь сделано явно, потому что ошибка может возникнуть после выхода из процедуры
					})
					.done(function()
					{
						if (config.is_check)
							return;
						if ((sound_iterations > 1) || (sound_iterations === -1))
							$sound.prop('loop', true);
						$sound.attr('src', filename);
						$sound.trigger('play');
						$sound.prop('volume', sound_volume);
						if (sound_iterations === -1)
						{
							_this.game.sound =
							{
								file: sound_file,
								volume: sound_volume
							};
						}
						else if (sound_iterations > 1)
						{
							let sound_duration = this.duration * sound_iterations * 1000;
							clearTimeout(this.sound_timeout);
							_this.sound_timeout = setTimeout(function()
							{
								stop_sound(_this, command_name, $sound, sound_file);
							}, sound_duration);
						}
					});
			}
		}

		function stop_sound(_this, command_name, $sound, sound_file)
		{
			clearTimeout(this.sound_timeout);
			if (sound_file === undefined)
				return;
			if (command_name === 'SFX')
			{
				$('#info_sfx').text('~');
				_this.game.sfx = {};
			}
			else
			{
				$('#info_sound').text('~');
				_this.game.sound = {};
			}
			$sound.prop('loop', false);
			$sound.trigger('pause');
			$sound.prop('volume', 0);
		}
	}

/* snd - синоним функции sound */
	this.snd = function(params)
	{
		let df = this.sound(params, 'SND');
		return df;
	}


/*====================================================================================================
	Воспроизведение звукового эффекта
	sfx [имя файла] [громкость]
	sfx ~ - остановить воспроизведение

	[имя файла] - имя звукового файла в директории "sound"

	[громкость] - громкость звука в процентах
  ====================================================================================================*/

	this.sfx = function(params)
	{
		let df = this.sound(params, 'SFX');
		return df;
	}


/*====================================================================================================
	Воспроизведение мелодии
	mus [имя файла] [эффект] [длительность] [громкость]
	music ~ - остановить воспроизведение

	[имя файла] - имя звукового файла в директории "sound"

	[эффект] - на текущий момент один - easy, он же по умолчанию.
	
	[длительность] - без единиц измерения - фреймы, "ms" - миллисекунды, "s" - секунды

	[громкость] - громкость звука в процентах
  ====================================================================================================*/

	this.music = function(params, command_name = 'MUSIC')
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.resolve('Отсутствуют параметры функции ' + command_name);
			return df.promise();
		}
		let params_list = this.get_params_list(params);
		if (params_list.length > 4)
		{
			df.resolve('Неверные параметры функции ' + command_name);
			return df.promise();
		}
		let _this = this;
		$.each(params_list, function(key, value)
		{
			params_list[key] = _this.get_var(value);
			if (params_list[key] === false)
				return df.resolve('Неизвестная переменная функции ' + command_name + ': ' + value);
		});
		if (df.state() === 'resolved')
			return df.promise();

		let music_file;
		let params_index = 0;
		if ((params_list[params_index].toLowerCase().search(/mp3|ogg|aac|wma/) !== -1) || (params_list[params_index] === '~'))
			music_file = params_list[params_index++];
		let effect_speed = 0
		let effect_name = 'easy'; // Пока эффект один, тут такое вот порно
		let music_volume = config.sound_volume;
		for (; params_index < params_list.length; params_index++) // Если следующий параметр не эффект, то длительность или громкость, а эффект по умолчанию - easy
		{
			if (params_list[params_index].indexOf('%') !== -1)
			{
				music_volume = params_list[params_index].slice(0, -1);
				if ((!$.isNumeric(music_volume)) || (music_volume < 0) || (music_volume > 100) || (music_file === '~'))
				{
					df.resolve('Неверное значение громкости в функции ' + command_name + ': ' + params_list[params_index]);
					return df.promise();
				}
				music_volume = Number(music_volume) * config.sound_volume / 100;
			}
			else if (params_list[params_index].toLowerCase() === 'easy')
				effect_name = params_list[params_index].toLowerCase();
			else
			{
				effect_speed = get_duration(params_list[params_index]);
				if (effect_speed === false)
				{
					df.resolve('Неверное значение длительности эффекта в функции ' + command_name + ': ' + params_list[params_index]);
					return df.promise();
				}
			}
		}
		if (config.is_skip) // Проверка на скип здесь, чтобы выполнились все проверки синтаксиса команды выше
			effect_speed = 0;
		let $music = $('#music');
		if ((this.game.music.file) && (music_file) && (effect_speed > 0) && (!config.is_check))
		{
			let cur_volume = $music.prop('volume');
			let music_volume_step = cur_volume / effect_speed * 100;
			clearInterval(_this.music_interval);
			_this.music_interval = setInterval(function()
			{
				$music.prop('volume', cur_volume);
				cur_volume -= music_volume_step;
				if (cur_volume <= 0)
				{
					stop_music(_this, $music, music_file);
					start_music(_this, $music, music_file, music_volume);
				}
			}, 100);
		}
		else if ((!this.game.music.file) && (!music_file))
		{
			df.resolve('Отсутствует имя файла музыки в функции ' + command_name);
			return df.promise();
		}
		else	
		{
			stop_music(_this, $music, music_file);
			start_music(_this, $music, music_file, music_volume);
		}
		df.resolve();
		return df.promise();

		function start_music(_this, $music, music_file, music_volume)
		{
			if (music_file === undefined)
			{
				if (config.is_check)
					return;
				_this.game.music.volume = music_volume;
				$('#info_music').text(_this.game.music.file + ' ' + music_volume);
				play_music(_this, $music, music_volume);
			}
			else if (music_file !== '~')
			{
				_this.game.music =
				{
					file: music_file,
					volume: music_volume
				};
				$('#info_music').text(music_file + ' ' + music_volume);
				let filename = _this.game.dir + '/sound/' + escape(music_file);
				$.get(filename)
					.fail(function()
					{
						show_warning('Файл<br>' + filename + '<br> не найден'); // Здесь сделано явно, потому что ошибка может возникнуть после выхода из процедуры
					})
					.done(function()
					{
						if (config.is_check)
							return;
						$music.attr('src', filename);
						$music.prop('loop', true);
						$music.trigger('play');
						play_music(_this, $music, music_volume);
					});
			}
			
			function play_music(_this, $music, music_volume)
			{
				if (effect_speed > 100)
				{
					let ratio;
					let cur_volume = $music.prop('volume');
					cur_volume > music_volume ? ratio = -1 : ratio = 1;
					let music_volume_step = ratio * (music_volume - cur_volume) * 100 / effect_speed;
					_this.music_interval = setInterval(function()
					{
						cur_volume += music_volume_step * ratio;
						$music.prop('volume', cur_volume);

						if (ratio * cur_volume >= ratio * music_volume)
						{
							clearInterval(_this.music_interval);
							cur_volume = music_volume;
							$music.prop('volume', music_volume);
						}
					}, 100);
				}
				else
					$music.prop('volume', music_volume);
			}
		}

		function stop_music(_this, $music, music_file)
		{
			clearInterval(_this.music_interval);
			if (music_file === undefined)
				return;
			$('#info_music').text('~');
			$music.prop('loop', false);
			$music.trigger('pause');
			$music.prop('volume', 0);
			_this.game.music = {};
		}
	}

/* mus - синоним функции music */
	this.mus = function(params)
	{
		let df = this.music(params, 'MUS');
		return df;
	}


/*====================================================================================================
	Воспроизведение видео
	video [имя файла] [эффект] [длительность]

	[имя файла] - имя видеофайла в директории "video"

	[эффект] - на текущий момент один - dissolve, он же по умолчанию.
	
	[длительность] - без единиц измерения - фреймы, "ms" - миллисекунды, "s" - секунды

  ====================================================================================================*/

	this.video = function(params, command_name = 'VIDEO')
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.resolve('Отсутствуют параметры функции ' + command_name);
			return df.promise();
		}
		let params_list = this.get_params_list(params);
		if (params_list.length > 2)
		{
			df.resolve('Неверные параметры функции ' + command_name);
			return df.promise();
		}
		let _this = this;
		let params_index = 0;
		$.each(params_list, function(key, value)
		{
			params_list[key] = _this.get_var(value);
			if (params_list[key] === false)
				return df.resolve('Неизвестная переменная функции ' + command_name + ': ' + value);
		});
		if (df.state() === 'resolved')
			return df.promise();

		let video = params_list[0];
		let effect_speed = 0;
		let effect_name;
		if (params_list.length > 1) // Если параметров больше одного и не включён режим пропуска
		{
			let effect_speed_param;
			let param = params_list[++params_index].toLowerCase();
			if (param === 'dissolve') // Если следующий параметр - эффект
			{
				if (params_list.length === 2) // Если указан эффект, но не указана длительность - ошибка
				{
					df.resolve('Отсутствует параметр длительности эффекта в функции ' + command_name);
					return df.promise();
				}
				effect_name = param;
				effect_speed_param = params_list[++params_index].toLowerCase(); // Получаем длительность
			}
			else // Если следующий параметр не эффект, то длительность, а эффект по умолчанию - dissolve
			{
				effect_speed_param = param;
			}
			effect_speed = get_duration(effect_speed_param);
			if (effect_speed === false)
			{
				df.resolve('Неверное значение длительности эффекта в функции ' + command_name + ': ' + effect_speed_param);
				return df.promise();
			}
			if (config.is_skip) // Проверка на скип здесь, чтобы выполнились все проверки синтаксиса команды выше
				effect_speed = 0;
		}
		else // Если параметров больше нет, значит эффект dissolve, а длительность - ноль
			effect_speed = 0;

		this.music('~ ' + effect_speed / 4);
		this.sound('~');
		this.sfx('~');
		this.anim('~');
		this.clearscreen();

		let $video = $('#video');
		$('#info_video').text(video);
		let filename = this.game.dir + '/video/' + escape(video);
		$.get(filename)
			.fail(function()
			{
				return df.resolve('Файл<br>' + filename + '<br> не найден');
			})
			.done(function()
			{
				if (config.is_check)
					return df.resolve();
				$video.attr('src', filename);
				$video.prop('volume', config.sound_volume);
				$video.prop('muted', !config.is_sound);
				_this.game.video = video;
				$video.trigger('play');
				$video.fadeIn(effect_speed);
				let $game_screen = $('#game_screen');

				$game_screen.on('click', function(e)
				{
					e.preventDefault();
					e.stopPropagation();
					$game_screen.off('click');
					stop_video(_this, effect_speed);
				});
				$video.on('ended', function()
				{
					stop_video(_this, effect_speed);
				});
			});
		return df.promise();
		
		function stop_video(obj, effect_speed)
		{
			if (config.is_sound)
			{
				let video_volume = config.sound_volume;
				let video_volume_step = video_volume / effect_speed * 100;
				let video_interval = setInterval(function()
				{
					$video.prop('volume', video_volume);
					video_volume -= video_volume_step;
					if (video_volume <= 0)
					{
						clearInterval(video_interval);
						$video.prop('volume', 0);
					}
				}, 100);
			}

			$video.fadeOut(effect_speed, function()
			{
				$video.trigger('pause');
				obj.game.video = null;
				$('#info_video').text('~');
				return df.resolve();
			});
		}
	}


/* vid - синоним функции video */
	this.vid = function(params)
	{
		let df = this.video(params, 'VID');
		return df;
	}


/*====================================================================================================
	Метка для последующего перехода командой JUMP
	label [имя метки]

	[имя метки] - имя метки латинскими буквами, первый символ - буква, остальные - буквы, цифры и символ "_"
  ====================================================================================================*/

	this.label = function(params)
	{
		let df = $.Deferred();
		df.resolve();
		return df.promise();
	}


/*====================================================================================================
	Переход к указанной метке или строке в текущем скрипте
	goto [имя метки/номер строки]

	[имя метки] - имя существующей метки

	[номер строки] - номер строки в скрипте

  ====================================================================================================*/

	this.goto = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('GOTO ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.reject('Отсутствуют параметры функции GOTO');
			return df.promise();
		}

		params = params.replace('label ', '');
		let label = this.get_var(params);
		if (label === false)
		{
			df.reject('Неизвестная переменная функции GOTO: ' + params);
			return df.promise();
		}
		let script_name = get_file_name(this.game.script_name);
		$('#sprites').off('click');
		$('#message_box_text').off('click');
		$('#message_box_next').off('click');
		if ($.isNumeric(label))
		{
			if (label < this.game.script_lines.length)
			{
				if (!config.is_check)
					this.game.script_line_num = label;
				df.resolve();
				return df.promise();
			}
			else
			{
				df.reject('Строка ' + label + ' в скрипте ' + this.game.script_name + ' не найдена');
				return df.promise();
			}
		}
		else
		{
			for (let i = 0; i < this.game.script_lines.length; i++)
			{
				let line = this.game.script_lines[i].trim();
				if (line.indexOf('label') === 0)
				{
					let split_line = this.get_params_list(line);
					if (split_line[1] === label)
					{
						if (!config.is_check)
							this.game.script_line_num = i;
						df.resolve();
						return df.promise();
					}
				}
			}
			df.reject('Метка ' + label + ' в скрипте ' + this.game.script_name + ' не найдена');
			return df.promise();
		}
	}


/*====================================================================================================
	Переход к указанному скрипту и, возможно, к метке в нём
	jump [имя скрипта] [имя метки/номер строки]

	[имя скрипта] - имя существующего скрипта

	[имя метки] - имя существующей метки

	[номер строки] - номер строки в скрипте

  ====================================================================================================*/

	this.jump = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('JUMP ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.reject('Отсутствуют параметры функции JUMP');
			return df.promise();
		}
		params = params.replace('label ', '');
		let params_list = this.get_params_list(params);
		let param1 = this.get_var(params_list[0]);
		if (param1 === false)
		{
			df.reject('Неизвестная переменная функции JUMP: ' + params_list[0]);
			return df.promise();
		}
		let label, filename;
		if (params_list.length === 1)
		{
			if (param1.indexOf('.scr') === -1)
			{
				filename = this.game.script_name;
				label = param1;
			}
			else
			{
				filename = this.get_var(param1);
				if (filename === false)
				{
					df.reject('Неизвестная переменная функции JUMP: ' + param1);
					return df.promise();
				}
				label = null;
			}
		}
		else if (params_list.length === 2)
		{
			filename = this.get_var(param1);
			if (filename === false)
			{
				df.reject('Неизвестная переменная функции JUMP: ' + param1);
				return df.promise();
			}
			label = this.get_var(params_list[1]);
			if (label === false)
			{
				df.reject('Неизвестная переменная функции JUMP: ' + params_list[1]);
				return df.promise();
			}
		}
		else
		{
			df.reject('Неверные параметры функции JUMP');
			return df.promise();
		}
		$('#sprites').off('click');
		$('#message_box_text').off('click');
		$('#message_box_next').off('click');
		this.game.script_name = filename;
		$('#info_script_name').text(this.game.script_name);
		let _this = this;
		let script_lines;
		$.get(this.game.dir + '/script/' + this.game.script_name)
			.done(function(data)
			{
				function replaceLT(match)
				{
					return match.replace(/</g, '&lt;');
				}
				script_lines = $.map(data.replace(/\t| {2,}/g, ' ').replace(/<{2,}/, replaceLT).split(/\r?\n/), $.trim);
				if (!config.is_check)
				{
					_this.game.script_lines = script_lines;
					let images_list = _this.get_images_list();
					preload_images(images_list);
				}
				if (_this.is_first_check_jump)
				{
					_this.is_first_check_jump = false;
					config.is_check = true;
				}
				if (label)
				{
					if ($.isNumeric(label))
					{
						label = parseInt(label, 10);
						if (label < script_lines.length)
						{
							if (!config.is_check)
								_this.game.script_line_num = label;
							df.resolve();
						}
						else
							df.reject('Строка ' + label + ' в скрипте ' + _this.game.script_name + ' не найдена');
					}
					else
					{
						for (let i = 0; i < script_lines.length; i++)
						{
							let line = script_lines[i].trim();
							if (line.indexOf('label') === 0)
							{
								let split_line = _this.get_params_list(line);
								if (split_line[1] === label)
								{
									if (!config.is_check)
										_this.game.script_line_num = i;
									df.resolve();
									return df.promise();
								}
							}
						}
						df.reject('Метка ' + label + ' в скрипте ' + _this.game.script_name + ' не найдена');
					}
				}
				else
				{
					_this.game.script_line_num = 0;
					df.resolve();
				}
			})
			.fail(function(jqXHR, textStatus, errorThrown)
			{
				df.reject(errorThrown);
			});
		return df.promise();
	}


/*====================================================================================================
	Очистка текста
	cleartext [модификатор]
	
	[модификатор] - игнорируется

  ====================================================================================================*/

	this.cleartext = function(params, command_name = 'CLEARTEXT')
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name);
		let df = $.Deferred();
		this.is_expand_text = false;
		this.prev_text = '';
		$('#message_box_name').html('').hide();
		let $message_box_text = $('#message_box_text');
		$message_box_text.html('');

		// Сброс всех кликов
		$message_box_text.off('click');
		$('#sprites').off('click');
		$('#message_box_next').off('click');

		// Сброс всех интервалов и таймаутов
		clearInterval(type_interval);
		type_interval = undefined;
		clearInterval(this.text_interval);
		clearTimeout(this.text_timeout);
		clearTimeout(this.delay_timeout);
		clearInterval(this.pause_interval);

		df.resolve();
		return df.promise();
	}

/* clt - синоним функции cleartext */
	this.clt = function(params)
	{
		if (params !== undefined)
		{
			let df = $.Deferred();
			df.reject('Неверные параметры функции CLT');
			return df.promise();
		}
		let df = this.cleartext(params, 'CLT');
		return df;
	}

/*====================================================================================================
	Вывод текста
	text [текст]
	text (без параметров) - очистить экран
	text ! - дождаться клика и очистить экран
	text ~ - очистить текст (аналог cleartext)
	text @ - не дожидаться клика после вывода текста, следующий фрагмент выводится с новой строки
	text + - вывести следующий фрагмент после уже выведенного текста

	is_note - выводить ли в виде заметки, т.е. на полный экран
  ====================================================================================================*/

	this.text = function(params, command_name = 'TEXT', is_note = false)
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + params);
		let df = $.Deferred();
		let $game_screen = $('#game_screen');
		if ((params === undefined) || (params.length === 0))
		{
			this.cleartext();
			hide_message_box(false, function()
			{
				if ((config.is_skip) || (config.is_check) || (params.length === 0) || (config.is_auto))
				{
					let delay;
					if (config.is_skip)
						delay = config.skip_text_pause;
					else if ((params.length === 0) || (config.is_check))
						delay = 0;
					else if (config.is_auto)
						delay = config.auto_text_pause;
					setTimeout(function()
					{
						$game_screen.off('click');
						df.resolve();
					}, delay);
				}
				if ((!config.is_skip) && ((!config.is_check)))
				{
					$game_screen.css({'cursor': 'pointer'});
					$game_screen.on('click', function(e)
					{
						e.preventDefault();
						e.stopPropagation();
						$game_screen.off('click');
						df.resolve();
					});
				}
			});
			return df.promise();
		}
		let $message_box = $('#message_box');
		if (is_note)
		{
			$message_box
				.addClass('note')
				.css('height', '90%');
		}
		else
		{
			$message_box
				.removeClass('note')
				.css('height', (120 + config.text_size_factor * 25) + 'px');
		}
		let $message_box_text = $('#message_box_text');
		$message_box_text.css('height', $message_box.height());

		if (params === '~')
		{
			this.cleartext();
			df.resolve();
			return df.promise();
		}

		let cur_str;
		if ((params.substr(0, 2) === '@@') || (params.substr(0, 2) === '++'))
			cur_str = this.get_var(params.substring(2));
		else if (params[0] === '@')
			cur_str = this.get_var(params.substring(1));
		else if ((params[0] === '+') || (params[0] === '!'))
			cur_str = this.get_var(params.substring(1));
		else
			cur_str = this.get_var(params);
		if (cur_str === false)
		{
			df.resolve('Неизвестная переменная функции ' + command_name + ': ' + params);
			return df.promise();
		}
		
		if (is_note) // Убираем у заметок кавычки
		{
			let first_char = cur_str.charAt(0);
			let last_char = cur_str.substr(-1);
			if (((first_char === '"') && (last_char === '"')) || ((first_char === "'") && (last_char === "'")))
				cur_str = cur_str.slice(1, -1);
		}
		cur_str = cur_str.toString().trim();
		cur_str = cur_str.replace(/<br \/>|<br>|\\n/g, '<br> ');
		cur_str = cur_str.replace('<<', '«');
		cur_str = cur_str.replace('>>', '»');
		cur_str = cur_str.replace(/-|–|—/g, '&#8209;');
		
		let script_name = get_file_name(this.game.script_name);
		try
		{
			if (localStorage.getItem(script_name + '_route') === null)
				localStorage.setItem(script_name + '_route', JSON.stringify([this.game.script_line_num]));
			else
			{
				let route_array = JSON.parse(localStorage.getItem(script_name + '_route'));
				if ($.inArray(this.game.script_line_num, route_array) !== -1) // Если строка с таким номером уже была...
				{
					set_skip_enabled(true);
				}
				else
				{
					route_array.push(this.game.script_line_num);
					localStorage.setItem(script_name + '_route', JSON.stringify(route_array));
					set_skip_enabled(config.is_skip_unread);
				}
			}
		}
		catch(e)
		{
			df.reject('Ошибка в локальном хранилище: ' + e.name);
			return df.promise();
		}
		if (config.is_check)
		{
			df.resolve();
			return df.promise();
		}

		let $sprites = $('#sprites');
		let $message_box_next = $('#message_box_next');
		$sprites.off('click');
		$message_box_text.off('click');
		$message_box_next.off('click');
		show_message_box();

		if (!config.is_skip)
			$message_box_next.show();

		if (!this.is_load_game)
		{
			let is_append_text = (params[0] === '+');
			if ((!is_append_text) && (!this.is_expand_text))
			{
				this.prev_text = '';
			}
			else
				this.prev_text = this.cur_text;
			if (is_append_text)
			{
				if (params.substr(0, 2) !== '++')
					this.prev_text += '<br>';
				else
					this.prev_text += ' ';
				type_writer(this.prev_text);
			}
		}
		this.is_expand_text = (params[0] === '@');
		if (this.is_expand_text)
		{
			if (params.substr(0, 2) !== '@@')
				cur_str += '<br>';
			else
				cur_str += ' ';
		}
		this.is_load_game = false;
		this.cur_text = type_writer(cur_str, config.text_speed, this.prev_text);
		this.save(0);

		let _this = this;
		if ((config.is_skip) || (config.is_auto))
		{
			let delay;
			if (config.is_skip)
				delay = config.skip_text_pause;
			else if (config.is_auto)
				delay = config.auto_text_pause + cur_str.length * config.text_speed;
			this.text_timeout = setTimeout(function()
			{
				if (type_interval !== undefined)
					$message_box_next.trigger('click');
				$message_box_next.trigger('click');
			}, delay);
		}
		else if (this.is_expand_text)
		{
			this.text_interval = setInterval(function()
			{
				if (type_interval === undefined)
				{
					clearInterval(_this.text_interval);
					clearTimeout(_this.text_timeout);
					$message_box_next.trigger('click');
				}
			}, 1000);
		}
		$message_box_text.find('a').on('click', function(e)
		{
			e.stopPropagation();
		});
		$sprites
			.css('cursor', 'pointer')
			.on('click', function(e)
			{
				if ($message_box_next.is(':visible'))
					$message_box_next.trigger('click');
				else if (config.is_skip)
					set_skip(false);
				else
					$sprites.off('click');
			});
		$message_box_text
			.css('cursor', 'pointer')
			.on('click', function(e)
			{
				if ($message_box_next.is(':visible'))
					$message_box_next.trigger('click');
				else if (config.is_skip)
					set_skip(false);
				else
					$message_box_text.off('click');
			});
		$message_box_next.on('click', function(e)
		{
			e.preventDefault();
			e.stopPropagation();
			if (params[0] === '!')
				_this.clearscreen();
			if (type_interval !== undefined)
			{
				clearInterval(type_interval);
				type_interval = undefined;
				type_writer(_this.cur_text);
				return df.promise();
			}
			else
			{
				clearTimeout(_this.text_timeout);
				clearInterval(_this.text_interval);
				$sprites.off('click');
				$message_box_text.off('click');
				$message_box_next.off('click');
//				stop_all_effects();
				if (_this.is_pause)
				{
					_this.pause_interval = setInterval(function()
					{
						if (!_this.is_pause)
						{
							clearInterval(_this.pause_interval);
							df.resolve();
							return df.promise();
						}
					}, 1000);
				}
				else
				{
					df.resolve();
					return df.promise();
				}
			}
		});
		return df.promise();
	}

/* mes - синоним функции text */
	this.mes = function(params)
	{
		let df = this.text(params, 'MES', false);
		return df;
	}

/* msg - синоним функции text */
	this.msg = function(params)
	{
		let df = this.text(params, 'MSG', false);
		return df;
	}



/*====================================================================================================
	Очистка окна сообщений и убирание окна сообщений с экрана (аналог "text")
	clearscreen
  ====================================================================================================*/

	this.clearscreen = function(params, command_name = 'CLEARSCREEN')
	{
		if (params !== undefined)
		{
			let df = $.Deferred();
			df.reject('Неверные параметры функции ' + command_name);
			return df.promise();
		}
		let df = this.text('', command_name);
		return df;
	}

/* cls - синоним функции clearscreen */
	this.cls = function(params)
	{
		let df = this.clearscreen(params, 'CLS');
		return df;
	}

/*====================================================================================================
	Вывод заметки на весь экран
	note [модификатор]
  ====================================================================================================*/

	this.note = function(params)
	{
		let df = this.text(params, 'NOTE', true);
		return df;
	}


/*====================================================================================================
	Присвоение локальной переменной
	setvar [имя переменной] [оператор] [значение]
	Операции:
			~ - сбросить переменную в ноль
			= - операция присвоения
			+ - операция сложения уже хранящегося в переменной значения с переданным значением
			- - операция вычитания из уже хранящегося в переменной значения переданного значение
			. - операция конкатенации (сложения строк) уже хранящегося в переменной значения с переданным значением
			* - операция умножения уже хранящегося в переменной значения на переданное значение
			/ - операция деления уже хранящегося в переменной значения на переданное значение
  ====================================================================================================*/

	this.setvar = function(params, command_name = 'SETVAR')
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.reject('Отсутствуют параметры функции ' + command_name);
			return df.promise();
		}
		if (params === '~ ~')
		{
			this.game.local_variables = {};
			df.resolve();
			return df.promise();
		}
		let params_list = this.get_params_list(params);
		if ((params_list.length < 2) || (params_list.length > 3))
		{
			df.reject('Неверные параметры функции ' + command_name + ': ' + params);
			return df.promise();
		}
		let variable = params_list[0];
		if ($.isNumeric(variable))
		{
			df.reject('Неизвестная переменная функции ' + command_name + ': ' + variable);
			return df.promise();
		}
		variable = 'var_' + variable.replace('$', '');
		let mod = params_list[1];
		if (['~', '=', '+', '+=', '-', '-=', '.', '.=', '*', '*=', '/', '/='].indexOf(mod) === -1)
		{
			df.reject('Неизвестная операция в функции ' + command_name + ': ' + mod);
			return df.promise();
		}
		let value;
		if (mod !== '~')
		{
			value = this.get_var(params_list[2]);
			if (value === false)
			{
				df.reject('Неизвестная переменная функции ' + command_name + ': ' + params_list[2]);
				return df.promise();
			}
			if ($.isNumeric(value))
				value = Number(value);
		}
		switch (mod)
		{
			case '~':
				delete this.game.local_variables[variable];
				break;
			case '=':
				this.game.local_variables[variable] = value;
				break;
			case '+':
			case '+=':
				if (this.game.local_variables[variable] !== undefined)
					this.game.local_variables[variable] += value;
				else
					this.game.local_variables[variable] = value;
				break;
			case '-':
			case '-=':
				if (this.game.local_variables[variable] !== undefined)
					this.game.local_variables[variable] -= value;
				else
					this.game.local_variables[variable] = -value;
				break;
			case '.':
			case '.=':
				if (this.game.local_variables[variable] !== undefined)
					this.game.local_variables[variable] += value.toString();
				else
					this.game.local_variables[variable] = value.toString();
				break;
			case '*':
			case '*=':
				if (this.game.local_variables[variable] !== undefined)
					this.game.local_variables[variable] *= value;
				else
				{
					df.reject('Неверная операция в функции ' + command_name + ': переменная ' + variable + ' не определена');
					return df.promise();
				}
				break;
			case '/':
			case '/=':
				if (this.game.local_variables[variable] !== undefined)
					if (value != 0)
						this.game.local_variables[variable] = this.game.local_variables[variable] / value;
					else
					{
						df.reject('Неверная операция в функции ' + command_name + ': деление на ноль');
						return df.promise();
					}
				else
				{
					df.reject('Неверная операция в функции ' + command_name + ': переменная ' + variable + ' не определена');
					return df.promise();
				}
				break;
		}
		df.resolve();
		return df.promise();
	}

/* var - синоним функции setvar */
	this.var = function(params)
	{
		let df = this.setvar(params, 'VAR');
		return df;
	}


/*====================================================================================================
	Присвоение глобальной переменной (не сбрасывается после начала новой игры)
	gsetvar [имя переменной] [оператор] [значение]
	Операции:
			~ - сбросить переменную в ноль
			= - операция присвоения
			+ - операция сложения уже хранящегося в переменной значения с переданным значением
			- - операция вычитания из уже хранящегося в переменной значения переданного значение
			. - операция конкатенации (сложения строк) уже хранящегося в переменной значения с переданным значением
			* - операция умножения уже хранящегося в переменной значения на переданное значение
			/ - операция деления уже хранящегося в переменной значения на переданное значение
  ====================================================================================================*/

	this.gsetvar = function(params, command_name = 'GSETVAR')
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.reject('Отсутствуют параметры функции ' + command_name);
			return df.promise();
		}
		if (params === '~ ~')
		{
			try
			{
				localStorage.removeItem(this.game.short_name + '_global');
			}
			catch(e)
			{
				df.reject('Ошибка в локальном хранилище: ' + e.name);
				return df.promise();
			}
			df.resolve();
			return df.promise();
		}
		let params_list = this.get_params_list(params);
		if ((params_list.length < 2) || (params_list.length > 3))
		{
			df.reject('Неверные параметры функции ' + command_name + ': ' + params);
			return df.promise();
		}
		let variable = params_list[0];
		if ($.isNumeric(variable))
		{
			df.reject('Неизвестная переменная функции ' + command_name + ': ' + variable);
			return df.promise();
		}
		variable = 'var_' + variable.replace('$', '');
		let mod = params_list[1];
		if (['~', '=', '+', '-', '.', '*', '/'].indexOf(mod) === -1)
		{
			df.reject('Неизвестная операция в функции ' + command_name + ': ' + mod);
			return df.promise();
		}
		let value;
		if (mod !== '~')
		{
			value = this.get_var(params_list[2]);
			if (value === false)
			{
				df.reject('Неизвестная переменная функции ' + command_name + ': ' + params_list[2]);
				return df.promise();
			}
		}
		try
		{
			let global_variables = {};
			let item = localStorage.getItem(this.game.short_name + '_global');
			if (item !== null)
				global_variables = JSON.parse(item);
			switch (mod)
			{
				case '~':
					delete global_variables[variable];
					break;
				case '=':
					global_variables[variable] = value;
					break;
				case '+':
				case '+=':
					if (global_variables[variable] !== undefined)
						global_variables[variable] += value;
					else
						global_variables[variable] = value;
					break;
				case '-':
				case '-=':
					if (global_variables[variable] !== undefined)
						global_variables[variable] -= value;
					else
						global_variables[variable] = -value;
					break;
				case '.':
				case '.=':
					if (global_variables[variable] !== undefined)
						global_variables[variable] += value.toString();
					else
						global_variables[variable] = value.toString();
					break;
				case '*':
				case '*=':
					if (global_variables[variable] !== undefined)
						global_variables[variable] *= value;
					else
					{
						df.reject('Неверная операция в функции ' + command_name + ': переменная ' + variable + ' не определена');
						return df.promise();
					}
					break;
				case '/':
				case '/=':
					if (global_variables[variable] !== undefined)
						if (value != 0)
							global_variables[variable] = global_variables[variable] / value;
						else
						{
							df.reject('Неверная операция в функции ' + command_name + ': деление на ноль');
							return df.promise();
						}
					else
					{
						df.reject('Неверная операция в функции ' + command_name + ': переменная ' + variable + ' не определена');
						return df.promise();
					}
					break;
			}
			global_variables = JSON.stringify(global_variables);
			localStorage.setItem(this.game.short_name + '_global', global_variables);
			df.resolve();
		}
		catch(e)
		{
			df.reject('Ошибка в локальном хранилище: ' + e.name);
		}
		return df.promise();
	}

/* gvar - синоним функции gsetvar */
	this.gvar = function(params)
	{
		let df = this.gsetvar(params, 'GVAR');
		return df;
	}


/*====================================================================================================
	Присваивание переменной случайного числа
	random [имя переменной] [минимальное значение] [максимальное значение]
  ====================================================================================================*/

	this.random = function(params, command_name = 'RANDOM')
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.reject('Отсутствуют параметры функции ' + command_name);
			return df.promise();
		}
		let params_list = this.get_params_list(params);
		if (params_list.length > 3)
		{
			df.reject('Неверные параметры функции ' + command_name);
			return df.promise();
		}
		let variable = params_list[0];
		if ($.isNumeric(variable))
		{
			df.reject('Неверное значение переменной функции ' + command_name + ': ' + variable);
			return df.promise();
		}
		variable = 'var_' + variable.replace('$', '');
		let min_value, max_value;
		if (params_list.length > 1) // Если параметров больше одного, то у нас есть как минимум максимальное значение
		{
			max_value = this.get_var(params_list[params_list.length - 1]);
			if (max_value === false)
			{
				df.reject('Неизвестная переменная функции ' + command_name + ': ' + params_list[2]);
				return df.promise();
			}
			if (!$.isNumeric(max_value))
			{
				df.reject('Неверное максимальное значение функции ' + command_name + ': ' + max_value);
				return df.promise();
			}
			if (params_list.length === 3) // Если параметров 3, то присваиваем минимальное значение
			{
				min_value = this.get_var(params_list[1]);
				if (min_value === false)
				{
					df.reject('Неизвестная переменная функции ' + command_name + ': ' + params_list[1]);
					return df.promise();
				}
				if (!$.isNumeric(min_value))
				{
					df.reject('Неверное минимальное значение функции ' + command_name + ': ' + min_value);
					return df.promise();
				}
			}
			else
				min_value = 0;
		}
		else
		{
			min_value = 0;
			max_value = 1;
		}

		let value = Math.floor(min_value + Math.random() * (max_value + 1 - min_value));
		try
		{
			let global_variables = JSON.parse(localStorage.getItem(this.game.short_name + '_global'));
			if (variable === 'var_selected')
				this.game.selected = value;
			else if ((global_variables !== null) && (global_variables[variable] !== undefined))
			{
				global_variables[variable] = value;
				global_variables = JSON.stringify(global_variables);
				localStorage.setItem(this.game.short_name + '_global', global_variables);
			}
			else
				this.game.local_variables[variable] = value;
		}
		catch(e)
		{
			df.reject('Ошибка в локальном хранилище: ' + e.name);
			return df.promise();
		}
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + variable + ' = ' + value);
		df.resolve();
		return df.promise();
	}

/* rand - синоним функции random */
	this.rand = function(params)
	{
		let df = this.random(params, 'RAND');
		return df;
	}


/*====================================================================================================
	Выбор пользователя
	choice [выбор 1]|[выбор 2]|[выбор 3]
	Результат будет храниться в переменной selected.
  ====================================================================================================*/

	 this.choice = function(params, command_name = 'CHOICE')
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.reject('Отсутствуют параметры функции ' + command_name);
			return df.promise();
		}
		let $choice_menu = $('#choice_menu');
		let choices = params.split('|');
		let choices_cnt = choices.length;
		if (choices_cnt > 22)
		{
			df.reject('Слишком большое количество выборов: ' + choices_cnt);
			return df.promise();
		}
		this.cleartext();
		this.game.selected = null;
		let $overlay = $('#overlay');
		for (let i = 0; i < choices_cnt; i++)
		{
			let id = 'choice_' + i;
			$('<button>')
				.attr('id', id)
				.attr('value', i)
				.appendTo($choice_menu);
			let choice = this.get_var(choices[i]);
			if (choice === false)
			{
				df.reject('Неизвестная переменная функции ' + command_name + ': ' + choices[i]);
				return df.promise();
			}
			let $id = $('#' + id);
			$id.append('<div>' + choice + '</div>');
			let _this = this;
			if (!config.is_check)
			{
				$id.on('click', function(e)
				{
					e.preventDefault();
					e.stopPropagation();
					$id.off('click');
					_this.game.selected = parseInt($id.attr('value'), 10) + 1;
					if (config.log_level != LOG_DISABLE) console.log(command_name + ' selected = ' + _this.game.selected);
					$choice_menu.find('button').off('click');
					$overlay.stop().fadeOut(config.effect_speed);
					$choice_menu.stop().fadeOut(config.effect_speed, function()
					{
						$choice_menu.find('button').remove();
						df.resolve();
					});
				});
			}
		}
		set_choice_button_size();
		this.save(0);
		set_skip(false);
		hide_message_box(false, function()
		{
			$overlay.stop().fadeTo(config.effect_speed, 1);
			$choice_menu.find('button').fadeTo(config.effect_speed, 1);
			$choice_menu.stop().fadeTo(config.effect_speed, 1);
		});
		if (config.is_check)
		{
			$choice_menu.stop().fadeOut(config.effect_speed, function()
			{
				$choice_menu.find('button').remove();
				df.resolve();
			});
			df.resolve();
		}
		return df.promise();
	}

/* select - синоним функции choice */
	this.select = function(params)
	{
		let df = this.choice(params, 'SELECT');
		return df;
	}

/* sel - синоним функции choice */
	this.sel = function(params)
	{
		let df = this.choice(params, 'SEL');
		return df;
	}


/*====================================================================================================
	Операция сравнения
	if [имя переменной] [операция сравнения] [имя переменной или значение]
	fi
	Операции сравнения:
			>  - больше
			<  - меньше
			== - равно
			!= - не равно
			>= - больше или равно
			<= - меньше или равно
  ====================================================================================================*/

	this.if = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('IF ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.reject('Неверные параметры функции IF');
			return df.promise();
		}
		let params_list = this.get_params_list(params);
		if (params_list.length != 3)
		{
			df.reject('Неверные параметры функции IF');
			return df.promise();
		}
		let variable = params_list[0];
		if ($.isNumeric(variable))
		{
			df.reject('Неверное значение переменной функции IF: ' + variable);
			return df.promise();
		}
		variable = 'var_' + variable.replace('$', '');
		let operation = params_list[1];
		let global_variables;
		try
		{
			global_variables = JSON.parse(localStorage.getItem(this.game.short_name + '_global'));
		}
		catch(e)
		{
			df.reject('Ошибка в локальном хранилище: ' + e.name);
			return df.promise();
		}
		if (variable === 'var_selected')
			variable = this.game.selected;
		else if ((global_variables !== null) && (global_variables[variable] !== undefined))
			variable = global_variables[variable];
		else if (this.game.local_variables[variable] !== undefined)
			variable = this.game.local_variables[variable];
		else
			variable = 0;
		if (['<', '<=', '==', '!=', '>=', '>'].indexOf(operation) === -1)
		{
			df.reject('Неверная операция в функции IF: ' + operation);
			return df.promise();
		}
		let value = this.get_var(params_list[2]);
		if (value === false)
		{
			df.reject('Неизвестная переменная функции IF' + command_name + ': ' + params_list[2]);
			return df.promise();
		}
		if ((!config.is_check) && (!perform_code(variable + operation + value)))
		{
			let if_cnt = 1;
			do
			{
				this.game.script_line_num++;
				let line = this.game.script_lines[this.game.script_line_num].trim();
				if (line.indexOf('if') === 0)
					if_cnt++;
				else if (line.indexOf('fi') === 0)
					if_cnt--;
			}
			while ((if_cnt > 0) && (this.game.script_line_num < this.game.script_lines.length));
		}
		df.resolve();
		return df.promise();
	}

	this.fi = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('FI');
		let df = $.Deferred();
		df.resolve();
		return df.promise();
	}


/*====================================================================================================
	Сброс кеша прохождения
	reset
  ====================================================================================================*/

	 this.reset = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('RESET');
		let df = $.Deferred();
		if (params !== undefined)
		{
			df.reject('Неверные параметры функции RESET');
			return df.promise();
		}
		try
		{
			localStorage.clear();
		}
		catch(e)
		{
			show_warning('Ошибка в локальном хранилище: ' + e.name);
			return false;
		}
		this.save('~');
		show_info('Данные успешно удалены');
		df.resolve();
		return df.promise();
	}


/*====================================================================================================
	Остановка и отмена скипа
	stopskip
  ====================================================================================================*/

	this.stopskip = function(params, command_name = 'STOPSKIP')
	{
		if (config.log_level != LOG_DISABLE) console.log(command_name + ' ' + params);
		let df = $.Deferred();
		if (params !== undefined)
		{
			df.reject('Неверные параметры функции ' + command_name);
		}
		else
		{
			set_skip(false);
			df.resolve();
		}
		return df.promise();
	}

/* stop - синоним функции stopskip */
	this.stop = function(params)
	{
		let df = this.stopskip(params, 'STOP');
		return df;
	}

/* ss - синоним функции stopskip */
	this.ss = function(params)
	{
		let df = this.stopskip(params, 'SS');
		return df;
	}


/*====================================================================================================
	Завершение выполнения скрипта и переход к списку новелл
	quit
  ====================================================================================================*/

	this.quit = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('QUIT ' + params);
		let df = $.Deferred();
		if (params !== undefined)
		{
			df.reject('Неверные параметры функции QUIT');
		}
		else
		{
			let href = window.location.protocol + '//' + window.location.hostname + window.location.pathname;
			window.location.href = href;
			df.resolve();
		}
		return df.promise();
	}


/*====================================================================================================
	Выполнение произвольного кода javascript
	exec [команда]

	[команда] - команда или набор команд javascript, которые нужно выполнить
	
  ====================================================================================================*/

	this.exec = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('EXEC ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.resolve('Отсутствуют параметры функции EXEC');
			return df.promise();
		}

		let command = this.get_var(params);
		if (command === false)
		{
			df.resolve('Неизвестная переменная функции EXEC: ' + params);
			return df.promise();
		}
		let first_char = command.charAt(0);
		let last_char = command.substr(-1);
		if (((first_char === '"') && (last_char === '"')) || ((first_char === "'") && (last_char === "'")))
			command = command.slice(1, -1);

		try
		{
			perform_code(command); 
		}
		catch(e)
		{
			df.resolve('Неверные параметры функции EXEC: ' + params);
			return df.promise();
		}
		df.resolve();
		return df.promise();
	}


/*====================================================================================================
	Запуск проверки скрипта
	check [имя скрипта]

	[имя скрипта] - имя существующего скрипта
	
  ====================================================================================================*/

	 this.check = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('CHECK ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.reject('Отсутствуют параметры функции CHECK');
			return df.promise();
		}

		let filename = this.get_var(params);
		if (filename === false)
		{
			df.reject('Неизвестная переменная функции CHECK: ' + params);
			return df.promise();
		}

		config.is_check = false;
		this.is_first_check_jump = true;
		this.perform({command: 'jump', params: filename});
	}



/*----------------------------------------------------------------------------------------------------
	Далее идут различные сервисные функции
  ----------------------------------------------------------------------------------------------------*/

/*====================================================================================================
	Сохранение игры
	save [номер слота]
	save ~ - удаление всех записей

	[номер слота] - число от 0 до 20, слот 0 используется для быстрого сохранения
  ====================================================================================================*/

	this.save = function(slot)
	{
		if (config.log_level != LOG_DISABLE) console.log('SAVE ' + slot);
		if (slot === '~')
		{
			try
			{
				let _this = this;
				$.each(localStorage, function(key, value)
				{
					if (key.indexOf(_this.game.short_name + '_save') !== -1)
						localStorage.removeItem(key);
				});
				return;
			}
			catch(e)
			{
				show_warning('Ошибка в локальном хранилище: ' + e.name);
				return false;
			}
		}
		if (!$.isNumeric(slot))
		{
			show_warning('Неверный слот для сохранения: ' + slot);
			return false;
		}
		let save_game =
		{
			local: this.game.local_variables,
			selected: this.game.selected,
			script_name: this.game.script_name,
			script_line_num: this.game.script_line_num,
			is_expand_text: this.is_expand_text,
			prev_text: this.prev_text,
			music: this.game.music,
			sound: this.game.sound,
			bg_color: $('#game_screen').css('background-color'),
			bg: this.game.background,
			relay: this.game.relay,
			sprites: this.game.sprites,
			animation: this.game.animation
		};
		save_game = JSON.stringify(save_game);
		try
		{
			localStorage.setItem(this.game.short_name + '_save_' + slot, save_game);
			if (slot !== 0)
			{
				show_notification('Сохранение выполнено', config.notification_delay);
				show_message_box();
			}
		}
		catch(e)
		{
			show_warning('Ошибка в локальном хранилище: ' + e.name);
			return false;
		}
	}

/*====================================================================================================
	Загрузка игры
	load [номер слота]

	[номер слота] - число от 0 до 20, слот 0 используется для быстрого сохранения
  ====================================================================================================*/

	this.load = function(slot)
	{
		if (config.log_level != LOG_DISABLE) console.log('LOAD ' + slot);
		if (!$.isNumeric(slot))
		{
			show_warning('Неверный слот для загрузки: ' + slot);
			return false;
		}
		let load_game = this.get_load(slot);
		if (!load_game)
			return false;
		this.cleartext();
		this.setimg('~');
		this.relay('~');
		this.anim('~');
		this.drop();
		this.game.local_variables = load_game.local;
		this.game.selected = load_game.selected;
		this.game.script_name = load_game.script_name;
		if (load_game.bg_color)
			$('#game_screen').css('background-color', load_game.bg_color);
		if (!$.isEmptyObject(load_game.bg))
		{
			if (load_game.bg.file === undefined) // Костыль для совместимости со старыми сохранениями
				this.bg(load_game.bg + ' dissolve 0.3s');
			else
				this.bg(load_game.bg.file + ' ' + load_game.bg.x + ' ' + load_game.bg.y + ' ' + load_game.bg.filters + 'dissolve 0.3s');
		}
		if (load_game.relay.delay)
		{
			let param_str = '';
			for (let i = 0; i < load_game.relay.files.length; i++)
				param_str += load_game.relay.files[i] + ' ';
			param_str += load_game.relay.delay + 'ms';
			this.relay(param_str);
		}
		let _this = this;
		$.each(load_game.sprites, function(key, value)
		{
			let param_str = '@' + value.name.replace(/^img_/, '') + ' ' + value.file + ' ' + value.x + ' ' + value.y + ' ' + value.filters + 'dissolve 0.3s';
			_this.setimg(param_str);
		});
		this.game.sprites = load_game.sprites;

		if (!$.isEmptyObject(load_game.music))
		{
			this.game.music =
			{
				file: load_game.music.file,
				volume: load_game.music.volume
			}
			this.music(load_game.music.file + ' ' + config.sound_volume / load_game.music.volume * 100 + '% 0.3s');
		}
		else
			this.music('~');
		if (!$.isEmptyObject(load_game.sound))
		{
			this.game.sound =
			{
				file: load_game.sound.file,
				volume: load_game.sound.volume
			}
			this.sound(load_game.sound.file + ' ' + load_game.sound.volume * 100 + '%');
		}
		else
			this.sound('~');
		this.is_expand_text = load_game.is_expand_text;
		this.prev_text = load_game.prev_text;
		if (this.prev_text)
		{
			show_message_box();
			this.cur_text = this.prev_text;
			type_writer(this.prev_text);
		}
		this.is_load_game = true;
		this.game.script_line_num = load_game.script_line_num;
		this.game.animation = load_game.animation;
		if (!$.isEmptyObject(load_game.animation))
			this.anim(this.game.animation.name + ' ' + this.game.animation.strength);
		this.perform({command: 'jump', params: this.game.script_name + ' ' + (this.game.script_line_num - 1)});
	}

/* Сброс значений переменных игры */
	this.drop = function()
	{
		clearTimeout(this.text_timeout);
		clearInterval(type_interval);
		type_interval = undefined;
		stop_all_effects_filters();
		this.is_expand_text = false;
		this.prev_text = '';
		this.game.local_variables = {};
		this.game.selected = null;
		this.game.script_name = null;
		this.game.script_lines = [];
		this.game.script_line_num = null;
		this.game.sound = {};
		this.game.sfx = {};
		this.game.music = {};
		this.game.background = {};
		this.game.relay = {};
		this.game.sprites = {};
		this.game.animation = {};
	}

// Получение следующей команды скрипта
	this.get_next_command = function()
	{
		let line = this.game.script_lines[this.game.script_line_num].replace(/\/\/.*$/, '').replace(/[ \t]{2,}/g, ' ').trim();
		while (((line.length === 0) || (line.charAt(0) === ';') || (line.indexOf('#') === 0)) && (this.game.script_line_num < this.game.script_lines.length))
		{
			this.game.script_line_num++;
			if (this.game.script_lines[this.game.script_line_num] === undefined)
				return false;
			line = this.game.script_lines[this.game.script_line_num].replace(/\/\/.*$/, '').replace(/[ \t]{2,}/g, ' ').trim();
		}
		if ((line.length === 0) || (line.charAt(0) === ';') || (line.indexOf('#') === 0))
		{
			show_error('Больше команд в скрипте не найдено: ' + this.game.script_name);
			return false;
		}
		this.game.script_line_num++;

		if (config.log_level != LOG_DISABLE) console.log('LINE ' + parseInt(this.game.script_line_num, 10) + ': ' + line);
		$('#info_script_line_num').text(parseInt(this.game.script_line_num, 10));
		
		let first_char = line.charAt(0);
		let last_char = line.substr(-1);
		if (first_char === '$') // Если первый символ в строке "$", то добавляем команду "var"
			line = 'var ' + line;
// Если первые символы в строке '"' или '@"', или '+"' и т.п., то добавляем команду "text"
		else if (((first_char === '"') && (last_char === '"')) || ((first_char === "'") && (last_char === "'")))
			line = 'msg ' + line.slice(1, -1);
		else if ((((line.substr(0, 2) === '@"') || (line.substr(0, 2) === '+"')) && (last_char === '"'))
					|| (((line.substr(0, 2) === "@'") || (line.substr(0, 2) === "+'")) && (last_char === "'")))
			line = 'msg ' + line.substr(0, 1) + line.slice(2, -1);
		else if ((((line.substr(0, 3) === '@@"') || (line.substr(0, 3) === '++"')) && (last_char === '"')) 
					|| (((line.substr(0, 3) === "@@'") || (line.substr(0, 3) === "++'")) && (last_char === "'")))
			line = 'msg ' + line.substr(0, 2) + line.slice(3, -1);
// Если первый символ в строке '[' или '@[', или '@@[', то добавляем команду "text"
		else if (((first_char === '[') && ((last_char === '"') || (last_char === "'")))
					|| (((line.substr(0, 2) === '@[') || (line.substr(0, 2) === '+[')) && ((last_char === '"') || (last_char === "'")))
					|| (((line.substr(0, 3) === '@@[') || (line.substr(0, 3) === '++[')) && ((last_char === '"') || (last_char === "'"))))
			line = 'msg ' + line;

		let delimiter_pos = line.indexOf(' ');
		if (delimiter_pos > 0)
		{
			let command = line.substr(0, delimiter_pos).toLowerCase();
			let params = line.substr(delimiter_pos + 1);
			return {command:command, params:params};
		}
		else
			return {command:line};
	}

// Рекурсивное исполнение всех команд скрипта
	this.perform = function(code)
	{
		if (code === false)
			return false;
		if (!function_exists(this[code.command]))
			show_error('Ошибка синтаксиса');
//		this.save(0);
		let _this = this;
		let df;
		df = this[code.command](code.params);
		df.done(function(warning)
		{
			if (warning)
			{
				show_warning(warning, function()
				{
					_this.perform(_this.get_next_command());
				});
			}
			else
				_this.perform(_this.get_next_command());
		});
		df.fail(function(error)
		{
			show_error(error);
		});
	}

// Кеширование всех картинок
	this.get_images_list = function()
	{
		let images_list = [];
		for (let i = 0; i < this.game.script_lines.length; i++)
		{
			let file_path = this.game.dir;
			let line = this.game.script_lines[i].trim();
			if ((line.indexOf('~') !== -1) || (line.indexOf('$') !== -1))
				continue;
			let line_lowercase = line.toLowerCase().trim();
			if (line_lowercase.indexOf('bg') === 0)
				file_path += '/background/';
			else if ((line_lowercase.indexOf('setimg') === 0) || (line_lowercase.indexOf('img') === 0) || (line_lowercase.indexOf('sprite') === 0))
				file_path += '/foreground/';
			else if (line_lowercase.indexOf('rel') === 0)
				file_path += '/foreground/';
			else
				continue;
			if (line.indexOf('.') !== -1)
			{
				let split_line = this.get_params_list(line);
				for (let i = 1; i < split_line.length; i++)
				{
					split_line[i] = split_line[i].replace(/s$|%$/g, '');
					if (!$.isNumeric(split_line[i]) && (split_line[i].indexOf('.') !== -1))
					{
						filename = file_path + split_line[i];
						if (images_list.indexOf(filename) === -1)
						{
							filename = filename.replace(/'|"/g, '');
							images_list.push(filename);
						}
					}
				}
			}
		}
		return images_list;
	}

// Разбиение строки параметров с учётом параметров в кавычках, возвращает массив параметров
	this.get_params_list = function(params)
	{
		let regexp = /([^\s"']+)|"([^"]*)"|'([^']*)'/g;
		let matches = params.match(regexp);
		for (let i = 0; i < matches.length; i++)
			matches[i] = matches[i].replace(/'|"/g, '');
		return matches;
	}

// Получение значения переменной
	this.get_var = function(variable)
	{
		if (typeof(variable) !== 'string')
			return variable;
		let value = '';
		let pos = 0;
		let regexp = /\{([A-Za-z\$_]{1}[A-Za-z_0-9]{0,})\}|(\$[A-Za-z_]{1}[A-Za-z_0-9]{0,})/g;
		if (variable.search(/^[A-Za-z\$_]{1}[A-Za-z_0-9]{0,}$/) !== -1)
		{
			let temp_var = 'var_' + variable.replace('$', '');
			if (temp_var === 'var_selected')
				return this.game.selected;
			else
			{
				try
				{
					let global_variables = JSON.parse(localStorage.getItem(this.game.short_name + '_global'));
					if ((global_variables !== null) && (global_variables[temp_var] !== undefined))
						return global_variables[temp_var];
					else if (this.game.local_variables[temp_var] !== undefined)
						return this.game.local_variables[temp_var];
				}
				catch(e)
				{
					show_error('Ошибка в локальном хранилище: ' + e.name);
					return false;
				}
			}
		}
		else if (variable.search(regexp) !== -1)
		{
			let matches;
			while ((matches = regexp.exec(variable)) != null)
			{
				value += variable.substring(pos, matches.index);
				pos = regexp.lastIndex;
				let temp_var = 'var_' + matches[0].replace(/[\$|\{|\}]/g, '');
				if (temp_var === 'var_selected')
					value = this.game.selected;
				else
				{
					try
					{
						let global_variables = JSON.parse(localStorage.getItem(this.game.short_name + '_global'));
						if ((global_variables !== null) && (global_variables[temp_var] !== undefined))
							value += global_variables[temp_var];
						else if (this.game.local_variables[temp_var] !== undefined)
							value += this.game.local_variables[temp_var];
					}
					catch(e)
					{
						show_error('Ошибка в локальном хранилище: ' + e.name);
						return false;
					}
				}
			}
		}

		value += variable.substring(pos);

		return value.toString();
	}

// Получение сохранения
	this.get_load = function(slot)
	{
		let load_game;
		try
		{
			load_game = JSON.parse(localStorage.getItem(this.game.short_name + '_save_' + slot));
		}
		catch(e)
		{
			show_warning('Ошибка в локальном хранилище: ' + e.name);
			return false;
		}
		return load_game;
	}

// Проверка на наличие сохранения
	this.is_load = function(slot)
	{
		return Boolean(this.get_load(slot));
	}
}
