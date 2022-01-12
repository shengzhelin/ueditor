UE.parse.register("charts", function(utils) {
  utils.cssRule(
    "chartsContainerHeight",
    ".edui-chart-container { height:" +
      (this.chartContainerHeight || 300) +
      "px}"
  );
  var resourceRoot = this.rootPath,
    containers = this.root,
    sources = null;

  //不存在指定的根路徑， 則直接退出
  if (!resourceRoot) {
    return;
  }

  if ((sources = parseSources())) {
    loadResources();
  }

  function parseSources() {
    if (!containers) {
      return null;
    }

    return extractChartData(containers);
  }

  /**
     * 提取數據
     */
  function extractChartData(rootNode) {
    var data = [],
      tables = rootNode.getElementsByTagName("table");

    for (var i = 0, tableNode; (tableNode = tables[i]); i++) {
      if (tableNode.getAttribute("data-chart") !== null) {
        data.push(formatData(tableNode));
      }
    }

    return data.length ? data : null;
  }

  function formatData(tableNode) {
    var meta = tableNode.getAttribute("data-chart"),
      metaConfig = {},
      data = [];

    //提取table數據
    for (var i = 0, row; (row = tableNode.rows[i]); i++) {
      var rowData = [];

      for (var j = 0, cell; (cell = row.cells[j]); j++) {
        var value = cell.innerText || cell.textContent || "";
        rowData.push(cell.tagName == "TH" ? value : value | 0);
      }

      data.push(rowData);
    }

    //解析元訊息
    meta = meta.split(";");
    for (var i = 0, metaData; (metaData = meta[i]); i++) {
      metaData = metaData.split(":");
      metaConfig[metaData[0]] = metaData[1];
    }

    return {
      table: tableNode,
      meta: metaConfig,
      data: data
    };
  }

  //加載資源
  function loadResources() {
    loadJQuery();
  }

  function loadJQuery() {
    //不存在jquery， 則加載jquery
    if (!window.jQuery) {
      utils.loadFile(
        document,
        {
          src: resourceRoot + "/third-party/jquery-1.10.2.min.js",
          tag: "script",
          type: "text/javascript",
          defer: "defer"
        },
        function() {
          loadHighcharts();
        }
      );
    } else {
      loadHighcharts();
    }
  }

  function loadHighcharts() {
    //不存在Highcharts， 則加載Highcharts
    if (!window.Highcharts) {
      utils.loadFile(
        document,
        {
          src: resourceRoot + "/third-party/highcharts/highcharts.js",
          tag: "script",
          type: "text/javascript",
          defer: "defer"
        },
        function() {
          loadTypeConfig();
        }
      );
    } else {
      loadTypeConfig();
    }
  }

  //加載圖表差異化配置文件
  function loadTypeConfig() {
    utils.loadFile(
      document,
      {
        src: resourceRoot + "/dialogs/charts/chart.config.js",
        tag: "script",
        type: "text/javascript",
        defer: "defer"
      },
      function() {
        render();
      }
    );
  }

  //渲染圖表
  function render() {
    var config = null,
      chartConfig = null,
      container = null;

    for (var i = 0, len = sources.length; i < len; i++) {
      config = sources[i];

      chartConfig = analysisConfig(config);

      container = createContainer(config.table);

      renderChart(container, typeConfig[config.meta.chartType], chartConfig);
    }
  }

  /**
     * 渲染圖表
     * @param container 圖表容器節點對象
     * @param typeConfig 圖表類型配置
     * @param config 圖表通用配置
     * */
  function renderChart(container, typeConfig, config) {
    $(container).highcharts(
      $.extend({}, typeConfig, {
        credits: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        title: {
          text: config.title,
          x: -20 //center
        },
        subtitle: {
          text: config.subTitle,
          x: -20
        },
        xAxis: {
          title: {
            text: config.xTitle
          },
          categories: config.categories
        },
        yAxis: {
          title: {
            text: config.yTitle
          },
          plotLines: [
            {
              value: 0,
              width: 1,
              color: "#808080"
            }
          ]
        },
        tooltip: {
          enabled: true,
          valueSuffix: config.suffix
        },
        legend: {
          layout: "vertical",
          align: "right",
          verticalAlign: "middle",
          borderWidth: 1
        },
        series: config.series
      })
    );
  }

  /**
     * 創建圖表的容器
     * 新創建的容器會替換掉對應的table對象
     * */
  function createContainer(tableNode) {
    var container = document.createElement("div");
    container.className = "edui-chart-container";

    tableNode.parentNode.replaceChild(container, tableNode);

    return container;
  }

  //根據config解析出正確的類別和圖表數據訊息
  function analysisConfig(config) {
    var series = [],
      //數據類別
      categories = [],
      result = [],
      data = config.data,
      meta = config.meta;

    //數據對齊方式為相反的方式， 需要反轉數據
    if (meta.dataFormat != "1") {
      for (var i = 0, len = data.length; i < len; i++) {
        for (var j = 0, jlen = data[i].length; j < jlen; j++) {
          if (!result[j]) {
            result[j] = [];
          }

          result[j][i] = data[i][j];
        }
      }

      data = result;
    }

    result = {};

    //普通圖表
    if (meta.chartType != typeConfig.length - 1) {
      categories = data[0].slice(1);

      for (var i = 1, curData; (curData = data[i]); i++) {
        series.push({
          name: curData[0],
          data: curData.slice(1)
        });
      }

      result.series = series;
      result.categories = categories;
      result.title = meta.title;
      result.subTitle = meta.subTitle;
      result.xTitle = meta.xTitle;
      result.yTitle = meta.yTitle;
      result.suffix = meta.suffix;
    } else {
      var curData = [];

      for (var i = 1, len = data[0].length; i < len; i++) {
        curData.push([data[0][i], data[1][i] | 0]);
      }

      //餅圖
      series[0] = {
        type: "pie",
        name: meta.tip,
        data: curData
      };

      result.series = series;
      result.title = meta.title;
      result.suffix = meta.suffix;
    }

    return result;
  }
});
