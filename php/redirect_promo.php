<?php
	chdir('..');
	$promoName = $_POST['name'];
	$promoLink = $_POST['url'];
	$promoImage = $_POST['image'];
	if (empty($promoName) || (empty($promoLink) || empty($promoImage)))
		exit;
	if (($logStr = @file_get_contents('log/promo_click.log')) === FALSE)
		$logStr = '';
	$logStr = date('Y-m-d H:i:s') . "\t" . $_SERVER['REMOTE_ADDR'] . "\t" . $promoName . "\t" . $promoLink . "\t" . $promoImage . "\r\n" . $logStr;
	file_put_contents('log/promo_click.log', $logStr);
?>