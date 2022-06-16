<?php
	if (!isset($_POST['type']) && (!isset($_POST['game_name'])))
		exit;
	chdir('..');
	$infoType = $_POST['type'];
	$gameName = $_POST['game_name'];
	if (($logStr = @file_get_contents('log/games_info.log')) === FALSE)
		$logStr = '';
	$logStr = date('Y-m-d H:i:s') . "\t" . $_SERVER['REMOTE_ADDR'] . "\t" . $infoType . "\t" . $gameName . "\r\n" . $logStr;
	file_put_contents('log/games_info.log', $logStr);
?>