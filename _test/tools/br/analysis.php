<?php
require_once 'config.php';
/**
 *
 * 分析源碼引入及依賴關系，提供單次讀取中的文件載入緩存 dfddf
 * @author yangbo
 *
 */
class Analysis{
	/**
	 * 緩存數據提高效率，c映射內容，i映射依賴列表，s映射縮略名稱
	 * @var array
	 */
	static private $_cache = array();
	//static private $projpath = array();

	var $circle = array();

	public function Analysis(){
		$ss = explode('/', substr($_SERVER['SCRIPT_NAME'], 1));
		/*配置修改為使用Config.php中的配置, by bell 2011-3-25
		 * if(sizeof(self::$projpath) == 0){
			self::$projpath[0] = '../../../_src/';
			self::$projpath[1] = '../../../../tangram/src/';
			self::$projpath[2] = '../../../../base-me/src/';
			self::$projpath[3] = '../../../../Tangram-base/src/';
			//TODO : 項目路徑提取方式應該考慮使用test切分，用於支持ui項目使用同一套框架
			}*/
	}

	/**
	 * 因測試需要更新的引入方法，domain支持多個通過,分割，支持第二參數忽略已經引入內容，遞歸判定跳過的入口必須提前
	 * @param $domain 期望載入的依賴庫
	 * @param $exclude 期望排除的依賴庫
	 * @param $parent 解決相互依賴問題
	 */
	public function get_import_srcs($domain, $recurse = true){
		if(Config::$DEBUG) var_dump("分析$domain");

		if(array_search($domain, $this->circle)) return array();//如果已經被分析過則直接返回
		array_push($this->circle, $domain);

		$include = array();
		$cnts = self::get_src_cnt($domain);
		$is = $cnts['i'];
		if(sizeof($is) > 0)
		foreach($is as $d){
			if($recurse)
			$include = array_merge($include, $this->get_import_srcs($d));
			else
			$include[$d] = self::$_cache[$d];
		}

		//因為依賴關系的前後聯繫，最後在include中加入當前domain
		if($recurse)
		$include[$domain] = $cnts['c'];
		return $include;
	}


	/**
	 * 讀取源文件內容，支持緩存，支持覆蓋率文件讀取，覆蓋率路徑在Config中配置
	 * @param string $domain
	 * @see Config::$COVERAGE_PATH
	 */
	static function get_src_cnt($domain){
		new Analysis();
		if(!array_key_exists($domain, self::$_cache)){
			$cnt =''; $covcnt = '';
			//$path = join('/', explode('.', $domain)).'.js';  //為了支持xx.xx.js類型的文件名而修改 田麗麗
			//文件在當前項目存在則取當前項目，否則取tangram項目
			require_once 'config.php';
			foreach(Config::$SOURCE_PATH as $i=>$d){
				if(Config::$DEBUG)
				var_dump($d.$path);
				if(file_exists($d.$path)){
					$cnt = file_get_contents($d.$path);
					$cnt.="\n";//讀取文件內容必須加個回車
					break;
				}
			}
			//嘗試讀取cov目錄下的文件，如果不存在則忽略
			$covpath = Config::$COVERAGE_PATH.$path;
			if(file_exists($covpath)){
				if(Config::$DEBUG)var_dump($covpath);
				$covcnt = file_get_contents($covpath);
			}
			else $covcnt = $cnt;
			if($cnt == ''){
				if(Config::$DEBUG)
				print "fail read file : ".$path;
				return array('', array(), '');
			}

			if(Config::$DEBUG)
			print "start read file $domain<br />";

			$is = array();
			//正則匹配，提取所有(///import xxx;)中的xxx
			preg_match_all('/\/\/\/import\s+([^;]+);?/ies', $cnt, $is, PREG_PATTERN_ORDER);

			//移除//，順便移除空行
			//			$cnt = preg_replace('/\/\/.*/m', '', $cnt);TODO:正則處理出現在“”或者正則中的//時出現問題
			//移除/**/
			//			$cnt = preg_replace('/\/\*.*\*\//sU', '', $cnt);

			self::$_cache[$domain] = array('c'=>$cnt, 'i'=>$is[1], 'cc'=>$covcnt);
		}
		return self::$_cache[$domain];
	}
}
?>
