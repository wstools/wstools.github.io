// ==UserScript==
// @name        wsmud_funny_base
// @version     0.0.34
// @author      苏轻
// @require     https://code.jquery.com/jquery-3.3.1.min.js
// @grant       unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    let fn = {
        send: async function(message) {
            if (typeof message === "string") {
                sendmessage(message);
            } else if (message instanceof Array) {
                for (const m of message) {
                    if (typeof m === "string") {
                        await fn.sleep(500);
                        sendmessage(m);
                    } else {
                        throw(`(Error) Type of message must be "string" or "array[string]", not "array[${typeof m}]".`);
                    }
                }
            } else {
                throw(`(Error) Type of message must be "string" or "array[string]", not "${typeof message}".`);
            }
            function sendmessage(message) {
                $("#sendmessage").attr("cmd") ? $("#sendmessage").attr("cmd", message) : $(".container").append($(`<span id="sendmessage" cmd="${message}"><span>`));
                $("#sendmessage").click();
            }
        },
        sleep: function(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        deepCopy: function (object) {
            let result = {};
            for (const key in object) {
                result[key] = typeof object[key] === "object" ? fn.deepCopy(object[key]) : object[key];
            }
            return result;
        },
        getTimeString: function() {
            let date = new Date();
            let string = date.toString().substr(16, 5);
            return string;
        },
        addToContent: function(string) {
            $(".content-message pre").append(`${string}`);
            AutoScroll(".content-message pre");
        },
    };

    let listener = {
        ONMESSAGE: null,
        keys: {"send": [], "string": []},
        addListener: function(type, fn) {
            listener.keys[type] = listener.keys[type] || [];
            listener.keys[type].push(fn);
        },
    };

    let wsmud = {
        webSocket: null,
        send: function(message) {
            wsmud.webSocket.send(message);
            listener.keys["send"].forEach(fn => fn(message, null));
        },
        receive: function(message) {
            let data = message.data;
            if (/{(.*)}/.test(data)) data = (new Function(`return ${data};`))();
            console.log(data);
            if (typeof data === "string") {
                listener.keys["string"].forEach(fn => fn(message, data));
            } else if (typeof data === "object") {
                if (data.type === "dialog") data.type = data.dialog;
                listener.keys[data.type] = listener.keys[data.type] || [];
                if (listener.keys[data.type].length > 0) {
                    listener.keys[data.type].forEach(fn => fn(message, data));
                } else {
                    listener.ONMESSAGE.apply(this, arguments);
                }
            }
        }
    };

    if (WebSocket) {
        unsafeWindow.WebSocket = function(url) {
            wsmud.webSocket = new WebSocket(url);
        };
        unsafeWindow.WebSocket.prototype = {
            get url() {
                return wsmud.webSocket.url;
            },
            get protocol() {
                return wsmud.webSocket.protocol;
            },
            get readyState() {
                return wsmud.webSocket.readyState;
            },
            get bufferedAmount() {
                return wsmud.webSocket.bufferedAmount;
            },
            get extensions() {
                return wsmud.webSocket.extensions;
            },
            get binaryType() {
                return wsmud.webSocket.binaryType;
            },
            set binaryType(type) {
                wsmud.webSocket.binaryType = type;
            },
            get onerror() {
                return wsmud.webSocket.onerror;
            },
            set onerror(fn) {
                wsmud.webSocket.onerror = fn;
            },
            get onopen() {
                return wsmud.webSocket.onopen;
            },
            set onopen(fn) {
                wsmud.webSocket.onopen = fn;
            },
            get onclose() {
                return wsmud.webSocket.onclose;
            },
            set onclose(fn) {
                wsmud.webSocket.onclose = fn;
            },
            close: function () {
                wsmud.webSocket.close();
            },
            get onmessage() {
                return wsmud.webSocket.onmessage;
            },
            set onmessage(fn) {
                listener.ONMESSAGE = fn;
                wsmud.webSocket.onmessage = wsmud.receive;
            },
            send: function (message) {
                wsmud.send(message);
            },
        };
    };


    let jh = ["jh fam 0 start", "jh fam 1 start", "jh fam 2 start", "jh fam 3 start", "jh fam 4 start", "jh fam 5 start", "jh fam 6 start", "jh fam 7 start", "jh fam 8 start", "jh fam 9 start"];
    let e = "go east", s = "go south", w = "go west", n = "go north", enter = "go enter";
    let onekey = {
        jh: jh, e: e, s: s, w: w, n: n,
        enter: enter,
        wakuang: "wakuang",
        xiulian: [jh[0], w, w, n, enter, w, "xiulian"],
        flower: "greet 99",
    }

    let funny = {
        "fn": fn,
        "listener": listener,
        "onekey": onekey,
    };
    unsafeWindow.funny = funny;
})();

let AutoScroll = function(name) {
    if (name === undefined) return;
    let a = $(name)[0].scrollTop,
        b = $(name)[0].scrollHeight,
        h = Math.ceil($(name).height()); // 向上取整
        console.log(`AutoScroll => a=${a} b=${b} h=${h}`);
    if (a < b - h) {
        let add = (b - h < 120) ? 1 : Math.ceil((b - h) / 120);
        $(name)[0].scrollTop = a + add;
        setTimeout(`AutoScroll("${name}")`, 1000/120);
    }
}
unsafeWindow.AutoScroll = AutoScroll;