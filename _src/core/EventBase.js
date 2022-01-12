/**
 * UE采用的事件基類
 * @file
 * @module UE
 * @class EventBase
 * @since 1.2.6.1
 */

/**
 * UEditor公用空間，UEditor所有的功能都掛載在該空間下
 * @unfile
 * @module UE
 */

/**
 * UE采用的事件基類，繼承此類的對應類將獲取addListener,removeListener,fireEvent方法。
 * 在UE中，Editor以及所有ui實例都繼承了該類，故可以在對應的ui對象以及editor對象上使用上述方法。
 * @unfile
 * @module UE
 * @class EventBase
 */

/**
 * 通過此構造器，子類可以繼承EventBase獲取事件監聽的方法
 * @constructor
 * @example
 * ```javascript
 * UE.EventBase.call(editor);
 * ```
 */
var EventBase = (UE.EventBase = function() {});

EventBase.prototype = {
  /**
     * 註冊事件監聽器
     * @method addListener
     * @param { String } types 監聽的事件名稱，同時監聽多個事件使用空格分隔
     * @param { Function } fn 監聽的事件被觸發時，會執行該回調函數
     * @waining 事件被觸發時，監聽的函數假如返回的值恒等於true，回調函數的隊列中後面的函數將不執行
     * @example
     * ```javascript
     * editor.addListener('selectionchange',function(){
     *      console.log("選區已經變化！");
     * })
     * editor.addListener('beforegetcontent aftergetcontent',function(type){
     *         if(type == 'beforegetcontent'){
     *             //do something
     *         }else{
     *             //do something
     *         }
     *         console.log(this.getContent) // this是註冊的事件的編輯器實例
     * })
     * ```
     * @see UE.EventBase:fireEvent(String)
     */
  addListener: function(types, listener) {
    types = utils.trim(types).split(/\s+/);
    for (var i = 0, ti; (ti = types[i++]); ) {
      getListener(this, ti, true).push(listener);
    }
  },

  on: function(types, listener) {
    return this.addListener(types, listener);
  },
  off: function(types, listener) {
    return this.removeListener(types, listener);
  },
  trigger: function() {
    return this.fireEvent.apply(this, arguments);
  },
  /**
     * 移除事件監聽器
     * @method removeListener
     * @param { String } types 移除的事件名稱，同時移除多個事件使用空格分隔
     * @param { Function } fn 移除監聽事件的函數引用
     * @example
     * ```javascript
     * //changeCallback為方法體
     * editor.removeListener("selectionchange",changeCallback);
     * ```
     */
  removeListener: function(types, listener) {
    types = utils.trim(types).split(/\s+/);
    for (var i = 0, ti; (ti = types[i++]); ) {
      utils.removeItem(getListener(this, ti) || [], listener);
    }
  },

  /**
     * 觸發事件
     * @method fireEvent
     * @param { String } types 觸發的事件名稱，同時觸發多個事件使用空格分隔
     * @remind 該方法會觸發addListener
     * @return { * } 返回觸發事件的隊列中，最後執行的回調函數的返回值
     * @example
     * ```javascript
     * editor.fireEvent("selectionchange");
     * ```
     */

  /**
     * 觸發事件
     * @method fireEvent
     * @param { String } types 觸發的事件名稱，同時觸發多個事件使用空格分隔
     * @param { *... } options 可選參數，可以傳入一個或多個參數，會傳給事件觸發的回調函數
     * @return { * } 返回觸發事件的隊列中，最後執行的回調函數的返回值
     * @example
     * ```javascript
     *
     * editor.addListener( "selectionchange", function ( type, arg1, arg2 ) {
     *
     *     console.log( arg1 + " " + arg2 );
     *
     * } );
     *
     * //觸發selectionchange事件， 會執行上面的事件監聽器
     * //output: Hello World
     * editor.fireEvent("selectionchange", "Hello", "World");
     * ```
     */
  fireEvent: function() {
    var types = arguments[0];
    types = utils.trim(types).split(" ");
    for (var i = 0, ti; (ti = types[i++]); ) {
      var listeners = getListener(this, ti),
        r,
        t,
        k;
      if (listeners) {
        k = listeners.length;
        while (k--) {
          if (!listeners[k]) continue;
          t = listeners[k].apply(this, arguments);
          if (t === true) {
            return t;
          }
          if (t !== undefined) {
            r = t;
          }
        }
      }
      if ((t = this["on" + ti.toLowerCase()])) {
        r = t.apply(this, arguments);
      }
    }
    return r;
  }
};
/**
 * 獲得對象所擁有監聽類型的所有監聽器
 * @unfile
 * @module UE
 * @since 1.2.6.1
 * @method getListener
 * @public
 * @param { Object } obj  查詢監聽器的對象
 * @param { String } type 事件類型
 * @param { Boolean } force  為true且當前所有type類型的偵聽器不存在時，創建一個空監聽器數組
 * @return { Array } 監聽器數組
 */
function getListener(obj, type, force) {
  var allListeners;
  type = type.toLowerCase();
  return (
    (allListeners =
      obj.__allListeners || (force && (obj.__allListeners = {}))) &&
    (allListeners[type] || (force && (allListeners[type] = [])))
  );
}
