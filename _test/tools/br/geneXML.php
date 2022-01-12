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
			$browser = $testResult['browserInfo'];
			$host = $testResult['hostInfo'];
			$caseName = $testResult['name']; //得到用例名稱
			settype($caseName, "string"); //$caseName本來類型為object，需要做轉換
			$fail = $testResult['failNumber'];
			$total = $testResult['totalNumber'];
			$cov = $testResult['cov'];
			settype($browser, "string");
			settype($host, "string");
			settype($fail, "string");
			settype($total, "string");
			settype($cov, "float");

			if (!array_key_exists($caseName, $caseList)) { //如果這個用例不存在
				$caseInfo = array (
					'hostInfo' => $host,
					'fail' => $fail,
					'total' => $total,
					'cov' => $cov
				);
				//				$totalCov += $cov;
				$caseList[$caseName] = array (
				$browser => $caseInfo//,
				//				'totalCov'=>$totalCov
				);

				//				$caseList['totalCov'] = $totalCov;
			} else { //否則添加到相應的用例中去
				$foundCase = $caseList[$caseName]; //找到用例名稱對應的array，$caseName為key
				if (!array_key_exists($browser, $foundCase)) { //如果沒有該瀏覽器訊息，則添加
					//					$totalCov += $cov;
					$caseList[$caseName][$browser] = array (
						'hostInfo' => $host,
						'fail' => $fail,
						'total' => $total,
						'cov' => $cov
					);
					//					$caseList[$caseName]['totalCov'] = $totalCov;
				} else {
					$foundBrowser = $foundCase[$browser]; //有這個瀏覽器
					array_push($foundBrowser, array (
						'hostInfo' => $host,
						'fail' => $fail,
						'total' => $total,
						'cov' => $cov
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
?>