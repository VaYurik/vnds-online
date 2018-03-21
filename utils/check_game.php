<?php
	$gamesList = array();
	chdir('../games/');
	foreach (glob('*', GLOB_ONLYDIR) as $gameDir)
	{
		$content = @file_get_contents($gameDir . '/info.txt');
		if ($content === FALSE)
			echo 'Error reading file ' . $gameDir . '/info.txt<br>';
		if (preg_match('/title=(.+)/', $content, $matches) == 0)
			echo 'Error file format ' . $gameDir . '/info.txt<br>';
		else
			$gameName = $matches[1];
		echo '<br><b>Checking ' . $gameName . '...</b><br>';

		$content = @file_get_contents($gameDir . '/img.ini');
		if ($content === FALSE)
			echo 'Error reading file ' . $gameDir . '/img.ini<br>';
		if (preg_match('/width=(\d+)\s*height=(\d+)/', $content, $matches) == 0)
			echo 'Error file format ' . $gameDir . '/img.ini<br>';
		else
		{
			$gameWidth = $matches[1];
			$gameHeight = $matches[2];
		}
		$gameIconSmall = getFullFileName($gameDir, 'icon');
		$gameIconBig = getFullFileName($gameDir, 'icon-high');
		$gameThumbSmall = getFullFileName($gameDir, 'thumbnail');
		$gameThumbBig = getFullFileName($gameDir, 'thumbnail-high');
		$bgFiles = array();
		$fgFiles = array();
		$sndFiles = array();
		foreach (glob($gameDir . '/script/*.scr') as $gameScript)
		{
			$script = @file_get_contents($gameScript);
			$findCount = preg_match_all('/bgload (\S+\.[A-Za-z0-9]+)/', $script, $matches);
			$bgFiles = array_merge($bgFiles, array_unique($matches[1]));
			$findCount = preg_match_all('/setimg (\S+\.[A-Za-z0-9]+)/', $script, $matches);
			$fgFiles = array_merge($fgFiles, array_unique($matches[1]));
			$findCount = preg_match_all('/music (\S+\.[A-Za-z0-9]+)/', $script, $matches);
			$sndFiles = array_merge($sndFiles, array_unique($matches[1]));
			$findCount = preg_match_all('/sound (\S+\.[A-Za-z0-9]+)/', $script, $matches);
			$sndFiles = array_merge($sndFiles, array_unique($matches[1]));
		}
		$bgFiles = array_unique($bgFiles);
		checkFiles($gameDir . '/background', $bgFiles);
		$fgFiles = array_unique($fgFiles);
		checkFiles($gameDir . '/foreground', $fgFiles);
		$sndFiles = array_unique($sndFiles);
		checkFiles($gameDir . '/sound', $sndFiles);
	}

	function checkFiles($path, $fileList)
	{
		foreach ($fileList as $fileName)
		{
			$fileName = $path . '/' . $fileName;
			if (!file_exists($fileName))
				echo 'File ' . $fileName . ' not found!<br>';
		}
	}
	
	function getFullFileName($filePath, $fileName)
	{
		$fileList = glob($filePath . '/' . $fileName . '.*');
		if (count($fileList) == 1)
			return $fileList[0];
		else
		{
			echo 'Can\'t find ' . $fileName . '<br>';
			return false;
		}
	}
?>