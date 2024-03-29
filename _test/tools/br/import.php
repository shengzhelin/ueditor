<?php
require_once 'config.php';
//加入一個調試開關
if(array_key_exists('debug', $_GET))
Config::$DEBUG = true;
if(!Config::$DEBUG){
	header("Content-type: text/javascript; charset=utf-8");
	header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
}
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 *
 * path: import.php
 * author: berg
 * version: 1.0
 * date: 2010/07/18 23:57:52
 *
 * @fileoverview * import.js的php版本
 * 接受一個f參數，格式和import.js相同，自動合並js並輸出
 * 此外，本腳本支持引入一個包所有文件（其實也就是一個目錄下的所有js文件，**不遞歸**）
 * IE下，get請求不能超過2083字節，請注意。
 */
$cov = array_key_exists('cov', $_GET) ? true : false;
$import = 'import.js';
function importSrc($cov){
	global $import;
	$source = '';
	require_once 'config.php';
	if(file_exists(Config::$test_PATH.$import)){
		$cnt = file_get_contents(Config::$test_PATH.$import);
	}
	if($cnt == ''){
		if(Config::$DEBUG)
		print "fail read file : ".Config::$test_PATH.$import;
		return '';
	}
	$is = array();
	//正則匹配，提取所有(///import xxx;)中的xxx
	preg_match_all('/\/\/\/import\s+([^;]+);?/ies', $cnt, $is, PREG_PATTERN_ORDER);
	foreach($is[1] as $i) {
//        $dd = $i;
		//$path = join('/', explode('.', $i)).'.js';
		$path = $i.'.js'; //為了支持xx.xx.js類型的文件名而修改 田麗麗
		if($cov){
			$covpath = Config::$COVERAGE_PATH.$path;
			if(file_exists($covpath)){
				if(Config::$DEBUG) var_dump($covpath);
                $_source=file_get_contents($covpath);
                $source.= $_source;
			}
			else if(Config::$DEBUG)print "fail read file : ".Config::$COVERAGE_PATH.$path;
		}
		else {
		    foreach(Config::$SOURCE_PATH as $i=>$d){
//                if(preg_match("/editorui/",$dd)){
//                    echo "*************".file_get_contents($d.$path)."************";
//                }
			    if(file_exists($d.$path)){
					$source.= file_get_contents($d.$path);
					$source.="\n";//讀取文件內容必須加個回車
					break;
		        }
		    }
		}
	}
	return $source;
}
//update by bell 2011-03-25, 更新覆蓋率相關邏輯
echo importSrc($cov);
?>