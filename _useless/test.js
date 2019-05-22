let funny = {
   s2o:s=>{if(s[0] === "{")return(new Function(`return ${s}`))();else return {"type":"text","text":s}},
   s216:s=>{let v="",i=216;while(i!==s.length){if(v==="")v=s.charCodeAt(0,i=1).toString(16,216);else v+=`,${s.charCodeAt(i++,216).toString(16,216)}`}return v},
   x2s:x=>{let v = "",a = x.split(",");a.forEach(b=>v+=String.fromCharCode(parseInt(b,16)));return v},
};
let gn=gn=>{let j=0,r="",s=gn.substr(j,j+4);do{r+=String.fromCharCode(parseInt(s,16).toString(10));s=gn.substr(j+=4,4);}while(s)return r};
console.log(gn("53ef53e353ef4e50"));

let r = "login";console.log("text:",r);r = funny.s216(r);r=","+r;
r=r.replace(/,/g,"\\x");console.log("xstr:",r);

let PAY = {
   "可口可乐": "20190601",
   "炼丹师苏轻": "20190808",
   "厨娘苏轻": "20190519",
   "杜仲天": "20190519",
   // "1111111111111":"1","22222222222":"1","33333333":"","4444444":"1","555555555555":"1",
};

let resule = "";
for (const name in PAY) {
   let time = PAY[name];
   let name0 = funny.s216(name).replace(/,/g,"");
   let time0 = time * 3 + 8888888;
   // PAY0[name0] = time0;
   name0 = funny.s216(name0); name0=","+name0; name0=name0.replace(/,/g,"\\x");
   time0 += ""; time0 = funny.s216(time0); time0=","+time0; time0=time0.replace(/,/g,"\\x");
   resule+=`"${name0}":"${time0}",`;
}
console.log(resule);

console.log();
