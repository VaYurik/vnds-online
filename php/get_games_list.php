<?php
	$gamesList = array();
	chdir('..');
	foreach (glob('games/*', GLOB_ONLYDIR) as $gameDir)
	{
		$errorMessage = null;
		$gameFont = null;
		$textSize = null;
		$lineHeight = null;
		$content = @file_get_contents($gameDir . '/info.txt');
		if ($content === FALSE)
			$errorMessage = 'Ошибка чтения файла ' . $gameDir . '/info.txt';
		if (preg_match('/title=(.+)/u', $content, $matches) == 0)
			$errorMessage = 'Неверный формат файла ' . $gameDir . '/info.txt<br><br>Отсутствует название игры';
		else
			$gameName = $matches[1];
		if (preg_match('/font=(.+)/', $content, $matches))
		{
			$match = trim($matches[1]);
			if (!file_exists($gameDir . '/font/' . $match))
				$errorMessage = 'Ошибка в файле ' . $gameDir . '/info.txt<br><br>Шрифт ' . $gameDir . '/font/' . $match . ' не найден';
			else
				$gameFont = $gameDir . '/font/' . $match;
		}
		if (preg_match('/text_size=(.+)/', $content, $matches))
		{
			$match = trim($matches[1]);
			if ((preg_match('/(.+)em/', $match, $matches)) && (is_numeric($matches[1])))
				$textSize = $matches[1];
			else if ((preg_match('/(.+)px/', $match, $matches)) && (is_numeric($matches[1])))
				$textSize = $matches[1] / 16;
			else if ((preg_match('/(.+)%/', $match, $matches)) && (is_numeric($matches[1])))
				$textSize = $matches[1] / 100;
			else
				$errorMessage = 'Ошибка в файле ' . $gameDir . '/info.txt<br><br>Неверный размер шрифта';
		}
		if (preg_match('/line_height=(.+)/', $content, $matches))
		{
			$match = trim($matches[1]);
			if (is_numeric($match))
				$lineHeight = $match;
			else
				$errorMessage = 'Ошибка в файле ' . $gameDir . '/info.txt<br><br>Неверная высота строки';
		}

		$content = @file_get_contents($gameDir . '/img.ini');
		if ($content === FALSE)
			$errorMessage = 'Ошибка чтения файла ' . $gameDir . '/img.ini';
		if (preg_match('/width=(\d+)\s*height=(\d+)/', $content, $matches) == 0)
			$errorMessage = 'Неверный формат файла ' . $gameDir . '/img.ini';
		else
		{
			$gameWidth = $matches[1];
			$gameHeight = $matches[2];
		}
		$gameIconSmall = getFullFileName($gameDir, 'icon');
		$gameIconBig = getFullFileName($gameDir, 'icon-high');
		$gameThumbSmall = getFullFileName($gameDir, 'thumbnail');
		$gameThumbBig = getFullFileName($gameDir, 'thumbnail-high');
		$gamesList[] = array
		(
			'dir' => $gameDir,
			'full_name' => $gameName,
			'short_name' => basename($gameDir),
			'width' => $gameWidth,
			'height' => $gameHeight,
			'icon_s' => $gameIconSmall,
			'icon_b' => $gameIconBig,
			'thumb_s' => $gameThumbSmall,
			'thumb_b' => $gameThumbBig,
			'font' => $gameFont,
			'text_size' => $textSize,
			'line_height' => $lineHeight,
			'error' => $errorMessage
		);
		unset($gameName, $gameWidth, $gameHeight, $errorMessage);
	}
	print json_encode($gamesList);

	function getFullFileName($filePath, $fileName)
	{
		$fileList = glob($filePath . '/' . $fileName . '.*');
		if (count($fileList) == 1)
			return $fileList[0];
	}

?>