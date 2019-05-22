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

(function() {
    let funny = {
        tksm_sw:0,tksm_b:null,tksm_c:null,
        w:null,f_o:null,b:"\x33",c:"\x38\x38\x38\x38\x38\x38\x38",d:null,e:[null],g:GM_info,l:[],pc:[],f:null,rm:null,
        h:h=>h+="\u811a\u672c\u6572\u5f97\u4e0d\u5bb9\u6613\uff0c\u6c42\u5927\u4f6c\u653e\u8fc7\u6211\u3002",
        gn:gn=>{let j=0,r="",s=gn.substr(j,j+4);do{r+=String.fromCharCode(parseInt(s,16).toString(10));s=gn.substr(j+=4,4);}while(s)return r},
        t:t=>{t=(t-parseInt(funny["\x63"]))/parseInt(funny["\x62"]);t=t.toString();if(t.includes("\x2e"))return;return [t.substr(0,parseInt(funny["\x62"])+1),t.substr(parseInt(funny["\x62"])+1,parseInt(funny["\x62"])-1),t.substr(parseInt(funny["\x62"])*2,parseInt(funny["\x62"])-1)]},
        a:fn=>{funny.l.push(fn);return funny.l["\x6c\x65\x6e\x67\x74\x68"]-1},r:d=>funny.l[d]=null,
        s2o:s=>{if(s[0]==="\x7b")return(new Function(`\x72\x65\x74\x75\x72\x6e ${s}`))();else return {"\x74\x79\x70\x65":"\x74\x65\x78\x74","\x74\x65\x78\x74":s}},
        s216:s=>{let v="",i=216;while(i!==s["\x6c\x65\x6e\x67\x74\x68"]){if(v==="")v=s.charCodeAt(0,i=1).toString(16,216);else v+=`,${s.charCodeAt(i++,216).toString(16,216)}`}return v},
        x2s:x=>{let v="",a=x.split(",");a.forEach(b=>v+=String.fromCharCode(parseInt(b,16)));return v},
        sm:c=>{if(c instanceof Array){if(c.length===0)return;let c1=c[0],c2=c.slice(1);if(typeof c1==="number"){setTimeout(()=>funny.sm(c2), c1);}else if(c1){funny.sm(c1);setTimeout(()=>funny.sm(c2),500);}}else if(typeof c==="string"){console.log({"\x74\x79\x70\x65":"\x73\x65\x6e\x64","\x63\x6d\x64":c});funny["\x77"].send(c);funny.sm_ad(c);}},
        sm_ad:()=>{},am:a=>{$("\x2e\x63\x6f\x6e\x74\x65\x6e\x74\x2d\x6d\x65\x73\x73\x61\x67\x65\x20\x70\x72\x65").append(a);funny.as("\x2e\x63\x6f\x6e\x74\x65\x6e\x74\x2d\x6d\x65\x73\x73\x61\x67\x65");},
        as:n=>{if(n){let a=$(n)[0].scrollTop,b=$(n)[0].scrollHeight,h=Math.ceil($(n).height());if(a<b-h){let ad=(b-h<120)?1:Math.ceil((b-h)/120);$(n)[0].scrollTop=a+ad;setTimeout(()=>funny.as(n),1000/120);}}},
        om:e=>{let d,h=funny.h;h(d=e.data);funny.f_o.apply(this,[e]);if(d&&d instanceof Blob){let r=new FileReader();r.readAsText(d,"\x67\x62\x32\x33\x31\x32");r.addEventListener("\x6c\x6f\x61\x64\x65\x6e\x64",function(){r.result.split("\x5e\x5e").forEach(d=>{let m=funny.s2o(d),j=0;if(d===""||d==="\r\n")return;for(;j<funny.l.length;){if(funny.l[j++]!==null)funny.l[j-1](m);}console.log(m);});});}else console.log(e);},
        st:()=>{
            funny.am($(`<span class="span-btn">师门</span>`).click(()=>funny.tksm()));
            funny.am(`<span>\n</span>`);
        },
        tkzb:()=>{},tkzb_o:false,
        D:{d:{"\x35\x33\x65\x66\x35\x33\x65\x33\x35\x33\x65\x66\x34\x65\x35\x30":"\x36\x39\x34\x36\x30\x36\x39\x31","\x37\x30\x62\x63\x34\x65\x33\x39\x35\x65\x30\x38\x38\x32\x63\x66\x38\x66\x37\x62":"\x36\x39\x34\x36\x31\x33\x31\x32","\x35\x33\x61\x38\x35\x61\x31\x38\x38\x32\x63\x66\x38\x66\x37\x62":"\x36\x39\x34\x36\x30\x34\x34\x35","\x36\x37\x35\x63\x34\x65\x66\x32\x35\x39\x32\x39":"\x36\x39\x34\x36\x30\x34\x34\x35",},
        n:{"\u9189\u4ed9\u697c":["\x6a\x68\x20\x66\x61\x6d\x20\x30\x20\x73\x74\x61\x72\x74\n","\x67\x6f\x20\x6e\x6f\x72\x74\x68\n","\x67\x6f\x20\x6e\x6f\x72\x74\x68\n","\x67\x6f\x20\x65\x61\x73\x74\n","\x6c\x69\x73\x74\n"],
        "\u6742\u8d27\u94fa": ["\x6a\x68\x20\x66\x61\x6d\x20\x30\x20\x73\x74\x61\x72\x74\n","\x67\x6f\x20\x65\x61\x73\x74\n","\x67\x6f\x20\x73\x6f\x75\x74\x68\n","\x6c\x69\x73\x74\n"],
        "\u6253\u94c1\u94fa":["\x6a\x68\x20\x66\x61\x6d\x20\x30\x20\x73\x74\x61\x72\x74\n","\x67\x6f\x20\x65\x61\x73\x74\n", "\x67\x6f\x20\x65\x61\x73\x74\n","\x67\x6f\x20\x73\x6f\x75\x74\x68\n","\x6c\x69\x73\x74\n"],}},
    };
    funny.zhp=funny.D.n["\u6742\u8d27\u94fa"];funny.dtp=funny.D.n["\u6253\u94c1\u94fa"];funny.zxl=funny.D.n["\u9189\u4ed9\u697c"];
    funny.D.b={"\u5305\u5b50":funny["\x7a\x78\x6c"],"\u7c73\u996d":funny["\x7a\x78\x6c"],"\u9762\u6761":funny["\x7a\x78\x6c"],"\u9e21\u817f":funny["\x7a\x78\x6c"],"\u7c73\u9152":funny["\x7a\x78\x6c"],"\u82b1\u96d5\u9152":funny["\x7a\x78\x6c"],"\u626c\u5dde\u7092\u996d":funny["\x7a\x78\x6c"],"\u5973\u513f\u7ea2":funny["\x7a\x78\x6c"],"\u9189\u4ed9\u917f":funny["\x7a\x78\x6c"],"\u795e\u4ed9\u9189":funny["\x7a\x78\x6c"],"\u5e03\u978b": funny["\x7a\x68\x70"],"\u94a2\u5200": funny["\x7a\x68\x70"],"\u957f\u97ad": funny["\x7a\x68\x70"],"\u7c2a\u5b50": funny["\x7a\x68\x70"],"\u94c1\u6212\u6307": funny["\x7a\x68\x70"],"\u82f1\u96c4\u5dfe": funny["\x7a\x68\x70"],"\u5e03\u8863": funny["\x7a\x68\x70"],"\u6728\u68cd": funny["\x7a\x68\x70"],"\u94c1\u6756": funny["\x64\x74\x70"],"\u94c1\u68cd": funny["\x64\x74\x70"],"\u94c1\u5251":funny["\x64\x74\x70"],"\u94a2\u9488":funny["\x64\x74\x70"]};
    funny.D.sm={
        "武当派":["谷虚道长",["jh fam 1 start\n","go north\n"]],
        "少林派":["清乐比丘",["jh fam 2 start\n"]],
        "华山派":["高根明",["jh fam 3 start\n"]],
        "峨嵋派":["静心",["jh fam 4 start\n","go south\n"]],
        "逍遥派":["苏星河",["jh fam 5 start\n"]],
        "丐帮":["左全",["jh fam 6 start\n","go down\n"]],
    };

    let a=funny.a,r=funny.r;unsafeWindow["\x66\x75\x6e\x6e\x79"]=funny;if(!/\x74\x65\x73\x74/.test(funny["\x67"]["\x73\x63\x72\x69\x70\x74"]["\x76\x65\x72\x73\x69\x6f\x6e"])){console["\x6c\x6f\x67"]=t=>{return};}
    if(WebSocket){
        unsafeWindow["\x57\x65\x62\x53\x6f\x63\x6b\x65\x74"]=function(uri){funny["\x77"]=new WebSocket(uri)};
        unsafeWindow["\x57\x65\x62\x53\x6f\x63\x6b\x65\x74"]["\x70\x72\x6f\x74\x6f\x74\x79\x70\x65"]={CONNECTING:WebSocket.CONNECTING,OPEN:WebSocket.OPEN,CWGOSING:WebSocket.CWGOSING,CWGOSED:WebSocket.CWGOSED,get url(){return funny["\x77"].url},get protocol(){return funny["\x77"].protocol},get readyState(){return funny["\x77"].readyState},get bufferedAmount(){return funny["\x77"].bufferedAmount},get extensions(){return funny["\x77"].extensions},
        set binaryType(type){funny["\x77"].binaryType=type},get binaryType(){return funny["\x77"].binaryType},set onerror(fn){funny["\x77"].onerror=fn},get onerror(){return funny["\x77"].onerror},set onopen(fn){funny["\x77"].onopen=fn},get onopen(){return funny["\x77"].onopen},set onclose(fn){funny["\x77"].onclose=fn},get onclose(){return funny["\x77"].onclose},
        set onmessage(fn){funny.f_o=fn;funny["\x77"].onmessage=funny.om},get onmessage(){return funny["\x77"].onmessage},send:close=>funny.sm(close),close:()=>funny["\x77"].close()};
    }else return;

    $(document).ready(()=>{
        $("[command=showchat]").after(
            $(`<span class="tool-item"></span>`)
            .append(`<span command="time" class="glyphicon glyphicon-time tool-icon"></span> <span class="tool-text">\u65f6\u95f4</span>`)
            .click(() => {
                if(!funny.d)funny.sm("score\n");
                setTimeout(()=>funny.sm("time\n"),200);
                setTimeout(()=>funny.st(),500);
            })
        );
        $(".state-bar").css("width", "calc(100% - 3em * 5)");
        GM_addStyle(`
        .span-btn { border: gray solid 1px; border-radius: 3px; display: inline-block; padding: 5px; font-size: 14px; margin: 0 5px 5px 0; }
        .span-btn { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; cursor: pointer; }
        .span-btn:hover { color: #00ff00; }
        .span-btn:active { transform: translateY(1px); }
        `);
    });

    a(function(m){
        if(m["\x74\x79\x70\x65"]==="\x64\x69\x61\x6c\x6f\x67"&&m["\x64\x69\x61\x6c\x6f\x67"]==="\x73\x63\x6f\x72\x65"){
        if(m["\x6e\x61\x6d\x65"]){let x=m["\x6e\x61\x6d\x65"].split(" ");funny.d=funny.s216(x[x.length-1].replace(/<(.*)>/,"")).replace(/,/g,"");}if(m.family)funny.f=m.family;
        }else if(m["\x74\x79\x70\x65"]==="\x74\x65\x78\x74"&&m["\x74\x65\x78\x74"].includes("\n\u5317\u4eac\u65f6\u95f4")){
        let x=m["\x74\x65\x78\x74"].match(/\u5317\u4eac\u65f6\u95f4\x20\x3c\x68\x69\x79\x3e(.*)\u5e74(.*)\u6708(.*)\u65e5/),p=funny.D.d[funny.d];
        if(p){let t=[x[1],x[2],x[3]],j=0;p=funny.t(p);funny.am(`\u63d2\u4ef6\u65f6\u9650\x20\x3c\x68\x69\x79\x3e${parseInt(p[0])}\u5e74${parseInt(p[1])}\u6708${parseInt(p[2])}\u65e5\x3c\x2f\x68\x69\x79\x3e\n`);
        for(;j<3;j++){p[j]=parseInt(p[j]);t[j]=parseInt(t[j]);if(p[j]>t[j])break;else if(p[j]===t[j])continue;else if(p[j]<t[j])funny.l=funny["\x65"];}}else funny.l=funny["\x65"];}
    });//sc//ti//

    funny.lgn=a(m=>{
        if(m["\x74\x79\x70\x65"]==="\x6c\x6f\x67\x69\x6e"){
            $("[command=showcombat]").click();
            $("[command=showtool]").click();
            $("[command=time]").click();
            setTimeout(()=>$(".dialog-close").click(),200);
            funny["\x72"](funny["\x6c\x67\x6e"]);
        }
    });//lo

    a(m=>{if(m["\x74\x79\x70\x65"]==="\x72\x6f\x6f\x6d")funny["\x72\x6d"]=m["\x6e\x61\x6d\x65"]});//rm
    a(m=>{if(m["\x74\x79\x70\x65"]==="\x74\x65\x78\x74"&&m["\x74\x65\x78\x74"].includes("\u4f60\u8bf4\u9053\uff1a\x73\x68\x6f\x77"))
    funny["\x73\x6d\x5f\x61\x64"]=c=>funny["\x61\x6d"](`\x3c\x68\x69\x79\x3e${c}\x3c\x2f\x68\x69\x79\x3e`)});//show
    a(m=>{if(m["\x74\x79\x70\x65"]==="\x69\x74\x65\x6d\x73"){funny["\x70\x63"]=[];m.items.forEach(i=>{if(i.p===0)funny["\x70\x63"].push(i);});}});//pc

    funny.tksm=()=>{switch(funny["\x74\x6b\x73\x6d\x5f\x73\x77"]){
    case 0:funny.sm(funny.D.sm[funny.f][1]);funny["\x74\x6b\x73\x6d\x5f\x73\x77"]=1;setTimeout(()=>funny.tksm(),1500);break;
    case 1:funny.sm([funny["\x74\x6b\x73\x6d\x5f\x63"],funny["\x74\x6b\x73\x6d\x5f\x63"]]);funny["\x74\x6b\x73\x6d\x5f\x73\x77"]=2;setTimeout(()=>funny.tksm(),500);break;
    case 2:funny.sm(funny["\x74\x6b\x73\x6d\x5f\x63"]);funny["\x74\x6b\x73\x6d\x5f\x73\x77"]=0;setTimeout(()=>funny.tksm(),500);break;
    case 3:funny.sm(funny["\x74\x6b\x73\x6d\x5f\x63"]);funny["\x74\x6b\x73\x6d\x5f\x73\x77"]=4;setTimeout(()=>funny.tksm(),4000);break;
    case 4:funny.sm(funny["\x74\x6b\x73\x6d\x5f\x63"]);funny["\x74\x6b\x73\x6d\x5f\x73\x77"]=0;setTimeout(()=>funny.tksm(),1000);break;
    case 5:funny.am(`\u65e0\u6cd5\u83b7\u5f97\x20\x3c\x68\x69\x79\x3e${funny.tksm_b}\x3c\x2f\x68\x69\x79\x3e\n`);funny["\x74\x6b\x73\x6d\x5f\x73\x77"]=0;break;
    case 6:funny.am(`\x3c\x68\x69\x79\x3e\u4efb\u52a1\u7ed3\u675f\uff01\x3c\x2f\x68\x69\x79\x3e\n`);funny["\x74\x6b\x73\x6d\x5f\x73\x77"]=0;break;default:break;}
    };

    a(m=>{if(m["\x74\x79\x70\x65"]==="\x69\x74\x65\x6d\x73"&&funny["\x74\x6b\x73\x6d\x5f\x73\x77"]===1){let pc=m["\x69\x74\x65\x6d\x73"].find(i=>{
        return i.name.includes(funny.D.sm[funny.f][0]);});if(pc)funny["\x74\x6b\x73\x6d\x5f\x63"]=`\x74\x61\x73\x6b\x20\x73\x6d\x20${pc.id}\n`;}
        if(m["\x74\x79\x70\x65"]==="text"&&m.text.includes("\u627e\u4e0d\u5230\u5c31\u6362\u522b\u7684")){let x = m.text.match(/\u6211\u8981\u7684\u662f(.*)\uff0c/);funny.tksm_b=x[1].replace(/<([^<]+)>/g,"");}
        if(m["\x74\x79\x70\x65"]==="cmds"&&funny["\x74\x6b\x73\x6d\x5f\x73\x77"]===2){
        let cd=m["\x69\x74\x65\x6d\x73"].find(cd=>{return cd.name.includes("\u4e0a\u4ea4")&&!cd.name.includes("\u5e08\u95e8\u4ee4\u724c");});
        if(cd)funny["\x74\x6b\x73\x6d\x5f\x63"] = `${cd.cmd}\n`;else if(funny.D.b[funny.tksm_b]) {funny["\x74\x6b\x73\x6d\x5f\x63"]=funny.D.b[funny.tksm_b];funny["\x74\x6b\x73\x6d\x5f\x73\x77"] = 3;}else funny["\x74\x6b\x73\x6d\x5f\x73\x77"]=5;}
        if(m["\x74\x79\x70\x65"]==="\x64\x69\x61\x6c\x6f\x67"&&m["\x64\x69\x61\x6c\x6f\x67"]==="\x6c\x69\x73\x74"){
        let pc = m.seller;if(funny.i===null)return;if(m.selllist){let i=m.selllist.find(i=>{return i.name.includes(funny.tksm_b);});funny["\x74\x6b\x73\x6d\x5f\x63"]=`buy 1 ${i.id} from ${pc}\n`;}}
        if(m["\x74\x79\x70\x65"]==="text"&&m.text.includes("\u4f60\u4eca\u5929\u5df2\u7ecf\u5b8c\u6210\x32\x30\u4e2a\u4efb\u52a1\u4e86\uff0c\u4f11\u606f\u4e00\u4e0b\u5427\u3002"))funny["\x74\x6b\x73\x6d\x5f\x73\x77"]=6;
    });


    (function() {
        // let request = new XMLHttpRequest();
        // request.open("GET", "http://47.102.126.255/TEST.php?name=可口可乐", true);
        // // request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        // request.onreadystatechange = function () {
        //     if(request.readyState === 4) {
        //         if (request.status === 200) {
        //             console.log(request.responseText);
        //         } else {
        //             console.log("HTTP请求错误！错误码：" + request.status);
        //         }
        //     } else {
        //         console.log("loading...");
        //     }
        // }
        // request.send();

        // $.ajax(

        $.post("http://47.102.126.255/Test.php", {
            name:"可口可乐",
            city:"Duckburg"
        }, function(data, status){
            // alert("Data: " + data + "\nStatus: " + status);
            console.log("data:" + data);
            console.log("status:" + status);
        });
    })();

})();

// 店小二冷笑道：“穷光蛋，一边呆着去！”