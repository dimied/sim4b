<?php

$app_namespace_map = array(
	"Module"=> "./src/modules"
);

function __autoload($classname) {
	//echo "Autoloading : ".$classname;
	$filename_prefix = __DIR__.'/';
	$parts = explode('\\', $classname);
	
	$classname = array_pop($parts);
	
	if( count($parts) > 0 ) {
		$nsPrefix = implode("\\", $parts);
		
		foreach($GLOBALS["app_namespace_map"] as $ns => $path) {
			if($ns === $nsPrefix) {
				$filename_prefix .= $path."/";
				break;
			}
		}
	}

	$filename = $filename_prefix.$classname.'.php';
	if( DIRECTORY_SEPARATOR !== "/" ) {
		//make more friendly for Windows systems
		$filename = str_replace("/", DIRECTORY_SEPARATOR, $filename);
	}
	//echo $filename;
	
	if( file_exists($filename) ) {
		include_once($filename);
	} else {
		throw new Exception('Class not found: '.$classname);
	}
}

function getPathURL($localpath) {
	$url = (DIRECTORY_SEPARATOR !== "/") 
		? str_replace(DIRECTORY_SEPARATOR,"/", $localpath) 
		: $localpath;

	return $_SERVER["DOCUMENT_ROOT"]."/".$url;
}
?>
