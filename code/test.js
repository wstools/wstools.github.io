// let role = {};
// let role_handler = {
//     set: function(obj, prop, value) {
//         if (prop === "lianxi") {
//             obj["l"] = value;
//             return;
//         }

//         obj[prop] = value;
//     },
//     get: function(obj, prop){
//         if (prop in obj) {
//             return null;
//         } else {
//             return obj[prop];
//         }
//     }
// };
// let role_proxy = new Proxy(role, role_handler);



// role_proxy.lianxi = 1;
// console.log(role);

// console.log(role_proxy);
// console.log(JSON.stringify(role_proxy));

// function Money2Str(number) {
//     let str = "" + number;
//     let c = str.substring(str.length - 2, str.length);
//     if (c) c = c + "个<yel>铜板</yel>";
//     let b = str.substring(str.length - 4, str.length - 2);
//     if (b) b = b + "两<wht>白银</wht>";
//     let a = str.substring(0, str.length - 4);
//     if (a) a = a + "两<hiy>黄金</hiy>";
//     return "<hiw>" + a + b + c + "</hiw>";
// }

// console.log(Money2Str( ));



// let data = {
//     "roleid": {
//         id: "",
//         name: "",
//         level: "", level_value: 0,
//     }
// }


// let tn = {
//     "type":"dialog",
//     "dialog":"list",
//     "selllist":
//     [
//         {"name":"<hig>玄晶</hig>","id":"squ93f482bc","count":23,"value":10000,unit:"块"},
//         {"name":"<hio>命中之石</hio>","id":"sv2p3f482bc","count":1,"value":100000000,unit:"块"},
//         {"name":"<hig>碎裂的红宝石</hig>","id":"9i1m3f482bc","count":1,"value":10000,unit:"块"},
//         {"name":"<hiy>朱果</hiy>","id":"plwj3f482bc","count":1,"value":2000000,unit:"颗"},
//         {"name":"<hic>潜灵果</hic>","id":"6tqp3f482bc","count":1,"value":1000000,unit:"颗"},
//         {"name":"<hiy>泰山剑法残页</hiy>","id":"huca3f482bc","count":1,"value":2000000,unit:"份"},
//         {"name":"<hig>金雁功残页</hig>","id":"xszc3f482bc","count":1,"value":100000,unit:"份"},
//         {"name":"<hio>不老长春功残页</hio>","id":"scc93f482bc","count":1,"value":10000000,unit:"份"}
//         ],
//     title:"唐楠正在贩卖以下物品：",
//     seller:"301r3ccdda4"
// };

// let dxe = {
//     "type":"dialog",
//     "dialog":"list",
//     "selllist":
//     [
//         {"name":"<wht>米饭</wht>","id":"zt3m3ccdda4","count":-1,"value":200,unit:"碗"},
//         {"name":"<wht>包子</wht>","id":"jl7v3ccdda4","count":-1,"value":100,unit:"个"},
//         {"name":"<wht>鸡腿</wht>","id":"ujwo3ccdda4","count":-1,"value":200,unit:"个"},
//         {"name":"<wht>面条</wht>","id":"t2oz3ccdda4","count":-1,"value":200,unit:"碗"},
//         {"name":"<wht>扬州炒饭</wht>","id":"l2he3ccdda4","count":-1,"value":500,unit:"碗"},
//         {"name":"<wht>米酒</wht>","id":"h7xo3ccdda4","count":-1,"value":200,unit:"壶"},
//         {"name":"<wht>花雕酒</wht>","id":"cdwc3ccdda4","count":-1,"value":400,unit:"壶"},
//         {"name":"<wht>女儿红</wht>","id":"4fp53ccdda4","count":-1,"value":1000,unit:"壶"},
//         {"name":"<hig>醉仙酿</hig>","id":"j68w3ccdda4","count":-1,"value":10000,unit:"壶"},
//         {"name":"<hiy>神仙醉</hiy>","id":"gg593ccdda4","count":-1,"value":100000,unit:"壶"}
//     ],
//     title:"店小二正在贩卖以下物品：",
//     seller:"wzjc3ccdda4"
// };

// //进出困难缥缈
// let cmd = [];
// for (let i = 0; i < 12; i++) {
//     cmd.push("jinglian 0b3m3eb5529 ok");
// }
// funny.SendCommand(cmd);


// var formData = new FormData();
// formData.append('tel', '18217767969');
// // formData.append('psw', '111111');

// // console.log(formData);



// function SendCommand(command) {//发送
//     if (command instanceof Array) {
//         let cmd = command.splice(0, 1)[0];
//         if (typeof cmd === "number") {
//             setTimeout(() => SendCommand(command), cmd);
//         } else if (cmd) {
//             SendCommand(cmd);
//             SendCommand(command);
//         }
//     } else if (typeof command === "string") {
//         console.log(command);
//     }
// }


// let test = ["1", "2"];
// SendCommand(test);

// console.log([].splice(0, 1)[0]);

let a = [1, 2, 1, 2, 3];

function test(a) {
    let b = [];
    for (let i = 0; i < a.length; i++) {
        let n = a[i];
        b[n] = b[n] || 0;
        b[n] ++;
    }

    let index = b.findIndex(n => {
        return n === 1;
    });

    return index;
}

test(a);


function test2(a) {
    let b = 0;
    for (let i = 0; i < a.length; i++) {
        b ^= a[i];
    }
    return b;
}

test2(a);