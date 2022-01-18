/**
 * 瀏覽器判斷模塊
 * @file
 * @module UE.browser
 * @since 1.2.6.1
 */

/**
 * 提供瀏覽器檢測的模塊
 * @unfile
 * @module UE.browser
 */
var browser = UE.browser = function(){
    var agent = navigator.userAgent.toLowerCase(),
        opera = window.opera,
        browser = {
        /**
         * @property {boolean} ie 檢測當前瀏覽器是否為IE
         * @example
         * ```javascript
         * if ( UE.browser.ie ) {
         *     console.log( '當前瀏覽器是IE' );
         * }
         * ```
         */
        ie		:  /(msie\s|trident.*rv:)([\w.]+)/.test(agent),

        /**
         * @property {boolean} opera 檢測當前瀏覽器是否為Opera
         * @example
         * ```javascript
         * if ( UE.browser.opera ) {
         *     console.log( '當前瀏覽器是Opera' );
         * }
         * ```
         */
        opera	: ( !!opera && opera.version ),

        /**
         * @property {boolean} webkit 檢測當前瀏覽器是否是webkit內核的瀏覽器
         * @example
         * ```javascript
         * if ( UE.browser.webkit ) {
         *     console.log( '當前瀏覽器是webkit內核瀏覽器' );
         * }
         * ```
         */
        webkit	: ( agent.indexOf( ' applewebkit/' ) > -1 ),

        /**
         * @property {boolean} mac 檢測當前瀏覽器是否是運行在mac平台下
         * @example
         * ```javascript
         * if ( UE.browser.mac ) {
         *     console.log( '當前瀏覽器運行在mac平台下' );
         * }
         * ```
         */
        mac	: ( agent.indexOf( 'macintosh' ) > -1 ),

        /**
         * @property {boolean} quirks 檢測當前瀏覽器是否處於“怪異模式”下
         * @example
         * ```javascript
         * if ( UE.browser.quirks ) {
         *     console.log( '當前瀏覽器運行處於“怪異模式”' );
         * }
         * ```
         */
        quirks : ( document.compatMode == 'BackCompat' )
    };

    /**
    * @property {boolean} gecko 檢測當前瀏覽器內核是否是gecko內核
    * @example
    * ```javascript
    * if ( UE.browser.gecko ) {
    *     console.log( '當前瀏覽器內核是gecko內核' );
    * }
    * ```
    */
    browser.gecko =( navigator.product == 'Gecko' && !browser.webkit && !browser.opera && !browser.ie);

    var version = 0;

    // Internet Explorer 6.0+
    if ( browser.ie ){

        var v1 =  agent.match(/(?:msie\s([\w.]+))/);
        var v2 = agent.match(/(?:trident.*rv:([\w.]+))/);
        if(v1 && v2 && v1[1] && v2[1]){
            version = Math.max(v1[1]*1,v2[1]*1);
        }else if(v1 && v1[1]){
            version = v1[1]*1;
        }else if(v2 && v2[1]){
            version = v2[1]*1;
        }else{
            version = 0;
        }

        browser.ie11Compat = document.documentMode == 11;
        /**
         * @property { boolean } ie9Compat 檢測瀏覽器模式是否為 IE9 兼容模式
         * @warning 如果瀏覽器不是IE， 則該值為undefined
         * @example
         * ```javascript
         * if ( UE.browser.ie9Compat ) {
         *     console.log( '當前瀏覽器運行在IE9兼容模式下' );
         * }
         * ```
         */
        browser.ie9Compat = document.documentMode == 9;

        /**
         * @property { boolean } ie8 檢測瀏覽器是否是IE8瀏覽器
         * @warning 如果瀏覽器不是IE， 則該值為undefined
         * @example
         * ```javascript
         * if ( UE.browser.ie8 ) {
         *     console.log( '當前瀏覽器是IE8瀏覽器' );
         * }
         * ```
         */
        browser.ie8 = !!document.documentMode;

        /**
         * @property { boolean } ie8Compat 檢測瀏覽器模式是否為 IE8 兼容模式
         * @warning 如果瀏覽器不是IE， 則該值為undefined
         * @example
         * ```javascript
         * if ( UE.browser.ie8Compat ) {
         *     console.log( '當前瀏覽器運行在IE8兼容模式下' );
         * }
         * ```
         */
        browser.ie8Compat = document.documentMode == 8;

        /**
         * @property { boolean } ie7Compat 檢測瀏覽器模式是否為 IE7 兼容模式
         * @warning 如果瀏覽器不是IE， 則該值為undefined
         * @example
         * ```javascript
         * if ( UE.browser.ie7Compat ) {
         *     console.log( '當前瀏覽器運行在IE7兼容模式下' );
         * }
         * ```
         */
        browser.ie7Compat = ( ( version == 7 && !document.documentMode )
                || document.documentMode == 7 );

        /**
         * @property { boolean } ie6Compat 檢測瀏覽器模式是否為 IE6 模式 或者怪異模式
         * @warning 如果瀏覽器不是IE， 則該值為undefined
         * @example
         * ```javascript
         * if ( UE.browser.ie6Compat ) {
         *     console.log( '當前瀏覽器運行在IE6模式或者怪異模式下' );
         * }
         * ```
         */
        browser.ie6Compat = ( version < 7 || browser.quirks );

        browser.ie9above = version > 8;

        browser.ie9below = version < 9;

        browser.ie11above = version > 10;

        browser.ie11below = version < 11;

    }

    // Gecko.
    if ( browser.gecko ){
        var geckoRelease = agent.match( /rv:([\d\.]+)/ );
        if ( geckoRelease )
        {
            geckoRelease = geckoRelease[1].split( '.' );
            version = geckoRelease[0] * 10000 + ( geckoRelease[1] || 0 ) * 100 + ( geckoRelease[2] || 0 ) * 1;
        }
    }

    /**
     * @property { Number } chrome 檢測當前瀏覽器是否為Chrome, 如果是，則返回Chrome的大版本號
     * @warning 如果瀏覽器不是chrome， 則該值為undefined
     * @example
     * ```javascript
     * if ( UE.browser.chrome ) {
     *     console.log( '當前瀏覽器是Chrome' );
     * }
     * ```
     */
    if (/chrome\/(\d+\.\d)/i.test(agent)) {
        browser.chrome = + RegExp['\x241'];
    }

    /**
     * @property { Number } safari 檢測當前瀏覽器是否為Safari, 如果是，則返回Safari的大版本號
     * @warning 如果瀏覽器不是safari， 則該值為undefined
     * @example
     * ```javascript
     * if ( UE.browser.safari ) {
     *     console.log( '當前瀏覽器是Safari' );
     * }
     * ```
     */
    if(/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(agent) && !/chrome/i.test(agent)){
    	browser.safari = + (RegExp['\x241'] || RegExp['\x242']);
    }


    // Opera 9.50+
    if ( browser.opera )
        version = parseFloat( opera.version() );

    // WebKit 522+ (Safari 3+)
    if ( browser.webkit )
        version = parseFloat( agent.match( / applewebkit\/(\d+)/ )[1] );

    /**
     * @property { Number } version 檢測當前瀏覽器版本號
     * @remind
     * <ul>
     *     <li>IE系列返回值為5,6,7,8,9,10等</li>
     *     <li>gecko系列會返回10900，158900等</li>
     *     <li>webkit系列會返回其build號 (如 522等)</li>
     * </ul>
     * @example
     * ```javascript
     * console.log( '當前瀏覽器版本號是： ' + UE.browser.version );
     * ```
     */
    browser.version = version;

    /**
     * @property { boolean } isCompatible 檢測當前瀏覽器是否能夠與UEditor良好兼容
     * @example
     * ```javascript
     * if ( UE.browser.isCompatible ) {
     *     console.log( '瀏覽器與UEditor能夠良好兼容' );
     * }
     * ```
     */
    browser.isCompatible =
        !browser.mobile && (
        ( browser.ie && version >= 6 ) ||
        ( browser.gecko && version >= 10801 ) ||
        ( browser.opera && version >= 9.5 ) ||
        ( browser.air && version >= 1 ) ||
        ( browser.webkit && version >= 522 ) ||
        false );
    return browser;
}();
//快捷方式
var ie = browser.ie,
    webkit = browser.webkit,
    gecko = browser.gecko,
    opera = browser.opera;