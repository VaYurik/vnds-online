<?php
	chdir('..');
	$promoName = $_POST['name'];
	$promoLink = $_POST['url'];
	$promoImage = $_POST['image'];
	if (empty($promoName) || (empty($promoLink) || empty($promoImage))) exit;
	$logStr = date('Y-m-d H:i:s') . "\t" . $_SERVER['REMOTE_ADDR'] . "\t" . $promoName . "\t" . $promoLink . "\t" . $promoImage . "\r\n";
	file_put_contents('log/promo_click.log', $logStr, FILE_APPEND);
?>