<?php
/**
 * 追加接口參數，支持過濾成功用例
 * @param unknown_type $onlyfails
 */
function interXML($onlyfails) {
	if(!file_exists('report.xml'))
	return array();
    $xmlFile = simpleXML_load_file("report.xml");
	$caseList = array ();
    foreach($xmlFile->testsuite as $testsuite){
		foreach ($testsuite->testcase as $testResult) {
			//			$totalCov = 0;
			$browser =strval( $testResult['browserInfo']);
			$host = strval($testResult['hostInfo']);
			$caseName = strval($testResult['name']);
			$fail = strval($testResult['failNumber']);
			$total = strval($testResult['totalNumber']);
			$cov = strval($testResult['cov']);
                        $recordCovForBrowser = strval($testResult['recordCovForBrowser']);
		if (!array_key_exists($caseName, $caseList)) { //如果這個用例不存在
				$caseInfo = array (
					'hostInfo' => $host,
					'fail' => $fail,
					'total' => $total,
					'cov' => $cov,
                    'recordCovForBrowser' => $recordCovForBrowser
				);
				//				$totalCov += $cov;
				$caseList[$caseName] = array (
				$browser => $caseInfo//,
				//				'totalCov'=>$totalCov
				);
				//				$caseList['totalCov'] = $totalCov;
			} else { //否則添加到相應的用例中去
				$foundCase = $caseList[$caseName]; //找到用例名稱對應的array，$caseName為key
				if (!array_key_exists($browser, $foundCase)) { //如果沒有該瀏覽器信息，則添加
					//					$totalCov += $cov;
					$caseList[$caseName][$browser] = array (
						'hostInfo' => $host,
						'fail' => $fail,
						'total' => $total,
						'cov' => $cov,
                        'recordCovForBrowser' => $recordCovForBrowser
					);
					//					$caseList[$caseName]['totalCov'] = $totalCov;
				} else {
					$foundBrowser = $foundCase[$browser]; //有這個瀏覽器
					array_push($foundBrowser, array (
						'hostInfo' => $host,
						'fail' => $fail,
						'total' => $total,
						'cov' => $cov,
                        'recordCovForBrowser' => $recordCovForBrowser
					));
				}
			}

		}
	}

	//根據需求添加僅記錄失敗情況的接口
	if($onlyfails){//如果僅考慮失敗情況，此處根據用例情況過濾
		foreach($caseList as $name => $info){
			$all_success = true;//記錄當前用例是否全部運行成功
			foreach($info as $b => $result){
				if($result['fail'] > 0)
				$all_success = false;//如果有失敗情況則終止循環並進入下一個用例分析
				break;
			}
			//if($all_success) //如果全部通過則從記錄中移除
			//unset($caseList[$name]);
		}
	}
	return $caseList;
}

function record()
{
//    require_once 'geneXML.php';
    /*如果全部運行完畢，發送郵件*/
    $kissList = interXML(false);
    require_once 'geneHTML.php';
    if (sizeof($kissList) > 0) {
        //針對kissList過濾，移除全部正確用例
        $html = geneHTML($kissList);
        $report = 'report.html';
	    $handle = fopen("$report", "w");
	    fwrite($handle, $html);
	    fclose($handle);
//        require_once 'geneHistory.php';
//        geneHistory($html);
    }
}
?>
