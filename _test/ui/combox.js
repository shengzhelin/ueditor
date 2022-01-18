/**
 * Created by JetBrains PhpStorm.
 * User: dongyancen
 * Date: 12-4-12
 * Time: 下午4:44
 * To change this template use File | Settings | File Templates.
 */
module( 'ui.combox' );
test( 'combox', function() {
    var editor = new baidu.editor.ui.Editor();
    editor.render("editor");
//設置菜單內容
    var list = [
                ['1',[1]],
                ['0',[0]],
                ['宋體',['宋體', 'SimSun']],
                ['楷體',['楷體', '楷體_GB2312', 'SimKai']],
                ['黑體',['黑體', 'SimHei']],
                ['隸書',['隸書', 'SimLi']],
                ['andale mono',['andale mono']],
                ['arial',['arial', 'helvetica', 'sans-serif']],
                ['arial black',['arial black', 'avant garde']],
                ['comic sans ms',['comic sans ms']],
                ['impact',['impact', 'chicago']],
                ['times new roman',['times new roman']]
    ];
    var title = list ;

    for(var i=0,ci,items=[];ci=list[i++];){

            (function(key,val){
                items.push({
                    label: key,
                    value: val,
                    renderLabelHtml: function (){
                        return '<div class="edui-label %%-label" style="font-family:' +
                            utils.unhtml(this.value.join(',')) + '">' + (this.label || '') + '</div>';
                    }
                });
            })(ci[0],ci[1])
        }
    editor.ready(function(){
        var combox = new te.obj[0].Combox({editor:editor,items :items,title: title,  initValue:'字體',className: 'edui-for-fontfamily'});

        te.dom[0].innerHTML = combox.renderHtml();
        combox.postRender();
        combox.showPopup();
    //////// getItem
        equal(combox.getItem(0).label,'1','檢查item內容');
        equal(combox.getItem(0).value[0],1,'');
///////getValue setValue
        combox.setValue(list[4][1]);
        equal(combox.getValue(),list[4][1],'設置內容');
        equal(combox.label,'黑體','');
        equal(combox.getDom('button_body').innerHTML,"黑體",'');
  ////////getLabelForUnknowValue
        combox.setValue(['黑體', 'chicago']);
        equal(combox.getValue()[0],"黑體",'設置一個不在原來列表的內容');
        equal(combox.getValue()[1],'chicago','');
        equal(combox.getValue(),combox.label,'');
        equal(combox.getDom('button_body').innerHTML,"黑體,chicago",'');
    /////selectByIndex
        combox.popup.items[2].onclick();
        equal(combox.getValue()[0],'宋體','檢查onclick，設定選中內容');
        equal(combox.getValue()[1],'SimSun','');
        equal(items[2].label,combox.label,'');
        equal(combox.selectedIndex,2,'');
        combox.popup.hide();
        start();

     });
stop();
} );