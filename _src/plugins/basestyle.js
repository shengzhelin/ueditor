/**
 * B、I、sub、super命令支持
 * @file
 * @since 1.2.6.1
 */

UE.plugins['basestyle'] = function(){

    /**
     * 字體加粗
     * @command bold
     * @param { String } cmd 命令字符串
     * @remind 對已加粗的文本內容執行該命令， 將取消加粗
     * @method execCommand
     * @example
     * ```javascript
     * //editor是編輯器實例
     * //對當前選中的文本內容執行加粗操作
     * //第一次執行， 文本內容加粗
     * editor.execCommand( 'bold' );
     *
     * //第二次執行， 文本內容取消加粗
     * editor.execCommand( 'bold' );
     * ```
     */


    /**
     * 字體傾斜
     * @command italic
     * @method execCommand
     * @param { String } cmd 命令字符串
     * @remind 對已傾斜的文本內容執行該命令， 將取消傾斜
     * @example
     * ```javascript
     * //editor是編輯器實例
     * //對當前選中的文本內容執行斜體操作
     * //第一次操作， 文本內容將變成斜體
     * editor.execCommand( 'italic' );
     *
     * //再次對同一文本內容執行， 則文本內容將恢覆正常
     * editor.execCommand( 'italic' );
     * ```
     */

    /**
     * 下標文本，與“superscript”命令互斥
     * @command subscript
     * @method execCommand
     * @remind  把選中的文本內容切換成下標文本， 如果當前選中的文本已經是下標， 則該操作會把文本內容還原成正常文本
     * @param { String } cmd 命令字符串
     * @example
     * ```javascript
     * //editor是編輯器實例
     * //對當前選中的文本內容執行下標操作
     * //第一次操作， 文本內容將變成下標文本
     * editor.execCommand( 'subscript' );
     *
     * //再次對同一文本內容執行， 則文本內容將恢覆正常
     * editor.execCommand( 'subscript' );
     * ```
     */

    /**
     * 上標文本，與“subscript”命令互斥
     * @command superscript
     * @method execCommand
     * @remind 把選中的文本內容切換成上標文本， 如果當前選中的文本已經是上標， 則該操作會把文本內容還原成正常文本
     * @param { String } cmd 命令字符串
     * @example
     * ```javascript
     * //editor是編輯器實例
     * //對當前選中的文本內容執行上標操作
     * //第一次操作， 文本內容將變成上標文本
     * editor.execCommand( 'superscript' );
     *
     * //再次對同一文本內容執行， 則文本內容將恢覆正常
     * editor.execCommand( 'superscript' );
     * ```
     */
    var basestyles = {
            'bold':['strong','b'],
            'italic':['em','i'],
            'subscript':['sub'],
            'superscript':['sup']
        },
        getObj = function(editor,tagNames){
            return domUtils.filterNodeList(editor.selection.getStartElementPath(),tagNames);
        },
        me = this;
    //添加快捷鍵
    me.addshortcutkey({
        "Bold" : "ctrl+66",//^B
        "Italic" : "ctrl+73", //^I
        "Underline" : "ctrl+85"//^U
    });
    me.addInputRule(function(root){
        utils.each(root.getNodesByTagName('b i'),function(node){
            switch (node.tagName){
                case 'b':
                    node.tagName = 'strong';
                    break;
                case 'i':
                    node.tagName = 'em';
            }
        });
    });
    for ( var style in basestyles ) {
        (function( cmd, tagNames ) {
            me.commands[cmd] = {
                execCommand : function( cmdName ) {
                    var range = me.selection.getRange(),obj = getObj(this,tagNames);
                    if ( range.collapsed ) {
                        if ( obj ) {
                            var tmpText =  me.document.createTextNode('');
                            range.insertNode( tmpText ).removeInlineStyle( tagNames );
                            range.setStartBefore(tmpText);
                            domUtils.remove(tmpText);
                        } else {
                            var tmpNode = range.document.createElement( tagNames[0] );
                            if(cmdName == 'superscript' || cmdName == 'subscript'){
                                tmpText = me.document.createTextNode('');
                                range.insertNode(tmpText)
                                    .removeInlineStyle(['sub','sup'])
                                    .setStartBefore(tmpText)
                                    .collapse(true);
                            }
                            range.insertNode( tmpNode ).setStart( tmpNode, 0 );
                        }
                        range.collapse( true );
                    } else {
                        if(cmdName == 'superscript' || cmdName == 'subscript'){
                            if(!obj || obj.tagName.toLowerCase() != cmdName){
                                range.removeInlineStyle(['sub','sup']);
                            }
                        }
                        obj ? range.removeInlineStyle( tagNames ) : range.applyInlineStyle( tagNames[0] );
                    }
                    range.select();
                },
                queryCommandState : function() {
                   return getObj(this,tagNames) ? 1 : 0;
                }
            };
        })( style, basestyles[style] );
    }
};

