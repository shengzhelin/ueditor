/**
 *  ueditor完整配置項
 *  可以在這裡配置整個編輯器的特性
 */
var UEDITOR_CONFIG = {
    UEDITOR_HOME_URL: '../', //這裡你可以配置成ueditor目錄在您網站的絕對路徑
    toolbars: [
        ['FullScreen','Source','|','Undo','Redo','|',
         'Bold','Italic','Underline','StrikeThrough','Superscript','Subscript','RemoveFormat','FormatMatch','|',
         'BlockQuote','|',
         'PastePlain','|',
         'ForeColor','BackColor','InsertOrderedList','InsertUnorderedList','|',
         'Paragraph','RowSpacing','FontFamily','FontSize','|',
         'DirectionalityLtr','DirectionalityRtl','|','','Indent','Outdent','|',
         'JustifyLeft','JustifyCenter','JustifyRight','JustifyJustify','|',
         'Link','Unlink','Anchor','Image','MultiMenu','Video','Map','GMap','Code', '|',
         'Horizontal','Date','Time','Spechars','|',
         'InsertTable','DeleteTable','InsertParagraphBeforeTable','InsertRow','DeleteRow','InsertCol','DeleteCol','MergeCells','MergeRight','MergeDown','SplittoCells','SplittoRows','SplittoCols','|',
         'SelectAll','ClearDoc','SearchReplace','Print','Preview','PageBreak','Help','AutoSave','InsertFrame']
    ],
    labelMap: {
        'anchor':'錨點',
        'undo': '撤銷',
        'redo': '重做',
        'bold': '加粗',
        'indent':'首行縮進',
        'outdent':'取消縮進',
        'italic': '斜體',
        'underline': '下劃線',
        'strikethrough': '刪除線',
        'subscript': '下標',
        'superscript': '上標',
        'formatmatch': '格式刷',
        'source': '源代碼',
        'blockquote': '引用',
        'pasteplain': '純文本粘貼模式',
        'selectall': '全選',
        'print': '打印',
        'preview': '預覽',
        'horizontal': '分隔線',
        'removeformat': '清除格式',
        'time': '時間',
        'date': '日期',
        'unlink': '取消鏈接',
        'insertrow': '前插入行',
        'insertcol': '前插入列',
        'mergeright': '右合併單元格',
        'mergedown': '下合併單元格',
        'deleterow': '刪除行',
        'deletecol': '刪除列',
        'splittorows': '拆分成行',
        'splittocols': '拆分成列',
        'splittocells': '完全拆分單元格',
        'mergecells': '合併多個單元格',
        'deletetable': '刪除表格',
//        'tablesuper': '表格高級設置',
        'insertparagraphbeforetable': '表格前插行',
        'cleardoc': '清空文檔',
        'fontfamily': '字體',
        'fontsize': '字號',
        'paragraph': '格式',
        'image': '圖片',
        'inserttable': '表格',
        'link': '超鏈接',
        'emoticon': '表情',
        'spechars': '特殊字符',
        'searchreplace': '查詢替換',
        'map': 'Baidu地圖',
        'gmap': 'Google地圖',
        'video': '視頻',
        'help': '幫助',
        'justifyleft':'靠左對齊',
        'justifyright':'靠右對齊',
        'justifycenter':'居中對齊',
        'justifyjustify':'兩端對齊',
        'forecolor' : '字體顏色',
        'backcolor' : '背景色',
        'insertorderedlist' : '有序列表',
        'insertunorderedlist' : '無序列表',
        'fullscreen' : '全屏',
        'directionalityltr' : '從左向右輸入',
        'directionalityrtl' : '從右向左輸入',
        'rowspacing' : '行間距',
        'code' : '插入代碼',
        'pagebreak':'分頁',
        'insertframe':'插入Iframe'
    },
    iframeUrlMap: {
        'anchor': '../../../dialogs/anchor/anchor.html',
        'image': '../../../dialogs/image/image.html',
        'inserttable': '../../../dialogs/table/table.html',
        'link': '../../../dialogs/link/link.html',
        'emoticon': '../../../dialogs/emoticon/emoticon.html',
        'spechars': '../../../dialogs/spechars/spechars.html',
        'searchreplace': '../../../dialogs/searchreplace/searchreplace.html',
        'map': '../../../dialogs/map/map.html',
        'gmap': '../../../dialogs/gmap/gmap.html',
        'video': '../../../dialogs/video/video.html',
        'help': '../../../dialogs/help/help.html',
        'code' : '../../../dialogs/code/code.html',
        'multimenu': '../../../dialogs/menu-emoticon/emoticon.html',
        'insertframe': '../../../dialogs/insertframe/insertframe.html'
    },
    listMap: {
        'fontfamily': ['宋體', '楷體', '隸書', '黑體','andale mono','arial','arial black','comic sans ms','impact','times new roman'],
        'fontsize': [10, 11, 12, 14, 16, 18, 20, 24, 36],
        'underline':['none','overline','line-through','underline'],
        'paragraph': ['p:Paragraph', 'h1:Heading 1', 'h2:Heading 2', 'h3:Heading 3', 'h4:Heading 4', 'h5:Heading 5', 'h6:Heading 6'],
        'rowspacing' : ['1.0:0','1.5:15','2.0:20','2.5:25','3.0:30']
    },
    fontMap: {
        '宋體': ['宋體', 'SimSun'],
        '楷體': ['楷體', '楷體_GB2312', 'SimKai'],
        '黑體': ['黑體', 'SimHei'],
        '隸書': ['隸書', 'SimLi'],
        'andale mono' : ['andale mono'],
        'arial' : ['arial','helvetica','sans-serif'],
        'arial black' : ['arial black','avant garde'],
        'comic sans ms' : ['comic sans ms'],
        'impact' : ['impact','chicago'],
        'times new roman' : ['times new roman']
    },
    contextMenu: [
        {
            label : '刪除',
            cmdName : 'delete'

        },
        {
            label : '全選',
            cmdName : 'selectall'

        },{
            label : '刪除代碼',
            cmdName : 'highlightcode'

        },{
             label : '清空文檔',
             cmdName : 'cleardoc',
            exec : function(){
                if(confirm('確定清空文檔嗎？')){
                    this.execCommand('cleardoc');
                }
            }
        },'-',{
             label : '取消鏈接',
             cmdName : 'unlink'
        },'-',{
            group : '段落格式',
            icon : 'justifyjustify',
            subMenu : [
                {
                    label: '靠左對齊',
                    cmdName : 'justify',
                    value : 'left'
                },
               {
                    label: '靠右對齊',
                    cmdName : 'justify',
                    value : 'right'
                },{
                    label: '居中對齊',
                    cmdName : 'justify',
                    value : 'center'
                },{
                    label: '兩端對齊',
                    cmdName : 'justify',
                    value : 'justify'
                }
            ]
        },'-',{
            group : '表格',
            icon : 'table',
            subMenu : [
                {
                    label: '刪除表格',
                    cmdName : 'deletetable'
                },
                {
                    label: '表格前插行',
                    cmdName : 'insertparagraphbeforetable'
                },
                '-',
                {
                    label: '刪除行',
                    cmdName : 'deleterow'
                },
                {
                    label: '刪除列',
                    cmdName : 'deletecol'
                },
                '-',
                 {
                    label: '前插入行',
                    cmdName : 'insertrow'
                },
                {
                    label: '前插入列',
                    cmdName : 'insertcol'
                },
                '-',
                 {
                    label: '右合併單元格',
                    cmdName : 'mergeright'
                },
                {
                    label: '下合併單元格',
                    cmdName : 'mergedown'
                },
                '-',
                 {
                    label: '拆分成行',
                    cmdName : 'splittorows'
                },
                {
                    label: '拆分成列',
                    cmdName : 'splittocols'
                },
                 {
                    label: '合併多個單元格',
                    cmdName : 'mergecells'
                },
                {
                    label: '完全拆分單元格',
                    cmdName : 'splittocells'
                }
            ]
        }
    ],
    initialStyle: '',                                    //編輯器內部樣式
    initialContent: 'hello',  //初始化編輯器的內容
    autoClearinitialContent :true,                       //是否自動清除編輯器初始內容
    iframeCssUrl :'../../../themes/iframe.css',        //要引入css的url
    removeFormatTags : 'b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var',    //配置格式刷刪除的標籤
    removeFormatAttributes : 'class,style,lang,width,height,align,hspace,valign',        //配置格式刷刪除的屬性
    enterTag : 'p',                                      //編輯器回車標籤。p或br
    maxUndoCount : 20,                                   //最多可以回退的次數
    maxInputCount : 20,                                  //當輸入的字符數超過該值時，保存一次現場
    selectedTdClass : 'selectTdClass',                   //設定選中td的樣式名稱
    pasteplain : 0,                                      //是否純文本粘貼。false為不使用純文本粘貼，true為使用純文本粘貼
    textarea : 'editorValue',                            //提交表單時，服務器端接收編輯器內容的名字
    focus : false,                                       //初始化時，是否讓編輯器獲得焦點true或false
    indentValue : '2em',                                 //初始化時，首行縮進距離
    pageBreakTag : '_baidu_page_break_tag_',             //分頁符
    autoSave:true,                                       //是否開啟自動保存
    autoSavePath:this.UEDITOR_HOME_URL+'auto-save.php',  //自動保存的地址
    autoSaveFrequency:5,                                 //自動保存頻率
    minFrameHeight: 320,                                 //最小高度
    autoHeightEnabled: true,                             //是否自動長高
    autoFloatEnabled: true,                              //是否保持toolbar的位置不動
    elementPathEnabled : true,                           //是否啟用elementPath
    serialize : function(){                              //配置過濾標籤
        function X( t, s, b ) {
            var o = {};
            for(var i=0,ai;ai=arguments[i++];){
                for(var k in ai){
                    o[k] = ai[k]
                }
            }

            return o;
        }
        var inline = {strong:1,em:1,b:1,i:1,u:1,span:1,a:1,img:1};
        var block = X(inline, {p:1,div:1,blockquote:1,$:{style:1,dir:1}});
        return {
            blackList: {style:1,script:1,form:1,input:1,textarea:1,"#comment":1}
//            ,
//            whiteList: {
//                br: {$:{}},
//                span: X(inline, {$:{style:1,id:1}}),
//                strong: inline,
//                em:inline,
//                b: inline,
//                a: X(inline,{$:{href:1,'target':1,title:1}}),
//                u: inline,
//                div: block,
//                p: block,
//                ul: {li:1,$:{style:1}},
//                ol: {li:1,$:{style:1}},
//                li: block,
//                img: {$:{style:1,width:1,height:1,src:1,alt:1,title:1}}
//            }
        };
    }()
};