///import core
///commands 塗鴉
///commandsName  Scrawl
///commandsTitle  塗鴉
///commandsDialog  dialogs\scrawl
UE.commands['scrawl'] = {
    queryCommandState : function(){
        return ( browser.ie && browser.version  <= 8 ) ? -1 :0;
    }
};
