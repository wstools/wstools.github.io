// ==UserScript==
// @name         WSMud_NewWorld
// @namespace    fun.suqing
// @version      0.1
// @description  Take over the MoFei's HTML!
// @author       You
// @match        http://*.wsmud.com/
// @run-at       document-start
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

(function() {
    "use strict";
    let funny = {
        request: {
            get: function(url, complete) {
                let request = new XMLHttpRequest();
                request.open("GET", url, true);
                request.onload = function() {
                    complete(request.responseText);
                };
                request.send();
                console.log(request);
            },
            post: function(url, data, complete) {
                let request = new XMLHttpRequest();
                request.open("POST", url, true);
                request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                request.onreadystatechange = function() {
                    if (request.readyState == 4 && request.status == 200) {
                        complete(request.responseText);
                    } else if (request.readyState == 4) {
                        console.log("Failed.");
                    } else {
                        console.log("Loading...");
                    }
                };
                request.send(data);
                console.log(request);
            },
        }
    };


    WebSocket ? console.log("WebSocket") : console.log("no WebSocket");

    $("head").html("");
    $("head").append(
        $("<title>wsmud</title>"),
    );
    GM_addStyle(`body{background:#151515;color:green;}`);
    GM_addStyle(`table{border-collapse:collapse;}`);
    GM_addStyle(`td{padding:5px;}`);

    $("body").html("");

    $("body").append(
        $(`<div id="sq-login"></div>`).append(
            $(`<span>账号：</span><input type="text" id="account">`),
            $(`<span>密码：</span><input type="password" id="password">`),
            $(`<button type="button">登录账号</button>`).click(function() {
                let url = "http://game.wsmud.com/UserAPI/Login";
                let data = `code=${$("#account").val()}&pwd=${$("#password").val()}`;
                function complete(responseText) {
                    console.log(JSON.parse(responseText));
                    // {code: 0, message: "用户名或密码错误"}
                    // {code: 1, message: ""}
                    let response = JSON.parse(responseText);
                    if (response.code === 1) {
                        funny.request.get("http://game.wsmud.com/Game/GetServer", function(responseText) {
                            let serverArray = JSON.parse(responseText);
                            console.log(serverArray);
                            serverArray.forEach(server => {
                                $("#sq-serve").append(
                                    $(`<button type="button">${server.Name}</button>`).click(function() {
                                        // ws://120.78.75.229:25631/
                                        // let uri = `ws://${server.IP}:${server.Port}`;
                                        let uri = "ws://" + server.IP + ":" + server.Port;
                                        console.log(uri);
                                        // console.log(document.cookie);
                                        // p=cAYypV3cOeqsh6B2Ibw/ZA==; u=f08115aac568400c95b6df1697416a41
                                        let cookie = document.cookie;
                                        let x = cookie.match(/p=(.*); u=(.*)/);
                                        let p = x[1];
                                        let u = x[2];
                                        let token = u + " " + p;

                                        let websocket = new WebSocket(uri);
                                        websocket.send(token);

                                        websocket.onopen = function(evt) {
                                            console.log("onopen");
                                        };
                                        websocket.onclose = function(evt) {
                                            console.log("onclose");
                                        };
                                        websocket.onmessage = function(evt) {
                                            console.log("onmessage");
                                        };
                                        websocket.onerror = function(evt) {
                                            console.log("onerror");
                                        };
                                    }),
                                );
                            });
                        });

                    }
                }
                funny.request.post(url, data, complete);
            }),
            $(`<button type="button">退出登录</button>`).click(function() {
                $("body").html("");
            }),
        ),
        $(`<div id="sq-serve"></div>`),
    );





})();