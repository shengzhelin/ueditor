<?php
/**
 * 使用注意事項：一般情況下不會所產生的測試結果表格內容不會有問題，
 * 問題的引入是沒有對每次添加的數據做瀏覽器判斷，在正常情況下瀏覽器的順序恒定不變的
 * 當不同瀏覽器運行的測試內容不同的情況下，如ie8下采用filter=baidu.fx，
 * 而chrome下采用filter=baidu.fx.collaplse
 * 在添加瀏覽器的時候按照順序會先添加chrome，再添加ie8
 * 那麽當chrome下用例只有baidu.fx.collapse的時候，
 * 由於他會默認先找到的瀏覽器為chrome，那麽與它相鄰的ie8的baidu.fx.current的內容會左移到chrome下。
 * 這個跟存儲數據的格式有關系：caseList
 * 							/         \
 *               baidu.fx.collapse    baidu.fx.current
 *              /           \             /            \
 *          chrome          ie8         null           ie8
 *         /  |  \         / |  \    (supposed       /   |  \
 *    fail  total hostInfo          to be chrome)  fail total hostInfo
 *
 *
 *
 * 不直接使用<style type ="text/css">來設置css是因為有的郵件客戶端會過濾這樣的信息
 *
 * ***/
function geneHTML($caseList, $name=''){
	date_default_timezone_set('PRC');
//	$url = (isset ($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '') . $_SERVER['PHP_SELF'];
    $url ="";
	$html = "<!DOCTYPE><html><head><meta http-equiv='Content-Type' content='text/html; charset=utf-8' />
<style>td, th {border: 1px solid black;}</style></head><body><div>
<h2 align='center'>自動化用例測試結果".date('Y-m-d H:i:s')."</h2>
<a href='http://$url/../../../../report/base/$name' style='font:normal bolder 12pt Arial' title='效果應該比郵件好'>網頁版</a>
<table align='center' cellspacing='0' style='font:normal bolder 12pt Arial;border: 1px solid black; color: #000000; background-color: #F0FFFF; text-align: center;'>
<tr><th colspan='16'>fail的用例統計</th></tr><tr><th rowspan='2'>用例名稱</th>".getTrCase($caseList,true,1)."</table><p><br/></p>
<table align='center' cellspacing='0' style='font:normal bolder 12pt Arial;border: 1px solid black; color: #000000; background-color: #F0FFFF; text-align: center;'>
<tr><th colspan='17'>全部用例統計</th></tr><tr><th rowspan='2'>用例名稱</th>".getTrCase($caseList,false,1)."<tr><th colspan='17'>未覆蓋到的用例</th></tr>".getTrCase($caseList,false,0)."</table></div></body></html>";
//  ."</table></div>"._srcOnlyList()."</body></html>"
	return $html;
}

/**
 * 創建遺漏用例列表
 * FIXME: 需要過濾package類型，考慮使用js名稱同名目錄存在進行過濾或者白名單
 */
function _srcOnlyList(){
	require 'case.class.php';
	$list = Kiss::listSrcOnly(false);
	$len = sizeof($list);
	$flag="<table cellspacing='0' style='border: 1px solid black; "
	."color: #fff; background-color: #0d3349; "
	."text-shadow: rgba(0, 0, 0, 0.5) 2px 2px 1px; "
	."text-align: center;'><thead><tr><th>遺漏列表：總計$len，未過濾無需用例的package類型</th></tr><tr><td>";
	$flag.=implode("</td></tr><tr><td>", $list);
	$flag.="</tr></table>";
	return $flag;
}

/**
 *
 * 根據實際瀏覽器書目確認生成表頭
 * @param unknown_type $caseList
 */
function getThBrowser($caseList){
	//創建瀏覽器相關單元格
	$thBrowser = '';
	$count = 0;
	foreach ($caseList as $casename => $casedetail) {
		//每一個用例
		foreach ($casedetail as $b => $info) {
			$thBrowser .= "<th colspan='3'>$b</th>";
			$count++;
		}
		$thBrowser .="</tr><tr>";
		break;//遍歷一次就知道所有瀏覽器的信息
	}
	for($index = 0; $index < $count; $index++) {
		$thBrowser .= "<td>cov</td><td>fail</td><td>total</td>";
	}

	return $thBrowser."</tr>";
}

/**
 *
 * 根據執行結果生成單元格信息
 * @param unknown_type $caseList
 */
function getTrCase($caseList,$onlyFail,$onlyCoverd){
//$onlyFail 為真時，只顯示 fail 的用例
    //$onlyCoverd 為0時，只顯示全瀏覽器覆蓋率為0的用例;為1時，只顯示全瀏覽器覆蓋率不為0的用例；為其他時，顯示所有的用例
	//創建case名對應的單元格
    $totalTrCase = '';
	require_once 'config.php';
    $rowColor = '#B0E0E6';//標記行的顏色，單雙數行顯示的背景顏色不同
	$numBro = count(Config::getBrowserSet($configBrowserSet));
    $averageCov = 0;//所有用例的全瀏覽器覆蓋率的平均值（全瀏覽器覆蓋率為0的不計）
    $numCov = 0;//全瀏覽器覆蓋率不為0的用例數量
	foreach ($caseList as $casename => $caseDetail) {
		//每一個用例
        $ifFail = false;
		$cnurl = implode('.', explode('_', $casename));
		$trCase = '';
        $totalCov = calTotalCov($caseDetail,$numBro);
        $averageCov +=$totalCov;
        $numCov = $totalCov==0?$numCov:$numCov+1;
        if(($onlyCoverd==0&&$totalCov!=0)||($onlyCoverd==1&&$totalCov==0))//$onlyCoverd 為0時，只顯示全瀏覽器覆蓋率為0的用例;為1時，只顯示全瀏覽器覆蓋率不為0的用例；
            continue;
        if(!$onlyFail){//對於展示 fail 的用例的列表，不顯示全瀏覽器覆蓋率
		    $trCase .= "<td title='全瀏覽器覆蓋率'>".$totalCov.($totalCov=="_"?"":"%")."</td>";
        }
		foreach ($caseDetail as $br => $infos) {
			//$b為browser名字,$info為詳細信息
			$fail = $infos['fail'];
            $ifFail = $fail==0?$ifFail:true;
			$total = $infos['total'];
			$cov = $infos['cov'];
			$color = $fail == 0 ? $rowColor : '#CD5C5C';
            $PercentSign = $cov=='_'?'':'%';
			$trCase .= "<td style='background-color:".$color."'>".$cov.$PercentSign."</td><td style='background-color:".$color."'>".$fail."</td><td style='background-color:".$color."'>".$total."</td>";
        }
		$trCase ="<tr style='background-color:$rowColor'><td><a href='http://../run.php?case=$cnurl'>運行</a>$casename</td>".$trCase."</tr>";
        if(!$onlyFail||$ifFail){
            $totalTrCase =$totalTrCase.$trCase;
            $rowColor = $rowColor=='#F0FFFF'?'#B0E0E6':'#F0FFFF';
        }
        else;
	}
    $averageCov = number_format($averageCov/$numCov,1);
    if($onlyCoverd==0)
        $tableContent = $totalTrCase;
    elseif(!$onlyFail)
        $tableContent = "<th rowspan='2'>總覆蓋率<br>(平均值：".$averageCov."%)</th>".getThBrowser($caseList).$totalTrCase;
    else
        $tableContent = getThBrowser($caseList).$totalTrCase;
	return $tableContent;
}

/**
 *
 * 計算總覆蓋率信息
 * @param unknown_type $caseDetail
 * @param unknown_type $brcount
 */
function calTotalCov($caseDetail,$brcount){
    $length = -1;
    $num_statements = 0;
    $num_executed = 0;
    $totalInfo = null;//數組，記錄全瀏覽器的覆蓋情況，對文件中的每一行：覆蓋為1，沒覆蓋為0，不計數為2
    $flag = 1;//$flag==-1時，各個瀏覽器覆蓋率記錄的文件信息有沖突，不能計算出全瀏覽器覆蓋率（統計的文件長度不同/標記為2的不計入統計的行信息不同）
	foreach ($caseDetail as $caseInfo){
        //如果recordCovForBrowser為空，跳過這個$caseInfo
        if($caseInfo['recordCovForBrowser']==''){
            continue;
        }
        $infos = explode(',',$caseInfo['recordCovForBrowser']);

        $length = ($length==-1||$length==count($infos))?count($infos):-1;
        if($length==-1||$length!=count($infos))
            break;//統計的文件長度不同
        else
            ;
        if($totalInfo==null){
//            if(count($infos)==1){
//                $flag = 0;//沒有覆蓋率信息
//                break;
//            }
            for($i=0;$i<count($infos);$i++){
                $totalInfo[$i] = $infos[$i];

            }
        }
        else{
            for($i=0;$i<count($infos);$i++){

                if($totalInfo[$i]==2){
                    continue;
                }
                elseif($infos[$i]==2){
                    $flag  = -1;//標記為2的不計入統計的行信息不同
                    break;
                }
                elseif($totalInfo[$i]==0&&$infos[$i]==1){
                    $totalInfo[$i] = 1;
                }
                else;
            }
            if($flag==-1){
                break;
            }
	    }
    }
    if($flag==-1)//各個瀏覽器的統計信息有矛盾
        $totalCov = "fail";
    elseif($length==-1||$totalInfo==null)//沒有覆蓋率信息
        $totalCov = "_";
    else{
        for($i=0;$i<count($totalInfo);$i++){
            if($totalInfo[$i]==0)
                $num_statements++;
            elseif($totalInfo[$i]==1){
                $num_statements++;
                $num_executed++;
            }
            else;
        }
        $totalCov = number_format(100*($num_executed/$num_statements),1);
    }
	return $totalCov;
}

?>