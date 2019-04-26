// ==UserScript==
// @name        wsmud_funny_3.0
// @namespace   suqing.fun
// @version     0.3.0
// @author      sq
// @match       http://*.wsmud.com/*
// @homepage    https://greasyfork.org/zh-CN/scripts/380709
// @description 武神传说脚本，内置了许多小功能。
// @run-at      document-start
// @require     http://code.jquery.com/jquery-3.3.1.min.js
// @grant       unsafeWindow
// @grant       GM_addStyle
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_getValue
// @grant       GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';
    let funny = {};
    let data = {
        dirs: ["west", "north", "south", "east", "northwest", "southwest", "northeast", "southeast", "down", "up", "westdown", "northdown", "southdown", "eastdown", "westup", "northup", "southup", "eastup", "enter", "out"],
        temp: {
            login: 1,
            jy: 0,
            qn: 0,
            pickup: {},
        },
        commands: {
            "扬州主城": {
                "豪宅练功房": ["jh fam 0 start", "go west", "go west", "go north", "go enter", "go west"],

            },
            "小号常用": {
                "送配偶玫瑰花": ["greet 99"],
                "请安玩家师傅": ["greet master"],
                "襄阳领取低保": [""],
            },
        }
    };
    let id = "ROLE_ID";
    let fn = {
        SetTitle: function() {
            $("head title").html(data[id].name + "<" + data[id].state + ">");
        },
        AddContent: function(html) {
            $(".content-message pre").append(html);
        },
        AutoScroll: function(name) {
            if (name === undefined) return;
            let a = $(name)[0].scrollTop,
                b = $(name)[0].scrollHeight,
                h = Math.ceil($(name).height()); //向上取整
            // console.log(`fn.scroll => a=${a} b=${b} h=${h}`);
            if (a < b - h) {
                let add = (b - h < 120) ? 1 : Math.ceil((b - h) / 120);
                $(name)[0].scrollTop = a + add;
                setTimeout(`AutoScroll("${name}")`, 1000/120);
            }
        },
        SendCommand: async function(command) {
            if (typeof command === "string") {
                funny.listener.webSocket.send(command);
            } else if (command instanceof Array) {
                command.forEach(cmd => {
                    await (new Promise(resolve => setTimeout(resolve, 250)));
                    funny.listener.webSocket.send(cmd);
                });
            }
        },
        Str2Obj: function (s) {
            if (s[0] == "{") {
                return (new Function("return " + s))();
            } else {
                return {"type": "txt", "txt": s};
            }
        },
        DeepCopy: function (object) {
            let result = {};
            for (const key in object) {
                result[key] = typeof object[key] === "object" ? fn.DeepCopy(object[key]) : object[key];
            }
            return result;
        },
        Time2String: function() {
            let date = new Date();
            let string = date.toString().substr(16, 5);
            return string;
        },
    };
    let listener = {
        webSocket: null,
        fn_onclose: null,
        fn_onmessage: null,
        onclose: function() {
            data[id].state = "已掉线";
            fn.SetTitle();
            listener.fn_onclose.apply(this, arguments);
        },
        send: function(command) {
            listener.webSocket.send(command);
            listener.monitor["send"].forEach(fn => fn(command));
        },
        onmessage: function(event) {
            let message = fn.Str2Obj(event.data);
            let key = message.type || "error";
            if (key === "dialog") key = message.dialog || "error";

            let monitors = listener.monitor[key];
            if (monitors instanceof Array && monitors.length > 0) {
                monitors.forEach(fn => fn(event, message));
            } else {
                console.log(key);
                listener.fn_onmessage.apply(this, arguments);
            }
        },
        monitor: {
            "send": [],
        },
        addMonitor: function(key, fn) {
            listener.monitor[key] = listener.monitor[key] || [];
            listener.monitor[key].push(fn);
        },
    };

    let addMonitor = listener.addMonitor;
    // addMonitor("type", function(event, message) {
    //     listener.fn_onmessage.apply(this, [event]);
    // });
    addMonitor("send", function(command) {
        $(".left-console").append(`<div> >> ${command}</div>`);
        AutoScroll(".console");
    });

    addMonitor("roles", function(event, message) {
        data.roles = message.roles; //[{name, title, id}, ...]
        listener.fn_onmessage.apply(this, [event]);
    });
    addMonitor("login", function(event, message) {
        id = message.id;
        let role = data.roles.find(role => {
            return role.id == id; //核对id找到name
        });
        data[id] = {}; //以后可以从保存的数据中读取
        data[id].name = role.name;
        data[id].state = "登录";
        listener.fn_onmessage.apply(this, [event]);
    });

    addMonitor("state", function(event, message) {
        data[id].state = message.state ? message.state.replace("你正在", "") : "闲逛中";
        fn.SetTitle();
        if (message.desc instanceof Array && message.desc.length > 0) {
            message.desc = []; //清空状态文本
            let cheat = fn.DeepCopy(event);
            cheat.data = JSON.stringify(message);
            listener.fn_onmessage.apply(this, [cheat]);
        } else {
            listener.fn_onmessage.apply(this, [event]);
        }
    });
    addMonitor("room", function(event, message) {
        let desc = message.desc;
        if (/cmd/.test(desc)) {
            desc = desc.replace("<hig>椅子</hig>", "椅子"); //新手教程里面的椅子
            desc = desc.replace("<CMD cmd='look men'>门(men)<CMD>", "<cmd cmd='look men'>门</cmd>。"); //兵营里的门
            desc.match(/<cmd cmd='([^']+)'>([^<]+)<\/cmd>/g).forEach(item => {
                let x = item.match(/<cmd cmd='(.*)'>(.*)<\/cmd>/);
                let cmd = x[1];
                let name = x[2].replace(/\(.*\)/, "").replace(" ", "").replace(" ", "");
                message.commands.unshift({cmd: cmd, name: name});
            });
        }
        message.desc = desc.substr(0, 20) + "……";
        let cheat = fn.DeepCopy(event);
        cheat.data = JSON.stringify(message);
        listener.fn_onmessage.apply(this, [cheat]);
    });

    addMonitor("txt", function(event, message) {
        let txt = message.txt;
        if (/重新连线|欢迎登陆/.test(txt)) {
            AddContent(txt + "\n");
            AddContent("wsmud_funny " + GM_info.script.version + " 苏轻祝您游戏愉快！\n");
            if (data.temp.login === 1) {
                let x = 200;
                let ms =  function() {
                    x += 500;
                    return x;
                }
                setTimeout(function() {$("[command=score]").click()}, ms());
                setTimeout(function() {$("[command=pack]").click()}, ms());
                setTimeout(function() {$("[command=skills]").click()}, ms());
                setTimeout(function() {$("[command=tasks]").click()}, ms());
                setTimeout(function() {$("[command=shop]").click()}, ms());
                setTimeout(function() {$("[command=message]").click()}, ms());
                setTimeout(function() {$("[command=stats]").click()}, ms());
                setTimeout(function() {$("[command=jh]").click()}, ms());
                setTimeout(function() {$("[command=showtool]").click()}, ms());
                setTimeout(function() {SendCommand("score2")}, ms());
                setTimeout(function() {$(".dialog-close").click()}, ms());
                setTimeout(function() {$("[command=showcombat]").click()}, ms());
            }
            data.temp.login ++;
        } else if (/你获得了(.*)点经验，(.*)点潜能/.test(txt)) {
            listener.fn_onmessage.apply(this, [event]);
            let x = txt.match(/获得了(.*)点经验，(.*)点潜能/);
            data.temp.jy += parseInt(x[1]);
            data.temp.qn += parseInt(x[2]);
            $(".remove_jyqn").remove();
            AddContent(`<span class="remove_jyqn">合计 => 经验:${data.temp.jy} 潜能:${data.temp.qn}\n</span>`);
        } else if (/看起来(.*)想杀死你/.test(txt)) {
            let x = txt.match(/看起来(.*)想杀死你/);
            AddContent(`<hir>${x[1]} => 开始攻击你！<hir>\n`);
        } else if (/你对著(.*)喝道/.test(txt)) {
            let x = txt.match(/你对著(.*)喝道/);
            AddContent(`<hir>你 => 开始攻击${x[1]}！<hir>\n`);
        } else if (/你扑向(.*)/.test(txt)) {
            let x = txt.match(/你扑向(.*)！/);
            AddContent(`<hir>你 => 开始攻击${x[1]}！<hir>\n`);
        } else if (/造成(.*)点/.test(txt)) {
            let x = txt.split(/.*造成<wht>|.*造成<hir>|<\/wht>点|<\/hir>点/);
            if (!x[2]) listener.fn_onmessage.apply(this, [event]);
            let y = x[2].split(/伤害|\(|</);
            (y[0] === "暴击") ? AddContent(`${y[2]}受到<hir>${x[1]}</hir>点<hir>暴击</hir>伤害！\n`)
                            : AddContent(`${y[2]}受到<wht>${x[1]}</wht>点伤害！\n`);
        } else if (/你的最大内力增加了/.test(txt)) {
            listener.fn_onmessage.apply(this, [event]);
            let a = txt.match(/你的最大内力增加了(.*)点。/);
            let n = parseInt(a[1]), max = parseInt(funny.role.max_mp), limit = parseInt(funny.role.limit_mp);
            let time = (limit - max) / (n * 6); //X分钟=>X小时X分钟
            let timeString = time < 60 ? `${parseInt(time)}分钟` : `${parseInt(time / 60)}小时${parseInt(time % 60)}分钟`;
            $(".remove_dzsj").remove();
            AddContent(`<span class="remove_dzsj">当前内力: ${max}\n上限内力: ${limit}\n需要时间: ${timeString}\n</span>`);
        } else if (/数息后只留下一堆玄色石头/.test(txt)) {
            let x = txt.match(/只见(.*)发出一阵白光/);
            AddContent(`你分解了 => ${x[1]}\n`);
        } else if (/无数花瓣夹杂着寒气/.test(txt)) {
            let a = txt.match(/无数花瓣夹杂着寒气将(.*)围起/);
            AddContent(`<him>太上忘情 => ${a[1]}</him>\n`);
        } else if (/你轻声吟道/.test(txt)) {

        } else {
            listener.fn_onmessage.apply(this, [event]);
        }
        AutoScroll(".content-message");
    });
    addMonitor("msg", function(event, message) {
        listener.fn_onmessage.apply(this, [event]);
        $(".channel pre").html("");

        let name = (message.name === "" || message.name === undefined) ? "" : message.name + "：";
        let uid = message.uid, content = message.content;
        let look3 = function() {SendCommand("look3 " + $(this).attr("cmd"))}
        if (message.ch === "chat") {
            let levels = ["<hic>闲聊</hic>", "<hic>闲聊</hic>", "<hic>闲聊</hic>", "<hiy>宗师</hiy>", "<hiz>武圣</hiz>", "<hio>武帝</hio>", "<hir>武神</hir>"];
            $(".chat").append($(`<hic cmd="${uid}">【${levels[message.lv]}】${name}${content}</hic><br>`).click(look3));
        } else if (message.ch === "fam") {
            $(".fam").append($(`<hiy>【${message.fam}】${name}${content}</hiy><br>`).click(look3));
        } else if (message.ch === "pty") {
            $(".pty").append($(`<span cmd="look3 ${uid}"><hiz>【帮派】${name}${content}</hiz><br></span>`).click(look3));
        } else if (message.ch === "tm") {
            $(".tm").append(`<hig>【队伍】${name}${content}</hig><br>`);
        } else if (message.ch === "es") {
            $(".es").append(`<hio>【${message.server}】${name}${content}</hio><br>`);
        } else if (message.ch === "rumor") {
            if (/闭关修炼/.test(content)) {
                let x = content.match(/武帝(.*)闭关修炼似有所悟，你随之受益获得了(.*)经验，(.*)潜能/);
                $(".rumor").append("<him>【谣言】武帝<hio>" + x[1] + "</hio>出关奖励<hio>" + x[2] + "</hio>点。</him><br>");
            } else if (/战胜了/.test(content)) {
                let x = content.match(/听说(.*)战胜了(.*)获得了(.*)称号！/);
                $(".rumor").append("<him>【谣言】" + x[1] + "获得了" + x[3] + "称号！</him><br>");
            } else if (/郭大侠收到线报/.test(content)) {
                $(".rumor").append("<him>【谣言】蒙古大军将会进攻襄阳！<wht>" + fn.Time2String() + "</wht></him><br>");
            } else if (/出现在/.test(content)) {
                let x = content.match(/听说(.*)出现在(.*)-(.*)一带。/);
                $(".rumor").append("<him>【谣言】" + x[1] + "出现在" + x[2] + x[3] + "！<wht>" + fn.Time2String() + "</wht></him><br>");
            } else {
                $(".rumor").append("<him>【谣言】" + content + "</him><br>");
            }
        } else if (message.ch === "sys") {
            if (/欢迎登录|非法收益/.test(content)) return;
            else if (/挖矿技巧/.test(content)) content = content.match(/(.*)捡到一本挖矿指南/)[1] + "使用了挖矿指南！";
            else if (/，望各路英雄鼎力相助/.test(content)) content = content.replace("，望各路英雄鼎力相助", "");
            else if (/蒙古大军挥军南下/.test(content)) content = content.replace("蒙古大军挥军南下，", "");
            else if (/蒙古大汗蒙哥出现在战场中央/.test(content)) content = "蒙古大汗蒙哥出现在战场中央！";
            else if (/蒙古可汗蒙哥被击杀于襄阳城下/.test(content)) content = content.replace("蒙古可汗蒙哥被击杀于襄阳城下，", "");

            $(".sys").append("<hir>【系统】" + content + "<wht>" + fn.Time2String() + "</wht></hir><br>");
        } else {
            throw(message);
        }
        AutoScroll("." + message.ch);
    });

    addMonitor("score", function(event, message) {
        listener.fn_onmessage.apply(this, [event]);
        for (const key in message) {
            if (key === "name") continue;
            data[id][key] = message[key];
        }
        for (const key in data[id]) $(".role_" + key).html(message[key]);
    });
    addMonitor("tasks", function(event, message) {
        listener.fn_onmessage.apply(this, [event]);
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
            $(".remove_tasks").remove();
            AddContent(`<span class="remove_tasks">${html}<span>`);
            AutoScroll(".content-message");
        }
    });
    addMonitor("skills", function(event, message) {
        listener.fn_onmessage.apply(this, [event]);
        data[id].skills = message.items || data[id].skills || [];
        let skill = data[id].skills.find(skill => {return skill.id == message.id});

        if (message.items) {
            data[id].skills = message.items;
            data[id].limit = parseInt(message.limit);
        }
        if (message.id && message.exp) {
            if (message.level) skill.level = message.level;

            let djsx = data[id].limit;                //等级上限
            let xxxl = parseInt(data[id].study_per);  //学习效率
            let lxxl = parseInt(data[id].lianxi_per); //练习效率
            let xtwx = parseInt(data[id].int);        //先天悟性
            let htwx = parseInt(data[id].int_add);    //后天悟性
            if (skill) {
                let name = skill.name, level = parseInt(skill.level), k = 0;
                if (/<wht>.*/.test(name)) k = 1; // 白
                if (/<hig>.*/.test(name)) k = 2;
                if (/<hic>.*/.test(name)) k = 3;
                if (/<hiy>.*/.test(name)) k = 4;
                if (/<hiz>.*/.test(name)) k = 5;
                if (/<hio>.*/.test(name)) k = 6; // 橙
                if (/<hir>.*/.test(name)) k = 7; // 红
                let qianneng = (djsx * djsx - level * level) * 2.5 * k;
                if (data[id].state === "练习技能") {
                    let time = qianneng / (xtwx + htwx) / (1 + lxxl / 100 - xtwx / 100) / 12;
                    let timeString = time < 60 ? `${parseInt(time)}分钟` : `${parseInt(time / 60)}小时${parseInt(time % 60)}分钟`;
                    //练习每一跳的消耗公式＝（先天悟性＋后天悟性）×（1＋练习效率%－先天悟性%）
                    AddContent(`练习${name}消耗了${parseInt(qianneng / time / 12)}点潜能。\n`);
                    $(".remove_lxjs").remove();
                    AddContent(`<span class="remove_lxjs">角色悟性: ${xtwx}＋${htwx}\n练习效率: ${lxxl}%\n等级上限: ${djsx}级\n需要潜能: ${qianneng}\n需要时间: ${timeString}\n</span>`);
                    AutoScroll(".content-message");
                } else if (/学习(.*)/.test(data[id].state)) {
                    //学习每一跳的消耗公式＝（先天悟性＋后天悟性）×（1＋学习效率%－先天悟性%）×3
                    let cost = (xtwx + htwx) * (1 +  xxxl / 100 - xtwx / 100) * 3;
                    AddContent(`学习${name}消耗了${parseInt(cost)}点潜能。\n`);
                    AutoScroll(".content-message");
                }
            }
        }
    });
    addMonitor("pack", function(event, message) {
        listener.fn_onmessage.apply(this, [event]);
        data[id].pack = data[id].pack || [];
        let pack = data[id].pack;
        if (message.money) pack.money = message.money;
        if (message.max_item_count) pack.max = message.max_item_count;
        if (message.items) {
            pack.items = message.items; //背包
            pack.items.forEach(item => {
                if (/<hig>养精丹<\/hig>/.test(item.name)) {
                    let cmd = [];
                    for (let i = 0; i < item.count; i ++) cmd.push("use " + item.id);
                    $(".content-message pre").append(
                        $(`<div class="item-commands"></div>`).append(
                            $(`<span>快捷使用${count}次 => ${item.name}</span>`).click(() => SendCommand(cmd))
                        )
                    );
                    AutoScroll(".content-message");
                }
            });
        }
        if (message.eqs) {
            pack.eqs = message.eqs; //装备
            console.log(pack.eqs);
        }

        if (message.name && !/wht/.test(message.name)) {
            let name = message.name;
            let count = message.count || 1;
            data.temp.pickup[name] ? (data.temp.pickup[name] += count) : (data.temp.pickup[name] = count);

            let remove = "remove_pickup_" + name.replace(/\/|<|>/g, "");
            $("." + remove).remove();
            $(".channel-pack").append(`<span class="${remove}">${name} => <wht>${data.temp.pickup[name]}</wht><br></span>`);
            AutoScroll(".channel-pack");
        }

        if (message.can_use == 1) { //获得可以直接使用的物品
            if (/<hic>养精丹<\/hic>|朱果|潜灵果/.test(message.name)) {
                let cmd = [];
                for (let i = 0; i < message.count; i ++) cmd.push("use " + message.id);
                $(".content-message pre").append(
                    $(`<div class="item-commands"></div>`).append(
                        $(`<span>快捷使用${count}次 => ${message.name}</span>`).click(() => SendCommand(cmd))
                    )
                );
                AutoScroll(".content-message");
            }
        }

        console.log(message);
    });




    unsafeWindow.funny = funny;
    unsafeWindow.AutoScroll = fn.AutoScroll;
    unsafeWindow.AddContent = fn.AddContent;
    unsafeWindow.SendCommand = fn.SendCommand;
    funny.fn = fn;
    funny.data = data;
    funny.listener = listener;


    if (WebSocket) {
        console.log("wsmud_funny 加载成功！");
        unsafeWindow.WebSocket = function(uri) {
            listener.webSocket = new WebSocket(uri);
        };
        unsafeWindow.WebSocket.prototype = {
            get url() {
                return listener.webSocket.url;
            },
            get protocol() {
                return listener.webSocket.protocol;
            },
            get readyState() {
                return listener.webSocket.readyState;
            },
            get bufferedAmount() {
                return listener.webSocket.bufferedAmount;
            },
            get extensions() {
                return listener.webSocket.extensions;
            },
            get binaryType() {
                return listener.webSocket.binaryType;
            },
            set binaryType(type) {
                listener.webSocket.binaryType = type;
            },
            get onerror() {
                return listener.webSocket.onerror;
            },
            set onerror(fn) {
                listener.webSocket.onerror = fn;
            },
            get onopen() {
                return listener.webSocket.onopen;
            },
            set onopen(fn) {
                listener.webSocket.onopen = fn;
            },
            get onclose() {
                return listener.webSocket.onclose;
            },
            set onclose(fn) {
                listener.fn_onclose = fn;
                listener.webSocket.onclose = listener.onclose;
            },
            close: function () {
                listener.webSocket.close();
            },
            get onmessage() {
                return listener.webSocket.onmessage;
            },
            set onmessage(fn) {
                listener.fn_onmessage = fn;
                listener.webSocket.onmessage = listener.onmessage;
            },
            send: function (command) {
                listener.send(command);
            },
        };
    } else console.log("wsmud_funny 加载失败！");



    $(document).ready(function() {
        let agent = navigator.userAgent.toLowerCase();
        console.log(agent);
        if (/ipad|iphone|android|mobile/.test(agent)) return; //判断是否移动端

        // GM_addStyle(".left,.right{background-color:#151515}");

        //样式优化
        $(".signinfo").addClass("hide");
        // GM_addStyle(".room_desc{overflow:hidden;white-space:nowrap;}");
        GM_addStyle(".channel{display:none;}");
        GM_addStyle(".content-bottom{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;}");
        GM_addStyle(".room-item>.item-name{margin-left:14px;}");
        $(".room_items")[0].style.maxHeight = "240px";
        $(".state-bar")[0].style.overflow = "hidden";
        $(".combat-commands")[0].style.overflow = "hidden";
        $(".dialog-content")[0].style.overflowX = "hidden";

        //三栏布局
        GM_addStyle("body{width:100%;display:flex;flex-flow:row no-wrap;}");
        GM_addStyle(".box{width:360px;flex: 0 0 auto;}");
        GM_addStyle(".container,.login-content{flex:1 0 auto;}");
        GM_addStyle(".left{order:-1;}");
        GM_addStyle(".right{order:1;margin-left:5px;padding-left:5px;border-left:1px solid gray;}");

        GM_addStyle(".left-nav{text-align:center;margin-left:10px;}");

        GM_addStyle(`.left{display:flex;flex-direction:column;flex-wrap:nowrap;}`);
        GM_addStyle(`.left table{table-layout:fixed;border-collapse:collapse;margin:0 10px 0 10px;}`);
        GM_addStyle(`.left td{width:88px;text-align:center;white-space:nowrap;border:gray solid 1px;}`);

        GM_addStyle(`.left-role{flex: 0 0 auto;}`);
        GM_addStyle(`.left-skill{flex: 1 0 auto;height:500px;overflow:auto;}`);
        GM_addStyle(`.left-pack{flex: 1 0 auto;height:500px;overflow:auto;font-size:12px;}`);

        GM_addStyle(`.left-hide{margin-left:10px;margin-right:10px;}`);

        GM_addStyle(`.left-console{flex:1 0 auto;height:100px;overflow:auto;border:gray solid 1px;margin:10px 10px 0 10px}`);
        GM_addStyle(`.left-send{flex:0 0 auto;height:auto;display:flex;}`);
        GM_addStyle(`.left-send input{flex:1 0 auto;height:auto;background-color:gray;color:white;font-size:16px;margin:5px 10px 0 10px;}`);

        $(".container").addClass("box");
        $(".login-content").addClass("box");
        $("body").append($(`
        <div class="left box">
            <div class="left-nav item-commands"></div>
            <div class="left-role left-hide"></div>
            <div class="left-skill left-hide"></div>
            <div class="left-pack left-hide"></div>
            <div class="left-hotkey left-hide"></div>
            <div class="left-setting left-hide"></div>
            <div class="left-console console"></div>
            <div class="left-send item-commands"></div>
        </div>
        <div class="right box">
        </div>
        `));



        $(".left-nav").append(
            $(`<span id="click_role">属性</span>`).click(function() {
                $(".left-hide").hide();
                $(".left-role").show();
            }),
            $(`<span>技能</span>`).click(function() {
                layoutSkill();
                $(".left-hide").hide();
                $(".left-skill").show();
            }),
            $(`<span>背包</span>`).click(function() {
                // layoutPack();
                $(".left-hide").hide();
                $(".left-pack").show();
            }),
            $(`<span>快捷</span>`).click(function() {
                $(".left-hide").hide();
                $(".left-hotkey").show();
            }),
            $(`<span>设置</span>`).click(function() {
                $(".left-hide").hide();
                $(".left-setting").show();
            }),
        );
        $(".left-role").append(`
        <table>
            <tr><td colspan="4"><hiy>角色信息</hiy></td></tr>
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
        </table>
        `);
        $(".left-skill").append(`
        <table>
            <thead>
                <tr><td colspan="3"><hiy>技能信息</hiy></td></tr>
                <tr><td>技能</td><td>代码</td><td>等级</td></tr>
            </thead>
            <tbody></tbody>
        </table>
        `);
        $(".left-pack").append(`
        <table><thead><hiy>还没敲</hiy></thead><tbody></tbody></table>
        `);
        $(".left-hotkey").append(
            $(`<div>小号常用的快捷键</div>`),
            $(`<div class="item-commands"></div>`).append(
                $(`<span>送给配偶99朵玫瑰</span>`).click(() => SendCommand("greet 99")),
            ),
        );
        $(".left-setting").append(
            $(`<input type="checkbox"><label>自动吃冰心丹（练习专用）</label>`).click(function() {
                funny.auto_food_bxd = $(this).prop("checked");
                if (funny.auto_food_bxd) {
                    fn.addToContent(`自动吃冰心丹<hig>已启用！</hig>\n`);
                    $("[command=pack]").click();
                    fn.send("pack");
                    fn.closeDialog();
                } else {
                    fn.addToContent(`自动吃冰心丹<hiw>已取消！</hiw>\n`);
                }
            }).prop("checked", funny.auto_food_bxd),
        );

        $(".left-send").append(
            $(`<input type="text" readonly onfocus="this.removeAttribute('readonly');" id="send_value">`)
            .keypress(function(key) {
                if (key.which == 13) $("#send_btn").click();
            }),
            $(`<span id="send_btn">发送</span>`).click(function() {
                let value = $("#send_value").val();
                if (value) {
                    SendCommand(value);
                    $(".left-console").append(`<div><hiy> >> ${value}</hiy></div>`);
                    AutoScroll(".left-console");
                    $("#send_value").val("");
                }
            })
        );
        $(".left span")[0].click();
        function layoutSkill() {
            let array = funny.skills || [];
            for (let i = 0; i < array.length; i++) {
                for (let j = 0; j < array.length - i - 1; j++) {
                    if (array[j].level < array[j + 1].level) {
                        [array[j], array[j + 1]] = [array[j + 1], array[j]];
                    }
                    if (!/<wht>/.test(array[j].name) && /<wht>/.test(array[j + 1].name)) {
                        [array[j], array[j + 1]] = [array[j + 1], array[j]];
                    }
                }
            }
            $(".left-skill tbody").html(""); // clear
            array.forEach(skill => {
                $(".left-skill tbody").append(
                    $(`<tr></tr>`).append(
                        $(`<td></td>`).append(`${skill.name}`),
                        $(`<td></td>`).append(`${skill.id}`),
                        $(`<td></td>`).append(`${skill.level}`),
                    ),
                );
            });
        }


        $(".right").append(
            $(`<div class="msg chat"></div>`),
            $(`<div class="msg tm"></div>`),
            $(`<div class="msg fam"></div>`),
            $(`<div class="msg pty"></div>`),
            $(`<div class="msg es"></div>`),
            $(`<div class="msg sys rumor"></div>`),
            $(`<div class="msg pickup channel-pack"></div>`),
            $(`<div class="msg item-commands"></div>`).append(
                $(`<span>切</span>`).click(function() {
                    if (funny.layout_left) {
                        $(".left")[0].style.order = "1";
                        $(".right")[0].style.order = "-1";
                    } else {
                        $(".left")[0].style.order = "-1";
                        $(".right")[0].style.order = "1";
                    }
                    funny.layout_left = !funny.layout_left;
                }),
                $(`<span>点</span>`).click(function() {
                    $(".clear-channel").show(500, function() {
                        setTimeout(function() {
                            $(".clear-channel").hide(500);
                        }, 10000);
                    });
                }),
            ),
            $(`<div class="msg item-commands clear-channel"></div>`).append(
                $(`<span>世界清屏</span>`).click(() => $(".chat").html("")),
                $(`<span>队伍清屏</span>`).click(() => $(".tm").html("")),
                $(`<span>门派清屏</span>`).click(() => $(".fam").html("")),
                $(`<span>全区清屏</span>`).click(() => $(".es").html("")),
                $(`<span>帮派清屏</span>`).click(() => $(".pty").html("")),
                $(`<span>系统清屏</span>`).click(() => $(".sys").html("")),
                $(`<span>统计清屏</span>`).click(() => $(".channel-pack").html("")),
                $(`<span>游戏清屏</span>`).click(() => $(".content-message pre").html("")),
            ),
        );
        $(".clear-channel").hide();
        GM_addStyle(`.right{height:100%;display:flex;flex-direction:column;}`);
        GM_addStyle(`.msg{height:auto;overflow:auto;flex:0 0 auto;font-size:14px;line-height:16px;max-height:160px;}`);
        GM_addStyle(`.chat{flex:1 1 auto;max-height:100%;}`);

    });
    //document.ready end
})();