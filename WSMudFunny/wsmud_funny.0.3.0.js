funny = {


    RefreshSkill: function() {
        if (funny.pack && funny.pack.eqs) {
            $(".left-eq-list").html("");
            funny.pack.eqs.forEach(eq => {
                $(".left-eq-list").append(`<div><span>${eq.name}</span></div>`);
            });
        }
    },

};

(function() {
    'use strict';

    AddMonitor("send", function(command) {
        if (command.includes("drop")) {
            let x = command.match(/drop (.*) (.*)/);
            let count = x[1];
            let id = x[2];
            let item = funny.pack.items.find(item => {return item.id === id});
            if (!item.name.includes("wht")) {
                AddContent(`你尝试丢弃${item.name}被funny阻止！\n`);
                AddContent(`如果你一定要丢弃，请一秒内连击两次按钮！\n`);
                AddContent(
                    $(`<div class="item-commands"></div>`)
                    .append(`<span>丢弃${count}${item.unit}${item.name}</span>`)
                    .click(() => ComboFn(2, 1000, () => funny.webSocket.send(command)))
                );
            }
        } else funny.webSocket.send(command);

        console.log(command);

    });

    // {type:"dialog", dialog:"pack", id:"qh4r3eb6d9b", remove:1, money:5085410}	1556550377.6017153
    AddMonitor("pack", function(event, message) {
        // if (message.name) {
        //     if (/<hig>大宋(.*)<\/hig>|<hig>蒙古(.*)<\/hig>|<hig>笠子帽<\/hig>/.test(data.name)) {
        //         fn.send(`fenjie ${data.id}`);
        //     } else {
        //         console.log(data);
        //     }
        // }

    });

    // {"type":"dialog","dialog":"list",
    // "stores":[
    // {"name":"<hig>意形步法残页</hig>","id":"l81o3eb6496","count":3,"value":NaN,unit:"份",can_combine:10},
    // {"name":"<hig>神龙剑残页</hig>","id":"ml8b3eb647b","count":4,"value":NaN,unit:"份",can_combine:10},
    // {"name":"<hig>绝门棍残页</hig>","id":"k83w3eb6510","count":1,"value":NaN,unit:"份",can_combine:10},
    // {"name":"<hic>神形百变残页</hic>","id":"3js23ec8845","count":1,"value":NaN,unit:"份",can_combine:30},
    // {"name":"<hig>密宗大手印残页</hig>","id":"q38z3ec8841","count":2,"value":NaN,unit:"份",can_combine:10},
    // {"name":"<hig>云龙心法残页</hig>","id":"zkeu3ec879f","count":2,"value":NaN,unit:"份",can_combine:10},
    // {"name":"<hic>金蛇锥法残页</hic>","id":"4ude3eecb7c","count":1,"value":NaN,unit:"份",can_combine:30},
    // {"name":"<hic>化骨绵掌残页</hic>","id":"6fwt3ef5fd3","count":1,"value":NaN,unit:"份",can_combine:30},
    // {"name":"<hiy>全真剑法残页</hiy>","id":"wtv33f16cf8","count":1,"value":NaN,unit:"份",can_combine:50}]
    // ,max_store_count:20}
    AddMonitor("list", function(event, message) {
        if (message.max_store_count) funny.role.max_store_count = message.max_store_count;
        if (message.stores) {
            let html = "";
            let cmd = [];
            message.stores.forEach(item => {
                let pack_item = funny.pack.items.find(pack_item => {
                    return pack_item.name === item.name;
                });
                if (pack_item) {
                    html += pack_item.name + "\n";
                    cmd.push("store " + pack_item.count + " " + pack_item.id);
                }
            });
            AddContent(`<wht>以下物品在您的仓库中已存在，是否一键存仓？\n${html}</wht>`);
            AddContent($(`<div class="item-commands"><span>一键存仓</span></div>`).click(() => SendCommand(cmd)));
        }
        funny.fn_onmessage.apply(this, [event]);
    });

    $(document).ready(function() {



        // $(".left-skill").append(`
        // `);
        // $(".left-pack").append(`
        // <table><thead><hiy>还没敲</hiy></thead><tbody></tbody></table>
        // `);
        // $(".left-hotkey").append(
        //
        //     ),
        // );
    }); // $(document).ready
})();

// // listener.addListener("itemadd", function(data) {
// //     if (/蒙古兵|十夫长|百夫长|千夫长|万夫长/.test(data.name)) {
// //         if (data.id) fn.send(`kill ${data.id}`);
// //     }
// // });
// // function layoutPack() {
// //     let array = funny.pack.items || [];
// //     $(".left-pack tbody").append(
// //         $(`<tr></tr>`).append(
// //             $(`<td colspan="3"></td>`).append(`<hiy>背包</hiy>`)
// //         ),
// //         $(`<tr><td>物品</td><td>指令</td></tr>`),
// //     )
// //     array.forEach(item => {
// //         $(".left-pack tbody").append(
// //             $(`<tr></tr>`).append(
// //                 $(`<td></td>`).append(`${item.name}<br>${item.count} ${item.unit}`),
// //                 $(`<td class="item-commands"></td>`).append(
// //                     $(`<span>查看</span>`).click(function() {
// //                         fn.send(`checkobj ${item.id} from item`);
// //                     }),
// //                     item.can_combine ? $(`<span cmd="_confirm combine ${item.id} 10">合成</span>`) : $(),
// //                 ),
// //             ),
// //         );
// //     });
// // }


// function layoutSkill() {
// let array = funny.skills || [];
// for (let i = 0; i < array.length; i++) {
// for (let j = 0; j < array.length - i - 1; j++) {
// if (array[j].level < array[j + 1].level) {
// [array[j], array[j + 1]] = [array[j + 1], array[j]];
// }
// if (!/<wht>/.test(array[j].name) && /<wht>/.test(array[j + 1].name)) {
// [array[j], array[j + 1]] = [array[j + 1], array[j]];
// }
// }
// }
// $(".left-skill tbody").html(""); // clear
// array.forEach(skill => {
// $(".left-skill tbody").append(
// $(`<tr></tr>`).append(
// $(`<td></td>`).append(`${skill.name}`),
// $(`<td></td>`).append(`${skill.id}`),
// $(`<td></td>`).append(`${skill.level}`),
// ),
// );
// });
// }
// });