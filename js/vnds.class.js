// Ман по командам VNDS: https://github.com/chaoskagami/vndc/blob/master/SCRIPTINGDOC.md

// Функции VNDS
var vnds_interpreter = function()
{
	this.append_text = false;
	this.prev_text = '';
	this.sound_timeout;
	this.text_timeout;

	this.init = function()
	{
		this.game =
		{
			dir: null,                  // Путь к директории с файлами игры
			full_name: null,            // Полное наименование игры, взятое из файла info.txt
			short_name: null,           // Короткое наименование игры, взятое из названия директории игры
			resolution:                 // Разрешение игры, взятое из файла img.ini
			{
				width: null,              // width
				height: null,             // height
				ratio: null               // отношение высоты к ширине (height / width)
			},
			icons:                      // Иконки игры, взятые из директории игры
			{
				small: null,              // icon
				big: null                 // icon-high
			},
			thumbs:                     // Привьюшки игры, взятые из директории игры
			{
				small: null,              // thumbnail
				big: null                 // thumbnail-high
			},
			local_variables: {},        // массив локальных переменных
			selected: null,             // последнее значение переменной selected
			script_name: null,          // название текущего скрипта
			script_lines: [],           // список строк текущего скрипта
			script_line_num: null,      // номер текущей строки скрипта
			sound: null,                // текущий воспроизводящийся звук
			music: null,                // текущая воспроизводящаяся музыка
			background: null,           // файл текущего фона
			sprites:                    // массив отображающихся в текущий момент спрайтов
			{                           // индекс массива - имя спрайта без расширения
				sprite: null,             // файл спрайта
				x: null,                  // координата x
				y: null                   // координата y
			},
			route: {}                   // массив с просмотренными фрагментами
		};
	}

/* Сброс значений переменных игры */
	this.drop = function()
	{
		this.append_text = false;
		this.prev_text = '';
		this.game.local_variables = {};
		this.game.selected = null;
		this.game.script_name = null;
		this.game.script_lines = [];
		this.game.script_line_num = null;
		this.game.sound = null;
		this.game.music = null;
		this.game.background = null;
		this.game.sprites = null;
		this.game.route = {};
	}

/* Вывод изображения filename в качестве фона
 * bgload bg [fadeout]
 * 		The parameter bg should be a file in backgrounds
 *		The second parameter, fadeout, should be a length in frames to fade into the new background
 */
	this.bgload = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('BGLOAD ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.resolve('Missing BGLOAD parameters');
			return df.promise();
		}
		let split_params = params.toString().split(' ');
		let background = this.getvar(split_params[0]);
		if (background === false)
		{
			df.resolve('Unknown BGLOAD variable ' + split_params[0]);
			return df.promise();
		}
		if (this.game.background === background)
		{
			this.setimg('~');
			df.resolve();
			return df.promise();
		}
		let $background = $('#background');
		let fadeout = split_params[1];
		if ((fadeout === undefined) || (config.is_skip))
			fadeout = 0;
		if (!$.isNumeric(fadeout))
		{
			df.resolve('Incorrect BGLOAD fadeout value: ' + fadeout);
			return df.promise();
		}

		let $game_screen = $('#game_screen');
		let $handle = $game_screen.prop('onclick'); // Сохраняем функцию по onclick
		$('#info_background').text(background);
		let filename = this.game.dir + '/background/' + background;
		let _this = this;
		$.get(filename)
			.fail(function()
			{
				df.resolve('File<br>' + filename + '<br> not found');
			})
			.done(function()
			{
				_this.cleartext();
				_this.game.background = background;
				if (fadeout === 0)
				{
					_this.setimg('~');
					$background.css({'background-image': 'url(' + filename + ')'});
					df.resolve();
				}
				else
				{
					$game_screen.off('click');
					let $sprites = $('#sprites');
					$sprites.find('img').each(function()
					{
						$(this).stop().fadeOut(fadeout / 0.12).remove();
					});
					$background.stop().fadeOut(fadeout / 0.12, function() // приводим к 60 fps
					{
						_this.game.sprites = {};
						$('#info_sprites').text('~');
						$(this)
							.css({'background-image': 'url(' + filename + ')'})
							.fadeIn(fadeout / 0.12, function()
							{
								$game_screen.on('click', $handle); // Возвращаем функцию по onclick обратно
								df.resolve();
							});
					});
				}
			});
		return df.promise();
	}

/* Вывод изображения filename в координаты x и y (в системе координат Nintendo DS)
 * setimage file x y
 * setimage file ~
 */
	this.setimg = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('SETIMG ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.resolve('Missing SETIMG parameters');
			return df.promise();
		}
		let $sprites = $('#sprites');
		let _this = this;
		$('#info_sprites').text(params);
		if (params === '~')
		{
			$sprites.find('img').each(function()
			{
				$(this).remove();
			});
			this.game.sprites = {};
			df.resolve();
			return df.promise();
		}
		let split_params = params.toString().split(' ');
		let sprite = this.getvar(split_params[0]);
		if (sprite === false)
		{
			df.resolve('Unknown SETIMG variable ' + split_params[0]);
			return df.promise();
		}
		if ((split_params.length < 2) || (split_params.length > 3))
		{
			df.resolve('Incorrect SETIMG parameters');
			return df.promise();
		}
		let split_spritename = sprite.toString().split('.');
		let sprite_name = split_spritename[0];
		sprite_name = sprite_name.replace('/', '_');
		if (split_params[1] === '~')
		{
			$('#' + sprite_name).remove();
			delete(_this.game.sprites[sprite_name]);
			df.resolve();
			return df.promise();
		}
		let filename = this.game.dir + '/foreground/' + sprite;
		let x = _this.getvar(split_params[1]);
		let y = _this.getvar(split_params[2]);
		if (x === false)
		{
			df.resolve('Unknown SETIMG variable ' + split_params[1]);
			return df.promise();
		}
		else if (y === false)
		{
			df.resolve('Unknown SETIMG variable ' + split_params[2]);
			return df.promise();
		}
		else if ((!$.isNumeric(x)) || (!$.isNumeric(y)))
		{
			df.resolve('Incorrect SETIMG coordinates: ' + x + ':' + y);
			return df.promise();
		}
		this.game.sprites[sprite_name] =
		{
			sprite: sprite,
			x: x,
			y: y
		};
		$.get(filename)
			.fail(function()
			{
				df.resolve('File<br>' + filename + '<br> not found');
			})
			.done(function()
			{
				let $sprite_name = $('#' + sprite_name);
				if ($sprite_name.length)
				{
					$sprite_name
						.animate(
						{
							'left': x * 100 / 256 + '%',
							'top': y * 100 / 192 + '%'
						}, config.effect_speed, function()
						{
							df.resolve();
						});
				}
				else
				{
					$('<img />')
						.attr('id', sprite_name)
						.appendTo($sprites);
					$('#' + sprite_name)
						.one('load', function()
						{
							let width = $(this).width() / _this.game.resolution.width * 100;
							let height = $(this).height() / _this.game.resolution.height * 100;
							$(this)
								.css({
									'visibility': 'visible',
									'width': width + '%',
									'height': height + '%',
									'left': x * 100 / 256 + '%',
									'top': y * 100 / 192 + '%'
								});
						}).attr('src', filename);

					df.resolve();
				}
			});
		return df.promise();
	}

/* Пауза
 * delay frames
 * 		frames is the number of frames to delay. Again, we operate at 60fps
 */
	this.delay = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('DELAY ' + params);
		let df = $.Deferred();
		let delay = this.getvar(params);
		if (delay === false)
		{
			df.resolve('Unknown DELAY variable ' + params);
			return df.promise();
		}
		if (!$.isNumeric(delay))
		{
			df.resolve('Incorrect DELAY value: ' + delay);
			return df.promise();
		}
		$('#message_box_next').hide();
		$('#message_box_text').css('cursor', 'default');
		if (config.is_skip)
			delay = config.skip_text_pause;
		else
			delay = delay / 0.06; // приводим к 60 fps
		setTimeout(function()
		{
			df.resolve();
		}, delay);
		return df.promise();
	}

/* Проигрывание звука filename количество раз iteration
 * sound file [times]
 * 		sound plays a sound, and optionally a number of times
 *		times is implicitly 1 if not specified. Pass -1 for infinity
 *		sound ~ - to stop all playing sounds
 */
	this.sound = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('SOUND ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.resolve('Missing SOUND parameters');
			return df.promise();
		}
		let split_params = params.toString().split(' ');
		let sound = this.getvar(split_params[0]);
		if (sound === false)
		{
			df.resolve('Unknown SOUND variable ' + split_params[0]);
			return df.promise();
		}
		let iteration = split_params[1];
		if (iteration === undefined)
			iteration = 1;
		else
		{
			iteration = this.getvar(iteration);
			if (iteration === false)
			{
				df.resolve('Unknown SOUND variable ' + split_params[1]);
				return df.promise();
			}
		}
		this.game.sound = null;
		let $sound = $('#sound');
		$sound.prop('loop', false);
		$sound.prop('volume', config.sound_volume);
		$sound.trigger('pause');
		if (this.sound_timeout)
			clearTimeout(this.sound_timeout);
		if (!$.isNumeric(iteration))
		{
			df.resolve('Incorrect SOUND iteration value: ' + iteration);
			return df.promise();
		}
		else
			iteration = Number(iteration);
		$('#info_sound').text(sound);
		if (sound === '~')
		{
			df.resolve();
			return df.promise();
		}
		let filename = this.game.dir + '/sound/' + sound;
		let _this = this;
		$.get(filename)
			.fail(function()
			{
				df.resolve('File<br>' + filename + '<br> not found');
			})
			.done(function()
			{
				if ((iteration > 1) || (iteration === -1))
					$sound.prop('loop', true);
				$sound.attr('src', filename);
				$sound.trigger('play');
				_this.game.sound = sound;
				if ((iteration === 1) || (iteration === -1))
					_this.game.sound = null;
				else
				{
					$sound.on('canplay', function()
					{
						let duration = _this.duration * iteration * 1000;
						_this.sound_timeout = setTimeout(function()
						{
							_this.sound('~');
						}, duration);
						$sound.off('canplay');
					});
				}
				df.resolve();
			});
		return df.promise();
	}

/* Проигрывание мелодии filename по кругу
 *		music ~ - to stop all playing sounds
 */
	this.music = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('MUSIC ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.resolve('Missing MUSIC parameters');
			return df.promise();
		}
		let music = this.getvar(params);
		if (music === false)
		{
			df.resolve('Unknown MUSIC variable ' + params);
			return df.promise();
		}
		this.sound('~');
		this.game.music = null;
		let $music = $('#music');
		$music.prop('loop', false);
		$music.prop('volume', config.sound_volume);
		$music.trigger('pause');
		$('#info_music').text(music);
		if (music !== '~')
		{
			let filename = this.game.dir + '/sound/' + music;
			let _this = this;
			$.get(filename)
				.fail(function()
				{
					df.resolve('File<br>' + filename + '<br> not found');
				})
				.done(function()
				{
					$music.attr('src', filename);
					$music.prop('loop', true);
					$music.trigger('play');
					_this.game.music = music;
					df.resolve();
				});
		}
		else
			df.resolve();
		return df.promise();
	}
	
/* Метка для последующего перехода командой JUMP
 *		label label
 */
	this.label = function(params)
	{
		let df = $.Deferred();
		df.resolve();
		return df.promise();
	}

/* Переход к указанной метке или строке в текущем скрипте
 *		goto label
 */
	this.goto = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('GOTO ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.reject('Missing GOTO parameters');
			return df.promise();
		}

		params = params.replace('label ', '');
		let label = this.getvar(params);
		if (label === false)
		{
			df.reject('Unknown GOTO variable ' + params);
			return df.promise();
		}
		let script_name = get_file_name(this.game.script_name);
		this.append_text = false;
		this.prev_text = '';
		$('#message_box_next').off('click');
		if ($.isNumeric(label))
		{
			if (label < this.game.script_lines.length)
			{
				this.game.script_line_num = label;
				df.resolve();
				return df.promise();
			}
			else
			{
				df.reject('Can\'t find line ' + label + ' in script ' + this.game.script_name);
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
					let split_line = line.split(' ');
					if (split_line[1] === label)
					{
						this.game.script_line_num = i;
						df.resolve();
						return df.promise();
					}
				}
			}
			df.reject('Can\'t find label ' + label + ' in script ' + this.game.script_name);
			return df.promise();
		}
	}

/* Переход к указанному скрипту и, возможно, к метке в нём
 *		jump script [label]
 */
	this.jump = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('JUMP ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.reject('Missing JUMP parameters');
			return df.promise();
		}
		params = params.replace('label ', '');
		let split_params = params.toString().split(' ');
		let param1 = this.getvar(split_params[0]);
		if (param1 === false)
		{
			df.reject('Unknown JUMP variable ' + split_params[0]);
			return df.promise();
		}
		let label, filename;
		if (split_params.length === 1)
		{
			if (param1.indexOf('.scr') === -1)
			{
				filename = this.game.script_name;
				label = param1;
			}
			else
			{
				filename = this.getvar(param1);
				if (filename === false)
				{
					df.reject('Unknown JUMP variable ' + param1);
					return df.promise();
				}
				label = null;
			}
		}
		else if (split_params.length === 2)
		{
			filename = this.getvar(param1);
			if (filename === false)
			{
				df.reject('Unknown JUMP variable ' + param1);
				return df.promise();
			}
			label = this.getvar(split_params[1]);
			if (label === false)
			{
				df.reject('Unknown JUMP variable ' + split_params[1]);
				return df.promise();
			}
		}
		else
		{
			df.reject('Incorrect JUMP parameters');
			return df.promise();
		}
		this.append_text = false;
		this.prev_text = '';
		$('#message_box_next').off('click');
		this.game.script_name = filename;
		$('#info_script_name').text(this.game.script_name);
		let _this = this;
		$.get(this.game.dir + '/script/' + this.game.script_name)
			.done(function(data)
			{
				{
					function replaceLT(match)
					{
						return match.replace(/</g, '&lt;');
					}
					_this.game.script_lines = $.map(data.replace(/\t| {2,}/g, ' ').replace(/<{2,}/, replaceLT).split(/\r?\n/), $.trim); 
					let images_list = _this.get_images_list(); 
					preload_images(images_list);
					if (label)
					{
						if ($.isNumeric(label))
						{
							label = parseInt(label, 10);
							if (label < _this.game.script_lines.length)
							{
								_this.game.script_line_num = label;
								df.resolve();
							}
							else
								df.reject('Can\'t find line number ' + label + ' in script ' + _this.game.script_name);
						}
						else
						{
							_this.game.script_line_num = -1;
							for (let i = 0; i < _this.game.script_lines.length; i++)
							{
								let line = _this.game.script_lines[i].trim();
								if (line.indexOf('label') === 0)
								{
									let split_line = line.split(' ');
									if (split_line[1] === label)
									{
										_this.game.script_line_num = i;
										df.resolve();
										break;
									}
								}
							}
							if (_this.game.script_line_num === -1)
								df.reject('Can\'t find label ' + label + ' in script ' + _this.game.script_name);
						}
					}
					else
					{
						_this.game.script_line_num = 0;
						df.resolve();
					}
				}
			})
			.fail(function(jqXHR, textStatus, errorThrown)
			{
				df.reject(errorThrown);
			});
		return df.promise();
	}

/* Очистка всего текста, модификатор игнорируется
 * cleartext [mod]
 */
	this.cleartext = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('CLEARTEXT');
		let df = $.Deferred();
		this.append_text = false;
		this.prev_text = '';
		$('#message_box_name')
			.html('')
			.hide();
		$('#message_box_text').html('');
		df.resolve();
		return df.promise();
	}

/* Вывод текста
 * text				- (no params) Clear screen
 * ------------ text !			- Wait for input and clear all.
 * text !			- Clear screen and wait for input.
 * text ~			- Clears all text (like cleartext)
 * text @...	- Don't wait for click after text is output.
 */
	this.text = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('TEXT ' + params);
		let df = $.Deferred();
		if ((params === undefined) || (params.length === 0) || (params === '!'))
		{
			this.cleartext();
			hide_message_box(function()
			{
				let $game_screen = $('#game_screen');
				if ((config.is_skip) || (config.is_auto))
				{
					let delay;
					if (config.is_skip)
						delay = config.skip_text_pause;
					if (config.is_auto)
						delay = config.auto_text_pause;
					this.prev_text = '';
					setTimeout(function()
					{
						$game_screen.off('click');
						df.resolve();
					}, delay);
				}
				if (!config.is_skip)
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

		if (params === '~')
		{
			this.cleartext();
			df.resolve();
		}
		else
		{
			let $message_box_text = $('#message_box_text');
			let wait_click = true;
			let cur_text = '';
			if (params[0] === '@')
			{
				cur_text = this.getvar(params.substring(1));
				if (cur_text === false)
				{
					df.resolve('Unknown TEXT variable ' + params.substring(1));
					return df.promise();
				}
				if (cur_text.length === 0)
				{
					df.resolve();
					return df.promise();
				}
				wait_click = false;
				this.append_text = true;
				cur_text = this.prev_text + cur_text;
			}
			else
			{
				cur_text = this.getvar(params);
				if (cur_text === false)
				{
					df.resolve('Unknown TEXT variable ' + params);
					return df.promise();
				}
				if (this.append_text)
					cur_text = this.prev_text + cur_text;
				this.append_text = false;
			}
			let script_name = get_file_name(this.game.script_name);
			if (this.game.route[script_name] === undefined)
				this.game.route[script_name] = [this.game.script_line_num];
			else
			{
				if ($.inArray(this.game.script_line_num, this.game.route[script_name]) != -1) // Если строка с таким номером уже была...
				{
					set_skip_enabled(true);
				}
				else
				{
					this.game.route[script_name].push(this.game.script_line_num);
					set_skip_enabled(config.is_skip_unread);
				}
			}

			cur_text = cur_text.trim();
			this.prev_text = cur_text + '<br>';
			if (wait_click)
			{
				show_message_box();
				type_writer(cur_text);
				let $message_box_next = $('#message_box_next');
				if ((config.is_skip) || (config.is_auto))
				{
					let delay;
					if (config.is_skip)
						delay = config.skip_text_pause;
					if (config.is_auto)
						delay = config.auto_text_pause + cur_text.length * config.text_speed;
					this.prev_text = '';
					this.text_timeout = setTimeout(function()
					{
						df.resolve();
					}, delay);
					if (config.is_skip)
						return df.promise();
				}
				$message_box_next.show();
				$message_box_text.find('a').on('click', function(e)
				{
					e.stopPropagation();
				});
				$message_box_text
					.css('cursor', 'pointer')
					.on('click', function(e)
					{
						$message_box_text.off('click');
						if ($message_box_next.is(':visible'))
						{
							$message_box_next.trigger('click');
						}
					});
				$message_box_next.on('click', function(e)
				{
					e.preventDefault();
					e.stopPropagation();
					$message_box_text.off('click');
					$message_box_next.off('click');
					clearTimeout(this.text_timeout);
					df.resolve();
					return df.promise();
				});
			}
			else if (!config.is_auto)
			{
				df.resolve();
			}
		}
		return df.promise();
	}

// Операции с переменными

/*
setvar var mod value

mod can be one of the following:

=	Set var to value
+	Add value to var
-	Subtract value from var
~	Reset to 0
 */

	this.setvar = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('SETVAR ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.reject('Missing SETVAR parameters');
			return df.promise();
		}
		if (params === '~ ~')
		{
			this.game.local_variables = {};
			df.resolve();
			return df.promise();
		}
		let split_params = params.toString().split(' ');
		let variable = split_params[0];
		if (typeof(variable) !== 'string')
		{
			df.reject('Incorrect SETVAR variable: ' + variable);
			return df.promise();
		}
		let mod = split_params[1];
		if (['~', '=', '+', '-'].indexOf(mod) === -1)
		{
			df.reject('Incorrect SETVAR operation: ' + mod);
			return df.promise();
		}
		let value;
		if (mod !== '~')
		{
			value = this.getvar(split_params[2]);
			if (value === false)
			{
				df.reject('Unknown SETVAR variable ' + split_params[2]);
				return df.promise();
			}
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
				if (this.game.local_variables[variable])
					this.game.local_variables[variable] += value;
				else
					this.game.local_variables[variable] = value;
				break;
			case '-':
				if (this.game.local_variables[variable])
					this.game.local_variables[variable] -= value;
				else
					this.game.local_variables[variable] = -value;
				break;
		}
		df.resolve();
		return df.promise();
	}

/*
gsetvar var mod value

mod can be one of the following:

=	Set var to value
+	Add value to var
-	Subtract value from var
~	Reset to 0
*/

	this.gsetvar = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('GSETVAR ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.reject('Missing GSETVAR parameters');
			return df.promise();
		}
		if (params === '~ ~')
		{
			try
			{
				localStorage.removeItem(this.game.short_name + '_global');
			}
			catch (e)
			{
				df.reject('Error in local storage ' + e.name);
				return df.promise();
			}
			df.resolve();
			return df.promise();
		}
		let split_params = params.toString().split(' ');
		let variable = split_params[0];
		if (typeof(variable) !== 'string')
		{
			df.reject('Incorrect GSETVAR variable: ' + variable);
			return df.promise();
		}
		let mod = split_params[1];
		if (['~', '=', '+', '-'].indexOf(mod) === -1)
		{
			df.reject('Incorrect GSETVAR operation: ' + mod);
			return df.promise();
		}
		let value;
		if (mod !== '~')
		{
			value = this.getvar(split_params[2]);
			if (value === false)
			{
				df.reject('Unknown GSETVAR variable ' + split_params[2]);
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
					if (global_variables[variable])
						global_variables[variable] += value;
					else
						global_variables[variable] = value;
					break;
				case '-':
					if (global_variables[variable])
						global_variables[variable] -= value;
					else
						global_variables[variable] = -value;
					break;
			}
			global_variables = JSON.stringify(global_variables);
			localStorage.setItem(this.game.short_name + '_global', global_variables);
			df.resolve();
		}
		catch (e)
		{
			df.reject('Error in local storage ' + e.name);
		}
		return df.promise();
	}

/*
	Присваивание случайного целого числа переменной
*/

	this.random = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('RANDOM ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.reject('Missing RANDOM parameters');
			return df.promise();
		}
		let split_params = params.toString().split(' ');
		if (split_params.length !== 3)
		{
			df.reject('Incorrect RANDOM parameters');
			return df.promise();
		}
		let variable = split_params[0];
		let min_value = this.getvar(split_params[1]);
		if (min_value === false)
		{
			df.reject('Unknown RANDOM variable ' + split_params[1]);
			return df.promise();
		}
		let max_value = this.getvar(split_params[2]);
		if (max_value === false)
		{
			df.reject('Unknown RANDOM variable ' + split_params[2]);
			return df.promise();
		}
		if (typeof(variable) !== 'string')
		{
			df.reject('Incorrect RANDOM variable: ' + variable);
			return df.promise();
		}
		if (!$.isNumeric(min_value))
		{
			df.reject('Incorrect RANDOM low value: ' + min_value);
			return df.promise();
		}
		if (!$.isNumeric(max_value))
		{
			df.reject('Incorrect RANDOM high value: ' + max_value);
			return df.promise();
		}
		let value = Math.floor(Math.random() * (max_value - min_value + 1)) + min_value;
		try
		{
			let global_variables = JSON.parse(localStorage.getItem(this.game.short_name + '_global'));
			if (variable === 'selected')
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
		catch (e)
		{
			df.reject('Error in local storage ' + e.name);
			return df.promise();
		}
		if (config.log_level != LOG_DISABLE) console.log('RANDOM ' + variable + ' = ' + value);
		df.resolve();
		return df.promise();
	}


/* Выбор пользователя
 * choice ch1|ch2|ch3...
 * The result of the choice is stored into a variable named selected, which can be queried with if
 */
	this.choice = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('CHOICE ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.reject('Missing CHOICE parameters');
			return df.promise();
		}
		let $choice_menu = $('#choice_menu');
		let choices = params.split('|');
		let choices_cnt = choices.length;
		if (choices_cnt > 22)
		{
			df.reject('Too much choices');
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
			let choice = this.getvar(choices[i]);
			if (choice === false)
			{
				df.reject('Unknown CHOICE variable ' + choices[i]);
				return df.promise();
			}
			let $id = $('#' + id);
			$id.append('<div>' + choice + '</div>');
			let _this = this;
			$id.on('click', function(e)
			{
				e.preventDefault();
				e.stopPropagation();
				$id.off('click');
				_this.game.selected = parseInt($id.attr('value'), 10) + 1;
				if (config.log_level != LOG_DISABLE) console.log('CHOICE selected = ' + _this.game.selected);
				$choice_menu.find('button').off('click');
				$overlay.stop().fadeOut(config.effect_speed);
				$choice_menu.stop().fadeOut(config.effect_speed, function()
				{
					$choice_menu.find('button').remove();
					df.resolve();
				});
			});
		}
		let i = 15;
 		while (($choice_menu.height() > resolution.height) && (i > 0))
		{
			$choice_menu.find('button').css(
			{
				'font-size': (i / 10) + 'em',
				'margin': (i / 2) + 'px 0',
				'padding': (i / 2) + 'px 0'
			});
			i--;
		}
		let max_width;
		do
		{
			$choice_menu.find('button').css('font-size', (i / 10) + 'em');
			max_width = 0;
			$.each($choice_menu, function()
			{
				if ($(this).width() > max_width)
					max_width = $(this).width();
			});
			max_width = (max_width + 30);
			i--;
		}
 		while ((max_width > resolution.width) && (i > 0));
		$choice_menu.find('button').width(max_width + 'px');
		set_skip(false);
		hide_message_box(function()
		{
			$overlay.stop().stop().fadeIn(config.effect_speed);
			$choice_menu.find('button').fadeIn(config.effect_speed);
			$choice_menu.stop().fadeIn(config.effect_speed);
		});
		return df.promise();
	}

/* Сравнение
 * if var op val
 * var is a variable name
 * op should be one of the following:
 * 		<   - less than
 * 		<=  - less than or equal
 * 		==  - equal
 * 		!=  - not equal
 * 		>=  - more than or equal
 * 		>   - more than
 */
	this.if = function(params)
	{
		if (config.log_level != LOG_DISABLE) console.log('IF ' + params);
		let df = $.Deferred();
		if (params === undefined)
		{
			df.reject('Missing IF parameters');
			return df.promise();
		}
		let split_params = params.toString().split(' ');
		if (split_params.length !== 3)
		{
			df.reject('Incorrect IF parameters');
			return df.promise();
		}
		let variable = split_params[0];
		let operation = split_params[1];
		let global_variables;
		try
		{
			global_variables = JSON.parse(localStorage.getItem(this.game.short_name + '_global'));
		}
		catch (e)
		{
			df.reject('Error in local storage ' + e.name);
			return df.promise();
		}
		if (variable === 'selected')
			variable = this.game.selected;
		else if ((global_variables !== null) && (global_variables[variable] !== undefined))
			variable = global_variables[variable];
		else if (this.game.local_variables[variable] !== undefined)
			variable = this.game.local_variables[variable];
		else
			variable = 0;
		if (['<', '<=', '==', '!=', '>=', '>'].indexOf(operation) === -1)
		{
			df.reject('Incorrect IF operation: ' + operation);
			return df.promise();
		}
		let value = this.getvar(split_params[2]);
		if (value === false)
		{
			df.reject('Unknown IF variable ' + split_params[2]);
			return df.promise();
		}
		if (!perform_code(variable + operation + value))
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

// Получение следующей команды скрипта
	this.get_next_command = function()
	{
		let line = this.game.script_lines[this.game.script_line_num].trim();
		line = line.replace(/[ \t]{2,}/g, ' ');
		while (((line.length === 0) || (line.charAt(0) === ';') || (line.indexOf('//') === 0)) && (this.game.script_line_num < this.game.script_lines.length))
		{
			this.game.script_line_num++;
			line = this.game.script_lines[this.game.script_line_num].trim();
		}
		if ((line.length === 0) || (line.charAt(0) === ';') || (line.indexOf('//') === 0))
		{
			show_error('Cant\'t find any command in script ' + this.game.script_name);
			return false;
		}
		this.game.script_line_num++;

		if (config.log_level != LOG_DISABLE) console.log('LINE ' + parseInt(this.game.script_line_num, 10) + ': ' + line);
		$('#info_script_line_num').text(parseInt(this.game.script_line_num, 10));
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
	this.execute = function(code)
	{
		let df;
		let _this = this;
		_this.save(0);
		if (code.params)
			df = this[code.command](code.params);
		else
			df = this[code.command]();
		df.done(function(warning)
		{
			if (warning)
			{
				show_warning(warning, function()
				{
					_this.execute(_this.get_next_command());
				});
			}
			else
				_this.execute(_this.get_next_command());
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
			let filename = this.game.dir;
			let line = this.game.script_lines[i].trim();
			if ((line.indexOf('~') !== -1) || (line.indexOf('$') !== -1))
				continue;
			let line_lowercase = line.toLowerCase();
			if (line_lowercase.indexOf('bgload') !== -1)
				filename += '/background/';
			else if (line_lowercase.indexOf('setimg') !== -1)
				filename += '/foreground/';
			else
				continue;

			let delimiter_pos = line.indexOf(' ');
			if (delimiter_pos > 0)
			{
				line = line.substr(delimiter_pos + 1);
				delimiter_pos = line.indexOf(' ');
				if (delimiter_pos > 0)
					filename += line.substr(0, delimiter_pos);
				else
					filename += line.trim();

				if (images_list.indexOf(filename) === -1)
					images_list.push(filename);
			}
		}
		return images_list;
	}

// Получение значения переменной
	this.getvar = function(variable)
	{
		if (typeof(variable) !== 'string')
			return variable;
		variable = variable.trim();
		let value = '';
		let pos = 0;
		let regexp = /\{([A-Za-z\$_]{1}[A-Za-z_0-9]{0,})\}/g;
		if (variable.search(regexp) !== -1)
		{
			let matches;
			while ((matches = regexp.exec(variable)) != null)
			{
				value += variable.substring(pos, matches.index);
				pos = regexp.lastIndex;
				let temp_var = matches[0].replace(/[\$|\{|\}]/g, '');
				if (temp_var === 'selected')
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
					catch (e)
					{
						show_error('Error in local storage ' + e.name);
						return false;
					}
				}
			}
		}
		else if (variable.search(/^[A-Za-z\$_]{1}[A-Za-z_0-9]{0,}$/) !== -1)
		{
			let temp_var = variable;
			if (temp_var.charAt(0) == '$')
				temp_var = temp_var.substr(1);

			if (temp_var === 'selected')
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
				catch (e)
				{
					show_error('Error in local storage ' + e.name);
					return false;
				}
			}
		}

		value += variable.substring(pos);

		if ($.isNumeric(value))
			value = Number(value);
		return value;
	}

/*
	SAVE slot
		save 0 - запись в слот 0
		save 1-20 - запись в слот 1-20
		save ~ - стирание всех записей
*/
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
			catch (e)
			{
				show_warning('Error in local storage ' + e.name);
				return false;
			}
		}
		if (!$.isNumeric(slot))
		{
			show_warning('Incorrect SAVE slot: ' + slot);
			return false;
		}
		let save_game =
		{
			local: this.game.local_variables,
			selected: this.game.selected,
			script_name: this.game.script_name,
			script_line_num: this.game.script_line_num,
			route: this.game.route,
			music: this.game.music,
			sound: this.game.sound,
			bg: this.game.background,
			sprites: this.game.sprites,
		};
		save_game = JSON.stringify(save_game);
		try
		{
			localStorage.setItem(this.game.short_name + '_save_' + slot, save_game);
			show_message_box();
			if (slot !== 0)
				show_notification('Сохранение выполнено', config.notification_delay);
		}
		catch (e)
		{
			show_warning('Error in local storage ' + e.name);
			return false;
		}
	}

/*
	LOAD slot [is_execute]
		load 0 - загрузка из слота 0
		load 1-20 - загрузка из слота 1-20
*/
	this.load = function(slot, is_execute)
	{
		if (config.log_level != LOG_DISABLE) console.log('LOAD ' + slot);
		if (!$.isNumeric(slot))
		{
			show_warning('Incorrect LOAD slot: ' + slot);
			return false;
		}
		let load_game = this.get_load(slot);
		if (!load_game)
			return false;
		this.game.local_variables = load_game.local;
		this.game.selected = load_game.selected;
		this.game.script_name = load_game.script_name;
		this.game.route = load_game.route;
		if (load_game.music)
			this.music(load_game.music);
		if (load_game.sound)
			this.sound(load_game.sound);
		if (load_game.bg)
			this.bgload(load_game.bg);
		let _this = this;
		$.each(load_game.sprites, function(key, value)
		{
			_this.setimg(value.sprite + ' ' + value.x + ' ' + value.y);
		});
		this.game.script_line_num = load_game.script_line_num;
		vn.execute({command: 'jump', params: this.game.script_name + ' ' + (this.game.script_line_num - 1)});
	}

// Получение сохранения
	this.get_load = function(slot)
	{
		let load_game;
		try
		{
			load_game = JSON.parse(localStorage.getItem(this.game.short_name + '_save_' + slot));
		}
		catch (e)
		{
			show_warning('Error in local storage ' + e.name);
			return false;
		}
		return load_game;
	}

// Проверка на наличие сохранения
	this.is_load = function(slot)
	{
		return Boolean(this.get_load(slot));
	}}
