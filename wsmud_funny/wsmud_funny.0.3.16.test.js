// ==UserScript==
// @name        wsmud_funny
// @namespace   suqing.fun
// @version     0.3.16.test
// @author      SuQing
// @match       http://*.wsmud.com/*
// @homepage    https://greasyfork.org/zh-CN/scripts/380709
// @description 如果您由于使用 wsmud_funny 插件而产生了任何不适，那么请即时关闭此插件即可。
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

    let title = new Proxy({name: "RoleName", state: "<STATE>"}, {
        set: function(title, key, value) {
            title[key] = value;
            $("head title").html(title.name + title.state);
        },
        get: function(title, key) {
            return title[key];
        }
    });
    // 若非测试版本 则屏蔽 console.log()
    if (!/test/.test(wsmud.version)) {
        console.log = target => {
            return;
        };
    }
    // 如设备为移动端 则标记
    let isMoblie = false;
    if (navigator.userAgent) {
        let agent = navigator.userAgent.toLowerCase();
        if (/ipad|iphone|android|mobile/.test(agent)) {
            isMoblie = true;
        }
        console.log(agent);
    }


    // Listener
    let listeners = [];
    function addListener(fn) {
        let id = listeners.length;
        listeners.push(fn);
        return id;
    }
    let removeListener = id => listeners[id] = null;
    // WebSocket
    let websocket = null;
    let fn_onmessage = null;
    function action(event) {
        fn_onmessage.apply(this, [event]);
    }
    // Message
    function onmessage(event) {
        let message = Str2Obj(event.data);
        for (let i = 0; i < listeners.length; i++) {
            let fn = listeners[i];
            if (fn(event, message) === 0) return;
        }
        action(event, message);
    }

    if (WebSocket) {
        unsafeWindow.WebSocket = function(uri) {
            websocket = new WebSocket(uri);
        };
        unsafeWindow.WebSocket.prototype = {
            set onopen(fn) {
                websocket.onopen = fn;
                title.state = "<已连接>";
            },
            set onclose(fn) {
                websocket.onclose = fn;
                title.state = "<已离线>";
                setTimeout(() => websocket.onopen(),  5000); // 5 秒后自动重连
            },
            set onmessage(fn) {
                fn_onmessage = fn;
                websocket.onmessage = onmessage;
            },
            send: function (command) {
                console.log(command);
                websocket.send(command);
            }
        };
    } else return; // 若 WebSocket 不存在 则运行结束



    addListener(function(event, message) {

    });



    // 你正在领悟石壁
    // {type: "dialog", dialog: "skills", id: "sword", exp: 98}



    // greet master






    let wsmud = {
        name: GM_info.script.name,
        version: GM_info.script.version,
        isMoblie: false,
        state: {},

        id: null,
        title: {name: "武神传说", state: " Mud"},
        roles: {},
        room: {name: "a-b(c)", map: "a", room: "n", path: ""},
        items: [], //房间的玩家/NPC/尸体/物品
        skills: {},

        role: {},
        pack: {"items": [], "pick": {}, "eqs": [], "money": "", max: 0},

        settings: {
            layout_left_right: true,
            needTimeStr: false,
            auto_sm: false,
            auto_sm_cmd: "Command",
            auto_sm_npc: "NPC_Name",
            auto_sm_item: "Item_Name",
        },

        onmessage: function(event) {
            let message = Str2Obj(event.data);
            let type = message.type || "";
            if (type === "dialog") {
                type = message.dialog || "";
            }
            if (type !== "msg" && type !== "time") console.log(message);


            let listeners = wsmud.listener[type];
            if (listeners instanceof Array && listeners.length > 0) {
                for (let i = 0; i < listeners.length; i++) {
                    let fn = listeners[i];
                    if (fn(event, message)) {
                        if (i < listeners.length - 1) continue;
                        wsmud.fn_onmessage.apply(this, arguments);
                    } else {
                        break;
                    }
                }
                // listeners.forEach(fn => { // });
            } else {
                wsmud.fn_onmessage.apply(this, arguments);
            }
        },
        listener: {"": [], "send": []}
    };

    let AutoSM = function() {
        let schoolName = wsmud.role.family;
        let schoolNames = ["无门无派", "武当派", "少林派", "华山派", "峨眉派", "逍遥派", "丐帮", "杀手楼"];
        let schoolPath = [
            ["jh fam 0 start", "go south", "go south", "go west"],
            ["jh fam 1 start", "go north"],
            ["jh fam 2 start"],
            ["jh fam 3 start"],
            ["jh fam 4 start", "go west"],
            ["jh fam 5 start"],
            ["jh fam 6 start", "go down"],
            ["jh fam 7 start", "go north"]
        ];
        let schoolNPC = ["武馆教习", "武当派第二代弟子 武当首侠 宋远桥", "少林寺第四十代弟子 清乐比丘",
        "市井豪杰 高根明", "峨眉派第五代弟子 苏梦清", "聪辩老人 苏星河", "丐帮七袋弟子 左全", "杀手教习 何小二"];
        let index = schoolNames.indexOf(schoolName);
        wsmud.settings.auto_sm = true;
        wsmud.settings.auto_sm_npc = schoolNPC[index];
        console.log(schoolPath[index]);
        return schoolPath[index];
    };
    let AutoBuy = function(itemName) {
        let list = [
            ["米饭", "包子", "鸡腿", "面条", "扬州炒饭", "米酒", "花雕酒", "女儿红", "醉仙酿", "神仙醉"],
            ["布衣", "钢刀", "木棍", "英雄巾", "布鞋", "铁戒指", "簪子", "长鞭", "钓鱼竿", "鱼饵"],
            ["铁剑", "钢刀", "铁棍", "铁杖", "铁镐", "飞镖"],
            ["<hig>金创药</hig>", "<hig>引气丹</hig>", "<hig>养精丹</hig>"]
        ];
        let shop = [
            ["店小二", ["jh fam 0 start", "go north", "go north", "go east"]],
            ["杂货铺老板 杨永福", ["jh fam 0 start", "go east", "go south"]],
            ["铁匠铺老板 铁匠", ["jh fam 0 start", "go east", "go east", "go south"]],
            ["药铺老板 平一指", ["jh fam 0 start", "go east", "go east", "go north"]]
        ];
        for (let i = 0; i < list.length; i++) {
            for (let j = 0; j < list[i].length; j++) {
                if (itemName.includes(list[i][j])) {
                    console.log(shop[i][1]);
                    return shop[i][1];
                }
            }
        }
        return 0;
    };

    let commands = {
        "快捷": {
            "修炼": ["stopstate", "jh fam 0 start", "go west", "go west", "go north", "go enter", "go west", "xiulian"],
            "打坐": ["stopstate", "jh fam 0 start", "go west", "go west", "go north", "go enter", "go west", "dazuo"],
            "疗伤": ["stopstate", "jh fam 0 start", "go north", "go north", "go west", "liaoshang"],
            "挖矿": ["stopstate", "wakuang"],
            "当铺": ["stopstate", "jh fam 0 start", "go south", "go east", "sell"],
        },
        "小号": {
            "配偶送花": ["greet 99"],
            "师傅请安": ["greet master"],
        },
        "其他": {
            "退出副本": ["cr over"],
            "退出组队": ["team out"],
            "重置武道": ["lingwu reset"],
        },
        "实验性指令": {
            "自动师门": AutoSM,
            "小树林秒退 20 次": function() {
                let xiaoshuling20 = ["tasks"];
                for (let i = 0; i < 20; i++) { xiaoshuling20.push("cr yz/lw/shangu"); xiaoshuling20.push("cr over"); }
                xiaoshuling20.push("tasks");
                return xiaoshuling20;
            }(),
        }
    };


    function DeepCopy(object) {
        let result = {};
        for (const key in object) {
            result[key] = (typeof object[key] === "object") ? DeepCopy(object[key]) : object[key];
        }
        return result;
    }
    function TimeStr() {
        let date = new Date();
        let str = date.toString().substr(16, 5);
        return str;
    }
    function AutoScroll(name) {
        if (name) {
            let scrollTop = $(name)[0].scrollTop;
            let scrollHeight = $(name)[0].scrollHeight;
            let height = Math.ceil($(name).height());
            // console.log(`AutoScroll => scrollTop=${scrollTop} scrollHeight=${scrollHeight} height=${height}`);
            if (scrollTop < scrollHeight - height) {
                let add = (scrollHeight - height < 120) ? 1 : Math.ceil((scrollHeight - height) / 120);
                $(name)[0].scrollTop = scrollTop + add;
                setTimeout(function() {
                    AutoScroll(name);
                }, 1000/120);
            }
        }
    }

    function Money2Str(number) {
        if (number == 0 || isNaN(number)) return 0;
        let str = "" + number;
        let c = str.substring(str.length - 2, str.length);
        if (c && c!== "00") {
            c = c + "个<yel>铜板</yel>";
        } else c = "";
        let b = str.substring(str.length - 4, str.length - 2);
        if (b && b !== "00") {
            b = b + "两<wht>白银</wht>";
        } else b = "";
        let a = str.substring(0, str.length - 4);
        if (a) a = a + "两<hiy>黄金</hiy>";
        return "<hiw>" + a + b + c + "</hiw>";
    }
    function AddContent(element) {
        $(".content-message pre").append(element);
        AutoScroll(".content-message");
    }
    function SendCommand(command) {
        if (typeof command === "string") {
            wsmud.send(command);
        } else if (command instanceof Array) {
            let sum = 0, ms = 250;
            let wait = () => {return sum += ms};
            command.forEach(cmd => setTimeout(function() {
                wsmud.send(cmd);
            }, wait()));
        } else if (command instanceof Function) {
            SendCommand(command());
        }
    }

    function AddListener(type, fn) {
        wsmud.listener[type] = wsmud.listener[type] || [];
        wsmud.listener[type].push(fn);
    }


    AddListener("send", function(event, message) {
        if (!wsmud.isMoblie) {
            $(".console").append(`<div> >> ${message}</div>`);
            AutoScroll(".console");
        }
        console.log(message);
        return true;
    });

    AddListener("roles", function(event, message) {
        if (message.roles && message.roles instanceof Array) {
            message.roles.forEach(role => {
                let id = role.id;
                let name = role.name;
                wsmud.roles[id] = name;
            });
        }
        return true;
    });
    AddListener("login", function(event, message) {
        if (message.id) {
            wsmud.id = message.id;
            wsmud.title.name = wsmud.roles[wsmud.id];
            wsmud.title.state = "<已登录>";
            RefreshTitle();
        }
        return true;
    });

    AddListener("room", function(event, message) {
        if (message.name && message.path) {
            message.name = message.name.replace("(副本区域)", "");
            let array = message.name.match(/(.*)-(.*)/);
            wsmud.room.name = message.name;
            wsmud.room.map = array[1];
            wsmud.room.room = array[2];
            wsmud.room.path = message.path;
        }
        return true;
    });
    AddListener("room", function(event, message) {
        if (message.desc && (message.commands instanceof Array)) {
            let str = message.desc;
            if (/cmd/.test(str)) {
                str = str.replace("<hig>椅子</hig>", "椅子"); //新手教程「椅子」
                str = str.replace("<CMD cmd='look men'>门(men)<CMD>", "<cmd cmd='look men'>门</cmd>"); //兵营副本「门」
                str = str.replace(/span/g, "cmd"); // 古墓里的「画」和「古琴」使用了`<span>`标签
                str = str.replace(/\((.*)\)/g, "");
                let cmds = str.match(/<cmd cmd='([^']+)'>([^<]+)<\/cmd>/g);
                cmds.forEach(item => {
                    let x = item.match(/<cmd cmd='(.*)'>(.*)<\/cmd>/);
                    message.commands.unshift({cmd: x[1], name: x[2]});
                });
                str = str.replace(/<([^<]+)>/g, "");
            }
            message.desc = str.substr(0, 20) + "……";
            let cheat = DeepCopy(event);
            cheat.data = JSON.stringify(message);
            wsmud.fn_onmessage.apply(this, [cheat]);
            return false;
        }
        return true;
    });

    AddListener("exits", function(event, message) {
        if (message.items) {
            wsmud.exits = {};
            for (const key in message.items) {
                wsmud.exits[key] = message.items[key];
            }
        }
        return true;
    });

    AddListener("items", function(event, message) {
        if (message.items && message.items instanceof Array) {
            wsmud.items = [];
            message.items.forEach(item => {
                if (item === 0) {
                } else if (item.id && item.name && Object.entries(item).length === 2) {
                    if (/尸体/.test(item.name)) {
                        SendCommand("get all from " + item.id); //自动捡尸
                    } else {
                        SendCommand("get " + item.id); //自动拾取
                    }
                } else if (item.p !== 1) {
                    wsmud.items.push(item);
                }
            });
        }
        return true;
    });
    AddListener("items", function(event, message) {
        wsmud.items.forEach(item => {
            if (item.name === "当铺老板 唐楠") {
                SendCommand("sell all");
                SendCommand("list " + item.id);
            } else if (/店小二|杂货铺老板 杨永福|铁匠铺老板 铁匠|药铺老板 平一指/.test(item.name)) {
                SendCommand("list " + item.id);
            } else if (item.name === wsmud.settings.auto_sm_npc && wsmud.settings.auto_sm) {
                wsmud.auto_sm_cmd = "task sm " + item.id;
                SendCommand(wsmud.auto_sm_cmd);
            }
        });
        return true;
    });
    AddListener("list", function(event, message) {
        if (message.seller && message.selllist) {
            message.selllist.forEach(item => {
                if (item.name === wsmud.settings.auto_sm_item) {
                    SendCommand("buy 1 " + item.id + " from " + message.seller);
                    setTimeout(() => SendCommand(AutoSM), 3000);
                }
            });
        }
        return true;
    });

    AddListener("itemadd", function(event, message) {
        if (message.p !== 1) {
            wsmud.items.push(message);
        }
        return true;
    });
    AddListener("itemremove", function(event, message) {
        if (message.id) {
            let index = wsmud.items.findIndex(item => {
                return item.id === message.id;
            });
            if (index !== -1) wsmud.items.splice(index, 1); //remove
        }
        return true;
    });

    AddListener("state", function(event, message) {
        if (message.state) {
            let str = message.state.replace("你正在", "");
            wsmud.title.state = "<" + str + ">";
        } else {
            wsmud.title.state = "<闲逛中>";
        }
        RefreshTitle();

        if (message.desc instanceof Array && message.desc.length > 0) {
            message.desc = []; //清空状态文本
            let cheat = DeepCopy(event);
            cheat.data = JSON.stringify(message);
            wsmud.fn_onmessage.apply(this, [cheat]);
            return false;
        } else {
            return true;
        }
    });
    AddListener("combat", function(event, message) {
        if (message.start === 1) {
            wsmud.title.state = "<战斗中>";
        } else if (message.end === 1) {
            wsmud.title.state = "<闲逛中>";
        }
        RefreshTitle();
        return true;
    });

    AddListener("die", function(event, message) {
        if (!message.relive) {
            AddContent(`<hiw>若不点击原地复活，则 10 秒后自动武庙复活。</hiw>\n`);
            let timer = setTimeout(() => SendCommand("relive"), 10000);
            AddContent(
                $(`<div class="item-commands" timer="${timer}"><span cmd="relive locale">原地复活</span></div>`)
                .click(function() {
                    let timer = $(this).attr("timer");
                    clearTimeout(timer);
                })
            );
        }
        return true;
    });

    AddListener("text", function(event, message) {
        if (/重新连线|欢迎登陆/.test(message.text)) {
            AddContent(message.text + "\n");
            AddContent(wsmud.name + " " + wsmud.version + " 苏轻祝您游戏愉快！\n");
            if (wsmud.version.includes("test")) AddContent("<hiw>当前测试版，如有问题可回退版本。\n</hiw>");
            if (wsmud.login === undefined) {
                wsmud.login = true;
                let ms = 0, add = 500;
                let wait =  function() {return ms += add};
                setTimeout(() => $("[command=score]").click(), wait());
                setTimeout(() => $("[for=1]").click(), wait());
                setTimeout(() => $("[command=pack]").click(), wait());
                setTimeout(() => $("[command=skills]").click(), wait());
                setTimeout(() => $("[command=tasks]").click(), wait());
                setTimeout(() => $(".dialog-close").click(), wait());
                if (!unsafeWindow.WG) {
                    setTimeout(() => $("[command=showtool]").click(), wait());
                    setTimeout(() => $("[command=showcombat]").click(), wait());
                }
            }
            return false;
        }
        return true;
    });
    AddListener("text", function(event, message) {
        if (/你获得了(.*)点经验，(.*)点潜能/.test(message.text)) {
            AddContent(message.text + "\n");
            let array = message.text.match(/获得了(.*)点经验，(.*)点潜能/);
            wsmud.jy = wsmud.jy ? (wsmud.jy + parseInt(array[1])) : parseInt(array[1]);
            wsmud.qn = wsmud.qn ? (wsmud.qn + parseInt(array[2])) : parseInt(array[2]);
            $(".remove_jy_qn").remove();
            AddContent(`<span class="remove_jy_qn">合计 => 经验:${wsmud.jy} 潜能:${wsmud.qn}\n</span>`);
            return false;
        }
        return true;
    });
    AddListener("text", function(event, message) {
        if (/看起来(.*)想杀死你/.test(message.text)) {
            let array = message.text.match(/看起来(.*)想杀死你/);
            AddContent(`<hir>${array[1]} => 开始攻击你！<hir>\n`);
            return false;
        } else if (/你对著(.*)喝道/.test(message.text)) {
            let array = message.text.match(/你对著(.*)喝道/);
            AddContent(`<hir>你 => 开始攻击${array[1]}！<hir>\n`);
            return false;
        } else if (/你扑向(.*)/.test(message.text)) {
            let array = message.text.match(/你扑向(.*)！/);
            AddContent(`<hir>你 => 开始攻击${array[1]}！<hir>\n`);
            return false;
        }
        return true;
    });
    AddListener("text", function(event, message) {
        if (/造成(.*)点/.test(message.text)) {
            let x = message.text.split(/.*造成<wht>|.*造成<hir>|<\/wht>点|<\/hir>点/);
            if (x[2]) {
                let y = x[2].split(/伤害|\(|</);
                if (y[0] === "暴击") {
                    AddContent(`${y[2]}受到<hir>${x[1]}</hir>点<hir>暴击伤害</hir>！\n`);
                } else {
                    AddContent(`${y[2]}受到<hiw>${x[1]}</hiw>点伤害！\n`);
                }
                return false;
            }
        }
        return true;
    });
    AddListener("text", function(event, message) {
        if (/你的最大内力增加了/.test(message.text)) {
            AddContent(message.text + "\n");
            let a = message.text.match(/你的最大内力增加了(.*)点。/);
            let n = parseInt(a[1]), max = parseInt(funny.role.max_mp), limit = parseInt(funny.role.limit_mp);
            let time = (limit - max) / (n * 6);
            let timeString = time < 60 ? `${parseInt(time)}分钟` : `${parseInt(time / 60)}小时${parseInt(time % 60)}分钟`;
            $(".remove_dzsj").remove();
            AddContent(`<span class="remove_dzsj">当前内力: ${max}\n上限内力: ${limit}\n需要时间: ${timeString}\n</span>`);
        }
        return true;
    });
    AddListener("text", function(event, message) {
        if (/只留下一堆玄色石头/.test(message.text) && message.text.includes("你")) {
            let array = message.text.match(/只见(.*)发出一阵白光/);
            AddContent(`你分解了 => ${array[1]}\n`);
            return false;
        }
        return true;
    });
    AddListener("text", function(event, message) {
        if (/你轻声吟道/.test(message.text)) {
            return false;
        } else if (/你的(.*)等级提升了！/.test(message.text)) {
            return false;
        }
        return true;
    });
    AddListener("text", function(event, message) {
        if (/最近师门物资紧缺|为师最近练功到了瓶颈|最近师门扩招了|你去帮我找/.test(message.text)) {
            SendCommand(wsmud.auto_sm_cmd);
        } else if (/你要是找不到/.test(message.text)) {
            let x = message.text.match(/我要的是(.*)，你要是找不到就换别的吧。/);
            wsmud.settings.auto_sm_item = x[1];
            console.log(x[1]);
        } else if (/不错，孺子可教！/.test(message.text)) {
            wsmud.settings.auto_sm_item = "师门完成";
            setTimeout(() => SendCommand(AutoSM), 2000);
        } else if (/辛苦了， 你先去休息一下吧/.test(message.text)) {
            wsmud.settings.auto_sm = false;
            SendCommand("tasks");
        }
        return true;
    });
    // {type: "cmds",
    // items: [{cmd: "cr cd/wudu/damen", name: "进入副本"},
    // {cmd: "cr cd/wudu/damen 0 1", name: "扫荡一次"},
    // {cmd: "cr cd/wudu/damen 0 10", name: "扫荡十次"}]}
    AddListener("cmds", function(event, message) {
        if (message.items) {
            message.items.forEach(item => {
                if (item.name.includes(wsmud.settings.auto_sm_item)) {
                    SendCommand(item.cmd);
                    return true;
                }
            });
            let cmd = AutoBuy(wsmud.settings.auto_sm_item);
            SendCommand(cmd);
        }
        return true;
    });
    // AddListener("text", function(event, message) {
    //     } else  else if (/无数花瓣夹杂着寒气/.test(text)) {
    //         let x = text.match(/无数花瓣夹杂着寒气将(.*)围起/);
    //         AddContent(`<him>太上忘情 => ${x[1]}</him>\n`);
    // });


    AddListener("msg", function(event, message) {
        if (wsmud.isMoblie) {
            return true;
        } else {
            let uid = message.uid;
            let content = message.content;
            let name = message.name ? message.name + "：" : "";
            let timeStr = wsmud.settings.needTimeStr ? "<hiw>" + TimeStr() + "</hiw>" : "";
            let look3 = function() {
                SendCommand("look3 " + $(this).attr("uid"));
            };
            if (message.ch === "chat") {
                let levels = ["<hic>闲聊</hic>", "<hic>闲聊</hic>", "<hic>闲聊</hic>", "<hiy>宗师</hiy>", "<hiz>武圣</hiz>", "<hio>武帝</hio>", "<hir>武神</hir>"];
                $(".chat").append($(`<hic uid="${uid}">【${levels[message.lv]}】${name}${content} ${timeStr}<br></hic>`).click(look3));
            } else if (message.ch === "fam") {
                $(".fam").append($(`<hiy uid="${uid}">【${message.fam}】${name}${content} ${timeStr}<br></hiy>`).click(look3));
            } else if (message.ch === "pty") {
                $(".pty").append($(`<hiz uid="${uid}">【帮派】${name}${content} ${timeStr}<br></hiz>`).click(look3));
            } else if (message.ch === "tm") {
                $(".tm").append(`<hig>【队伍】${name}${content} ${timeStr}<br></hig>`);
            } else if (message.ch === "es") {
                $(".es").append(`<hio>【${message.server}】${name}${content} ${timeStr}<br></hio>`);
            }
            AutoScroll("." + message.ch);
            setTimeout(() => $(".channel pre").html(""), 1000);
            return true;
        }
    });

    AddListener("msg", function(event, message) {
        if (wsmud.isMoblie) {
            return true;
        } else {
            if (message.ch === "rumor") {
                let content = message.content;
                if (/闭关修炼/.test(content)) {
                    let x = content.match(/武帝(.*)闭关修炼似有所悟，你随之受益获得了(.*)经验，(.*)潜能/);
                    $(".rumor").append("<him>【谣言】武帝<hio>" + x[1] + "</hio>出关奖励<hio>" + x[2] + "</hio>点。</him><br>");
                } else if (/战胜了/.test(content)) {
                    let x = content.match(/听说(.*)战胜了(.*)获得了(.*)称号！/);
                    $(".rumor").append("<him>【谣言】" + x[1] + "获得了" + x[3] + "称号！</him><br>");
                } else if (/郭大侠收到线报/.test(content)) {
                    $(".rumor").append("<him>【谣言】蒙古大军将会进攻襄阳！<wht>" + TimeStr() + "</wht></him><br>");
                } else if (/出现在/.test(content)) {
                    let x = content.match(/听说(.*)出现在(.*)-(.*)一带。/);
                    x[1] = "<hio>" + x[1] + "</hio>";
                    $(".rumor").append("<him>【谣言】" + x[1] + "出现在" + x[2] + x[3] + "！<wht>" + TimeStr() + "</wht></him><br>");
                } else {
                    $(".rumor").append("<him>【谣言】" + content + "</him><br>");
                }
                AutoScroll(".rumor");
            }
            $(".channel pre").html("");
            return true;
        }
    });
    AddListener("msg", function(event, message) {
        if (wsmud.isMoblie) {
            return true;
        } else {
            if (message.ch === "sys") {
                let content = message.content;
                if (/欢迎登录|非法收益/.test(content)) return true;
                else if (/挖矿技巧/.test(content)) content = content.match(/(.*)捡到一本挖矿指南/)[1] + "使用了挖矿指南！";
                else if (/，望各路英雄鼎力相助/.test(content)) content = content.replace("，望各路英雄鼎力相助", "");
                else if (/蒙古大军挥军南下/.test(content)) content = content.replace("蒙古大军挥军南下，", "");
                else if (/蒙古大汗蒙哥出现在战场中央/.test(content)) content = "蒙古大汗蒙哥出现在战场中央！";
                else if (/蒙古可汗蒙哥被击杀于襄阳城下/.test(content)) content = content.replace("蒙古可汗蒙哥被击杀于襄阳城下，", "");
                $(".sys").append("<hir>【系统】" + content + "<wht> " + TimeStr() + "</wht></hir><br>");
                AutoScroll(".sys");
            }
            $(".channel pre").html("");
            return true;
        }
    });

    AddListener("tasks", function(event, message) {
        if (message.items) {
            let fb, qa, wd1, wd2, wd3, sm1, sm2, ym1, ym2, yb1, yb2;
            message.items.forEach(task => {
                if (task.state === 2) SendCommand("taskover " + task.id); //自动完成
                if (task.id === "signin") {
                    let a = task.desc.match(/师门任务：(.*)，副本：<(.*)>(.*)\/20<(.*)>/);
                    let b = task.desc.match(/(.*)武道塔(.*)，进度(.*)\/(.*)<(.*)>，<(.*)>(.*)首席请安。<(.*)>/);
                    (parseInt(a[3]) < 20) ? fb = `<hig>${a[3]}</hig>` : fb = a[3];
                    (parseInt(b[3]) < parseInt(b[4])) ? wd1 = `<hig>${b[3]}</hig>` : wd1 = b[3];
                    wd2 = b[4];
                    /可以重置/.test(b[2]) ? wd3 = "<hig>可以重置</hig>" : wd3 = "已经重置";
                    /已经/.test(b[7]) ? qa = "已经请安" : qa = "<hig>尚未请安</hig>";
                } else if (task.id === "sm") {
                    let a = task.desc.match(/目前完成(.*)\/20个，共连续完成(.*)个。/);
                    (parseInt(a[1]) < 20) ? sm1 = `<hig>${a[1]}</hig>` : sm1 = a[1];
                    sm2 = a[2];
                } else if (task.id === "yamen") {
                    let a = task.desc.match(/目前完成(.*)\/20个，共连续完成(.*)个。/);
                    (parseInt(a[1]) < 20) ? ym1 = `<hig>${a[1]}</hig>` : ym1 = a[1];
                    ym2 = a[2];
                } else if (task.id === "yunbiao") {
                    let a = task.desc.match(/本周完成(.*)\/20个，共连续完成(.*)个。/);
                    (parseInt(a[1]) < 20) ? yb1 = `<hig>${a[1]}</hig>` : yb1 = a[1];
                    yb2 = a[2];
                }
            });
            let html = `门派请安 => ${qa}\n武道之塔 => ${wd1}/${wd2} ${wd3}\n`;
            html += `日常副本 => ${fb}/20\n师门任务 => ${sm1}/20 ${sm2}连\n`;
            html += `衙门追捕 => ${ym1}/20 ${ym2}连\n每周运镖 => ${yb1}/20 ${yb2}连\n`;
            $(".remove_task").remove();
            AddContent(`<span class="remove_task">${html}<span>`);
        }
        return true;
    });

    AddListener("score", function(event, message) {
        for (const key in message) wsmud.role[key] = message[key];
        wsmud.role.name = wsmud.title.name;
        RefreshRole();
        return true;
    });

    AddListener("pack", function(event, message) {
        if (message.money) wsmud.pack.money = Money2Str(message.money);
        if (message.max_item_count) wsmud.pack.max = message.max_item_count;
        if (message.eqs) wsmud.pack.eqs = message.eqs;
        if (message.items) {
            wsmud.pack.items = message.items;
            wsmud.pack.items.forEach(item => {
                if (/养精丹|小箱子|朱果|潜灵果|背包扩充石|师门补给包/.test(item.name)) {
                    let cmd = [];
                    let count = item.count;
                    let zl = "use";
                    if (/<hig>养精丹<\/hig>/.test(item.name)) count = count > 10 ? 10 : count;
                    if (/小箱子|师门补给包/.test(item.name)) zl = "open";

                    for (let i = 0; i < count; i++) cmd.push(zl + " " + item.id);
                    AddContent(
                        $(`<div class="item-commands"></div>`).append(
                            $(`<span>快捷 ${zl} ${count} 次 => ${item.name}</span>`).click(() => SendCommand(cmd))
                        )
                    );
                }
            });
        }
        return true;
    });
    AddListener("pack", function(event, message) {
        if (/养精丹|朱果|潜灵果|背包扩充石/.test(message.name)) {
            let cmd = [];
            let count = message.count;
            let zl = "use";
            if (/<hig>养精丹<\/hig>/.test(message.name)) count = count > 10 ? 10 : count;
            for (let i = 0; i < count; i++) cmd.push(zl + " " + message.id);
            AddContent(
                $(`<div class="item-commands"></div>`).append(
                    $(`<span>快捷 ${zl} ${count} 次 => ${message.name}</span>`).click(() => SendCommand(cmd))
                )
            );
        }
        return true;
    });
    AddListener("pack", function(event, message) {
        if (!funny.isMoblie) {
            if (message.name) {
                let name = message.name;
                if (name.includes("wht")) return true;

                let pick = wsmud.pack.pick;
                let count = message.count;
                if (pick[name]) {
                    if (pick[name].count < count) {
                        pick[name].add += (count - pick[name].count);
                        pick[name].count = count;
                    } else {
                        pick[name].count += count;
                        pick[name].add += count;
                    }
                } else {
                    let array = wsmud.pack.items;
                    let sum = 0;
                    for (let i = 0; i < array.length; i++) {
                        let item = array[i];
                        if (item.name === name) {
                            sum += item.count;
                        }
                    }
                    if (sum < count) {
                        pick[name] = {count: count, add: count - sum};
                    } else {
                        pick[name] = {count: sum + count, add: count};
                    }
                }

                let nameStr = message.name.replace(/<|>|\//g, "");
                let remove = "remove_pick_" + nameStr;
                let html = `${message.name} => 累计获得${pick[name].add}${message.unit} => 共有${pick[name].count}${message.unit}`;
                $("." + remove).remove();
                $(".channel-pick").append(`<span class="${remove}">${html}<br></span>`);
                AutoScroll(".channel-pick");
            }
        }
        return true;
    });
    AddListener("pack", function(event, message) {
        if (typeof message.eq === "number") {
            let index = message.eq;
            let itemIndex = wsmud.pack.items.findIndex(item => {
                return item.id === message.id;
            });
            let eq = DeepCopy(wsmud.pack.items[itemIndex]);
            wsmud.pack.eqs[index] = eq;
            wsmud.pack.items.splice(itemIndex, 1);
        }
        if (typeof message.uneq === "number") {
            let index = message.uneq;
            let item = DeepCopy(wsmud.pack.eqs[index]);
            item.count = 1;
            wsmud.pack.items.push(item);
            wsmud.pack.eqs[index] = null;
        }
        RefreshPack();
        RefreshEq();
        return true;
    });

//     count: 59
// dialog: "pack"
// id: "1uuw35b19ac"
// money: 807271003
// name: "<hio>武道</hio>"
// type: "dialog"
// unit: "本"
// value: 1000000

// {type: "dialog", dialog: "pack", id: "f1gv3f46fa9", remove: 40, money: 807271003}

    // {type: "dialog", dialog: "pack", id: "c7mj3f552d3", eq: 3}

    AddListener("skills", function(event, message) {
        if (message.limit) wsmud.role.skill_limit = parseInt(message.limit);
        if (message.items) {
            message.items.forEach(item => {
                wsmud.skills[item.id] = item;
                let color = ["wht", "hig", "hic", "hiy", "hiz", "hio", "hir"];
                for (let i = 0; i < color.length; i++) {
                    if (item.name.includes(color[i])) {
                        wsmud.skills[item.id].color = i + 1;
                        break; // => 白1 .. 橙6 红7
                    }
                }
            });
        }
        return true;
    });
    AddListener("skills", function(event, message) {
        if (message.id && message.exp && wsmud.skills) {
            let skill = wsmud.skills[message.id];
            if (skill) {
                if (message.level) {
                    skill.level = message.level;
                    AddContent(`<hig>您的技能${skill.name}等级提升到<hiw>${skill.level}</hiw>级！</hig>\n`);
                }
                let limit = wsmud.role.skill_limit,
                study_per = parseInt(wsmud.role.study_per),
               lianxi_per = parseInt(wsmud.role.lianxi_per),
                      int = parseInt(wsmud.role.int),
                  int_add = parseInt(wsmud.role.int_add),
                    level = parseInt(skill.level),
                        k = skill.color * 2.5; // k 系数 => 白2.5/../橙15/红17.5

                let qn = (limit * limit - level * level) * k;
                if (wsmud.title.state.includes("练习技能")) {
                    let time = qn / (int + int_add) / (1 + lianxi_per / 100 - int / 100) / (60 / 5);
                    let timeStr = time < 60 ? `${parseInt(time)}分钟` : `${parseInt(time / 60)}小时${parseInt(time % 60)}分钟`;
                    //练习每一跳的消耗公式＝（先天悟性＋后天悟性）×（1＋练习效率%－先天悟性%）
                    let cost = parseInt(qn / time / 12);
                    wsmud.role.lianxi_cost = cost;
                    AddContent(`练习${skill.name}消耗了${cost}点潜能。\n`);
                    $(".remove_lxsj").remove();
                    AddContent(`<span class="remove_lxsj">角色悟性: ${int}＋${int_add}\n练习效率: ${lianxi_per}%\n等级上限: ${limit}级\n需要潜能: ${qn}\n需要时间: ${timeStr}\n</span>`);
                } else if (wsmud.title.state.includes("学习")) {
                    //学习每一跳的消耗公式＝（先天悟性＋后天悟性）×（1＋学习效率%－先天悟性%）×3
                    let cost = parseInt((int + int_add) * (1 + study_per / 100 - int / 100) * 3);
                    wsmud.role.study_cost = cost;
                    AddContent(`学习${skill.name}消耗了${parseInt(cost)}点潜能。\n`);
                }
            }
        }
        return true;
    });
    AddListener("skills", function(event, message) {
        if (message.enable && message.id) {//装备上一个技能
            wsmud.skills[message.id].enable_skill = message.enable;
        }
        if (message.item) {//新学会技能
            let id = message.item.id;
            wsmud.skills[id] = message.item;
        }
        RefreshSkill();
        return true;
    });


    AddListener("", function(event, message) {
        return true;
    });
    AddListener("", function(event, message) {
        return true;
    });


    function RefreshRole() {
        for (const key in funny.role) {
            $(".role_" + key).html(wsmud.role[key]);
        }
    }
    function RefreshSkill() {
        $(".left-skill-list").html(""); //Clear
        let base = ["unarmed", "force", "parry", "dodge", "sword", "blade", "club", "staff", "whip", "throwing", "literate", "lianyao"];
        let skills = wsmud.skills;
        base.forEach(id => {
            if (skills[id]) {
                let name = skills[id].name, level = skills[id].level, exp = skills[id].exp, enable = "";
                if (skills[id].enable_skill) enable = " 已装备：" +skills[skills[id].enable_skill].name;
                $(".left-skill-list").append(`<div class="skill-line">
                    <span class="skill-line-name">${name}${enable}</span>
                    <span class="skill-line-level">${id} ${level}级</span>
                <div>`);
            }
        });

        let skillArray = [];
        for (const id in skills) if (!base.includes(id)) skillArray.push(skills[id]);
        skillArray.sort((a, b) => {
            if (b.level === a.level) return b.color - a.color;
            else return b.level - a.level;
        });

        skillArray.forEach(skill => {
            let enables = skill.can_enables;
            let str = "enable";
            enables.forEach(enable => str = str + "," + enable);

            $(".left-skill-list").append(
                $(`<div class="skill-line" enable="${str}">
                <span class="skill-line-name">${skill.name}</span><span class="skill-line-level">${skill.id} ${skill.level}级</span>
                <div>`).click(function() {
                    let enables = $(this).attr("enable");
                    let x = enables.split(",");
                    x.splice(0, 1);
                    $(this).after(`<div class="item-commands enable_${skill.id}"></div>`);
                    $(this).removeAttr("enable");
                    setTimeout(() => {
                        $(`.enable_${skill.id}`).remove();
                        $(this).attr("enable", enables);
                    }, 5000);

                    x.forEach(enable => {
                        $(`.enable_${skill.id}`).append(
                            $(`<span>装备${wsmud.skills[enable].name}</span>`)
                            .click(() => SendCommand("enable " + enable + " " + skill.id))
                        );
                    });
                    $(`.enable_${skill.id}`).append(
                        $(`<span>练习</span>`).click(() => SendCommand("lianxi " + skill.id))
                    );
                })
            );
        });
        RefreshEq();
    }
    function RefreshPack() {
        // $(".left-pack-list");
        let itemArray = wsmud.pack.items;
        $(".left-pack-list").html("");
        itemArray.forEach(item => {
            let id = item.id;
            let name = item.name;
            let unit = item.unit;
            let count = item.count;
            let value = Money2Str(item.value);
            if (value === 0) value = "<small>不可出售</small>";
            else value = `<small>每${unit}价值${value}</small>`;

            $(".left-pack-list").append(
                $(`<div class="pack-line">
                <span class="pack-line-name">${name}</span>
                <span class="pack-line-count">${value} 共${count}${unit}</span>
                </div>`)
            );
        });
    }
    function RefreshEq() {
        let eqArray = wsmud.pack.eqs;
        let nameArray = ["武器", "衣服", "鞋子", "头饰", "披风", "戒指", "项链", "饰品", "护腕", "腰带", "暗器"];
        $(".left-eq-list").html("");
        for (let i = 0; i < nameArray.length; i++) {
            let html = nameArray[i] + "：";
            if (eqArray[i] && eqArray[i].name) {
                html += eqArray[i].name;
            }
            $(".left-eq-list").append(
                $(`<div class="eq-line">${html}</div>`)
            );
        }
    }


    $(document).ready(function() {
        GM_addStyle(`.content-bottom {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }`);
        if (wsmud.isMoblie) return;
        $(".signinfo").addClass("hide");
        $(".room_items")[0].style.maxHeight = "240px";
        $(".state-bar")[0].style.overflow = "hidden";
        $(".combat-commands")[0].style.overflow = "hidden";
        $(".dialog-content")[0].style.overflowX = "hidden";
        GM_addStyle(`
        .channel{ display: none; }
        .room-item > .item-name { margin-left: 14px; }

        body { width: 100%; display: flex; flex-flow: row nowrap; }
        .left { order: -1; }
        .right { order: 1; }
        .left, .right { width: 370px; height: 100%; display: flex; flex: 0 0 auto; margin: 0 10px 0 10px; flex-flow: column nowrap; }
        .container, .login-content { width: 450px; flex: 1 0 auto; margin: 0; }

        .left-nav { flex: 0 0 auto; text-align: center; }

        .left-role { flex: 0 0 auto; }

        .left-skill { flex: 1 0 auto; height: auto; display: flex; flex-flow: column nowrap; }
            .left-skill-list { height: 480px; flex: 1 1 auto; line-height: 24px; padding: 10px 5px 0 5px; overflow: auto; border: gray solid 1px; }
                .skill-line { display: flex; padding: 2px 0 2px 0; border-top: #343434 solid 1px; }
                .skill-line-name { flex: 1 0 auto; }
                .skill-line-level { flex: 0 0 auto; }
            .left-eq { height: 245px; flex: 0 0 auto; display: flex; flex-flow: row nowrap; margin: 10px 0 10px 0; }
                .left-eq-list { width: 250px; flex: 0 0 auto; border: gray solid 1px; }
                .left-eq-change { width: 100px; flex: 1 1 auto; border: gray solid 1px; display: flex; flex-flow: column nowrap; margin-left: 10px; }
                .left-eq-change div { flex: 1 1 auto; text-align: center; padding-left: 5px; }
        .left-pack { flex: 1 0 auto; height: 500px; overflow: auto; }
            .left-skill-list { height: 480px; flex: 1 1 auto; line-height: 24px; padding: 10px 5px 0 5px; overflow: auto; }
                .pack-line { display: flex; padding: 2px 0 2px 0; border-top: #343434 solid 1px; }
                .pack-line-name { flex: 1 0 auto; }
                .pack-line-count { flex: 0 0 auto; }

        .left-hotkey { flex: 1 0 auto; height: 500px; display: flex; flex-flow: column nowrap; }
            .list-commands { flex: 0 1 auto; height: 1000px; border: gray solid 1px; padding-left: 5px; }
            .left-console { flex: 0 0 auto; height: 240px; overflow: auto; border: gray solid 1px; }
            .left-send { flex: 0 0 auto; height: auto; display: flex; }
            .left-send input { flex:1 0 auto; height: auto; background-color: gray; color: white; font-size: 16px; margin: 5px 10px 0 0; }

        .left-setting { }

        .left table { table-layout: fixed; border-collapse: collapse; margin: 0; }
        .left td { width: 88px; text-align: center; white-space: nowrap; border: #343434 solid 1px; }

        .msg { height: auto; overflow: auto; flex: 0 0 auto; font-size: 14px; line-height: 16px; max-height: 160px; }
        .chat { flex: 1 1 auto; max-height: 100%; }
        `);

        $("body").append(`<div class="left">
            <div class="left-nav item-commands"></div>
            <div class="left-role left-hide"></div>
            <div class="left-skill left-hide"></div>
            <div class="left-pack left-hide"></div>
            <div class="left-hotkey left-hide"></div>
            <div class="left-setting left-hide"></div>
        </div>`);
        $("body").append(`<div class="right">
            <div class="msg chat"></div>
            <div class="msg tm"></div>
            <div class="msg fam"></div>
            <div class="msg pty"></div>
            <div class="msg es"></div>
            <div class="msg sys rumor"></div>
            <div class="msg channel-pick"></div>
        </div>`);


        $(".left-role").append(`<table>
            <tr><td colspan="4" class="role_name">ROLE_NAME</td></tr>
            <tr><td>ID</td><td colspan="3" class="role_id"></td></tr>
            <tr><td>性别</td><td class="role_gender"></td><td>境界</td><td class="role_level"></td></tr>
            <tr><td>年龄</td><td colspan="3" class="role_age"></td></tr>
            <tr><td>经验</td><td colspan="3"><hig class="role_exp"></hig></td></tr>
            <tr><td>潜能</td><td colspan="3"><hig class="role_pot"></hig></td></tr>
            <tr><td>气血</td><td colspan="3"><span class="role_hp"></span>/<hic class="role_max_hp"></hic></td></tr>
            <tr><td>内力</td><td colspan="3"><span class="role_mp"></span>/<hic class="role_max_mp"></hic></td></tr>
            <tr><td>内力上限</td><td colspan="3"><hic class="role_limit_mp"></hic></td></tr>
            <tr>
                <td>臂力</td><td><hiy class="role_str"></hiy>＋<span class="role_str_add"></span></td>
                <td>根骨</td><td><hiy class="role_con"></hiy>＋<span class="role_con_add"></span></td>
            </tr>
            <tr>
                <td>身法</td><td><hiy class="role_dex"></hiy>＋<span class="role_dex_add"></span></td>
                <td>悟性</td><td><hiy class="role_int"></hiy>＋<span class="role_int_add"></span></td>
            </tr>
            <tr><td>攻击</td><td><hig class="role_gj"></hig></td><td>终伤</td><td><hig class="role_add_sh"></hig></td></tr>
            <tr><td>防御</td><td><hig class="role_fy"></hig></td><td>命中</td><td><hig class="role_mz"></hig></td></tr>
            <tr><td>招架</td><td><hig class="role_zj"></hig></td><td>躲闪</td><td><hig class="role_ds"></hig></td></tr>
            <tr><td>暴击</td><td><hig class="role_bj"></hig></td><td>攻速</td><td><hig class="role_gjsd"></hig></td></tr>
            <tr><td>门派</td><td><hic class="role_family"></hic></td><td>功绩</td><td><hic class="role_gongji"></hic></td></tr>
            <tr><td>忽视防御</td><td class="role_diff_fy"></td><td>伤害减免</td><td class="role_diff_sh"></td></tr>
            <tr><td>暴击伤害</td><td class="role_add_bj"></td><td>暴击抵抗</td><td class="role_diff_bj"></td></tr>
            <tr><td>增加忙乱</td><td class="role_busy"></td><td>忽视忙乱</td><td class="role_diff_busy"></td></tr>
            <tr><td>释放速度</td><td class="role_releasetime"></td><td>冷却速度</td><td class="role_distime"></td></tr>
            <tr><td>打坐效率</td><td class="role_dazuo_per"></td><td>内力减耗</td><td class="role_expend_mp"></td></tr>
            <tr><td>练习效率</td><td class="role_lianxi_per"></td><td>学习效率</td><td class="role_study_per"></td></tr>
            <tr><td>银两</td><td colspan="3" class="role_money"></td></tr>
        </table>`);
        $(".left-skill").append(`
        <div class="left-skill-list"></div>
        <div class="left-eq">
            <div class="left-eq-list"></div>
            <div class="left-eq-change">
                <div class="item-commands"><span class="save_eq" i="1">存配置壹</span><span class="load_eq" i="1">换配置壹</span></div>
                <div class="item-commands"><span class="save_eq" i="2">存配置贰</span><span class="load_eq" i="2">换配置贰</span></div>
                <div class="item-commands"><span class="save_eq" i="3">存配置叁</span><span class="load_eq" i="3">换配置叁</span></div>
            </div>
        </div>`);//技能
        $(".save_eq").click(function() {
            let i = $(this).attr("i");
            let key = wsmud.id + ".eq." + i;
            let cmd = [];
            let str = "<hir>以下配置被保存！</hio>\n";
            // wsmud.skills
            let base = ["unarmed", "force", "parry", "dodge", "sword", "blade", "club", "staff", "whip", "throwing"];
            let skills = wsmud.skills;
            base.forEach(id => {
                if (skills[id]) {
                    if (skills[id].enable_skill) {
                        cmd.push("enable " + id + " " + skills[id].enable_skill);
                        str += skills[skills[id].enable_skill].name + "\n";
                    }
                }
            });
            wsmud.pack.eqs.forEach(eq => {
                if (eq && eq.id) {
                    cmd.unshift("eq " + eq.id);
                    str += eq.name + "\n";
                }
            });
            AddContent(str);
            let value = JSON.stringify(cmd);
            localStorage.setItem(key, value);
        });
        $(".load_eq").click(function() {
            let i = $(this).attr("i");
            let key = wsmud.id + ".eq." + i;
            let value = localStorage.getItem(key);
            let cmd = JSON.parse(value);
            AddContent("<hir>即将加载配置……</hio>\n");
            SendCommand(cmd);
        });

        $(".left-pack").append(`<div class="left-pack-list"></div>`);//背包


        // $(`<div class="msg "></div>`).append(
        //     $(`<small>扬州城</small>`), $(`<br>`),
        //     $(``).click(() => SendCommand(commands["修炼"])),
        // )
        $(".left-hotkey").append(`
        <div class="list-commands"></div>
        <div class="left-console console"></div>
        <div class="left-send item-commands"></div>
        `);//指令


        for (const name in commands) {
            $(".list-commands").append(`<div class="item-commands ${name}"><small>${name}</small><br></div>`);
            for (const key in commands[name]) {
                $(`.${name}`).append(
                    $(`<span>${key}</span>`).click(() => SendCommand(commands[name][key]))
                );
            }
        }

        $(".left-send").append(
            $(`<input type="text" readonly onfocus="this.removeAttribute('readonly');" id="send_command">`)
            .keypress(function(key) {
                if (key.which == 13) $("#send_btn").click();
            }),
            $(`<span id="send_btn">发送</span>`).click(function() {
                let command = $("#send_command").val();
                if (command) {
                    $(".console").append(
                        $(`<div class="item-commands"> >> <span><hiy>${command}</hiy></span></div>`)
                        .click(() => SendCommand(command))
                    );
                    wsmud.webSocket.send(command);
                    AutoScroll(".console");
                    $("#send_command").val("");
                }
            })
        );
        $(".left-setting").append(
            $(`<div class="item-commands"></div>`).append(
                $(`<small>频道消息清屏</small>`), $(`<br>`),
                $(`<span>世界</span>`).click(() => $(".chat").html("")),
                $(`<span>队伍</span>`).click(() => $(".tm").html("")),
                $(`<span>门派</span>`).click(() => $(".fam").html("")),
                $(`<span>全区</span>`).click(() => $(".es").html("")), $(`<br>`),
                $(`<span>帮派</span>`).click(() => $(".pty").html("")),
                $(`<span>系统</span>`).click(() => $(".sys").html("")),
                $(`<span>统计</span>`).click(() => $(".channel-pack").html("")),
                $(`<span>游戏</span>`).click(() => $(".content-message pre").html("")),
                $(`<br>`), $(`<small>左右边栏操作</small>`), $(`<br>`),
                $(`<span>左右交换</span>`).click(function() {
                    if (wsmud.layout_left_right) {
                        $(".left")[0].style.order = "1";
                        $(".right")[0].style.order = "-1";
                    } else {
                        $(".left")[0].style.order = "-1";
                        $(".right")[0].style.order = "1";
                    }
                    wsmud.layout_left_right = !wsmud.layout_left_right;
                }),
                $(`<span>隐藏功能栏</span>`).click(function() {
                    $(".left").hide();
                    $(".right").append(
                        $(`<div class="msg item-commands killleft"><span>恢复功能边栏</span></div>`).click(function() {
                            $(this).remove();
                            $(".left").show();
                        }),
                    );
                    $("[command=showtool]").click(function() {
                        $(".left").show();
                        $(".killleft").remove();
                    });
                }),
                $(`<span>隐藏聊天栏</span>`).click(function() {
                    let html = $(this).html();
                    if (html.includes("隐藏")) {
                        $(".right").hide();
                        $(this).html("恢复聊天边栏");
                    } else {
                        $(".right").show();
                        $(this).html("隐藏聊天边栏");
                    }
                }),
            ),
        );

        $(".left-nav").append(
            $(`<span show="left-role">角色</span>`).click(LeftShow).click(RefreshRole),
            $(`<span show="left-skill">技能</span>`).click(LeftShow).click(RefreshSkill),
            $(`<span show="left-pack">背包</span>`).click(LeftShow).click(RefreshPack),
            $(`<span show="left-hotkey">指令</span>`).click(LeftShow).click(() => AutoScroll(".console")).click(),
            $(`<span show="left-setting">设置</span>`).click(LeftShow),
        );
        function LeftShow() {
            $(".left-hide").hide();
            $("." + $(this).attr("show")).show();
        }
    });

    function Str2Obj(str) {
        if (str[0] === "{") {
            return (new Function("return " + str))();
        } else {
            return {"type": "text", "text": str};
        }
    }

    unsafeWindow.funny = wsmud;
    unsafeWindow.funny.SendCommand = SendCommand;
    unsafeWindow.funny.DeepCopy = DeepCopy;
})();

