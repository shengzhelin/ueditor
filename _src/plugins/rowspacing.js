/**
 * 段前段後間距插件
 * @file
 * @since 1.2.6.1
 */

/**
 * 設置段間距
 * @command rowspacing
 * @method execCommand
 * @param { String } cmd 命令字符串
 * @param { String } value 段間距的值，以px為單位
 * @param { String } dir 間距位置，top或bottom，分別表示段前和段後
 * @example
 * ```javascript
 * editor.execCommand( 'rowspacing', '10', 'top' );
 * ```
 */

UE.plugins['rowspacing'] = function(){
    var me = this;
    me.setOpt({
        'rowspacingtop':['5', '10', '15', '20', '25'],
        'rowspacingbottom':['5', '10', '15', '20', '25']

    });
    me.commands['rowspacing'] =  {
        execCommand : function( cmdName,value,dir ) {
            this.execCommand('paragraph','p',{style:'margin-'+dir+':'+value + 'px'});
            return true;
        },
        queryCommandValue : function(cmdName,dir) {
            var pN = domUtils.filterNodeList(this.selection.getStartElementPath(),function(node){return domUtils.isBlockElm(node) }),
                value;
            //trace:1026
            if(pN){
                value = domUtils.getComputedStyle(pN,'margin-'+dir).replace(/[^\d]/g,'');
                return !value ? 0 : value;
            }
            return 0;

        }
    };
};


