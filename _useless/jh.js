// ==UserScript==
// @name        JHMudFunny
// @namespace   suqing.fun
// @version     0.0.test
// @author      SuQing
// @match       http://jh.92mud.com/*
// @homepage    https://greasyfork.org/zh-CN/scripts/-----
// @description 江湖论道插件
// @run-at      document-start
// @require     https://code.jquery.com/jquery-3.3.1.min.js
// @grant       unsafeWindow
// @grant       GM_addStyle
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_getValue
// @grant       GM_setClipboard
// ==/UserScript==

(function () {

    funny.tksm = () => {
        switch (funny["tksm_sw"]) {
        case 0:
            funny.sm(funny.D.sm[funny.f][1]);
            funny["tksm_sw"] = 1;
            setTimeout(() => funny.tksm(), 1500);
            break;
        case 1:
            funny.sm([funny["tksm_c"], funny["tksm_c"]]);
            funny["tksm_sw"] = 2;
            setTimeout(() => funny.tksm(), 500);
            break;
        case 2:
            funny.sm(funny["tksm_c"]);
            funny["tksm_sw"] = 0;
            setTimeout(() => funny.tksm(), 500);
            break;
        case 3:
            funny.sm(funny["tksm_c"]);
            funny["tksm_sw"] = 4;
            setTimeout(() => funny.tksm(), 4000);
            break;
        case 4:
            funny.sm(funny["tksm_c"]);
            funny["tksm_sw"] = 0;
            setTimeout(() => funny.tksm(), 1000);
            break;
        case 5:
            funny.am(`无法获得 <hiy>${funny.tksm_b}</hiy>\n`);
            funny["tksm_sw"] = 0;
            break;
        case 6:
            funny.am(`<hiy>任务结束！</hiy>\n`);
            funny["tksm_sw"] = 0;
            break;
        default:
            break;
        }
    };

    a(m => {




    });

})();

// 店小二冷笑道：“穷光蛋，一边呆着去！”

/*
ch: "rumor"
content: "听说有武林叛徒<him>出现在华山-崖底，请各位侠仕出手相助。"
fam: ""
name: "0"
pd_name: "谣言"
server: "0"
type: "msg"
uid: "/adm/daemons/bossd"
*/