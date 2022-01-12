/**
 * 重載QUnit部分接口實現批量執行控制功能
 */
(function() {
	if (!QUnit)
		return;
	var ms = QUnit.moduleStart, d = QUnit.done;

	function _d(args /* failures, total */) {
		//默認展開失敗用例
		$('li.fail ol').toggle();
		if (parent && parent.brtest) {
			parent.$(parent.brtest).trigger('done', [ new Date().getTime(), {
				failed : args[0],
				passed : args[1],
                detail:args[2]
			}, window._$jscoverage || null ]);
		}
	}
	QUnit.moduleStart = function() {
		stop();
		/* 為批量執行等待import.php正確返回 */
		var h = setInterval(function() {
			if (window && window['baidu']) {
				clearInterval(h);
				ms.apply(this, arguments);
				start();
			}
		}, 20);
	};
	QUnit.done = function() {
		_d(arguments);
		d.apply(this, arguments);
	};
})();
