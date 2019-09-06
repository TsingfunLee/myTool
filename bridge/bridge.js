(function (define) {
    function setupWebViewJavascriptBridge(callback) {
        if (window.WebViewJavascriptBridge) {
            callback(window.WebViewJavascriptBridge);
        } else {
            document.addEventListener('WebViewJavascriptBridgeReady', function () {
                callback(window.WebViewJavascriptBridge);
            }, false);
        }
    }

    //兼容单页应用：一个页面注册上了造成其他页面也触发
    var __eventHub = {};
    define(function () {
        return {
            //客户端调用JS
            on: function (event, callback) {
                setupWebViewJavascriptBridge(function (bridge) {
                    __eventHub[location.pathname + event] = callback;
                    bridge.registerHandler(event, function (data, response) {
                        //当前页面没注册事件
                        if (!__eventHub[location.pathname + event]) {
                            response({code: 2, msg: 'handle not found!'});
                            return;
                        }
                        
                        //-end
                        __eventHub[location.pathname + event](data, {
                            success: function (data) {                            
                                response({code: 0, data: data});
                            }, error: function (msg) {
                                response({code: 1, msg: msg});
                            }
                        });
                    });
                });
            },
            //JS调用客户端
            fire: function (event, data, success, error) {
                setupWebViewJavascriptBridge(function (bridge) {
                    bridge.callHandler(event, data, function (res) {
                        if (res.code === 0) {
                            success && success(res.data);
                        } else {
                            error && error(res.msg);
                        }
                    });
                });
            }
        };
    });
})((function () {
    if (typeof module !== 'undefined' && module.exports) {
        return function (factory) {
            module.exports = factory();
        };
    } else if (typeof define !== 'undefined' && typeof define === 'function' && define.amd) {
        return define;
    } else {
        return function (factory) {
            window.webviewBridge = factory();
        };
    }
})());