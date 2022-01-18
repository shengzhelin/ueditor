/**
 * 設置行內間距
 * @file
 * @since 1.2.6.1
 */
UE.plugins['lineheight'] = function(){
    var me = this;
    me.setOpt({'lineheight':['1', '1.5','1.75','2', '3', '4', '5']});

    /**
     * 行距
     * @command lineheight
     * @method execCommand
     * @param { String } cmdName 命令字符串
     * @param { String } value 傳入的行高值， 該值是當前字體的倍數， 例如： 1.5, 1.75
     * @example
     * ```javascript
     * editor.execCommand( 'lineheight', 1.5);
     * ```
     */
    /**
     * 查詢當前選區內容的行高大小
     * @command lineheight
     * @method queryCommandValue
     * @param { String } cmd 命令字符串
     * @return { String } 返回當前行高大小
     * @example
     * ```javascript
     * editor.queryCommandValue( 'lineheight' );
     * ```
     */

    me.commands['lineheight'] =  {
        execCommand : function( cmdName,value ) {
            this.execCommand('paragraph','p',{style:'line-height:'+ (value == "1" ? "normal" : value + 'em') });
            return true;
        },
        queryCommandValue : function() {
            var pN = domUtils.filterNodeList(this.selection.getStartElementPath(),function(node){return domUtils.isBlockElm(node)});
            if(pN){
                var value = domUtils.getComputedStyle(pN,'line-height');
                return value == 'normal' ? 1 : value.replace(/[^\d.]*/ig,"");
            }
        }
    };
};


