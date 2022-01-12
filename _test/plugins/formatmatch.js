module('plugins.formatmatch');

/*trace 973*/
test('為一行無格式的文字刷2種不同的格式', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
        editor.setContent('<p><strong>first</strong></p><p><em>second</em></p><p>third</p>');
        setTimeout(function () {
            var body = editor.body;
            range.setStart(body.firstChild.firstChild.firstChild, 2).collapse(true).select();
            editor.execCommand('formatmatch');
            range.selectNode(body.lastChild.firstChild).select();
            ua.mouseup(body);
            editor.addListener('mouseup', function () {
                equal(editor.queryCommandState('formatmatch'), 0, '刷後狀態為0');
                equal(body.lastChild.innerHTML.toLowerCase(), '<em>third</em>');
                start();
            });
            range.setStart(body.lastChild.previousSibling.firstChild.firstChild, 2).collapse(true).select();
            editor.execCommand('formatmatch');
            range.selectNode(body.lastChild.firstChild).select();
            ua.mouseup(body);
            /*editor自身還掛了一個mouseup偵聽器，必須在用例執行前調用，否則_selectionChange方法調用無法取到window，會報錯*/

        }, 50);
    stop();
});

/*trace 971*/
test('trace 971:有格式文字刷自己', function () {
    var editor = te.obj[0];
    var range = te.obj[1];

        editor.setContent('<p><strong>歡迎光臨</strong></p>');
        setTimeout(function () {
            var body = editor.body;
            var text = body.firstChild.firstChild.firstChild;
            range.setStart(text, 2).collapse(true).select();
            editor.addListener('mouseup', function () {
                equal(editor.getContent(), '<p><strong>歡</strong><strong>迎光臨</strong></p>');
                start();
            });
            editor.execCommand('formatmatch');
            range.setStart(text, 0).setEnd(text, 1).select();
            ua.mouseup(editor.body);

        }, 50);
    stop();
});
//TODO 1.2.6
//test( 'trace 1553:居中的標題自己刷自己', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    editor.setContent( '<h2 style="text-align:center">歡迎使用UEditor編輯器</h2>' );
//    setTimeout( function () {
//        var body = editor.body;
//        var text = body.firstChild.firstChild;
//        range.setStart( text, 2 ).setEnd( text, 4 ).select();
//        editor.addListener( 'mouseup', function () {
//            if ( (ua.browser.gecko && ua.browser.gecko < 2)||ua.browser.ie ==9)
//                equal( editor.getContent(), '<h2 style="text-align:center;" >歡迎使用UEditor編輯器</h2>' );
//            else
//                equal( editor.getContent(), '<h2 style="text-align:center" >歡迎使用UEditor編輯器</h2>' );
//        } );
//        editor.execCommand( 'formatmatch' );
//        range.setStart( text, 5 ).setEnd( text, 6 ).select();
//        ua.mouseup( editor.body );
//        setTimeout( function () {
//            start();
//        }, 500 );
//    }, 50 );
//    stop();
//} );

/*trace:969*/
test('格式刷的狀態反射：非閉合區間', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
        editor.setContent('hello');
        setTimeout(function () {
            var body = editor.body;
            range.setStart(body.firstChild.firstChild, 2).collapse().select();
            editor.addListener('mouseup', function () {
                equal(editor.queryCommandState('formatmatch'), 0, '刷後狀態為0');
                start();
            });
            editor.execCommand('formatmatch');
            equal(editor.queryCommandState('formatmatch'), 1, '刷前狀態為1');
            range.setStart(body.firstChild.firstChild, 0).setEnd(body.firstChild.firstChild, 2).select();
            /*格式刷偵聽mouseup事件，select方法不能觸發mouseup，因此必須手動觸發*/
            ua.mouseup(editor.body);

        }, 50);
    stop();
});

/*trace 964*/
test('默認格式圖片刷有格式的圖片', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
        editor.setContent('hello<img width="200px" height="200px" style="float: left;background-color: red"/><img width="100px" height="200px"/>');
        setTimeout(function () {
            var img = editor.body.firstChild.lastChild;
            var img_new = img.previousSibling;
            range.selectNode(img).select();
            editor.addListener('mouseup', function () {
                equal(editor.queryCommandState('formatmatch'), 0, '刷後狀態為0');
                if (!ua.browser.opera) {
                    equal(img_new.style.cssFloat || img_new.style.styleFloat, 'none', 'check style float', 'float');
                }
                equal(img_new.style.backgroundColor, 'red', 'check background color');
                start();
            });
            editor.execCommand('formatmatch');
            range.selectNode(img_new).select();
            ua.mouseup(editor.body);

        }, 50);
    stop();
});

/*trace 965*/
test('有浮動方式圖片刷默認的圖片', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
        editor.setContent('hello<img width="200px" height="200px" style="float: left;background-color: red;width: 200px"/><img width="100px" height="200px"/>');
        setTimeout(function () {
            var img = editor.body.firstChild.lastChild.previousSibling;
            var img_new = img.nextSibling;
            range.selectNode(img).select();
            editor.addListener('mouseup', function () {
                equal(editor.queryCommandState('formatmatch'), 0, '刷後狀態為0');
                if (!ua.browser.opera) {
                    equal(img_new.style.cssFloat || img_new.style.styleFloat, "left", 'check style float');
                }
                /*只有浮動方式會刷，其他都不刷*/
                equal(img_new.style.backgroundColor, '', 'check background color');
                equal(img_new.style.width, '', 'check style width');
                equal($(img_new).attr('width'), 100, 'check width');
                start();
            });
            editor.execCommand('formatmatch');
            range.selectNode(img_new).select();
            ua.mouseup(editor.body);

        }, 50);
    stop();
});

/*trace 1068*/
test('獨占一行圖片刷默認的圖片', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
        editor.setContent('hello<img width="200px" height="200px" style="background-color: red;width: 200px;display:block;"/><img width="100px" height="200px"/>');
        setTimeout(function () {
            var img = editor.body.firstChild.lastChild.previousSibling;
            var img_new = img.nextSibling;
            range.selectNode(img).select();
            editor.addListener('mouseup', function () {
                equal(editor.queryCommandState('formatmatch'), 0, '刷後狀態為0');
                if (!ua.browser.opera) {
                    equal(img_new.style.display, "block", 'check display block');
                }
                start();
            });
            editor.execCommand('formatmatch');
            range.selectNode(img_new).select();
            ua.mouseup(editor.body);

        }, 50);
    stop();
});

/*trace 1068*/
test('默認的圖片圖片刷獨占一行圖片', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
        editor.setContent('hello<img width="200px" height="200px" style="background-color: red;width: 200px;display:block;"/><img width="100px" height="200px"/>');
        setTimeout(function () {
            var img = editor.body.firstChild.lastChild;
            var img_new = img.previousSibling;
            range.selectNode(img).select();
            editor.addListener('mouseup', function () {
                equal(editor.queryCommandState('formatmatch'), 0, '刷後狀態為0');
                if (!ua.browser.opera) {
                    equal(img_new.style.display, "inline", 'check display block');
                }
                start();
            });
            editor.execCommand('formatmatch');
            range.selectNode(img_new).select();
            ua.mouseup(editor.body);

        }, 50);
    stop();
});

/*trace 939*/
test('trace 939:字母列表刷表格內的字母列表', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
        editor.setContent('<ol style="list-style-type: lower-alpha;"><li>first</li><li>second</li></ol> <table><tbody><tr><td><ol style="list-style-type: lower-alpha;"><li>third</li><li>fourth</li></ol></td></tr></tbody></table>');
        setTimeout(function () {
            range.selectNode(editor.body.firstChild).select();
            editor.execCommand('formatmatch');
            editor.addListener('mouseup', function () {
                setTimeout(function () {
                    equal(editor.body.lastChild.getElementsByTagName('ol')[0].style.listStyleType, 'lower-alpha', '查看列表是否仍然是字母的');
                    start();
                }, 250);
            });
            range.selectNode(editor.body.lastChild).select();
            ua.mouseup(editor.body);

        }, 50);
    stop();
});

/*trace 938*/
test('用格式刷刷整個表格', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
        editor.setContent('<p><span style="background: yellow">hello</span></p><table><tbody><tr><td></td></tr></tbody></table>');
        setTimeout(function () {
            range.selectNode(editor.body.firstChild).select();
            editor.addListener('mouseup', function () {
                /*整個校驗方法不好，沒有解決根源的問題，
                 校驗的目的應當是不會多出不應當出現的內容，除了match還可能會有其他多出來的內容
                 但是style之類的東西比較難校驗*/
                equal(editor.body.innerHTML.indexOf('match'), -1, '沒有插入match占位符');
                start();
            });
            editor.execCommand('formatmatch');
            range.selectNode(editor.body.lastChild).select();
            editor.currentSelectedArr = [editor.body.lastChild.getElementsByTagName('td')[0]];
            ua.mouseup(editor.body);

        }, 50);
    stop();
});

test('表格刷文本', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
        editor.setContent('<p><span style="background: yellow">hello</span></p><table><tbody><tr><td>hello2</td></tr></tbody></table>');
        setTimeout(function () {
            range.selectNode(editor.body.lastChild).select();
//            editor.currentSelectedArr = [editor.body.lastChild.getElementsByTagName('td')[0]];
            editor.addListener('mouseup', function () {
                equal(editor.body.firstChild.innerHTML, 'hello', ' 去掉hello的格式');
                start();
            });
            editor.execCommand('formatmatch');
            setTimeout(function () {
                range.selectNode(editor.body.firstChild).select();
                ua.mouseup(editor.body);

            }, 50);
        }, 50);
    stop();
});

/*trace 1096*/
test('trace 1096，1761:表格刷表格', function () {

    var editor = te.obj[0];
    var range = te.obj[1];
            editor.setContent('<p><span style="background: yellow">hello</span></p><table><tbody><tr><td>hello2</td><td></td></tr><tr><td></td><td>hello3</td></tr></tbody></table>');
            setTimeout(function () {
                var trs = editor.body.lastChild.getElementsByTagName('tr');
                var ut = editor.getUETable(editor.body.lastChild);
                var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[1].cells[0]);
                ut.setSelected(cellsRange);
                range.setStart(trs[0].cells[0], 0).collapse(true).select();
                var tds = editor.body.lastChild.getElementsByTagName('td');
                editor.addListener('mouseup', function () {
                    ok(ua.isEqualArray(ut.selectedTds, [trs[0].cells[0], trs[1].cells[0]]), '比較選擇的區域');
//            equal( editor.body.getElementsByTagName('table')[0].getAttribute( 'border' ), '1', '表格邊框寬度相同' );      /*如果沒有指定border，那麽不主動設置border*/
//            equal( tds[index].style['borderWidth'], '1px', '表格邊框寬度相同' );
//            equal( tds[index].style['borderStyle'], 'solid', '表格邊框樣式相同' );
                    for (var index = 0; index < tds.length; index++) {
                        equal(tds[index].style['borderColor'], tds[0].style['borderColor'], '表格邊框顏色相同');
                    }

                        start();
                });
                editor.execCommand('formatmatch');
//        editor.currentSelectedArr = [tds[1], tds[3]];
                range.setStart(tds[1], 0).setEnd(tds[3], 1).select();
                ua.mouseup(editor.body);
//            }, 50);
        }, 50);
    stop();
});

/*trace 1092, 991*/
test('文本刷a標籤(閉合)', function () {

    var editor = te.obj[0];
    var range = te.obj[1];
            editor.setContent('hello<a href="http://www.baidu.com/">baidu</a>');
    setTimeout(function () {

        var p = editor.body.firstChild;
            var a = p.lastChild;
            range.selectNode(p.firstChild).select();
            /*給文本刷上前景色*/
            editor.execCommand('forecolor', 'rgb(255,0,0)');
            editor.addListener('mouseup', function () {
                var a = p.lastChild;
                ua.clearWhiteNode(a);
                equal(a.childNodes.length, 3, '3子節點');
                //1.2版本中空的span里有刪不掉的不可見字符，已經從瀏覽器覆制過來了
                ua.checkHTMLSameStyle('ba<span style=\"color: rgb(255,0,0)\"></span>idu', editor.document, a, 'check style');
                    start();
            });
            range.selectNode(p.firstChild).select();
            editor.execCommand('formatmatch');
            range.setStart(p.lastChild.firstChild, 2).collapse(true).select();
            ua.mouseup(editor.body);

        }, 50);
    stop();
});



test('點了格式刷後不刷文本再點一次格式刷', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
        editor.setContent('<p><strong>first</strong></p><p><em>second</em></p><p>third</p>');
        setTimeout(function () {
            var body = editor.body;
            range.setStart(body.firstChild.firstChild.firstChild, 2).collapse(true).select();
            editor.addListener('mouseup', function () {
                equal(editor.__allListeners['mouseup'].length, num - 1, 'mouseup的偵聽器被刪除');
                equal(editor.queryCommandState('formatmatch'), 0, '刷後狀態為0');
                equal(body.lastChild.innerHTML.toLowerCase(), 'third');

                    start();
            });
            editor.execCommand('formatmatch');
            var num = editor.__allListeners['mouseup'].length;
            /*刪除mouseup偵聽器後直接返回*/
            editor.execCommand('formatmatch');
            equal(editor.__allListeners['mouseup'].length, num - 1, '如果第一次格式刷沒執行，下一次格式刷會先去掉上一個mouseup的偵聽器然後直接退出');
            ua.mouseup(body);

        }, 50);
    stop();
});
test('a標籤刷文本', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    setTimeout(function () {
        editor.setContent('hello<a href="http://www.baidu.com/"><span style="color: red; ">baidu</span></a>');
        setTimeout(function () {
            var p = editor.body.firstChild;
            var a = p.lastChild;
            range.setStart(a.firstChild.firstChild, 1).collapse(true).select();
            editor.addListener('mouseup', function () {
                /*firefox不支持outerHTML*/
                equal(p.firstChild.innerHTML, 'hello', 'span包含文本');
                ok(p.firstChild.style['color'], 'red', '查看文本是否添加了樣式');
                start();
            });
            editor.execCommand('formatmatch');
            range.selectNode(p.firstChild).select();
            ua.mouseup(editor.body);
        }, 50);
    },50);
    stop();
});