<?php
//	header('Content-type: application/json');

	$gamesList = array();
	chdir('..');
	foreach (glob('games/*', GLOB_ONLYDIR) as $gameDir)
	{
		$errorMessage = null;
		$content = @file_get_contents($gameDir . '/info.txt');
		if ($content === FALSE)
			$errorMessage = 'Error reading file ' . $gameDir . '/info.txt';
		if (preg_match('/title=(.+)/', $content, $matches) == 0)
			$errorMessage = 'Error file format ' . $gameDir . '/info.txt';
		else
			$gameName = $matches[1];

		$content = @file_get_contents($gameDir . '/img.ini');
		if ($content === FALSE)
			$errorMessage = 'Error reading file ' . $gameDir . '/img.ini';
		if (preg_match('/width=(\d+)\s*height=(\d+)/', $content, $matches) == 0)
			$errorMessage = 'Error file format ' . $gameDir . '/img.ini';
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