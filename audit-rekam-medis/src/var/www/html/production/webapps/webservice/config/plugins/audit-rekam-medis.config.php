<?php

$dir = dirname(__DIR__)."/be";
if(is_dir($dir)) {
	if($loader) $loader->setPsr4('AuditRekamMedis\\', $dir);
}

$currentDir = dirname(dirname(__FILE__));
$baseDir = dirname($currentDir);
if(is_dir($baseDir . "/plugins/audit-rekam-medis")) {
	if($loader) $loader->setPsr4('AuditRekamMedis\\', $baseDir . "/plugins/audit-rekam-medis");
}

/**
 * Configuration file generated for Audit Rekam Medis Plugin
 */
return [
    'AuditRekamMedis'
];
