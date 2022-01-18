UE.plugin.register('autosave', function (){

    var me = this,
        //無限循環保護
        lastSaveTime = new Date(),
        //最小保存間隔時間
        MIN_TIME = 20,
        //auto save key
        saveKey = null;

    function save ( editor ) {

        var saveData;

        if ( new Date() - lastSaveTime < MIN_TIME ) {
            return;
        }

        if ( !editor.hasContents() ) {
            //這里不能調用命令來刪除， 會造成事件死循環
            saveKey && me.removePreferences( saveKey );
            return;
        }

        lastSaveTime = new Date();

        editor._saveFlag = null;

        saveData = me.body.innerHTML;

        if ( editor.fireEvent( "beforeautosave", {
            content: saveData
        } ) === false ) {
            return;
        }

        me.setPreferences( saveKey, saveData );

        editor.fireEvent( "afterautosave", {
            content: saveData
        } );

    }

    return {
        defaultOptions: {
            //默認間隔時間
            saveInterval: 500
        },
        bindEvents:{
            'ready':function(){

                var _suffix = "-drafts-data",
                    key = null;

                if ( me.key ) {
                    key = me.key + _suffix;
                } else {
                    key = ( me.container.parentNode.id || 'ue-common' ) + _suffix;
                }

                //頁面地址+編輯器ID 保持唯一
                saveKey = ( location.protocol + location.host + location.pathname ).replace( /[.:\/]/g, '_' ) + key;

            },

            'contentchange': function () {

                if ( !saveKey ) {
                    return;
                }

                if ( me._saveFlag ) {
                    window.clearTimeout( me._saveFlag );
                }

                if ( me.options.saveInterval > 0 ) {

                    me._saveFlag = window.setTimeout( function () {

                        save( me );

                    }, me.options.saveInterval );

                } else {

                    save(me);

                }


            }
        },
        commands:{
            'clearlocaldata':{
                execCommand:function (cmd, name) {
                    if ( saveKey && me.getPreferences( saveKey ) ) {
                        me.removePreferences( saveKey )
                    }
                },
                notNeedUndo: true,
                ignoreContentChange:true
            },

            'getlocaldata':{
                execCommand:function (cmd, name) {
                    return saveKey ? me.getPreferences( saveKey ) || '' : '';
                },
                notNeedUndo: true,
                ignoreContentChange:true
            },

            'drafts':{
                execCommand:function (cmd, name) {
                    if ( saveKey ) {
                        me.body.innerHTML = me.getPreferences( saveKey ) || '<p>'+domUtils.fillHtml+'</p>';
                        me.focus(true);
                    }
                },
                queryCommandState: function () {
                    return saveKey ? ( me.getPreferences( saveKey ) === null ? -1 : 0 ) : -1;
                },
                notNeedUndo: true,
                ignoreContentChange:true
            }
        }
    }

});