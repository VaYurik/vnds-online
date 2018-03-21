<?php
	chdir('..');
	$errorMessage = null;
	$scriptFile = $_POST['script_file'];
	if (empty($scriptFile))
		$errorMessage = 'Error POST data: empty script filename';
	elseif (!file_exists($scriptFile))
		$errorMessage = 'File ' + $scriptFile + ' not found';
	else
	{
		$scriptLines = array();
		$lines = file($scriptFile);
		foreach ($lines as $line)
		{
			$line = str_replace("\t", ' ', $line); // Заменяем табуляции на пробелы
			$line = preg_replace('/ {2,}/', ' ', $line); // Заменяем многократные пробелы на пробелы
			$line = preg_replace_callback('/(<{2,})/', // Заменяем символ "<", если встречается больше одного раза подряд, на его html-сущность
				function ($matches)
				{
					return htmlentities($matches[1]);
				}, $line);

			$scriptLines[] = trim($line);
		}
	}
	
	print json_encode($result = array
	(
		'lines' => $scriptLines,
		'error' => $errorMessage
	));


?>