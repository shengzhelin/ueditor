/**
 * 服務器提交的額外參數列表設置插件
 * @file
 * @since 1.2.6.1
 */
UE.plugin.register("serverparam", function() {
  var me = this,
    serverParam = {};

  return {
    commands: {
      /**
             * 修改服務器提交的額外參數列表,清除所有項
             * @command serverparam
             * @method execCommand
             * @param { String } cmd 命令字符串
             * @example
             * ```javascript
             * editor.execCommand('serverparam');
             * editor.queryCommandValue('serverparam'); //返回空
             * ```
             */
      /**
             * 修改服務器提交的額外參數列表,刪除指定項
             * @command serverparam
             * @method execCommand
             * @param { String } cmd 命令字符串
             * @param { String } key 要清除的屬性
             * @example
             * ```javascript
             * editor.execCommand('serverparam', 'name'); //刪除屬性name
             * ```
             */
      /**
             * 修改服務器提交的額外參數列表,使用鍵值添加項
             * @command serverparam
             * @method execCommand
             * @param { String } cmd 命令字符串
             * @param { String } key 要添加的屬性
             * @param { String } value 要添加屬性的值
             * @example
             * ```javascript
             * editor.execCommand('serverparam', 'name', 'hello');
             * editor.queryCommandValue('serverparam'); //返回對象 {'name': 'hello'}
             * ```
             */
      /**
             * 修改服務器提交的額外參數列表,傳入鍵值對對象添加多項
             * @command serverparam
             * @method execCommand
             * @param { String } cmd 命令字符串
             * @param { Object } key 傳入的鍵值對對象
             * @example
             * ```javascript
             * editor.execCommand('serverparam', {'name': 'hello'});
             * editor.queryCommandValue('serverparam'); //返回對象 {'name': 'hello'}
             * ```
             */
      /**
             * 修改服務器提交的額外參數列表,使用自定義函數添加多項
             * @command serverparam
             * @method execCommand
             * @param { String } cmd 命令字符串
             * @param { Function } key 自定義獲取參數的函數
             * @example
             * ```javascript
             * editor.execCommand('serverparam', function(editor){
             *     return {'key': 'value'};
             * });
             * editor.queryCommandValue('serverparam'); //返回對象 {'key': 'value'}
             * ```
             */

      /**
             * 獲取服務器提交的額外參數列表
             * @command serverparam
             * @method queryCommandValue
             * @param { String } cmd 命令字符串
             * @example
             * ```javascript
             * editor.queryCommandValue( 'serverparam' ); //返回對象 {'key': 'value'}
             * ```
             */
      serverparam: {
        execCommand: function(cmd, key, value) {
          if (key === undefined || key === null) {
            //不傳參數,清空列表
            serverParam = {};
          } else if (utils.isString(key)) {
            //傳入鍵值
            if (value === undefined || value === null) {
              delete serverParam[key];
            } else {
              serverParam[key] = value;
            }
          } else if (utils.isObject(key)) {
            //傳入對象,覆蓋列表項
            utils.extend(serverParam, key, false);
          } else if (utils.isFunction(key)) {
            //傳入函數,添加列表項
            utils.extend(serverParam, key(), false);
          }
        },
        queryCommandValue: function() {
          return serverParam || {};
        }
      }
    }
  };
});
