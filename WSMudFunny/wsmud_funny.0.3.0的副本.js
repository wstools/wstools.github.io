// ==UserScript==
// @name        wsmud_funny
// @namespace   suqing
// @version     0.3.0
// @author      sq
// @match       http://*.wsmud.com/*
// @homepage    https://greasyfork.org/zh-CN/scripts/380709
// @description 武神传说脚本，内置了许多小功能。
// @run-at      document-start
// @require     https://code.jquery.com/jquery-3.3.1.min.js
// @require     https://greasyfork.org/scripts/382096-wsmud-funny-base/code/wsmud_funny_base.js?version=691656
// @xxxxxxx     https://greasyfork.org/scripts/382096/code/wsmud_funny_base.js
// @grant       unsafeWindow
// @grant       GM_addStyle
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// @grant       GM_openInTab
// @grant       GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';
    let wsmud = {
        role: {},
        id: undefined,
        total_jy: 0,
        total_qn: 0,
        layout_left: true,
    };
    console.log(funny);
    let fn = funny.fn;
    let listener = funny.listener;
    let onekey = funny.onekey;

    listener.addListener("send", function(message, data) {
        $(".console").append(`<div> >> ${message}</div>`);
        AutoScroll(".console");
    });
    listener.addListener("login", function(message, data) {
        if (data.id) wsmud.id = data.id;
        listener.ONMESSAGE.apply(this, arguments);
    });

    listener.addListener("string", function(message, data) {
        if (/重新连线|欢迎登陆/.test(data)) {
            fn.addToContent(`${data}\n`);
            wsmud.login_count = wsmud.login_count || 0;
            if (wsmud.login_count++ > 1) return;
            fn.addToContent(`wsmud_funny ${GM_info.script.version} 苏轻祝您游戏愉快！\n`);
            click();
            async function click() {
                $("[command=score]").click();
                await fn.sleep(100);
                $("[for=1]").click();
                await fn.sleep(100);
                $("[for=0]").click();
                await fn.sleep(100);
                $("[command=showcombat]").click();
                await fn.sleep(100);
                $("[command=showtool]").click();
                $(".dialog-close").click();
            }
        } else if (/你获得了(.*)点经验，(.*)点潜能/.test(data)) {
            let a = data.match(/你获得了(.*)点经验，(.*)点潜能/);
            wsmud.total_jy += parseInt(a[1]);
            wsmud.total_qn += parseInt(a[2]);
            fn.addToContent(`${data}\n`);
            $(".remove_data_jyqn").remove();
            fn.addToContent(`<span class="remove_data_jyqn">合计 => 经验:${wsmud.total_jy} 潜能:${wsmud.total_qn}\n</span>`);

        } else if (/看起来(.*)想杀死你/.test(data)) {
            let a = data.match(/看起来(.*)想杀死你！/);
            $(".content-message pre").append(`<hir>${a[1]} => 开始攻击你！<hir>\n`);
        } else if (/你对著(.*)喝道/.test(data)) {
            let a = data.match(/你对著(.*)喝道/);
            $(".content-message pre").append(`<hir>你 => 开始攻击${a[1]}！<hir>\n`);
        } else if (/你扑向(.*)/.test(data)) {
            let a = data.match(/你扑向(.*)！/);
            $(".content-message pre").append(`<hir>你 => 开始攻击${a[1]}！<hir>\n`);
        } else if (/造成(.*)点/.test(data)) {
            let a = data.split(/.*造成<wht>|.*造成<hir>|<\/wht>点|<\/hir>点/);
            let b = a[2].split(/伤害|\(|</);
            if (b[0] === "暴击") {
                $(".content-message pre").append(`${b[2]}受到<hir>${a[1]}</hir>点<hir>${b[0]}</hir>伤害！\n`);
            } else {
                $(".content-message pre").append(`${b[2]}受到<wht>${a[1]}</wht>点伤害！\n`);
            }
        } else if (/你的最大内力增加了/.test(data)) {
            fn.addToContent(`${data}\n`);
            let a = data.match(/你的最大内力增加了(.*)点。/);
            let n = parseInt(a[1]),
              max = parseInt(wsmud.role.max_mp),
            limit = parseInt(wsmud.role.limit_mp);
            let time = (limit - max) / (n * 6); // X分钟 => X小时X分钟
            let timeString = time < 60 ? `${parseInt(time)}分钟` : `${parseInt(time / 60)}小时${parseInt(time % 60)}分钟`;
            $(".remove_dzsj").remove();
            fn.addToContent(`<span class="remove_dzsj">当前内力: ${max}\n上限内力: ${limit}\n需要时间: ${timeString}\n</span>`);
        } else if (/无数花瓣夹杂着寒气/.test(data)) {
            let a = data.match(/无数花瓣夹杂着寒气将(.*)围起/);
            fn.addToContent(`<him>「太上忘情」 => ${a[1]} (无法躲闪)</him>\n`);
        } else if (/数息后只留下一堆玄色石头/.test(data)) {
            let a = data.match(/只见(.*)发出一阵白光/);
            fn.addToContent(`你分解了 => ${a[1]}\n`);
        } else if (/你轻声吟道/.test(data)) {
        } else {
            listener.ONMESSAGE.apply(this, arguments);
        }
    });

    listener.addListener("roles", function(message, data) {
        wsmud.roles = data;
        listener.ONMESSAGE.apply(this, arguments);
    });

    listener.addListener("msg", function(message, data) {
        listener.ONMESSAGE.apply(this, arguments);
        $(".channel").html("");
        data.name = (data.name === "" || data.name === undefined) ? "" : `${data.name}：`;
        if (data.ch === "chat") {
            let levels = ["<hic>闲聊</hic>","<hic>闲聊</hic>","<hic>闲聊</hic>","<hiy>宗师</hiy>","<hiz>武圣</hiz>","<hio>武帝</hio>","<hir>武神</hir>"];
            $(".chat").append($(`<span cmd="look3 ${data.uid}"><hic>【${levels[data.lv]}】${data.name}${data.content}</hic><br></span>`).click(function() {fn.send(`${$(this).attr("cmd")}`)}));
        } else if (data.ch === "fam") {
            $(".fam").append($(`<span cmd="look3 ${data.uid}"><hiy>【${data.fam}】${data.name}${data.content}</hiy><br></span>`).click(function() {fn.send(`${$(this).attr("cmd")}`)}));
        } else if (data.ch === "pty") {
            $(".pty").append($(`<span cmd="look3 ${data.uid}"><hiz>【帮派】${data.name}${data.content}</hiz><br></span>`).click(function() {fn.send(`${$(this).attr("cmd")}`)}));
        } else if (data.ch === "tm") {
            $(".tm").append(`<hig>【队伍】${data.name}${data.content}</hig><br>`);
        } else if (data.ch === "es") {
            $(".es").append(`<hio>【${data.server}】${data.name}${data.content}</hio><br>`);
        } else if (data.ch === "rumor") {
            if (data.content.includes("闭关修炼")) {
                let x = data.content.match(/听说武帝(.*)闭关修炼似有所悟，你随之受益获得了(.*)经验，(.*)潜能/);
                $(".rumor").append(`<him>【谣言】武帝「${x[1]}」出关，奖励经验潜能${x[3]}点。</him><br>`);
            } else if (data.content.includes("听说郭大侠收到线报蒙古大军近日将会进攻襄阳")) {
                $(".rumor").append(`<him>【谣言】蒙古大军将会进攻襄阳！<wht>${fn.getTimeString()}</wht></him><br>`);
            } else if (data.content.includes("出现在")) {
                let x = data.content.match(/听说(.*)出现在(.*)-(.*)一带。/);
                $(".rumor").append(`<him>【谣言】${x[1]}出现在${x[2]}${x[3]}！<wht>${fn.getTimeString()}</wht></him><br>`);
            } else {
                $(".rumor").append(`<him>【谣言】${data.content}</him><br>`);
            }
        } else if (data.ch === "sys") {
            if (/欢迎登录|非法收益/.test(data.content)) {
                return;
            } else if (/挖矿技巧/.test(data.content)) {
                let x = data.content.match(/(.*)捡到一本挖矿指南/);
                data.content = `${x[1]}使用了挖矿指南！`;
            } else if (/望各路英雄鼎力相助/.test(data.content)) {
                data.content = data.content.replace("，望各路英雄鼎力相助", "");
            }
            $(".sys").append(`<hir>【系统】${data.content}<wht>${fn.getTimeString()}</wht></hir><br>`);
        } else {
            throw(data);
        }
        AutoScroll(`.${data.ch}`);
    });

    listener.addListener("room", function(message, data) {
        if (/cmd cmd=/.test(data.desc)) {
            data.desc = data.desc.replace("<hig>椅子</hig>", "椅子");
            data.desc = data.desc.replace(/\((.*)\)/, "");
            let x = data.desc.match(/<cmd cmd='([^']+)'>([^<]+)<\/cmd>/g);
            x.forEach(desc => data.desc = `<hic>${desc}</hic>　${data.desc}`);
            let mask = fn.deepCopy(message);
            mask.data = JSON.stringify(data);
            listener.ONMESSAGE.apply(this, [mask]);
        } else {
            listener.ONMESSAGE.apply(this, [message]);
        }
    });
    listener.addListener("state", function(message, data) {
        wsmud.state = data.state;
        if (data.desc && data.desc.length > 0) {
            data.desc = [];
            let mask = fn.deepCopy(message);
            mask.data = JSON.stringify(data);
            listener.ONMESSAGE.apply(this, [mask]);
        } else {
            listener.ONMESSAGE.apply(this, [message]);
        }
    });

    listener.addListener("itemadd", function(data) {
        // if (/蒙古兵|十夫长|百夫长|千夫长|万夫长/.test(data.name)) {
        //     if (data.id) fn.send(`kill ${data.id}`);
        // }
        listener.ONMESSAGE.apply(this, arguments);
    });

    listener.addListener("tasks", function(message, data) {
        listener.ONMESSAGE.apply(this, arguments);
        if (data.items) {
            let fb, qa, wd1, wd2, wd3, sm1, sm2, ym1, ym2, yb1, yb2;
            data.items.forEach(item => {
                if (item.state === 2) fn.send(`taskover ${item.id}`); // 自动完成
                if (item.id === "signin") {
                    let a = item.desc.match(/师门任务：(.*)，副本：<(.*)>(.*)\/20<(.*)>/);
                    let b = item.desc.match(/(.*)武道塔(.*)，进度(.*)\/(.*)<(.*)>，<(.*)>(.*)首席请安。<(.*)>/);
                    (parseInt(a[3]) < 20) ? fb = `<hig>${a[3]}</hig>` : fb = a[3];
                    (parseInt(b[3]) < parseInt(b[4])) ? wd1 = `<hig>${b[3]}</hig>` : wd1 = b[3];
                    wd2 = b[4];
                    /可以重置/.test(b[2]) ? wd3 = "<hig>可以重置</hig>" : wd3 = "已经重置";
                    /已经/.test(b[7]) ? qa = "已经请安" : qa = "<hig>尚未请安</hig>";
                } else if (item.id === "sm") {
                    let a = item.desc.match(/目前完成(.*)\/20个，共连续完成(.*)个。/);
                    (parseInt(a[1]) < 20) ? sm1 = `<hig>${a[1]}</hig>` : sm1 = a[1];
                    sm2 = a[2];
                } else if (item.id === "yamen") {
                    let a = item.desc.match(/目前完成(.*)\/20个，共连续完成(.*)个。/);
                    (parseInt(a[1]) < 20) ? ym1 = `<hig>${a[1]}</hig>` : ym1 = a[1];
                    ym2 = a[2];
                } else if (item.id === "yunbiao") {
                    let a = item.desc.match(/本周完成(.*)\/20个，共连续完成(.*)个。/);
                    (parseInt(a[1]) < 20) ? yb1 = `<hig>${a[1]}</hig>` : yb1 = a[1];
                    yb2 = a[2];
                }
            });
            let html = `门派请安 => ${qa}\n武道之塔 => ${wd1}/${wd2} ${wd3}\n`;
               html += `日常副本 => ${fb}/20\n师门任务 => ${sm1}/20 ${sm2}连\n`;
               html += `衙门追捕 => ${ym1}/20 ${ym2}连\n每周运镖 => ${yb1}/20 ${yb2}连\n`;
            $(".remove_tasks").remove();
            fn.addToContent(`<span class="remove_tasks">${html}<span>`);
        }
    });

    listener.addListener("score", function(message, data) {
        for (const key in data) {
            wsmud.role[key] = data[key];
            $(`.role_${key}`).html(wsmud.role[key]);
        }
        listener.ONMESSAGE.apply(this, arguments);
    });
    listener.addListener("skills", function(message, data) {
        wsmud.skills = data.items || wsmud.skills || [];
        if (data.items) {
            wsmud.data_skill_limit = parseInt(data.limit);
        } else if (data.id && data.exp) {
            if (data.level) {
                for (const skill of wsmud.skills) {
                    if (skill.id === data.id) {
                        skill.level = data.level;
                        break;
                    }
                }
            }
            let name = "", k = 0, level = 0;
            let djsx = wsmud.data_skill_limit; // 上限
            let xxxl = parseInt(wsmud.role.study_per);   // 学习效率
            let lxxl = parseInt(wsmud.role.lianxi_per);  // 练习效率
            let xtwx = parseInt(wsmud.role.int);         // 先天悟性
            let htwx = parseInt(wsmud.role.int_add);     // 后天悟性
            for (const skill of wsmud.skills) {
                if (skill.id === data.id) {
                    level = parseInt(skill.level);
                    if (/<wht>.*/.test(skill.name))      k = 1; // 白
                    else if (/<hig>.*/.test(skill.name)) k = 2;
                    else if (/<hic>.*/.test(skill.name)) k = 3;
                    else if (/<hiy>.*/.test(skill.name)) k = 4;
                    else if (/<hiz>.*/.test(skill.name)) k = 5;
                    else if (/<hio>.*/.test(skill.name)) k = 6; // 橙
                    else if (/<hir>.*/.test(skill.name)) k = 7; // 红
                    break;
                }
            }
            let qianneng = (djsx * djsx - level * level) * 2.5 * k;
            if (wsmud.state === "你正在练习技能") {
                let time = qianneng / (xtwx + htwx) / (1 + lxxl / 100 - xtwx / 100) / 12;
                let timeString = time < 60 ? `${parseInt(time)}分钟` : `${parseInt(time / 60)}小时${parseInt(time % 60)}分钟`;
                $(".remove_lx").remove();
                // 练习每一跳的消耗公式＝（先天悟性＋后天悟性）×（1＋练习效率%－先天悟性%）
                fn.addToContent(`练习${name}消耗了${parseInt(qianneng / time / 12)}点潜能。\n`);
                fn.addToContent(`<span class="remove_lx">角色悟性: ${xtwx}＋${htwx}\n练习效率: ${lxxl}%\n等级上限: ${djsx}级\n需要潜能: ${qianneng}\n需要时间: ${timeString}\n</span>`);
            } else if (wsmud.state === "你正在读书" || /你正在学习/.test(wsmud.state)) {
                // 学习每一跳的消耗公式＝（先天悟性＋后天悟性）×（1＋学习效率%－先天悟性%）×3
                let cost = (xtwx + htwx) * (1 +  xxxl / 100 - xtwx / 100) * 3;
                fn.addToContent(`学习${name}消耗了${parseInt(cost)}点潜能。\n`);
                AutoScroll(".content-message pre");
            }
        }
        listener.ONMESSAGE.apply(this, arguments);
    });
    listener.addListener("pack", function(message, data) {
        listener.ONMESSAGE.apply(this, arguments);
        wsmud.pack = wsmud.pack || {};
        wsmud.pack.money = data.money || wsmud.pack.money || 0;
        wsmud.pack.max = data.max_item_count || wsmud.pack.max || 0;
        wsmud.pack.items = data.items || wsmud.pack.items || [];
        wsmud.pack.eqs = data.eqs || wsmud.pack.eqs || [];
        if (data.name && !/wht/.test(data.name)) {
            wsmud.pack.total = wsmud.pack.total || {};
            wsmud.pack.total[data.name] ?
            (wsmud.pack.total[data.name] ++) : (wsmud.pack.total[data.name] = 1);
            let remove = "remove_pack_" + data.name.replace(/\/|<|>/g, "");
            $(`.${remove}`).remove();
            $(".channel-pack").append(`<span class="${remove}">统计 => ${data.name} => <wht>${wsmud.pack.total[data.name]} (共${data.count}${data.unit})</wht><br></span>`);
            AutoScroll(".channel-pack");
        }
        if (data.can_use == 1 && /养精丹|朱果|潜灵果/.test(data.name)) {
            let count = data.count > 10 ? 10 : data.count;
            let cmd = [];
            for (let i = 0; i < count; i ++) cmd.push(`use ${data.id}`);
            $(".content-message pre").append(
                $(`<div class="item-commands"></div>`).append($(`<span>快捷使用${count}次 => ${data.name}</span>`).click(() => fn.send(cmd))),
            );
        }
        if (data.name) {
            if (/<hig>大宋(.*)<\/hig>|<hig>蒙古(.*)<\/hig>|<hig>笠子帽<\/hig>/.test(data.name)) {
                fn.send(`fenjie ${data.id}`);
            }
        }
    });

    $(document).ready(function() {
        // mobile
        let agent = navigator.userAgent.toLowerCase();
        console.log(agent);
        let isMobile = /ipad|iphone|android|mobile/.test(agent);
        if (isMobile) {
            fn.addToContent(`手机用户建议使用 <a href="https://greasyfork.org/zh-CN/scripts/382076">wsmud_funny_mobile</a>`);
            return;
        }
        // 样式优化
        $(".signinfo").addClass("hide");
        GM_addStyle(`.room_desc{overflow:hidden;white-space:nowrap;}`);
        GM_addStyle(`.channel{display:none;}`);
        GM_addStyle(`.content-bottom{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;}`);
        GM_addStyle(`.room-item>.item-name{margin-left:14px;}`);
        $(".room_items")[0].style.maxHeight = "240px";
        $(".state-bar")[0].style.overflow = "hidden";
        $(".combat-commands")[0].style.overflow = "hidden";
        $(".dialog-content")[0].style.overflowX = "hidden";
        // 三栏布局
        $("body").append($(`<div class="left box"></div>`));
        $("body").append($(`<div class="right box"></div>`));
        $(".container").addClass("box");
        $(".login-content").addClass("box");
        GM_addStyle(`body{width:100%;display:flex;flex-flow:row no-wrap;}`);
        GM_addStyle(`.box{width:360px;flex: 0 0 auto;}`);
        GM_addStyle(`.container,.login-content{flex:1 0 auto;}`);
        GM_addStyle(`.left{order:-1;}`);
        GM_addStyle(`.right{order:1;margin-left:5px;padding-left:5px;border-left:1px solid gray;}`);
        // 左边
        $(".left").append(
            $(`<div class="left-nav item-commands" style="text-align:center;margin-left:10px;"></div>`).append(
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
            ),
            $(`<div class="left-role left-hide"></div>`).append(
                $(`<table></table>`).append(
                    $(`<tr></tr>`).append(`<td colspan="4"><hiy>角色信息</hiy></td>`),
                    $(`<tr><td colspan="4" class="role_name">ROLE_NAME</td></tr>`),
                    $(`<tr><td>ID</td><td colspan="3" class="role_id"></td></tr>`),
                    $(`<tr><td>性别</td><td class="role_gender"></td><td>境界</td><td class="role_level"></td></tr>`),
                    $(`<tr><td>年龄</td><td colspan="3" class="role_age"></td></tr>`),
                    $(`<tr><td>经验</td><td colspan="3"><hig class="role_exp"></hig></td></tr>`),
                    $(`<tr><td>潜能</td><td colspan="3"><hig class="role_pot"></hig></td></tr>`),
                    $(`<tr><td>气血</td><td colspan="3"><span class="role_hp"></span>/<hic class="role_max_hp"></hic></td></tr>`),
                    $(`<tr><td>内力</td><td colspan="3"><span class="role_mp"></span>/<hic class="role_max_mp"></hic></td></tr>`),
                    $(`<tr><td>内力上限</td><td colspan="3"><hic class="role_limit_mp"></hic></td></tr>`),
                    $(`<tr><td>臂力</td><td><hiy class="role_str"></hiy>＋<span class="role_str_add"></span></td><td>根骨</td><td><hiy class="role_con"></hiy>＋<span class="role_con_add"></span></td></tr>`),
                    $(`<tr><td>身法</td><td><hiy class="role_dex"></hiy>＋<span class="role_dex_add"></span></td><td>悟性</td><td><hiy class="role_int"></hiy>＋<span class="role_int_add"></span></td></tr>`),

                    $(`<tr><td>攻击</td><td><hig class="role_gj"></hig></td><td>防御</td><td><hig class="role_fy"></hig></td></tr>
                       <tr><td>命中</td><td><hig class="role_mz"></hig></td><td>招架</td><td><hig class="role_zj"></hig></td></tr>
                       <tr><td>暴击</td><td><hig class="role_bj"></hig></td><td>躲闪</td><td><hig class="role_ds"></hig></td></tr>
                       <tr><td>终伤</td><td><hig class="role_add_sh"></hig></td><td>攻速</td><td><hig class="role_gjsd"></hig></td></tr>`),

                    $(`<tr><td>门派</td><td><hic class="role_family"></hic></td><td>功绩</td><td><hic class="role_gongji"></hic></td></tr>`),
                    $(`<tr><td>忽视防御</td><td class="role_diff_fy"></td><td>伤害减免</td><td class="role_diff_sh"></td></tr>
                    <tr><td>暴击伤害</td><td class="role_add_bj"></td><td>暴击抵抗</td><td class="role_diff_bj"></td></tr>
                    <tr><td>增加忙乱</td><td class="role_busy"></td><td>忽视忙乱</td><td class="role_diff_busy"></td></tr>
                    <tr><td>释放速度</td><td class="role_releasetime"></td><td>冷却速度</td><td class="role_distime"></td></tr>
                    <tr><td>打坐效率</td><td class="role_dazuo_per"></td><td>内力减耗</td><td class="role_expend_mp"></td></tr>
                    <tr><td>练习效率</td><td class="role_lianxi_per"></td><td>学习效率</td><td class="role_study_per"></td></tr>`)
                ),
            ),
            $(`<div class="left-skill left-hide"></div>`).append(
                $(`<table></table>`).append(
                    $(`<thead></thead>`).append(
                        $(`<tr><td colspan="3"><hiy>技能信息</hiy></td></tr>`),
                        $(`<tr><td>技能</td><td>代码</td><td>等级</td></tr>`),
                    ),
                    $(`<tbody></tbody>`),
                ),
            ),
            $(`<div class="left-pack left-hide"></div>`).append(
                $(`<table><thead><hiy>还没敲</hiy></thead><tbody></tbody></table>`),
            ),
            $(`<div class="left-hotkey left-hide"></div>`).append(
                $(`<div>快速抵达</div>`),
                $(`<div class="item-commands"></div>`).append(
                    $(`<span>豪宅修炼</span>`).click(() => fn.send(onekey.xiulian)),
                ),
                $(`<div>小号常用的快捷键</div>`),
                $(`<div class="item-commands"></div>`).append(
                    $(`<span>送给配偶九十九朵玫瑰花</span>`).click(() => fn.send("greet 99")),
                ),
            ),
            $(`<div class="left-setting left-hide"></div>`).append(
                $(`<input type="checkbox"><label>自动吃冰心丹（练习专用）</label>`).click(function() {
                    wsmud.auto_food_bxd = $(this).prop("checked");
                    if (wsmud.auto_food_bxd) {
                        fn.addToContent(`自动吃冰心丹<hig>已启用！</hig>\n`);
                        $("[command=pack]").click();
                        fn.send("pack");
                        $(".dialog-close").click();
                    } else {
                        fn.addToContent(`自动吃冰心丹<hiw>已取消！</hiw>\n`);
                    }
                }).prop("checked", wsmud.auto_food_bxd),
            ),

            $(`<div class="left-console console"></div>`),
            $(`<div class="left-send item-commands"></div>`).append(
                $(`<input type="text" readonly onfocus="this.removeAttribute('readonly');" id="send_value">`)
                .keypress(function(key) {
                    if (key.which == 13) $("#send_btn").click();
                }),
                $(`<span id="send_btn">发送</span>`).click(function() {
                    let value = $("#send_value").val();
                    if (value) fn.send(value);
                    $("#send_value").val("");
                }),
            ),
        );

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
        function layoutPack() {
            let array = funny.pack.items || [];
            $(".left-pack tbody").append(
                $(`<tr></tr>`).append(
                    $(`<td colspan="3"></td>`).append(`<hiy>背包</hiy>`)
                ),
                $(`<tr><td>物品</td><td>指令</td></tr>`),
            )
            array.forEach(item => {
                $(".left-pack tbody").append(
                    $(`<tr></tr>`).append(
                        $(`<td></td>`).append(`${item.name}<br>${item.count} ${item.unit}`),
                        $(`<td class="item-commands"></td>`).append(
                            $(`<span>查看</span>`).click(function() {
                                fn.send(`checkobj ${item.id} from item`);
                            }),
                            item.can_combine ? $(`<span cmd="_confirm combine ${item.id} 10">合成</span>`) : $(),
                        ),
                    ),
                );
            });
        }

        // 右边
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
                    if (wsmud.layout_left) {
                        $(".left")[0].style.order = "1";
                        $(".right")[0].style.order = "-1";
                    } else {
                        $(".left")[0].style.order = "-1";
                        $(".right")[0].style.order = "1";
                    }
                    wsmud.layout_left = !wsmud.layout_left;
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
})();