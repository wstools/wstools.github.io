// ==UserScript==
// @name        JHMud
// @namespace   JHMud_bySQ
// @version     0.0.1.test
// @author      SuQing
// @date        2019/05/14
// @modified    2019/05/21
// @match       http://jh.92mud.com/*
// @homepage    http://0.0.0.0/
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

(function() {
    "use strict";
    const Delay = 300; // 发送消息时 延迟 毫秒
    const GoNorth = "go north\n";
    const GoNorthUp = "go northup\n";
    const GoEast = "go east\n";
    const GoEastUp = "go eastup\n";
    const GoSouth = "go south\n";
    const GoSouthUp = "go southup\n";
    const GoWest = "go west\n";
    const GoWestUp = "go westup\n";
    const GoSouthWEST = "go southwest\n";
    const GoSouthEast = "go southeast\n";
    const GoEnter = "go enter\n";
    const GoDown = "go down\n";
    const GoUp = "go up\n";
    const OpenDoor = "open door\n";
    const JumpDown = "jump down\n";
    const BreakBi = "break bi\n";
    const List = "list\n";

    let WS = null;
    let OnMessage_FN = null;

    let showSendCommand = true;

    let role = new Proxy({}, {});
    let room = new Proxy({}, {});

    let Listeners = [];
    let addListener = fn => {
        let id = Listeners.length;
        Listeners.push(fn);
        return id;
    };
    let removeListener = id => {
        Listeners[id] = null;
    };

    let Place = {
        "扬州城": {
            "大院": ["jh fam 0 1\n"],
            "帮会管理处": ["jh fam 0 2\n"],
            "武庙": ["jh fam 0 3\n"],
            "钱庄": ["jh fam 0 4\n"],
            "当铺": ["jh fam 0 5\n"],
            "衙门正厅": ["jh fam 0 6\n"],
            "药铺": ["jh fam 0 7\n", List],
            "书院": ["jh fam 0 8\n"],
            "醉仙楼": ["jh fam 0 9\n", List],
            "杂货铺": ["jh fam 0 10\n", List],
            "打铁铺": ["jh fam 0 11\n", List],
            "武馆": ["jh fam 0 12\n"],
        }, "武当派": {
            "广场": ["jh fam 1 start\n"],
            "三清殿": ["jh fam 1 start\n", GoNorth],
            "石阶": ["jh fam 1 start\n", GoWest],
            "练功房": ["jh fam 1 start\n", GoWest, GoWest],
            "太子岩": ["jh fam 1 1\n"],
            "桃园小路": ["jh fam 1 1\n", GoNorth],
            "舍身崖": ["jh fam 1 1\n", GoNorth, GoEast],
            "南岩峰": ["jh fam 1 1\n", GoNorth, GoWest],
            "乌鸦岭": ["jh fam 1 1\n", GoNorth, GoWest, GoNorthUp],
            "三老峰": ["jh fam 1 1\n", GoNorth, GoWest, GoNorthUp, GoNorthUp],
            "五老峰": ["jh fam 1 1\n", GoNorth, GoWest, GoNorthUp, GoNorthUp, GoNorthUp],
            "虎头岩": ["jh fam 1 1\n", GoNorth, GoWest, GoNorthUp, GoNorthUp, GoNorthUp, GoNorthUp],
            "朝天宫": ["jh fam 1 1\n", GoNorth, GoWest, GoNorthUp, GoNorthUp, GoNorthUp, GoNorthUp, GoNorth],
            "三天门": ["jh fam 1 1\n", GoNorth, GoWest, GoNorthUp, GoNorthUp, GoNorthUp, GoNorthUp, GoNorth, GoNorth],
            "十二莲台": ["jh fam 1 1\n", GoNorth, GoWest, GoNorthUp, GoNorthUp, GoNorthUp, GoNorthUp, GoNorth, GoNorth, GoNorth],
            "茶室": ["jh fam 1 1\n", GoNorth, GoWest, GoNorthUp, GoNorthUp, GoNorthUp, GoNorthUp, GoNorth, GoNorth, GoNorth, GoEast],
            "紫金城": ["jh fam 1 1\n", GoNorth, GoWest, GoNorthUp, GoNorthUp, GoNorthUp, GoNorthUp, GoNorth, GoNorth, GoNorth, GoNorth],
            "林间小径": ["jh fam 1 1\n", GoNorth, GoWest, GoNorthUp, GoNorthUp, GoNorthUp, GoNorthUp, GoNorth, GoNorth, GoNorth, GoNorth, GoNorth],
            "林间小径2": [GoNorth],
            "金殿": ["jh fam 1 1\n", GoNorth, GoWest, GoNorthUp, GoNorthUp, GoNorthUp, GoNorthUp, GoNorth, GoNorth, GoNorth, GoNorth, GoNorth, GoNorth, OpenDoor, GoNorth],
        }, "少林派": {
            "广场1": ["jh fam 2 start\n"],
            "山门殿": ["jh fam 2 start\n", GoNorth],
            "西侧殿1": ["jh fam 2 start\n", GoNorth, GoWest],
            "东侧殿1": ["jh fam 2 start\n", GoNorth, GoEast],
            "台阶": ["jh fam 2 start\n", GoNorth, GoNorth],
            "西碑林": ["jh fam 2 start\n", GoNorth, GoNorth, GoWest],
            "东碑林": ["jh fam 2 start\n", GoNorth, GoNorth, GoEast],
            "天王殿": ["jh fam 2 start\n", GoNorth, GoNorth, GoNorthUp],
            "西侧殿2": ["jh fam 2 start\n", GoNorth, GoNorth, GoNorthUp, GoWest],
            "东侧殿2": ["jh fam 2 start\n", GoNorth, GoNorth, GoNorthUp, GoEast],
            "广场2": ["jh fam 2 1\n", GoSouth, GoSouthWEST, GoEast],
            "大雄宝殿": ["jh fam 2 1\n", GoSouth, GoSouthWEST, GoEast, GoNorthUp],
            "鼓楼小院": ["jh fam 2 1\n", GoSouth, GoSouthWEST],
            "钟楼小院": ["jh fam 2 1\n", GoSouth, GoSouthEast],
            "后殿": ["jh fam 2 1\n", GoSouth],
            "练武场1": ["jh fam 2 1\n"],
            "般若堂": ["jh fam 2 1\n", GoWest],
            "罗汉堂": ["jh fam 2 1\n", GoEast],
            "方丈楼": ["jh fam 2 1\n", GoNorth],
            "练武场2": ["jh fam 2 1\n", GoNorth, GoNorth],
            "达摩院": ["jh fam 2 1\n", GoNorth, GoNorth, GoNorthUp],
            "广场3": ["jh fam 2 1\n", GoNorth, GoNorth, GoNorthUp, GoNorth],
            "地藏殿": ["jh fam 2 1\n", GoNorth, GoNorth, GoNorthUp, GoNorth, GoWest],
            "白衣殿": ["jh fam 2 1\n", GoNorth, GoNorth, GoNorthUp, GoNorth, GoEast],
            "千佛殿": ["jh fam 2 1\n", GoNorth, GoNorth, GoNorthUp, GoNorth, GoNorthUp],
            "竹林1": ["jh fam 2 1\n", GoNorth, GoNorth, GoNorthUp, GoNorth, GoNorthUp, GoNorth],
            "竹林2": ["jh fam 2 1\n", GoNorth, GoNorth, GoNorthUp, GoNorth, GoNorthUp, GoNorth, GoNorth],
            "达摩洞": ["jh fam 2 1\n", GoNorth, GoNorth, GoNorthUp, GoNorth, GoNorthUp, GoNorth, GoNorth, GoNorth],
        }, "华山派": {
            "镇岳宫": ["jh fam 3 start\n"],
            "苍龙岭": ["jh fam 3 start\n", GoEastUp],
            "舍身崖": ["jh fam 3 start\n", GoEastUp, GoSouthUp],
            "崖底": ["jh fam 3 start\n", GoEastUp, GoSouthUp, JumpDown],
            "练武场": ["jh fam 3 1\n"],
            "客厅": ["jh fam 3 1\n", GoNorth],
            "寝室": ["jh fam 3 1\n", GoNorth, GoNorth],
            "山顶小店": ["jh fam 3 1\n", GoWest],
            "兵器房": ["jh fam 3 1\n", GoEast],
            "练功房": ["jh fam 3 1\n", GoEast, GoEast],
            "玉女峰": ["jh fam 3 1\n", GoSouth],
            "玉女祠": ["jh fam 3 1\n", GoSouth, GoWest],
            "玉女蜂山路": ["jh fam 3 1\n", GoSouth, GoWest, GoSouth],
            "玉女蜂小径": ["jh fam 3 1\n", GoSouth, GoWest, GoSouth, GoSouthUp],
            "思过崖": ["jh fam 3 1\n", GoSouth, GoWest, GoSouth, GoSouthUp, GoSouthUp],
            "后山": ["jh fam 3 1\n", GoSouth, GoWest, GoSouth, GoSouthUp, GoSouthUp, BreakBi, GoEnter]
        }, "峨嵋派": {
            "广场": ["jh fam 4 start\n"],
            "庙门": ["jh fam 4 start\n", GoNorth],
            "金顶": ["jh fam 4 start\n", GoNorth, GoEast],
            "睹光台": ["jh fam 4 start\n", GoNorth, GoEast, GoNorthUp],
            "华藏庵": ["jh fam 4 start\n", GoNorth, GoEast, GoNorthUp, GoEast],
            "大殿": ["jh fam 4 start\n", GoSouth],
            "走廊1": ["jh fam 4 start\n", GoEast],
            "走廊2": ["jh fam 4 start\n", GoEast, GoEast],
            "厨房": ["jh fam 4 start\n", GoEast, GoEast, GoNorth],
            "走廊3": ["jh fam 4 start\n", GoWest],
            "练功房": ["jh fam 4 start\n", GoWest, GoWest],
            "走廊4": ["jh fam 4 start\n", GoWest, GoNorth],
            "茅草屋": ["jh fam 4 start\n", GoWest, GoNorth, GoNorth],
            "走廊5": ["jh fam 4 start\n", GoWest, GoSouth],
            "走廊6": ["jh fam 4 start\n", GoWest, GoSouth, GoWest],
            "清修洞": ["jh fam 4 start\n", GoWest, GoSouth, GoWest, GoSouth],
        }, "逍遥派": {
            "青草坪": ["jh fam 5 start\n"],
            "地下石室1": ["jh fam 5 start\n", GoDown],
            "地下石室2": ["jh fam 5 start\n", GoDown, GoDown],
            "林间小道1": ["jh fam 5 1\n"],
            "林间小道2": ["jh fam 5 1\n", GoWest],
            "小屋": ["jh fam 5 1\n", GoWest, GoWest],
            "打铁屋": ["jh fam 5 1\n", GoWest, GoNorth],
            "酒家": ["jh fam 5 1\n", GoWest, GoSouth],
            "林间小道3": ["jh fam 5 start\n", GoSouth],
            "木屋": ["jh fam 5 start\n", GoSouth, GoSouth],
            "林间小道4": ["jh fam 5 start\n", GoNorth],
            "小木屋": ["jh fam 5 start\n", GoNorth, GoNorth],
            "林间小道5": ["jh fam 5 start\n", GoEast],
            "石屋": ["jh fam 5 start\n", GoEast, GoNorth],
            "木板路": ["jh fam 5 start\n", GoEast, GoSouth],
            "工匠屋": ["jh fam 5 start\n", GoEast, GoSouth, GoSouth],
        }, "丐帮": {
            "树洞内部": ["jh fam 6 start\n"],
            "树洞下": ["jh fam 6 start\n", GoDown],
            "暗道1": ["jh fam 6 1\n", GoWest, GoWest],
            "暗道2": ["jh fam 6 1\n", GoWest],
            "破庙密室": ["jh fam 6 1\n"],
            "土地庙": ["jh fam 6 1\n", GoUp],
            "暗道3": ["jh fam 6 1\n", GoEast],
            "暗道4": ["jh fam 6 1\n", GoEast, GoEast],
            "林间小屋": ["jh fam 6 1\n", GoEast, GoEast, GoUp],
        }, "襄阳": {

        }
    };
    let Family = {
        "自由人士": ["教头", Place["扬州城"]["武馆"]],
        "武当派": ["谷虚道长", Place["武当派"]["三清殿"]],
        "少林派": ["清乐比丘", Place["少林派"]["广场1"]],
        "华山派": ["高根明", Place["华山派"]["镇岳宫"]],
        "峨嵋派": ["苏梦清", Place["峨嵋派"]["庙门"]],
        "逍遥派": ["苏星河", Place["逍遥派"]["青草坪"]],
        "丐帮": ["左全", Place["丐帮"]["树洞下"]]
    };
    let P = {
        zxl: Place["扬州城"]["醉仙楼"],
        zhp: Place["扬州城"]["杂货铺"],
        dtp: Place["扬州城"]["打铁铺"],
        yp : Place["扬州城"]["药铺"]
    };
    let Buy = {
        "<wht>包子<nor>": P.zxl,
        "<wht>米饭<nor>": P.zxl,
        "<wht>面条<nor>": P.zxl,
        "<wht>鸡腿<nor>": P.zxl,
        "<wht>米酒<nor>": P.zxl,
        "<wht>花雕酒<nor>": P.zxl,
        "<wht>扬州炒饭<nor>": P.zxl,
        "<wht>女儿红<nor>": P.zxl,
        "<hig>醉仙酿<nor>": P.zxl,
        "<hiy>神仙醉<nor>": P.zxl,
        "<wht>布鞋<nor>": P.zhp,
        "<wht>钢刀<nor>": P.zhp,
        "<wht>长鞭<nor>": P.zhp,
        "<wht>簪子<nor>": P.zhp,
        "<wht>铁戒指<nor>": P.zhp,
        "<wht>英雄巾<nor>": P.zhp,
        "<wht>布衣<nor>": P.zhp,
        "<wht>木棍<nor>": P.zhp,
        "<wht>钢刀<nor>": P.dtp,
        "<wht>铁杖<nor>": P.dtp,
        "<wht>铁棍<nor>": P.dtp,
        "<wht>铁剑<nor>": P.dtp,
        "<wht>钢针<nor>": P.dtp,
        "<hig>引气丹<nor>": P.yp,
        "<hig>金创药<nor>": P.yp,
        "<hig>养精丹<nor>": P.yp
    };

    /********** 选项 **********/


    /********** 测试 **********/
    if (!/test/.test(GM_info.script.version)) {
        console.log = () => {}; // 禁止控制台的调试
        showSendCommand = false; // 禁止显示发送的消息
    }

    /********** document **********/
    $(document).ready(() => {
        $(".state-bar").css("width", "calc(100% - 3em * 5)");
        $("[command=showchat]").after(
            $(`<span class="tool-item"></span>`)
            .append(`<span command="time" class="glyphicon glyphicon-send tool-icon"></span> <span class="tool-text">插件</span>`)
            .click(() => Start())
        );

        GM_addStyle(`
        .span-btn { border: gray solid 1px; border-radius: 3px; display: inline-block; padding: 5px; font-size: 14px; margin: 0 5px 5px 0; }
        .span-btn { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; cursor: pointer; }
        .span-btn:hover { color: #00ff00; }
        .span-btn:active { transform: translateY(1px); }
        `);
    });

    if (WebSocket) {
        unsafeWindow.WebSocket = function (uri) {
            WS = new WebSocket(uri);
        };
        unsafeWindow.WebSocket.prototype = {
            CONNECTING: WebSocket.CONNECTING,
            OPEN: WebSocket.OPEN,
            CWGOSING: WebSocket.CWGOSING,
            CWGOSED: WebSocket.CWGOSED,
            get url() {
                return WS.url;
            },
            get protocol() {
                return WS.protocol;
            },
            get readyState() {
                return WS.readyState;
            },
            get bufferedAmount() {
                return WS.bufferedAmount;
            },
            get extensions() {
                return WS.extensions;
            },
            set binaryType(type) {
                WS.binaryType = type;
            },
            get binaryType() {
                return WS.binaryType;
            },
            set onerror(fn) {
                WS.onerror = fn;
            },
            get onerror() {
                return WS.onerror;
            },
            set onopen(fn) {
                WS.onopen = fn;
            },
            get onopen() {
                return WS.onopen;
            },
            set onclose(fn) {
                WS.onclose = fn;
            },
            get onclose() {
                return WS.onclose;
            },
            set onmessage(fn) {
                OnMessage_FN = fn;
                WS.onmessage = OnMessage;
            },
            get onmessage() {
                return WS.onmessage;
            },
            send: command => SendCommand(command),
            close: () => WS.close()
        };
    } else return;

    // 发送消息
    function SendCommand(command) {
        if (command instanceof Array) {
            if (command.length === 0) return;
            let cmd1 = command[0];
            let cmd2 = command.slice(1);
            if (typeof cmd1 === "string") {
                SendCommand(cmd1);
                setTimeout(() => SendCommand(cmd2), Delay); // 延迟
            } else if (typeof cmd1 === "number") {
                setTimeout(() => SendCommand(cmd2), cmd1); // 手动延迟
            }
        } else if (typeof command === "string") {
            // console.log("SEND: " + command);
            WS.send(command);
            if (showSendCommand) AppendMessage("<hiy>" + command + "</hiy>");
        }
    }
    // 接收数据
    function OnMessage(event) {
        OnMessage_FN.apply(this, [event]); // 原样执行
        let data = event.data;
        if (data && data instanceof Blob) {
            let reader = new FileReader();
            reader.readAsText(data, "gb2312");
            reader.addEventListener("loadend", function() {
                let results = reader.result.split("^^");
                results.forEach(str => {
                    if (str === "" || str === "\r\n") return;
                    let message = Str2Obj(str);
                    console.log(message);

                    for (let i = 0; i < Listeners.length; i ++) {
                        if (Listeners[i] !== null) {
                            let fn = Listeners[i];
                            fn(message);
                        }
                    }
                });
            });
        } else console.log(event);
    }
    // 添加额外文本
    function AppendMessage(message) {
        $(".content-message pre").append(message);
        AutoScroll(".content-message");
    }
    // 页面元素滚动
    function AutoScroll(selector) {
        if (!selector) return;
        let top = $(selector)[0].scrollTop; // 元素顶部的偏移量
        let max = $(selector)[0].scrollHeight; // 元素偏移量的最大值
        let height = Math.ceil($(selector).height()); // 元素的表面高度
        if (top < max - height) {
            let inc = (max - height < 120) ? 1 : Math.ceil((max - height) / 120);
            $(selector)[0].scrollTop = top + inc; // 改变偏移量
            setTimeout(() => AutoScroll(selector), 1000 / 60); // 滚动速度 FPS = 60
        }
    }
    // 字符串转对象
    function Str2Obj(str) {
        if (str[0] === "{") {
            return (new Function("return " + str))();
        } else return {
            "type": "text",
            "text": str
        };
    }
    function Say(text) {
        let url = `https://fanyi.baidu.com/gettts?lan=zh&text=${text}&spd=5&source=web`;
        let audio = new Audio(url);
        audio.play();
    }
    // 网络请求
    function GetTime(name) {
        let url = "http://47.102.126.255/JHMud.php";
        $.get(url, {"name": name}, function(data){
            data = JSON.parse(data);
            if (data.result) {
                AppendMessage(data.message);
            } else {
                AppendMessage(data.message);
                for (let i = 0; i < Listeners.length; i++) removeListener(i);
            }
        });
    }

    /********** 插件 **********/
    function Start() {
        AppendMessage($(`<span class="span-btn">师门</span>`).click(() => TaskSM(1)));
        AppendMessage(`<span>\n</span>`);
    }
    /********** 监控 **********/
    let id_login = addListener(message => {
        if (message.type === "login") {
            $("[command=showcombat]").click();
            $("[command=showtool]").click();
            SendCommand("score\n");
            setTimeout(() => $(".dialog-close").click(), 200);
        } else if (message.type === "dialog" && message.dialog === "score" && message.name && message.family) {
            let name = message.name.replace(/<(.+?)>/g, "");
            let x = name.split(" ");
            role.name = x[x.length - 1];
            role.family = message.family;
            GetTime(role.name);
            Say(`欢迎${role.name}。`);
            removeListener(id_login); // 销毁监听
        }
    });

    addListener(message => {
        if (message.type === "room") {
            room.name = message.name;
        } else if (message.type === "items") {
            room.npcs = []; // room.npcs
            message.items.forEach(item => {
                let isNPC = (item.p === 0);
                if (isNPC) room.npcs.push(item);
            });
        }
    });

    addListener(message => {
        if (message.type === "msg" && message.ch === "rumor") {

        }
//         ch: "rumor"
// content: "听说有武林叛徒<him>出现在华山-练功房，请各位侠仕出手相助。"
// fam: ""
// name: "0"
// pd_name: "谣言"
// server: "0"
// type: false
// uid: "/adm/daemons/bossd"
    });

    /********** 师门流程 **********/
    let sm_state = 0;
    let sm_family = null;
    let sm_father_name = null;
    let sm_cmd_find_father = null;
    let sm_cmd_task = null;

    let SMActions = new Map([
        ["init", function() {

        }],

    ]);


    function TaskSM() {
        switch (sm_state) {
            case 0: // 初始化
                sm_family = role.family;
                sm_father_name = Family[sm_family][0];
                sm_father_cmd = Family[sm_family][1];
                let id_sm_0 = addListener(message => {
                    if (message.type === "items") {
                        let npc = message.items.find(item => {return item.name.includes(sm_father_name)});
                        if (npc) {
                            let cmd = `task sm ${npc.id}\n`;
                            sm_cmd_task = [cmd, cmd];
                            removeListener(id_sm_0);
                        }
                    }
                });
            case 1:

                break;

            default:
                break;
        }
    }
    let task = {command: null, item: null};
    function TaskSM(state) {
        if (state === 0) {
            task = {command: null, item: null};
            return;
        } else if (state === 1) { // 1 开始师门 寻找门派师傅
            let family = role.family;
            let father = Family[family][0];
            let command = Family[family][1];


            if (npc) {
                let cmd = `task sm ${npc.id}\n`;
                task.command = [cmd, cmd];
                TaskSM(2);
            } else {
                let id_sm1 = addListener(message => {
                    if (message.type === "items") {
                        let npc = message.items.find(item => {
                            return item.name.includes(father);
                        });
                        if (npc) {
                            AppendMessage(`<cyn>师门任务目标 <hio>${father}</hio></cyn>\n`);
                            let cmd = `task sm ${npc.id}\n`;
                            task.command = [cmd, cmd];
                        } else {
                            task.command = null;
                        }
                    }
                });
                SendCommand(command);
                setTimeout(() => {
                    removeListener(id_sm1);
                    TaskSM(2);
                }, Delay * 3); // 至少时间去找 NPC
            }
        } else if (state === 2) { // 2 找到师傅 请求任务
            let command = task.command;
            if (command === null) {
                AppendMessage(`<cyn>师门任务目标 未找到</cyn>\n`);
                return;
            }
            task.item = "任务物品";
            let id_sm2 = addListener(message => {
                if (message.type === "text" && message.text.includes("你要是找不到就换别的吧")) {
                    let x = message.text.match(/我要的是(.+)，/);
                    task.item = x[1];
                    AppendMessage(`<cyn>任务物品 ${task.item}</cyn>\n`);
                } else if (message.type === "cmds" && message.items) {
                    let cmd = message.items.find(cmd => {
                        return cmd.name.includes("上交") && !cmd.name.includes("师门令牌");
                    });
                    if (cmd) {
                        task.command = `${cmd.cmd}\n`;
                    } else if (Buy[task.item]) {
                        task.command = Buy[task.item];
                    } else task.command = null;
                } else if (message.type === "text" && message.text.includes("你今天已经完成20个任务了，休息一下吧。")) {
                    task.item = null;
                    Say("师门任务完成");
                    TaskSM(0);
                }
            });
            SendCommand(command);
            setTimeout(() => {
                removeListener(id_sm2);
                TaskSM(3);
            }, Delay * 3); // 需要时间请求任务
        } else if (state === 3) {
            let item = task.item;
            if (item === null) return;
            let command = task.command;
            if (command === null) {
                AppendMessage(`<cyn>无法获得 ${item}</cyn>\n`);
                Say(`无法获得${item.replace(/<(.+?)>/g, "")}`);
                return;
            }
            SendCommand(command);
            if (Buy[item]) {
                let id_sm3 = addListener(message => {
                    if (message.type === "dialog" && message.dialog === "list" && message.seller && message.selllist) {
                        let npc_id = message.seller;
                        let item = message.selllist.find(item => {
                            return item.name === task.item;
                        });
                        let cmd = `buy 1 ${item.id} from ${npc_id}\n`;
                        SendCommand(cmd);
                    } else if (message.type === "text" && message.text.includes("穷光蛋，一边呆着去！")) {
                        Say(`穷光蛋${role.name}，你买不起任务物品。`);
                        AppendMessage(`<cyn>无力购买 ${item}</cyn>\n`);
                        TaskSM(0);
                    } else if (message.type === "text" && /你从(.+)那里买下了/.test(message.text)) {
                        setTimeout(() => TaskSM(1), Delay);
                    }
                });
                setTimeout(() => removeListener(id_sm3), Delay * 2);
            } else {
                setTimeout(() => TaskSM(1), Delay); // 需要时间上交
            }
        }
    }
    addListener(message => {
        if (message.type === "text" && /你的师门任务完成了，今日完成(.+)个，连续完成(.+)个。/.test(message.text)) {
            TaskSM(1);
        }
    });

    /********** 暴露 **********/
    unsafeWindow.funny = {
        role: role,
        room: room,

        send: SendCommand,
        appm: AppendMessage
    }
})();