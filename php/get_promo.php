<?php
	chdir('..');
	$errorMessage = null;
	$promoFile = $_GET['promo_file'];
	if (empty($promoFile))
		$errorMessage = 'Error GET data: empty promo filename';
	else
		$promoFile = 'promo/' . $promoFile;
	if (!file_exists($promoFile))
		$errorMessage = 'File ' + $promoFile + ' not found';
	try
	{
		$promoFile = file_get_contents($promoFile);
		if ($promoFile == false) $errorMessage = 'Error reading file ' . $promoFile;
	}
	catch (Exception $e)
	{
		$errorMessage = 'Error reading file ' . $promoFile . ':' . $e->getMessage();
	}
	$promoFile = trim($promoFile);
	if (empty($promoFile)) exit(1);
	$promoLines = explode("\n", $promoFile);
	$promoLine = $promoLines[rand(1, count($promoLines)) - 1];
	$promoInfo = explode(';', $promoLine);
	$promoName = trim($promoInfo[0]);
	$promoLink = trim($promoInfo[1]);
	$promoImage = trim($promoInfo[2]);
	$logStr = date('Y-m-d H:i:s') . "\t" . $_SERVER['REMOTE_ADDR'] . "\t" . $promoName . "\t" . $promoLink . "\t" . $promoImage . "\r\n";
	file_put_contents('log/promo_show.log', $logStr, FILE_APPEND);
	print json_encode($result = array
	(
		'name' => $promoName,
		'url' => $promoLink,
		'image' => $promoImage,
		'error' => $errorMessage
	));
?>
