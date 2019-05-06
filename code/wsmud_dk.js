// ==UserScript==
// @name        wsmud_dk
// @namespace   suqing.fun
// @version     0.0.1
// @author      SuQing
// @match       http://*.wsmud.com/*
// @homepage    https://greasyfork.org/zh-CN/scripts/-----
// @description -----
// @run-at      document-start
// @require     https://code.jquery.com/jquery-3.3.1.min.js
// @grant       unsafeWindow
// @grant       GM_addStyle
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_getValue
// @grant       GM_setClipboard
// ==/UserScript==

(function() {
    "use strict";

    GM_addStyle("body { width: 100%; display: flex; flex-flow: row nowrap; }");
    GM_addStyle(".gameOrigin { width: 300px; height: 100%; flex: 0 1 auto; }");
    GM_addStyle(".show { flex: 1 1 auto; width: 450px; height:100%; background-color: #151515; }");

    GM_addStyle(".servers td { padding: 0 5px 0 5px; text-align: center; border: 1px solid #333333; }");




    $(document).ready(function() {
        $("body").append("<div class='gameOrigin'></div>");
        $(".gameOrigin").append(
            $(".container").html(""),
            $(".login-content"),
            $(".hidden-item").html(""),
            $(".dialog-confirm").html(""),
            $(".pay").html("")
        );
        $("[command=SelectRole]").click(() => $(".gameOrigin").remove());

        $("body").append("<div class='show'></div>");

        let list = {};

        if (!WebSocket) {
            showMessage("检查 WebSocket 失败！无法正常工作！");
            return;
        } else {
            showMessage("检查 WebSocket 成功！");
            let tooken = getCookie("u") + " " + getCookie("p");
            getServer(function(serverArray) {
                serverArray.forEach(server => {
                    if (server.IsTest) return;
                    let uri = "ws://" + server.IP + ":" + server.Port;
                    $(".servers tbody").append(
                        $("<tr></tr>").append(
                            $("<td></td>").addClass("server-name").append(server.Name),
                            $("<td></td>").addClass("server-ip").append(server.IP),
                            $("<td></td>").addClass("server-port").append(server.Port),
                            $("<td></td>").append(
                                $("<a></a>").append("进入" + server.Name).click(() => {
                                    let ws = new WebSocket(uri);
                                    showMessage("Send => " + tooken);
                                    ws.onopen = () => ws.send(tooken);
                                    ws.onclose = () => 0;
                                    ws.onmessage = (event) => {
                                        let message = Str2Obj(event.data);
                                        console.log(message);
                                    }
                                })
                            )
                        )
                    );
                });
            });
        }








    });

})();

function Str2Obj(str) {
    if (str[0] === "{") {
        return (new Function("return " + str))();
    } else {
        return {
            "type": "text",
            "text": str
        };
    }
}

function showMessage(message) {
    $(".show").append("<div>" + message + "</div>");
}

function getCookie(key) {
    console.log(document.cookie);
    if (document.cookie.length > 0) {
        let begin = document.cookie.indexOf(key + "=");
        if (begin != -1) {
            begin += key.length + 1;
            let end = document.cookie.indexOf(";", begin);
            if (end == -1) {
                end = document.cookie.length;
            }
            return unescape(document.cookie.substring(begin, end));
        }
    }
    return "";
}

function getServer(complete) {
    let request = new XMLHttpRequest();
    request.open("GET", "http://game.wsmud.com/Game/GetServer");
    request.send();
    request.onreadystatechange = function() {
        showMessage(`请求服务器数据中…… state:${request.readyState};status:${request.status};text:${request.statusText}`);
        if (request.readyState === 4 && request.status === 200) {
            $(".show").append("<table class='servers'></table>");
            $(".servers").append("<thead></thead><tbody></tbody>");
            $(".servers thead").append(
                $("<tr></tr>").append(
                    $("<td></td>").append("服务器"),
                    $("<td></td>").append("地址"),
                    $("<td></td>").append("端口"),
                    $("<td></td>").append("登入"),
                )
            );
            let serverArray = JSON.parse(request.responseText);
            complete(serverArray);
        }
    }
}

// var xhr = new XMLHttpRequest();
// xhr.timeout = 3000;
// xhr.ontimeout = function (event) {
//     alert("请求超时！");
// }
// var formData = new FormData();
// formData.append('tel', '18217767969');
// formData.append('psw', '111111');
// xhr.open('POST', 'http://www.test.com:8000/login');
// xhr.send(formData);
// xhr.onreadystatechange = function () {
//     if (xhr.readyState == 4 && xhr.status == 200) {
//         alert(xhr.responseText);
//     }
//     else {
//         alert(xhr.statusText);
//     }
// }

function WebRequest(type, timeout, data, completeFn, errorFn) {
    if (type !== "GET" && type !== "POST") {
        errorFn("Type Error");
    }
    let request = new XMLHttpRequest();
    request.timeout = timeout || 10000;
    request.ontimeout = function(event) {
        errorFn("Time Out");
    }
    if (type === "POST") {

    }
}