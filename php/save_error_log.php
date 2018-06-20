<?php
	if (empty($_POST['message']))
		exit;
	chdir('..');
	$errorMessage = '"' . $_POST['message'] . '"';
	$errorType = $_POST['type'];
	if (!isset($_POST['game_name']))
		$gameName = 'vnds';
	else
		$gameName = 'game_' . $_POST['game_name'];
	if (!isset($_POST['script_name']))
		$scriptName = '';
	else
		$scriptName =  "\t" . $_POST['script_name'];
	if (!isset($_POST['script_line_num']))
		$scriptLineNum = '';
	else
		$scriptLineNum = "\t" . $_POST['script_line_num'];
	if (($logText = @file_get_contents('log/' . $gameName . '_errors.log')) === FALSE)
		$logText = '';
	$logStr = date('Y-m-d H:i:s') . "\t" . $_SERVER['REMOTE_ADDR'] . "\t" . $errorType . "\t" . $errorMessage . $scriptName . $scriptLineNum . "\t" . $_SERVER['HTTP_USER_AGENT'] . "\r\n";
	$logStr = str_replace('<br>', ' ', $logStr);
	$logText = $logStr . $logText;
	file_put_contents('log/' . $gameName . '_errors.log', $logText);
?>