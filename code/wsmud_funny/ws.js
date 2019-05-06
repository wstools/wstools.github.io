(function () {
    "use strict"
    var GameClient;
    var SelectedServer;
    $(function () {
        $(".login-content").on("click", ".panel_item", LoginCommand);
        $(".container").on("click", ContainerCommand);
        $(".role-list").on("click", ".role-item", function () {
            $(this).parent().find(".select").removeClass("select");
            $(this).addClass("select");
        });
        $(".channel-box").on("click", "span", ChannelChanged);
        $(".combat-commands").on("click", ".pfm-item", Combat.Perform);
        $(".sender-box").on("keyup", OnSendBoxKeyDown);
        $(".room_items").on("click", ".room-item", Process.selectItem);
        $(".right-bar,.bottom-bar").on("click", ".tool-item", MenuClick);
        $(".map-panel").on("click", function () {
            this.last_click = this.last_click || 0;
            if (Date.now() - this.last_click > 500) {
                this.last_click = Date.now();
                return;
            }
            Dialog.show("map");
        });
        $(".sender-btn").on("click", SendChatMessage);
        $(".room_exits").on("mousedown", Process.before_click_exits).on("mouseup", Process.click_exits);
        $(".room-title>.map-icon").on("click", function () {
            MAP.LoadMap();
        });
        $(".validnum-box>.validnum-btn").on("click", SendValidateCode);
        Process.init();

        CheckLogin();
    });

    function CheckLogin() {
        var key = GetUserCookie("p");
        if (!key) {
            return $("#login_panel").show();
        }
        ShowServers();
    }
    function is_weixin() {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == "micromessenger") {
            return true;
        } else {
            return false;
        }
    }
    function LoginCommand(e) {
        var cmd = $(this).attr("command");
        switch (cmd) {
            case "ToRolePanel":
                HideAndShow($("#role_panel"));
                break;
            case "ToServerPanel":
                HideAndShow($("#slist_panel"));
                break;
            case "ToLogin":
                HideAndShow($("#login_panel"));
                break;
            case "ToRegist":
                HideAndShow($("#regist_panel"));
                break;
            case "Forget":
                HideAndShow($("#reset_panel"));
                break;
            case "CancleRegist":
                HideAndShow($("#login_panel"));
                break;
            case "Down":
                HideAndShow($("#download"));
                break;

            default:
                LoginMethods[cmd]();
                break;
        }
    }
    var LoginMethods = {
        ToUpdate: function () {
            HideAndShow("#pwd_panel");
            API.UserAPI.GetPhone(function (x) {
                if (x) {
                    $("#pwd_phone").prop("disabled", true).val(x);
                    $("#pwd_bind").show();
                } else {
                    $("#pwd_phone").prop("disabled", false).val("");
                    $("#pwd_bind").hide();
                }
            });
        },
        ResetPwd: function () {
            var name = $("#reset_name").val();
            if (!name) return ShowInputError("#reset_name", "请输入用户名");
            if (!/^[a-z0-9]{5,15}$/.test(name)) return ShowInputError("#reset_name", "用户名格式错误,需要5-15位字母开头的字母，数字或下划线，不区分大小写");
            var phone = $("#reset_phone").val();
            if (!phone) return ShowInputError("#reset_phone", "请输入你的帐号绑定的手机号码");
            if (!/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/.test(phone)) return ShowInputError("#reset_phone", "手机号码格式错误");
            var valid_no = $("#reset_no").val();
            if (!valid_no) return ShowInputError($("#reset_no").parent(), "请输入你接收到的六位验证码");
            if (!/^\d{6}$/.test(valid_no)) return ShowInputError($("#reset_no").parent(), "请输入六位数字的验证码");
            var pwd1 = $("#reset_pwd1").val();
            if (!pwd1) return ShowInputError("#reset_pwd1", "请输入你的新密码");
            var pwd2 = $("#reset_pwd2").val();
            if (!pwd2) return ShowInputError("#reset_pwd2", "请重复输入你的新密码");
            if (pwd2.length < 6 || pwd2.length > 20) return ShowInputError("#update_pwd2", "密码长度在6到20之间");
            if (pwd2 != pwd1) return ShowInputError("#reset_pwd2", "两次密码输入不一致");
            ShowLoader("正在修改密码", "#reset_panel");
            API.UserAPI.ResetPasswordByPhone(name, phone, valid_no, pwd1, function (x) {
                if (!x) {
                    HideAndShow("#login_panel");
                } else {
                    ShowInputError("#reset_pwd2", x);
                    HideAndShow("#reset_panel");
                }
            });
        }, BindPhone: function () {
            HideAndShow("#bind_panel");
            API.UserAPI.GetPhone(function (x) {
                if (x) {
                    $("#phone_no").prop("disabled", true).val(x);
                    $("#phone_no").prev().html("你已绑定手机，再次验证会取消绑定");
                    $("#phone_no").parent().next().find('span:last()').html("解除绑定");
                } else {
                    $("#phone_no").prop("disabled", false).val("");
                    $("#phone_no").prev().html("你要绑定的手机");
                    $("#phone_no").parent().next().find('span:last()').html("绑定");
                }
            });
        }, CheckValid: function () {
            var phone = $("#phone_no");
            var phone_no = "";
            if (!phone.is(":disabled")) {
                phone_no = phone.val();
                if (!phone_no) return ShowInputError("#phone_no", "请输入你的帐号绑定的手机号码");
                if (!/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/.test(phone_no)) return ShowInputError("#reset_phone", "手机号码格式错误");
            }
            var valid_no = $("#phone_valid").val();
            if (!valid_no) return ShowInputError($("#phone_valid").parent(), "请输入你接收到的六位验证码");
            if (!/^\d{6}$/.test(valid_no)) return ShowInputError($("#phone_valid").parent(), "请输入六位数字的验证码");
            API.UserAPI.BindPhone(valid_no, phone_no, function (x) {
                if (x) {
                    ShowInputError($("#phone_valid").parent(), x);
                    HideAndShow("#bind_panel");
                } else {
                    HideAndShow("#role_panel");
                }
            });
        }

        , ReLogin: function () {
            HideAndShow($("#login_panel"));
            var myDate = new Date();
            myDate.setTime(-1000);//设置时间
            var data = document.cookie;
            var dataArray = data.split("; ");
            for (var i = 0; i < dataArray.length; i++) {
                var varName = dataArray[i].split("=");
                document.cookie = varName[0] + "=''; expires=" + myDate.toGMTString();
            }
        }, UpdatePwd: function () {
            var pwd1 = $("#update_pwd1").val();
            var pwd2 = $("#update_pwd2").val();
            var pwd3 = $("#update_pwd3").val();
            if (pwd1.length < 6 || pwd1.length > 20) return ShowInputError("#update_pwd1", "密码长度在6到20之间");
            if (pwd2.length < 6 || pwd2.length > 20) return ShowInputError("#update_pwd2", "密码长度在6到20之间");
            if (pwd3 != pwd2) return ShowInputError("#update_pwd3", "两次密码输入不一致");
            var valid_no;
            if ($("#pwd_bind").is(":visible")) {
                valid_no = $("#pwd_no").val();
                if (!valid_no) return ShowInputError($("#pwd_no").parent(), "请输入你接收到的六位验证码");
                if (!/^\d{6}$/.test(valid_no)) return ShowInputError($("#pwd_no").parent(), "请输入六位数字的验证码");
            }


            ShowLoader("正在修改密码", "#pwd_panel");
            API.UserAPI.ChangePassword(pwd1, pwd2, valid_no, function (x) {
                if (x.code) {
                    HideAndShow($("#role_panel"));
                } else {
                    ShowInputError("#update_pwd1", x.message || '修改失败');
                    HideAndShow("#pwd_panel");
                }
            });
        }, LoginIn: function () {
            var name = $("#login_name").val().toLowerCase();
            var pwd = $("#login_pwd").val();
            if (!name) return ShowInputError("#login_name", "请输入用户名");
            if (!/^[a-z0-9]{5,15}$/.test(name)) return ShowInputError("#login_name", "用户名格式错误,需要5-15位字母开头的字母，数字或下划线，不区分大小写");
            if (!pwd) return ShowInputError("#login_pwd", "请输入密码");
            if (pwd.length < 6 || pwd.length > 20) return ShowInputError("#login_pwd", "密码长度在6到20之间");
            ShowLoader("正在登录", "#login_panel");
            API.UserAPI.Login(name, pwd, function (x) {
                if (x.code) {
                    ShowServers();
                } else {
                    ShowInputError("#login_name", x.message || '登陆失败');
                    HideAndShow("#login_panel");
                }
            });
        }, SelectServer: function () {
            if (!SERVERS) return;
            var index = parseInt($(".server-list>.select").attr("index"));
            if (!(index >= 0 && index < SERVERS.length)) {
                return Confirm.Show({ content: "你没有选择要连接的服务器。" });
            }
            var item = SERVERS[index];
            if (!item) {
                Confirm.Show({ content: "你没有选择要连接的服务器。" });
            }
            ShowLoader("正在连接服务器");
            ConnectServer(item);
            SetCookie("s", index);
        }, SelectRole: function () {
            var item = $(".role-list>.select");
            if (!item.length) return;
            var id = item.attr("roleid");
            SendCommand("login " + id);
            ShowLoader("正在进入游戏", "#role_panel");
        },
        CreateRole: function () {
            var player = {};
            //  player.id = $("#reg_id").val();
            player.name = $("#reg_name").val();
            player.gender = $("#gender_0").is(":checked") ? 1 : 2;
            player.str = parseInt($("#reg_str").val());
            player.con = parseInt($("#reg_con").val());
            player.dex = parseInt($("#reg_dex").val());
            player.int = parseInt($("#reg_int").val());

            //  if (!/^[a-z][a-z0-9]{2,9}$/.test(player.id)) return ShowInputError("#reg_id", "ID格式错误");

            if (!/^[\u4E00-\u9FA5]{2,5}$/.test(player.name)) return ShowInputError("#reg_name", "名称格式错误，只能使用2-5位中文字符");
            if (player.str < 15 || player.str > 30) return ShowInputError("#reg_name", "臂力需要在15-30之间");
            if (player.con < 15 || player.con > 30) return ShowInputError("#reg_name", "根骨需要在15-30之间");
            if (player.dex < 15 || player.dex > 30) return ShowInputError("#reg_name", "身法需要在15-30之间");
            if (player.int < 15 || player.int > 30) return ShowInputError("#reg_name", "悟性需要在15-30之间");
            if (player.str + player.con + player.dex + player.int != 80) return ShowInputError("#reg_name", "先天属性需要在15-30之间，并且总和等于80");
            ShowLoader("正在创建角色", "#addrole_panel");
            SendCommand("createrole " + player.name + " " + player.gender + " " + player.str + " " + player.con + " " + player.dex + " " + player.int);
        }, AddRole: function () {
            var count = $(".role-list>.role-item").length;
            if (count > 4) return Confirm.Show({
                content: "你只能最多创建五个角色"
            });
            HideAndShow($("#addrole_panel"));
            RefreshInput("name");
            RefreshInput("prop");
            RefreshInput("id");
        },
        DeleteRole: function () {
            var item = $(".role-list>.select");
            if (!item.length) return;
            var id = item.attr("roleid");
            if (!id) return;
            Confirm.Show({
                content: "是否确认删除角色：" + item.html(),
                onOK: function () {
                    SendCommand("deleterole " + id);
                }
            })
        }, Regist: function () {
            var name = $("#regist_name").val().toLowerCase();
            var pwd = $("#regist_pwd1").val();
            if (!name) return ShowInputError("#regist_name", "请输入用户名");
            if (!/^[a-z0-9]{5,15}$/.test(name)) return ShowInputError("#regist_name", "用户名需要是5-10个英文字符");
            if (!pwd) return ShowInputError("#regist_pwd1", "请输入密码");
            if (pwd.length < 6 || pwd.length > 20) return ShowInputError("#regist_pwd1", "密码长度在6到20之间");
            if (pwd != $("#regist_pwd2").val()) return ShowInputError("#regist_pwd2", "重复密码输入不一致，请重新输入");
            var user = {
                Name: name, PassWord: pwd
            };
            API.UserAPI.Regist(user, function (x) {
                if (x.code) {
                    ShowServers();
                } else {
                    ShowInputError("#regist_name", x.message || '注册失败');
                    HideAndShow("#regist_panel");
                }
            });
        }
    }
    function SendValidateCode() {
        var btn = $(this);
        if (btn.is(":disabled")) return;
        var txt = btn.parent().prev().prev();
        var phone = txt.val();
        if (!txt.is(":disabled")) {
            if (!phone) return ShowInputError(txt, "请输入你的帐号绑定的手机号码");
            if (!/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/.test(phone)) return ShowInputError(txt, "手机号码格式错误");
        } else {
            phone = "";
        }
        API.UserAPI.SendValidateCode(phone, function (x) {
            if (!x) ShowInputError(btn.parent(), "验证码发送失败");
        });
        btn.prop("disabled", true);
        btn.html("120秒后重新发送");
        SetButtonText(0, btn);

    }
    function SetButtonText(index, btn) {
        if (index == 120) {
            btn.prop("disabled", false);
            btn.html("发送验证码");
        } else {
            btn.html((120 - index) + "秒后重新发送");
            index++;
            window.setTimeout(SetButtonText.bind(this, index, btn), 1000);
        }
    }


    function SetCookie(name, value) {
        var d = new Date();
        d.setTime(d.getTime() + (300 * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + "; expires=" + d.toGMTString();
    }


    var SERVERS;
    function ShowServers() {
        if (!SERVERS) {
            ShowLoader("正在获取服务器列表");
            API.UserAPI.GetServer(function (x) {
                if (!x || typeof x == "string") {
                    ShowInputError("#login_pwd", "获取服务器列表出错");
                    return;
                }
                SERVERS = x || [];
                DisplayServer(x);
                ShowServers();
            });
            return;
        }
        var x = SERVERS;
        if (!x || !x.length) {
            HideAndShow("#login_panel");
            ShowInputError("#login_pwd", "获取服务器列表出错");
        } else {
            var sel_ser = GetUserCookie("s");
            var sel_item = sel_ser ? SERVERS[sel_ser] : (x.length == 1 ? SERVERS[0] : null);
            if (sel_item) {
                ShowLoader("正在连接服务器");
                return ConnectServer(sel_item);
            }
            HideAndShow("#slist_panel");
        }
    }

    function DisplayServer() {
        if (!SERVERS) return;

        if (window.location.hostname == "localhost") {
            SERVERS.push({ ID: 99, Name: "本地测试1", IP: "127.0.0.1", Port: 25631 });
            SERVERS.push({ ID: 100, Name: "本地测试2", IP: "127.0.0.1", Port: 25632 });
        }
        var html = [];
        var names = ["武神传说", "武神传说", "武神传说", "武神传说"];
        for (var i = 0; i < SERVERS.length; i++) {
            if (SERVERS[i].IsTest && window.location.search != "?test" && window.location.hostname != "localhost") {
                SERVERS.splice(i, 1);
                continue;
            }
            html.push("<li class='role-item");
            if (i == 0) html.push(" select");
            html.push("' index='" + i + "'>");
            html.push(names[i]);
            html.push("&nbsp;&nbsp;");
            html.push(SERVERS[i].Name);
            if (SERVERS[i].IsRcd) {
                html.push("<span style='color:red;font-size:0.5rem;line-height:2rem;height:2rem;'>&nbsp;（推荐）</span>");
            }
            html.push("</li>");
        }

        $(".server-list").html(html.join("")).on("click", 'li', function () {
            var elem = $(this);
            if (elem.is(".select")) return;
            elem.parent().find(".select").removeClass("select");
            elem.addClass("select");
        });


    }
    function GetUserCookie(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            return unescape(arr[2]);
        else
            return null;
    }
    function ShowRightMenus(btn) {
        var elem = $(".right-bar");
        if (elem.is(".hide")) {
            elem.css("bottom", -135);
            elem.removeClass("hide");
            elem.animate({ bottom: 50 }, "fast");
            $(btn).find("span").removeClass("glyphicon-triangle-top")
                .addClass("glyphicon-triangle-bottom");
        } else {
            elem.animate({ bottom: -135 }, "fast", function () {
                elem.addClass("hide");
            });
            $(btn).find("span").removeClass("glyphicon-triangle-bottom")
                .addClass("glyphicon-triangle-top");
        }
    }

    function ContainerCommand(e) {
        var elem = $(e.target);
        var cmd = elem.attr("cmd");
        if (!cmd) cmd = elem.parent().attr("cmd");
        if (cmd) {
            if (cmd[0] == "_") {
                var str = cmd.split(" ");
                switch (str[0]) {
                    case "_confirm":
                        Confirm.Process(str);
                        break;
                    case "_setting":
                        Setting.save(str[1], str[2]);
                        break;
                    case "_close":
                        Warn.Close(elem);
                        break;
                    case "_hide":
                        Storage.ban_user(str[1]);
                        break;
                }
            } else {
                SendCommand(cmd);
            }
            return false;
        } else {
            if (isShowChat) {
                if (!elem.closest(".chat-panel").length) {
                    $(".chat-panel").addClass("hide");
                    isShowChat = false;
                }
            }
        }
        Confirm.Close();
        return false;
    }

    var LastCommand;
    function SendCommand(cmd) {
        if (IsConnecting) return;
        if (!GameClient || !GameClient.Connected()) {
            LastCommand = cmd;
            ReceiveMessage("<red>连接中断，正在重新连线...</red>");
            ConnectServer(SelectedServer);
            return;
        }

        GameClient.Send(cmd);
    }
    function ChannelChanged() {
        var elem = $(this);
        var ch = elem.attr("channel");
        if (ch == "emote") {
            return ShowEmotePanel();
        }

        if (elem.is(".selected")) return;
        var parent = elem.parent();
        parent.children().removeClass("selected");
        elem.addClass("selected");
        parent.attr("channel", ch);
        $(".sender-box").focus();
        return false;
    }
    function ShowEmotePanel() {
        var panel = $(".channel-emotes");
        if (panel.is(".hide")) {
            panel.removeClass("hide");
            if (!Process.emtoes) {
                SendCommand("emote");
                Process.emtoes = [];
                $(".sender-box").blur();
                panel.on("click", "span", function () {
                    var text = $(this).html();
                    $(".sender-box").val("*" + text).focus();
                    $(".channel-emotes").addClass("hide");
                });
            }
        } else {
            $(".channel-emotes").addClass("hide");
        }
    }
    function MenuClick(item) {
        var cmd = $(this).attr("command");
        if (!cmd) return;
        switch (cmd) {
            case "showtool":
                ToolAction.ShowTools();
                break;
            case "showchat":
                return ShowChat();
            case "showcombat":

                return Combat.Show();
            case "stopstate":
                SendCommand("stopstate");
                break;
            default:
                Dialog.show(cmd);
                break;
        }
    }
    var isShowChat = false;
    function ShowChat() {
        var elem = $(".chat-panel").toggleClass("hide");
        if (!elem.is(".hide")) {
            isShowChat = true;
            elem.find("input").val("").focus();
        } else {
            isShowChat = false;
        }
        return false;
    }

    var ToolAction = {
        Tools: null,
        HideTool: null,
        ToolState: 0,
        ToolOpacity: 0,
        ToolSpeed: 0,
        InitTools: function () {
            if (!this.Tools) {
                var tools = $(".right-bar>.tool-item");
                this.Tools = [];
                for (var i = 0; i < tools.length; i++) {
                    this.Tools.push(tools[i]);
                }
                this.HideTool = $(".br-tool");
            }
        },
        ShowTools: function () {
            this.InitTools();
            if (this.ToolState == 1) return;
            if (this.ToolState == 0) {//显示
                for (var i = 0; i < this.Tools.length; i++) {
                    this.Tools[i].style.display = "";
                    this.Tools[i].style.opacity = 0;
                }
                this.ToolSpeed = 200;
                this.ToolOpacity = 0;
                $(this.HideTool).removeClass("hide-tool");
            } else {//隐藏
                this.ToolOpacity = 100;
                this.ToolSpeed = 100;
                $(this.HideTool).addClass("hide-tool");
            }
            window.setTimeout(this.ShowToolsAnimate.bind(this, this.ToolState), 100);
            this.ToolState = 1;
        },
        ShowToolsAnimate: function (type) {
            if (type == 0) {
                this.ToolOpacity = this.ToolOpacity + this.ToolSpeed;
                var to = this.ToolOpacity;
                for (var i = this.Tools.length - 1; i >= 0; i--) {
                    if (to < 0) this.Tools[i].style.opacity = 0;
                    else if (to > 100) this.Tools[i].style.opacity = 1;
                    else this.Tools[i].style.opacity = to / 100;
                    to -= 20;
                    if (to < 0) break;
                }
                this.ToolOpacity -= 30;
                if (to < 100) {
                    window.setTimeout(this.ShowToolsAnimate.bind(this, type), 100);
                } else {
                    this.ToolState = 2;
                }
            } else {
                this.ToolOpacity = this.ToolOpacity - this.ToolSpeed;
                var to = this.ToolOpacity;
                for (var i = 0; i < this.Tools.length; i++) {
                    if (to < 0) this.Tools[i].style.opacity = 0;
                    else if (to > 100) this.Tools[i].style.opacity = 1;
                    else this.Tools[i].style.opacity = to / 100;
                    to += 20;
                    if (to >= 100) break;
                }
                this.ToolOpacity -= 20;
                if (to >= 0) {
                    window.setTimeout(this.ShowToolsAnimate.bind(this, type), 100);
                } else {
                    this.ToolState = 0;
                    for (var i = 0; i < this.Tools.length; i++) {
                        this.Tools[i].style.display = "none";
                    }
                }
            }
        }, showFlag: function (cmd, val) {
            this.InitTools();
            if (val < 0) val = 0;
            else if (val > 99) val = 99;
            for (var i = 0; i < this.Tools.length; i++) {
                if (this.Tools[i].getAttribute("command") == cmd) {
                    var tool = $(this.Tools[i]);
                    if (val) {
                        tool.find(".tag").html(val).removeClass("hide");
                    } else {
                        tool.find(".tag").addClass("hide");
                    }
                    break;
                }
            }
        }
    }

    var IsConnecting = false;
    function ConnectServer(server, pid) {
        if (IsConnecting) return;

        SelectedServer = server;
        console.log("重新连接", GameClient == null ? "未连接" : "已连接");
        GameClient = new WSClient(server.IP, server.Port);
        IsConnecting = true;
        GameClient.OnError = function (err, o) {
            IsConnecting = false;
            if (err) {
                if (err.isTrusted) err = "服务器没有响应，请稍后重试";
                ShowLoader("<strong>连接失败：</strong>" + err + "");
            }
        }
        GameClient.OnConnect = function () {
            IsConnecting = false;
            if (!pid && !Process.player) {
                ShowLoader('正在获取角色列表...');
                SendCommand(GetUserCookie("u") + " " + GetUserCookie("p"));
            } else {
                if (pid) {
                    SendCommand(GetUserCookie("u") + " " + GetUserCookie("p") + " " + pid + " " + server.ID);

                } else {
                    SendCommand(GetUserCookie("u") + " " + GetUserCookie("p") + " " + Process.player);
                }
            }

        }

        GameClient.OnClose = function (e) {
            IsConnecting = false;
            console.log(this.Port, this.ChangeServer);
            if (this.ChangeServer) {
                this.ChangeServer = false;
                return;
            }
            if (this.Connected()) return;

            if (Process.player) {
                Process.clear();
                ReceiveMessage("<red>你的连接中断了...</red>");
            } else {
                HideAndShow($("#slist_panel"));
            }
        }
        GameClient.OnData = ReceiveData;
        GameClient.OnMessage = ReceiveMessage;
        GameClient.Connect();
    }
    function ShowInputError(inp, msg) {
        $(inp).focus().parent().find(".input-error").remove();

        $("<div class='input-error'>" + msg + "</div>").insertAfter(inp);
    }




    function ShowLoader(msg, elem) {
        var p = $(".login-content").children();
        for (var i = 0; i < p.length; i++) {
            if ($(p[i]).css("display") != "none"
                && !$(p[i]).is(".signinfo")) {
                $(p[i]).hide();
            }
        }
        var loader = $("#loader").css("opacity", 1).show();
        loader.find("#loader_msg").html(msg);
    }

    var MessageContent;
    var MessagePage;
    var MessageCount = 0;
    function ReceiveMessage(x) {

        if (!MessagePage) {
            MessagePage = $("<pre></pre>").appendTo(MessageContent);
        }
        if (MessageCount > 1000) {
            MessageCount = 0;
            MessagePage.empty();
        }
        MessagePage.append(x + "\n");
        MessageCount++;
        if (Process.contentScroll) {
            MessageContent[0].scrollTop = 99999;
        }
    }
    function ReceiveData(data) {
        var func = Process[data.type];
        func && func(data);
    }
    function OnSendBoxKeyDown(e) {
        if (e.keyCode == 13) {
            SendChatMessage();
        }
    }
    function SendChatMessage() {
        var value = $(".sender-box").val();
        if (!value) return;
        if (value.length > 100) return ReceiveMessage("<hir>你输入的内容太多了。</hir>");
        var channel = $(".channel-box").attr("channel");
        $(".sender-box").val("").focus();
        SendCommand(channel + " " + value + "");

    }


    function RefreshInput(type) {
        switch (type) {
            case 'name':
                $("#reg_name").val(create_name($("#gender_0").is(":checked") ? 0 : 1));
                break;
            case 'id':
                $("#reg_id").val(create_id());
                break;
            case 'prop':
                var obj = create_prop();
                $("#reg_str").val(obj.str);
                $("#reg_con").val(obj.con);
                $("#reg_dex").val(obj.dex);
                $("#reg_int").val(obj.int);
                break;
        }
    }
    var Process = {
        itemsElement: null,
        contentScroll: true,
        clear: function () {
            Dialog.pack.items = null;
            Dialog.skills.items = null;

            this.state(null);
        },
        init: function () {
            Process.itemsElement = $(".room_items");
            MessageContent = $(".content-message");
            MessageContent.on("mousedown", function () { Process.contentScroll = false; });
            MessageContent.on("mouseup", function () { Process.contentScroll = true; });
            // window.setInterval(Process.flash, 500);
        }, onContentScroll: function (e) {
            if (Process.auto_scroll) {
                Process.auto_scroll = false;
                return;
            }
            if (Process.contentScroll) {
                setTimeout(function () { Process.contentScroll = true; }, 4000);
                Process.contentScroll = false;
            } else {
                if (MessageContent[0].scrollTop + MessageContent.height() >= MessageContent[0].scrollHeight) {
                    Process.contentScroll = true;
                }
            }

        },
        regist: function (x) {
            if (x.result) {
                HideAndShow("#addrole_panel");
                $("#addrole_panel .input-error").html(x.result);
            }
        },
        flash: function () {
            if (MessagePage) {
                if (Process._flash_show) {
                    MessagePage.find("fla").hide();
                    Process._flash_show = false;
                } else {
                    MessagePage.find("fla").show();
                    Process._flash_show = true;
                }
            }
        }, emote: function (data) {
            Process.emotes = data.items || 0;
            var str = [];
            for (var i = 0; i < Process.emotes.length; i++) {
                str.push('<span>');
                str.push(Process.emotes[i]);
                str.push("</span>");
            }
            $(".channel-emotes").html(str.join(""));
        }
        , deleterole: function (x) {
            if (x.result) {
                var item = $("#role_panel>ul>.content>.role-list>.role-item[roleid='" + x.id + "']");
                item.remove();
                var elems = $("#role_panel>ul>.content>.role-list>.role-item");
                if (item.is(".select") && elems.length) {
                    $(elems[0]).addClass("select");
                } else if (!elems.length) {
                    LoginMethods.AddRole();
                }
            } else {
                Confirm.Show({
                    content: "<span class='input-error'>删除失败</span>",
                });
            }
        }, cross: function (data) {
            var serv = null;
            for (var i = 0; i < SERVERS.length; i++) {
                if (SERVERS[i].ID == data.sid) {
                    serv = SERVERS[i];
                }
            }
            if (!serv) return;
            // ShowLoader(data.msg || "正在进入【" + serv.Name + "】");
            //if (!Process.player) {
            //    HideAndShow(".container");
            //}
            GameClient.ChangeServer = true;
            GameClient.Close();
            Dialog.pack.items = null;
            if (data.cross_type == 'duizhan') {
                Dialog.skills.items = null;
                Dialog.skills.isShow = false;
            }
            console.log("重新连接到", serv.Name);
            if (!data.pid) Process.die({ relive: true });
            ConnectServer(serv, data.pid);
        }
        ,
        roles: function (x) {
            var result = x.roles;
            if (!result.length) {

                LoginMethods.AddRole();
            } else {
                HideAndShow("#role_panel");
                var html = [];
                for (var i = 0; i < result.length; i++) {
                    html.push("<li class='role-item");
                    if (i == 0) html.push(" select");
                    html.push("' roleid='" + result[i].id + "'>");
                    html.push(result[i].title);
                    html.push("&nbsp;&nbsp;");
                    html.push(result[i].name);
                    html.push("</li>");
                }
                $(".role-list").html(html.join(""));
            }
        }, loginerror: function (msg) {

            $(".container").hide();
            $(".login-content").show();
            ShowLoader("<strong>登陆失败：</strong>" + msg.msg + "");
            //HideAndShow("#role_panel");
        }, login: function (x) {
            if (!Process.player) {
                HideAndShow(".container");
            }
            Process.player = x.id;
            Setting.load(x.setting);
            if (LastCommand) {
                SendCommand(LastCommand);
                LastCommand = null;
            }
            //var panel = $(".player-panel").html(CreateHeadPanel(x));

        },
        selectItem: function (e) {
            if ($(e.target).is(".status-item")) {
                var sid = e.target.getAttribute("sid");
                if (sid) return SendCommand("status " + sid);
            }
            var id = $(this).attr("itemid");
            if (id) {
                if (id == Process.player) {
                    var name = $(this).find(".item-name").html();

                    var cmds = [{ cmd: "look " + id, name: "查看" }, { cmd: "dazuo", name: "打坐" },
                    { cmd: "liaoshang", name: "疗伤" }];
                    if (Dialog.team.items && Dialog.team.items.length) {
                        cmds.push({ cmd: "team out", name: "退出队伍" });
                        if (Dialog.team.isCap) {
                            cmds.push({ cmd: "team dismiss", name: "解散队伍" });
                            cmds.push({ cmd: "team set", name: "更改分配方式" });
                        }
                    }
                    Process.item({
                        id: id,
                        desc: name,
                        commands: cmds
                    });
                    return;
                }
                console.log(id);
                SendCommand("select " + id);
            }
        }, countwidth: function (m1, m2) {
            var w = m1 * 100 / m2;
            if (w < 0) w = 0;
            if (w > 100) w = 100;
            return w;
        }, itemremove: function (data) {
            var item = Combat.STATUS[data.id];
            if (item) {
                for (var si in item.items) {
                    clearInterval(item.items[si].handler);
                }
                var div = item.elem.parent();
                if (div.next().is(".item-commands")) {
                    div.next().remove();
                }
                div.remove();
                delete Combat.STATUS[data.id];
            }
        }, itemadd: function (data) {
            if (Setting.off_plist && data.p && data.id != Process.player) {
                return;
            }
            var item = data, player_item;
            if (Setting.item_firstme && item.id == Process.player) {

                player_item = $(Process.create_roomitem(item)).prependTo(Process.itemsElement);
            } else {
                player_item = $(Process.create_roomitem(item)).appendTo(Process.itemsElement);
            }
            if (Combat.STATUS[data.id]) Process.itemremove(data);
            Combat.AppendStatusItem(item.id, player_item.find(".item-status-bar"), item.status);
        }
        , items: function (room) {
            Process.itemsElement.empty();
            Combat.STATUS = {};//更换房间，状态信息清空
            for (var i = 0; i < room.items.length; i++) {
                var item = room.items[i];
                if (!item) continue;
                if (Setting.off_plist && item.p && item.id != Process.player) {
                    continue;
                }
                var player_item;
                if (Setting.item_firstme && item.id == Process.player) {

                    player_item = $(Process.create_roomitem(item)).prependTo(Process.itemsElement);
                } else {
                    player_item = $(Process.create_roomitem(item)).appendTo(Process.itemsElement);
                }
                Combat.AppendStatusItem(item.id, player_item.find(".item-status-bar"), item.status);
            }
            Process.cur_room = room;
        }, get_hpnum: function (hp, max_hp) {
            var diff = hp / max_hp;
            if (diff > 0.8) return "<hiy>" + hp + "</hiy>";
            if (diff > 0.5) return "<yel>" + hp + "</yel>";
            if (diff > 0.2) return "<red>" + hp + "</red>";
            return "<hir>" + hp + "</hir>";
        }, create_roomitem: function (item) {
            var str = [];

            str.push("<div class='room-item' itemid='" + item.id + "'>");
            if (item.max_hp) {
                str.push('<div class="item-status"');
                if (!Combat.IsShow && !Setting.show_hp) {
                    str.push(' style="display:none;"');
                }
                str.push('>');
                str.push('<div class="progress hp"><div class="progress-bar" max="' + item.max_hp + '"  style="width:' + Process.countwidth(item.hp, item.max_hp) + '%"></div></div>');
                str.push('<div class="progress mp"><div class="progress-bar" max="' + item.max_mp + '"   style="width:' + Process.countwidth(item.mp, item.max_mp) + '%"></div></div>');
                str.push("</div>");
            }
            str.push("<span class='item-status-bar'>");

            str.push('</span>');


            str.push("<span class='item-name'>");
            str.push(item.name);
            if (Setting.show_hpnum && item.max_hp) {

                str.push('<span class="progress-num">['
                    + this.get_hpnum(item.hp, item.max_hp) + "<nor>/</nor><hiy>" + item.max_hp + '</hiy>]</span>');
            }

            str.push('</span>');
            str.push("</div>");
            return str.join("");
        },
        room: function (room) {
            $(".room_items").html("");
            $(".room-name").html(room.name);
            $(".room_desc").html(room.desc);
            Process.room_name = room.name;
            if (!Setting.keep_msg && MessagePage) {
                MessagePage.remove();
                MessagePage = null;
                MessageCount = 0;
            } else if (Setting.keep_msg) {
                ReceiveMessage("你来到了" + room.name + "。");
            }
            if (Process.room_path == room.path) return;
            var html = [];
            Combat.ShowRoomCommands(room.commands);

            Process.room_path = room.path;
            MAP.SetRoom(room);
        }, exits: function (room) {
            var items = room ? room.items : Process.room_exits;
            if (!items) return;
            Process.room_exits = items;
            if (Setting.exits_dir) {
                var str = ["这里明显的出口有："];
                var exits = [];
                for (var i = 0; i < MAP.DIRS.length; i++) {
                    if (items[MAP.DIRS[i]]) {
                        exits.push(MAP.DIRS[i]);
                    }
                }
                for (var i = 0; i < exits.length; i++) {
                    if (i > 0) {
                        str.push(i == exits.length - 1 ? " 和 " : "、");
                    }
                    str.push("<span class='exits-item' dir='" + exits[i] + "'>" + exits[i] + "</span>");
                }
                if (exits.length) {
                    $(".room_exits").html(str.join(""));
                } else {
                    $(".room_exits").html("<HIK>这里没有明显的出口。<HIK>");
                }
            } else {
                $(".room_exits").html(MAP.CreateExitsMap(items, $(".container").width(), Process.room_name))
            }

        },
        before_click_exits: function (e) {
            var elem = $(e.target);
            if (!elem.attr("dir")) return;
            if (elem.is("rect"))
                elem.attr("fill", "gray");
            else if (elem.is("text"))
                elem.prev().attr("fill", "gray");
        },
        click_exits: function (e) {
            var elem = $(e.target);
            var dir = elem.attr("dir");
            if (!dir) return;
            if (elem.is("rect"))
                elem.attr("fill", "#232323");
            else if (elem.is("text"))
                elem.prev().attr("fill", "#232323");
            SendCommand("go " + dir);
        },
        item: function (item) {
            ReceiveMessage(item.desc);
            if (!item.commands) return;
            var html = ["<div class='item-commands'>"];
            for (var i = 0; i < item.commands.length; i++) {
                html.push("<span cmd='" + item.commands[i].cmd + "'>");
                html.push(item.commands[i].name);
                html.push("</span>");
            }
            html.push("</div>");
            if (Setting.show_command && Combat.STATUS[item.id]) {
                Process.itemsElement.find(".item-commands").remove();
                var roomitem = Combat.STATUS[item.id].elem.parent();
                $(html.join("")).insertAfter(roomitem);

                return MessageContent[0].scrollTop = 99999;
            }
            ReceiveMessage(html.join(""));
        },
        actions: function (data) {
            Combat.ShowActions(data);
        }, cmds: function (data) {
            if (!data.items) return;
            var html = ["<div class='item-commands'>"];
            if (!data.items.length) data.items = [data.items];
            for (var i = 0; i < data.items.length; i++) {
                html.push("<span cmd='" + data.items[i].cmd + "'>");
                html.push(data.items[i].name);
                html.push("</span>");
            }
            html.push("</div>");
            ReceiveMessage(html.join(""));
        }
        , map: function (x) {
            MAP.SetMapBuffer(x.map, x.path);
            MAP.ShowMap(x.map, x.path);
        }, updatemap: function (x) {
            MAP.UpdateMap(x.map, x);
        }, dialog: function (data) {
            Dialog.show(data.dialog, data);
        }, sc: function (data) {
            Combat.StatusChanged(data);
        }, perform: function (data) {
            Combat.ShowPFM(data);
        }, disobj: function (data) {
            Combat.DisObj(data);
        }, changepfm: function (data) {
            Combat.ChangeDistime(data);
        }, clearDistime: function (data) {
            Combat.ClearDistime(data);
        }, pay: function (data) {


        },
        dispfm: function (data) {
            Combat.On_Perform(data);
        }, status: function (data) {
            Combat.StatusItemChanged(data);
        }, combat: function (data) {
            if (data.start) {
                if (Setting.auto_showcombat == 1 && !Combat.IsShow) {
                    Combat.Show();
                }
                if (Setting.auto_hideroom == 1) {
                    if (!Setting.hide_roomdesc) {
                        $(".room_desc").hide();
                    }
                }
            }
            if (data.end) {
                if (Setting.auto_hideroom == 1) {
                    if (!Setting.hide_roomdesc) {
                        $(".room_desc").show();
                    }
                }
            }
        }, state: function (data) {
            if (data && data.state) {

                var ary = ["<span class='title'>" + data.state + "</span>"];
                if (data.commands) {
                    // ary.push("<div class='item-commands'>");
                    for (var i = 0; i < data.commands.length; i++) {
                        ary.push("<span class='item-command' cmd='" + data.commands[i].cmd + "'>");
                        ary.push(data.commands[i].name);
                        ary.push("</span>");
                    }
                    // ary.push("</div>");
                }
                $(".state-bar").removeClass("hide").html(ary.join(""));

                if (data.no_stop) $(".state-tool").hide();
                else $(".state-tool").show();
                Process.states = data.desc;
                if (Process.timer) clearInterval(Process.timer);
                if (Process.states && Process.states.length) {
                    if (typeof Process.states == "string") {
                        Process.states = [Process.states];
                    }
                    Process.timer = setInterval(Process.updatestate, data.interval || 5000);
                }
            } else {
                $(".state-bar").addClass("hide").empty();
                $(".state-tool").hide();
                clearInterval(Process.timer);
            }
        }, updatestate: function () {
            if (Process.states && GameClient) {
                var length = Process.states.length;
                ReceiveMessage(Process.states[parseInt(Math.random() * length)]);
            }
        }, die: function (data) {
            if (data.relive) {
                return Process.state({});
            }
            Process.state({
                state: "<hiw>你已经死亡：</hiw>",
                no_stop: true,
                desc: ["<blk>一股阴冷的气息包围着你。</blk>", "<blu>朦胧中你好像听到有人在喊：过来吧，过来吧！</blu>"],
                commands: data.commands,
                interval: 12000
            });

        }, warn: function (data) {
            Warn.Show(data);
        }, msg: function (data) {
            var msg = Dialog.channel.createElement(data, !Setting.no_spmsg);
            if (!msg) return;
            if (!Setting.no_spmsg) {
                if (!Process.ChannelElement) {
                    Process.ChannelCount = 0;
                    Process.ChannelElement = $("<div class='channel'><pre></pre></div>").insertBefore(MessageContent);
                    Process.ChannelPro = Process.ChannelElement.find("pre");
                    Process.ChannelElement.on("click", Dialog.channel.show.bind(Dialog.channel));
                    Process.ChannelElement.on("mousedown", Dialog.channel.endScroll);
                    Process.ChannelElement.on("mouseup", Dialog.channel.beginScroll);
                }
                var isBottom = Dialog.channel.isBottom();
                if (Dialog.channel.datas.length == 1) {
                    Process.ChannelPro.empty();
                }
                Process.ChannelPro.append(msg);
                if (isBottom)
                    Dialog.channel.scrollBottom();
            } else {
                ReceiveMessage(msg);
            }
        }, addAction: function (data) {
            Combat.AddObj(data.id, data.name, data.distime);
        }, removeAction: function (data) {
            Combat.DisObj({ id: data.id, count: 0 });
        }
    };
    var Warn = {
        Elemes: [],
        Show: function (data) {
            var html = ["<div class='warn-dialog'>"];

            html.push("<div class='warn-content'>");
            html.push(data.content);
            html.push("</div>");
            html.push("<div class='item-commands'>");
            for (var i = 0; i < data.cmds.length; i++) {
                var cmd = data.cmds[i];
                html.push("<span cmd='");
                html.push(cmd.cmd);
                html.push("'>");
                html.push(cmd.name);
                html.push("</span>");
            }
            html.push("</div>");
            var elem = $(html.join("")).appendTo(".bottom-bar");
            this.Elemes.push(elem);
            window.setTimeout(this.Settop, 1);
            var func = this.Close.bind(this, elem);
            if (data.time) {
                window.setTimeout(func, data.time);
            }
            elem.on("click", "span", func);
        }
        , Close: function (elem) {
            if (this.Elemes.indexOf(elem) > -1) {
                elem.remove();
                this.Elemes.Remove(elem);
                this.Settop();
            }
        }, Settop: function () {
            var height = 0;
            for (var i = 0; i < Warn.Elemes.length; i++) {
                var elem = Warn.Elemes[i];
                elem.css("bottom", height);
                height += elem.height() + 14;
            }
        }
    };
    var Combat = {
        IsShow: false,
        Actions: null,
        Skills: null,
        Show: function () {
            if (Combat.IsShow) return Combat.Hide();

            if (!this.Actions) SendCommand("actions");
            Combat.IsShow = true;
            if (!Setting.show_hp) {
                $(".room-item>.item-status").show();
            }
            $(".combat-panel").removeClass("hide");
            $(".right-bar")[0].style.bottom = ($(".combat-panel").height() + $(".bottom-bar").height()) + "px";
        },
        Hide: function () {
            Combat.IsShow = false;
            if (!Setting.show_hp) {
                $(".room-item>.item-status").hide();
            }
            $(".combat-panel").addClass("hide");
            $(".right-bar")[0].style.bottom = null;
        }, ShowRoomCommands: function (cmds) {
            if (this.RoomCommands)
                for (var i = 0; i < this.RoomCommands.length; i++) {
                    if (this.RoomCommands[i].elem)
                        this.RoomCommands[i].elem.remove();
                }
            this.RoomCommands = cmds;
            this.create_actions();
        }, ShowActions: function (data) {
            this.Actions = data.actions || [];

            this.create_actions();
            if (data.skills)
                this.ShowPFM(data);
        },
        ShowPFM: function (data) {

            this.Skills = data.skills || [];
            this.create_skillItems(data.skills);
        }
        , create_actions: function (items) {
            if (!this.Actions) return;
            var ary = this.Actions.concat(this.RoomCommands || []);
            var panel = $(".room-commands");
            for (var i = 0; i < ary.length; i++) {
                if (ary.elem) continue;
                var item = ary[i];
                var html = [];
                html.push("<span class='act-item' cmd='" + item.cmd + "'>");
                html.push(item.name);
                if (item.distime) {
                    html.push("<span class='shadow'></span>");
                }
                html.push("</span>");
                if (!item.elem)
                    item.elem = $(html.join("")).appendTo(panel);
            }
        }, DisObj: function (data) {
            if (!this.Actions) return;
            var cmd = "use " + data.id;
            for (var i = 0; i < this.Actions.length; i++) {
                var item = this.Actions[i];
                if (item.cmd == cmd) {
                    if (!data.count) {
                        this.Actions.splice(i, 1);
                        return item.elem.remove();
                    }
                    else {
                        this.ANI_OBJ(item.elem.find(".shadow").show()[0], data.time, 0);
                    }
                }
            }
        }, AddObj: function (id, name) {
            if (!this.Actions) return;
            var cmd = "use " + id;
            for (var i = 0; i < this.Actions.length; i++) {
                var item = this.Actions[i];
                if (item.cmd == cmd) return;
            }
            this.Actions.push({
                cmd: "use " + id,
                name: name.replace(/\<.+?\>/g, "")
            });
            this.create_actions();
        }
        , ANI_OBJ: function (elem, time, ani_time) {
            if (!elem) return;
            var p = ani_time * 100 / time;
            if (p >= 100) {
                return elem.style.display = "none";
            }
            elem.style.left = p + "%";
            setTimeout(Combat.ANI_OBJ, 1000, elem, time, ani_time + 1000);
        }
        , create_skillItems: function (items) {
            var elem = $(".combat-commands").empty();
            if (!items.length) return;
            for (var i = 0; i < items.length; i++) {
                var html = [];
                html.push("<span class='pfm-item' pid='" + items[i].id + "'>");
                html.push(items[i].name);
                html.push("<span class='shadow'></span>");
                html.push("</span>");
                items[i].shadow = $(html.join("")).appendTo(elem).find(".shadow")[0];
            }
        }, ChangeDistime: function (data) {
            var pfmid = data.id.replace("/", ".");
            for (var j = 0; j < Combat.dis_pfms.length; j++) {
                if (Combat.dis_pfms[j].id == pfmid) {
                    Combat.dis_pfms[j].ani_time += data.time;
                    break;
                }
            }
        }, ClearDistime: function (data) {
            if (!Combat.dis_pfms) return;
            var pfmid = data.id ? data.id.replace("/", ".") : data.id;
            for (var j = 0; j < Combat.dis_pfms.length; j++) {
                if (pfmid && pfmid != "all" && Combat.dis_pfms[j].id == pfmid) {
                    Combat.dis_pfms[j].ani_time = 0;
                    break;
                } else {
                    Combat.dis_pfms[j].ani_time = 0;
                }

            }
        }, On_Perform: function (data) {
            if (!this.Skills) return;
            // console.log(data);
            data.rtime = data.rtime || 0;
            data.distime = data.distime || 0;
            if (!this.dis_pfms) this.dis_pfms = [];
            for (var i = 0; i < this.dis_pfms.length; i++) {

                if (this.dis_pfms[i].id == data.id) {
                    data.id = null;
                    this.dis_pfms[i].distime = data.distime;
                    this.dis_pfms[i].ani_time = data.distime;
                    continue;
                }
                if (this.dis_pfms[i].ani_time < data.rtime) {
                    this.dis_pfms[i].ani_time = data.rtime;
                    this.dis_pfms[i].distime = data.rtime;
                }
            }
            if (data.id) {
                this.dis_pfms.push({
                    id: data.id,
                    distime: data.distime,
                    ani_time: data.distime
                });
            }
            Combat.ani_time = Combat.ani_time || 0;
            if (data.rtime > Combat.ani_time) {
                Combat.distime = data.rtime;
                Combat.ani_time = data.rtime;
            }
            if (!this.time_handler) {
                Combat.ANI_PFM();
            }
        }, PFM_INTERVAL: 300
        , ANI_PFM: function () {
            var p = Combat.ani_time * 100 / Combat.distime;

            for (var i = 0; i < Combat.Skills.length; i++) {
                var skill = Combat.Skills[i];
                var cur_per = p;
                for (var j = 0; j < Combat.dis_pfms.length; j++) {
                    if (Combat.dis_pfms[j].id == skill.id && Combat.dis_pfms[j].distime) {
                        cur_per = Combat.dis_pfms[j].ani_time * 100 / Combat.dis_pfms[j].distime;
                        if (cur_per < 0) {
                            Combat.dis_pfms.splice(j, 1);
                        } else {
                            Combat.dis_pfms[j].ani_time -= Combat.PFM_INTERVAL;
                        }
                        // if (p > cur_per) cur_per = p;
                        break;
                    }
                }
                if (cur_per > 0) {
                    if (cur_per < 0) cur_per = 0;
                    skill.shadow.style.left = (100 - cur_per) + "%";
                    skill.shadow.style.display = "block";
                } else {
                    skill.shadow.style.display = "none";
                    skill.shadow.style.left = "0px";
                }
            }

            if (Combat.ani_time > 0 || Combat.dis_pfms.length) {
                Combat.time_handler = setTimeout(Combat.ANI_PFM, Combat.PFM_INTERVAL);
            } else {
                Combat.time_handler = null;
            }
            Combat.ani_time -= Combat.PFM_INTERVAL;
        },
        StatusChanged: function (data) {
            var items = $(".room-item");
            for (var i = 0; i < items.length; i++) {
                var item = $(items[i]);
                if (item.attr("itemid") == data.id) {
                    this.UpdaeBar(data, "mp", item);
                    this.UpdaeBar(data, "hp", item);
                    break;
                }
            }
        }, UpdaeBar: function (data, type, item) {
            var val = data[type], max = 0;
            if (val == undefined) return;

            var bar = item.find("." + type + ">.progress-bar");
            if (data["max_" + type]) {
                max = data["max_" + type];
                bar.attr("max", max);
            } else {
                max = parseInt(bar.attr("max"));
            }
            if (Setting.show_hpnum && type == "hp") {

                item.find(".progress-num").html("[" + Process.get_hpnum(val, max) + "<nor>/</nor><hiy>" + max + '</hiy>]');
            }
            bar.css("width", Combat.CountWidth(val, max) + "%");
            if (Setting.show_damage && data.damage && data.id != Process.player) {
                var per = 0;
                if (data.damage == -1) {
                    per = parseInt((max - val) * 1000 / max) / 10;
                } else {
                    per = parseInt(data.damage * 1000 / max) / 10;
                }
                bar = item.find(".item-damage");
                if (!bar.length) {
                    bar = $('<span class="item-damage">[<hiy>0%</hiy>]<span>').appendTo(item.find('.item-name'));
                }
                bar.html("[<hiy>" + per + '%</hiy>]');
            }

        }

        , CountWidth: function (d1, d2) {
            if (d2 == 0) return 0;
            var d = d1 * 100 / d2;
            if (d >= 100) return 100;
            if (d < 0) return 0;
            return d;
        }, Perform: function () {
            var elem = $(this);
            if (elem.is("disable")) return;
            var pfmid = elem.attr("pid");
            if (!pfmid) return;
            SendCommand("perform " + pfmid);
            //  Combat.On_Perform({ id: pfmid });
        },
        STATUS: {},
        AppendStatusItem: function (id, elem, status) {
            var stitem = { elem: elem, items: {} };
            if (status) {
                for (var i = 0; i < status.length; i++) {
                    this.StatusItem_add(stitem, status[i]);
                }
            }
            this.STATUS[id] = stitem;
        }
        , StatusItemChanged: function (data) {

            var func = Combat["StatusItem_" + data.action];
            func && func.call(Combat, this.STATUS[data.id], data);

        }, StatusItem_add: function (statu_item, item) {
            if (!statu_item) return;
            var str = [];
            str.push('<span class="status-item');
            if (item.downside) {
                str.push(" downside");
            }
            str.push('" sid="');
            str.push(item.sid);
            str.push('">');
            str.push(item.name);
            if (item.count != undefined) {
                str.push("x");
                str.push(item.count);
            }
            str.push('<span class="shadow"></span></span>');
            statu_item.items[item.sid] = {
                elem: $(str.join("")).appendTo(statu_item.elem)[0],
                name: item.name,
                count: item.count,
                duration: item.duration,
                anitime: item.duration - (item.overtime || 0)
            };
            if (item.duration > 0)
                Combat.StatusItemANI(statu_item.items[item.sid]);
        },
        StatusItem_remove: function (player_status, data) {
            if (!player_status) return;
            var ids = data.sid;
            if (typeof ids == "string") ids = [ids];
            for (var i = 0; i < ids.length; i++) {
                var item = player_status.items[ids[i]];
                if (item) {
                    $(item.elem).remove();
                    item.handler && clearTimeout(item.handler);
                    delete player_status.items[ids[i]];
                }
            }

        },
        StatusItem_refresh: function (player_status, data) {
            if (!player_status) return;
            var item = player_status.items[data.sid];
            if (!item) return;
            var text = item.elem.firstChild;
            var shadow = item.elem.lastChild;
            item.count = data.count;
            item.elem.innerHTML = item.name + "x" + item.count + shadow.outerHTML;
            item.handler && clearTimeout(item.handler);
            item.anitime = item.duration;
            Combat.StatusItemANI(item);
        }, StatusItem_override: function (player_status, data) {

            var item = player_status.items[data.sid];
            if (!item) return;
            item.handler && clearTimeout(item.handler);
            item.anitime = item.duration;
            Combat.StatusItemANI(item);
        },
        StatusItem_clear: function (player_status, data) {
            if (!player_status) return;
            for (var sid in player_status.items) {
                var item = player_status.items[sid];
                if (item) {
                    $(item.elem).remove();
                    clearTimeout(item.handler);
                }
            }
            player_status.items = {};
        },
        StatusItemANI: function (item) {
            var shadow = item.elem.lastChild;
            var p = item.anitime * 100 / item.duration;
            if (p < 0) p = 0;
            shadow.style.right = p + "%";
            item.anitime = item.anitime - 1000;
            if (p > 0) {
                item.handler = setTimeout(Combat.StatusItemANI, 1000, item);
            } else {
                //elem.parent().remove();
                item.handler = 0;
            }

        }

    };
    function CreateHeadPanel(x) {
        var html = ['<div class="title">'];
        html.push(x.name);
        html.push('</div><div><span>气血： </span><div class="progress">');
        html.push('<div class="progress-bar" style="width:');
        html.push(x.hp * 100 / x.max_hp);
        html.push('%; background-color: #800000;"></div><span class="progress-text">');
        html.push(x.hp);
        html.push(' / ');
        html.push(x.max_hp);
        html.push('</span></div></div><div><span>内力： </span><div class="progress"><div style="width:');
        html.push(x.mp * 100 / x.max_mp);
        html.push('%; background-color: #000080;"></div><span class="progress-text">');
        html.push(x.mp);
        html.push(' / ');
        html.push(x.max_mp);
        html.push('</span></div></div><div></div>');
        return html.join("");
    }

    var MAP = {
        DIRS: ["west", "north", "south", "east", "northwest", "southwest", "northeast", "southeast",
            "down", "up", "westdown", "northdown", "southdown", "eastdown", "westup", "northup", "southup", "eastup", "enter", "out"],
        REG: /<(\w+)>(.+)<\/\w+>/,
        CreateExitsMap: function (exits, w, name) {
            var str = name.split("-");
            if (str.length > 1) name = str[str.length - 1];
            name = name.replace(/\(.*?\)/, "");
            var unitY = 30;
            var unitX = 70;
            var unitW = 60;
            var unitH = 20;
            var height = unitY + 10;
            var l = (w - unitW) / 2, t = 10;
            var dirs = {};
            if (exits["north"] && exits["up"]) {
                exits["north_2"] = exits["up"];
                delete exits["up"];
            }
            if (exits["south"] && exits["down"]) {
                exits["south_2"] = exits["down"];
                delete exits["down"];
            }
            for (var dir in exits) {
                if (dir.indexOf("south") > -1 || dir == "down" || dir == "out") {
                    dirs["s"] = true;
                } else if (dir.indexOf("north") > -1 || dir == "up" || dir == "enter") {
                    dirs["n"] = true;
                }
            }
            if (dirs.s) height += unitY;
            if (dirs.n) {
                height += unitY;
                t += unitY;
            }
            var html = [];
            html.push('<svg style="margin-left:-2em" height="' + height + '" width="' + w + '">');
            html.push('<rect x="' + l + '" y="' + t + '"  fill="dimgrey" stroke-width="1" stroke="gray" ');
            html.push('width="' + unitW + '" height="' + unitH + '"></rect>');
            html.push(' <text x="' + (l + 30) + '" y="' + (t + 14) + '"  text-anchor="middle" style="font-size:12px;" ');
            this.pushName(html, name, true);
            for (var dir in exits) {
                var pos1, pos2, pos;
                switch (dir) {
                    case "west":
                    case "westup":
                    case "westdown":
                        pos1 = [l - (unitX - unitW), t + unitH / 2];
                        pos2 = [l, t + unitH / 2];
                        pos = [l - unitX, t];
                        break;
                    case "east":
                    case "eastup":
                    case "eastdown":
                        pos1 = [l + unitW, t + unitH / 2];
                        pos2 = [l + unitX, t + unitH / 2];
                        pos = [l + unitX, t];
                        break;
                    case "south":
                    case "southup":
                    case "southdown":
                    case "down":
                        pos1 = [l + unitW / 2, t + unitH];
                        pos2 = [l + unitW / 2, t + unitY];
                        pos = [l, t + unitY];
                        break;
                    case "north":
                    case "northup":
                    case "northdown":
                    case "up":
                        pos1 = [l + unitW / 2, t];
                        pos2 = [l + unitW / 2, t - (unitY - unitH)];
                        pos = [l, t - unitY];
                        break;
                    case "northwest":
                        pos1 = [l - unitX + unitW, t - unitY + unitH];
                        pos2 = [l, t];
                        pos = [l - unitX, t - unitY];
                        break;
                    case "northeast":
                    case "north_2":
                    case "enter":
                        pos1 = [l + unitX, t - unitY + unitH];
                        pos2 = [l + unitW, t];
                        pos = [l + unitX, t - unitY];
                        break;
                    case "southeast":
                    case "south_2":
                        pos1 = [l + unitX, t + unitY];
                        pos2 = [l + unitW, t + unitH];
                        pos = [l + unitX, t + unitY];
                        break;
                    case "southwest":
                    case "out":
                        pos1 = [l - unitX + unitW, t + unitY];
                        pos2 = [l, t + unitH];
                        pos = [l - unitX, t + unitY];
                        break;
                }
                var rm_name = exits[dir];
                if (dir == "south_2") dir = "down";
                else if (dir == "north_2") dir = "up";
                html.push('<rect x="' + pos[0] + '" y="' + pos[1] + '" dir="' + dir + '" fill="#232323" stroke-width="1" stroke="gray" ');
                html.push('width="' + unitW + '" height="' + unitH + '"></rect>');
                html.push(' <text x="' + (pos[0] + 30) + '" y="' + (pos[1] + 14) + '" dir="' + dir + '" text-anchor="middle" style="font-size:12px;"');
                this.pushName(html, rm_name, false);

                if (pos1) {
                    html.push('<line  stroke="gray" ');
                    html.push(" x1='" + pos1[0] + "' y1='" + pos1[1] + "' x2='" + pos2[0] + "' y2='" + pos2[1] + "'");
                    if (dir.indexOf("up") > -1 || dir.indexOf("down") > -1) {
                        html.push(" stroke-dasharray='5,5'");
                        html.push(" stroke-width='10'");
                    } else {
                        html.push(" stroke-width='1'");
                    }
                    html.push("></line >");
                }

            }

            html.push("</svg>");
            return html.join("");
        }, GetColor: function (name, issel) {
            switch (name.toLowerCase()) {
                case "hig":
                    return "#00FF00";
                case "hir":
                    return "#FF0000";
                case "him":
                    return "#FF00FF";
                case "hic":
                    return "#00FFFF";
                case "hiy":
                    return "##FFFF00";
                default:
                    return "dimgrey";

            }
        },
        ShowMap: function (map, id) {
            if (!map) return;
            this.CurMapID = id;
            var html = [];
            var pos = MAP.getMinPos(map);
            var offX = 0 - pos.minX;
            var offY = 0 - pos.minY;
            var unitY = 50;
            var unitX = 100;
            var unitW = 60;
            var unitH = 20;
            var reg = /^([a-z]{1,2})(\d)?([d|l])?$/;
            var content = $(".map-panel");
            MAP.MapWidth = (pos.maxX + offX + 1) * unitX;
            var off_x = 0;
            var content_width = content.width();
            if (MAP.MapWidth < content_width) {
                off_x = (content_width - MAP.MapWidth) / 2;
                MAP.MapWidth = content_width;
            }
            MAP.MapHeight = (pos.maxY + offY + 1) * unitY;
            if (MAP.MapWidth < 0 || MAP.MapHeight < 0) return;
            html.push('<svg class="map" height="' + MAP.MapHeight + '" width="' + MAP.MapWidth + '">');
            for (var i = 0; i < map.length; i++) {
                html.push("<rect class='map-room' rm='" + map[i].id + "' ");

                var l = (map[i].p[0] + offX) * unitX + off_x + 20;
                var t = (map[i].p[1] + offY) * unitY + 20;
                html.push("x='" + l + "' y='" + t + "'");
                html.push(' fill="dimgrey" stroke-width="1" stroke="gray" ');
                html.push('width="' + unitW + '" height="' + unitH + '"></rect>');
                var exits = map[i].exits;
                if (exits) {
                    for (var j = 0; j < exits.length; j++) {
                        reg.test(exits[j]);
                        var length = RegExp.$2 ? parseInt(RegExp.$2) : 1;
                        var pos1;
                        var pos2;
                        switch (RegExp.$1) {
                            case "w":
                                pos1 = [l - (unitX - unitW) - unitX * (length - 1), t + unitH / 2];
                                pos2 = [l, t + unitH / 2];
                                break;
                            case "e":
                                pos1 = [l + unitW, t + unitH / 2];
                                pos2 = [l + unitX + unitX * (length - 1), t + unitH / 2];
                                break;
                            case "s":
                                pos1 = [l + unitW / 2, t + unitH];
                                pos2 = [l + unitW / 2, t + unitY + unitY * (length - 1)];
                                break;
                            case "n":
                                pos1 = [l + unitW / 2, t];
                                pos2 = [l + unitW / 2, t - (unitY - unitH) - unitY * (length - 1)];
                                break;
                            case "nw":
                                pos1 = [l - length * unitX + unitW, t - length * unitY + unitH];
                                pos2 = [l, t];
                                break;
                            case "ne":
                                pos1 = [l + unitW, t];
                                pos2 = [l + length * unitX, t - (unitY - unitH)];
                                break;
                            case "se":
                                pos1 = [l + unitW, t + unitH];
                                pos2 = [l + length * unitX, t + length * unitY];
                                break;
                            case "sw":
                                pos1 = [l, t + unitH];
                                pos2 = [l - (unitX - unitW) - unitX * (length - 1), t + length * unitY];
                                break;
                        }
                        if (pos1) {
                            html.push('<line  stroke="gray" ');
                            html.push(" x1='" + pos1[0] + "' y1='" + pos1[1] + "' x2='" + pos2[0] + "' y2='" + pos2[1] + "'");
                            if (RegExp.$3) {
                                html.push(" stroke-dasharray='5,5'");
                            }
                            if (RegExp.$3 == "l") {
                                html.push(" stroke-width='10'");
                            } else {
                                html.push(" stroke-width='1'");
                            }
                            html.push("></line >");
                        }

                    }

                }
                html.push(' <text x="' + (l + 30) + '" y="' + (t + 14) + '" text-anchor="middle" style="font-size:12px;" ');
                this.pushName(html, map[i].n, true);
            }
            html.push("</svg>");
            content.html(html.join(""));
            this.MapContent = $("svg");
            if (!this.IsShow) {
                this.IsShow = true;
                $(".map-panel").slideDown("fast");
            }
            this.SetRoom(this.Room);
        },
        pushName: function (html, rm_name, issel) {
            var mathch = this.REG.exec(rm_name);
            if (mathch) {
                html.push('  fill="' + this.GetColor(mathch[1]) + '"');
                html.push('>' + mathch[2] + '</text>');
            } else {
                html.push(' fill="');
                html.push(issel ? "#232323" : "dimgrey");
                html.push('">' + rm_name + '</text>');
            }
        },
        getMinPos: function (map) {
            var pos = {
                minX: 99999,
                minY: 99999,
                maxX: 0,
                maxY: 0
            };
            for (var i = 0; i < map.length; i++) {
                var x = map[i].p[0];
                var y = map[i].p[1];
                if (x < pos.minX) {
                    pos.minX = x;
                } if (x > pos.maxX) pos.maxX = x;
                if (y < pos.minY) {
                    pos.minY = y;
                } if (y > pos.maxY) pos.maxY = y;
            }
            return pos;
        },
        State: 0,
        ZoomState: 100,
        Buffer: {},
        HideItem: function () {
            if (this.State == 0) {
                this.State = 1;
                $(".room_desc").slideUp("fast");
            }
        },
        ShowItem: function () {
            if (this.State == 1) {
                this.State = 0;
                $(".room_desc").slideDown("fast");
            }
        }, ZoomIn: function (pars) {
            if (pars.zoom) return;
            MAP.ZoomState = MAP.ZoomState / pars.zoom;
            if (MAP.ZoomState > 200) MAP.ZoomState = 200;
            if (MAP.ZoomState < 80) MAP.ZoomState = 80;
            var pw = MAP.MapWidth * MAP.ZoomState / 100;
            var ph = MAP.MapHeight * MAP.ZoomState / 100;
            this.MapContent.attr("viewBox", "0,0," + pw + "," + ph);
        }, SetRoom: function (rm) {
            this.Room = rm;
            if (!this.IsShow) return;

            if (this.CurRoomItem) {
                this.CurRoomItem.attr("fill", "dimgrey");
                this.CurRoomItem.attr("stroke", "gray");
            }
            this.CurRoomItem = null;
            var item = this.MapContent.find("rect[rm='" + rm.path + "']");
            if (item.length) {
                this.CurRoomItem = item;
                this.CurRoomItem.attr("fill", "#bebebe");
                this.CurRoomItem.attr("stroke", "gray");
                var pos = [item.attr("x"), item.attr("y"), item.attr("width"), item.attr("height")];
                var elem = document.querySelector(".map-panel");
                var height = elem.offsetHeight;
                var width = elem.offsetWidth;
                elem.scrollTop = pos[1] - (height - pos[3]) / 2;
                elem.scrollLeft = pos[0] - (width - pos[2]) / 2;
            }
            var map_path = rm.path.substr(0, rm.path.lastIndexOf("/"));
            if (map_path != this.CurMapID) {
                if (MAP.Buffer[map_path]) {
                    return MAP.ShowMap(MAP.Buffer[map_path], map_path);
                }
                SendCommand("map " + map_path);
            }
        },
        LoadMap: function () {
            if (this.IsShow) {
                this.IsShow = false;
                return $(".map-panel").slideUp("fast");
            }
            var rm = MAP.Room;
            if (!rm) return;
            var name = rm.path.substr(0, rm.path.lastIndexOf("/"));
            if (name == this.CurMapID) {
                $(".map-panel").slideDown("fast");
                this.IsShow = true;
                return;
            }
            if (MAP.Buffer[name]) {
                return MAP.ShowMap(MAP.Buffer[name], name);
            }
            SendCommand("map " + name);
        }, SetMapBuffer: function (maps, id) {
            MAP.Buffer[id] = maps;
        }, UpdateMap: function (mapid, data) {
            var map = MAP.Buffer[mapid];
            if (!map) return;
            if (!data.id) {
                MAP.Buffer[mapid] = null;
                if (this.CurMapID == mapid) this.CurMapID = null;
                return;
            }
            for (var i = 0; i < map.length; i++) {
                if (map[i].id == data.id) {
                    map[i].n = data.n || map[i].n;
                    map[i].p = data.p || map[i].p;
                    break;
                }
            }
            if (mapid == this.CurMapID) {
                MAP.ShowMap(map, mapid);
            }
        }
    }
    var Touch = {
        List: {},
        AddListener: function (evt, elem, func) {
            document.querySelector(elem).addEventListener("touchstart", Touch.Start);
            if (evt == "zoom") {
                document.querySelector(elem).addEventListener("touchmove", Touch.Move);
            } else {
                document.querySelector(elem).addEventListener("touchend", Touch.End);
            }
            if (!Touch.List[evt]) Touch.List[evt] = [];
            Touch.List[evt].push(func)
        },
        Start: function (event) {
            Touch.StartPos = [];
            for (var i = 0; i < event.changedTouches.length; i++) {
                var touch = event.changedTouches[i];
                Touch.StartPos.push([
                    touch.screenX, touch.screenY
                ]);
            }
        },
        Move: function (event) {
            var count = event.changedTouches.length;
            if (count != 2) return;
            var pos = [];
            for (var i = 0; i < count; i++) {
                var touch = event.changedTouches[i];
                pos.push([
                    touch.screenX, touch.screenY
                ]);
            }
            if (pos.length != 2) return;
            Touch.Zoom(Touch.StartPos, pos);
            Touch.StartPos = pos;
        },
        End: function (event) {
            var pos = [];
            for (var i = 0; i < event.changedTouches.length; i++) {
                var touch = event.changedTouches[i];
                pos.push([
                    touch.screenX, touch.screenY
                ]);
            }
            if (!pos.length || pos.length != Touch.StartPos.length) return;
            if (pos.length == 1) {
                Touch.Slide(Touch.StartPos[0], pos[0]);
            } else if (pos.length == 2) {
                Touch.Zoom(Touch.StartPos, pos);
            }
        }, Zoom: function (start, end) {
            var off1 = Touch.Distance(start[0], start[1]);
            var off2 = Touch.Distance(end[0], end[1]);
            Touch.On("zoom", {
                zoom: off2 / off1
            });
        }, Distance: function (pos1, pos2) {
            return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2));
        },
        Slide: function (start, end) {
            var offx = start[0] - end[0];
            var offy = start[1] - end[1];
            if (Math.abs(offx) < Math.abs(offy) && Math.abs(offy) > 20) {
                Touch.On("slide", { offY: offy, offX: offx, isTop: offy > 0 });
            }
        }
        ,
        On: function (evt, pars) {
            var funcs = Touch.List[evt];
            if (!funcs) return;
            for (var i = 0; i < funcs.length; i++) {
                funcs[i](pars);
            }
        }

    };
    var Dialog = {
        isShow: false,
        curItem: null,
        show: function (name, data) {
            if (!name) return;
            if (!data) {
                //如果是点击进来的
                if (this.isShow && name == this.curItem) return this.hide();
                if (this.curItem && name != this.curItem) {
                    Dialog[Dialog.curItem].close && Dialog[Dialog.curItem].close();
                    Dialog[Dialog.curItem].isShow = false;
                    Dialog.contentElement.empty();
                }
                this.init();
                this.curItem = name;
                this[name].show(data);
            } else {
                this[name].onData(data);
            }
        }, select: function (name) {
            if (this.isShow && name == this.curItem) return this.hide();
            if (this.curItem && name != this.curItem) {
                Dialog[Dialog.curItem].close && Dialog[Dialog.curItem].close();
                Dialog[Dialog.curItem].isShow = false;
                Dialog.contentElement.empty();
            }
            this.init();
            this.curItem = name;
        },
        init: function () {
            if (this.isShow) return;
            if (!this.isInit) {
                this.contentElement = $(".dialog>.dialog-content");
                this.titleElement = $(".dialog>.dialog-header>.dialog-title");
                this.iconElement = $(".dialog>.dialog-header>.dialog-icon");
                this.footerElement = $(".dialog>.dialog-footer").on("click", ".footer-item", Dialog.footerClick);
                this.hiddenElement = $(".hidden-item");
                this.element = $(".dialog");
                $(".dialog>.dialog-header>.dialog-close").on("click", Dialog.hide);
                this.isInit = true;
            }
            $(".content-room").addClass("hide");
            this.element.removeClass("hide");
            this.isShow = true;
        }, hide: function () {
            if (Dialog[Dialog.curItem].hide && Dialog[Dialog.curItem].hide() == false) return;
            Dialog.isShow = false;
            $(".content-room").removeClass("hide");
            Dialog.element.addClass("hide");
        }, footerClick: function () {
            var elem = $(this);
            if (elem.is(".select")) return;
            var cmd = elem.attr("for");
            elem.parent().find(".select").removeClass("select");
            elem.addClass("select");
            Dialog[Dialog.curItem].footerChanged(cmd);
        }, title: function (title) {
            Dialog.titleElement.html(title);
        }, icon: function (css) {
            this.iconElement.attr("class", "dialog-icon glyphicon glyphicon-" + css);
        }, footer: function (html) {
            html ? this.footerElement.html(html) : this.footerElement.empty();
        },
        score: {
            footer: [["属性", ".dialog-score"], ["详细", ".dialog-score2"], ["称号", ".dialog-titles"]],
            selectIndex: 0,
            onData: function (data) {
                console.log(data);
                this.data = data;
                this.init_elem();
                Dialog.titleElement.html(data.name);
                Dialog.icon("user");
                if (data.titles) {
                    this.titles = data.titles;
                    this.create_titles();
                } else {
                    if (data.id && data.id != this.uid) {
                        this.uid = data.id;
                        if (this.uid != Process.player) {
                            Dialog.footerElement.find(".footer-item:eq(2)").hide();
                        } else {
                            Dialog.footerElement.find(".footer-item:eq(2)").show();
                        }
                    }
                    var panel = $(data.name ? this.footer[0][1] : this.footer[1][1]);
                    var elems = panel.find("span");
                    for (var i = 0; i < elems.length; i++) {
                        var elem = $(elems[i]);
                        var prop = elem.attr("data-prop");
                        if (prop) {
                            elem.html(data[prop] || 0);
                        }
                    }
                }
            },
            init_elem: function () {
                Dialog.init();
                Dialog.curItem = "score";
                if (this.isShow) return;
                Dialog.footer("");
                for (var i = 0; i < this.footer.length; i++) {
                    var elem = $("<span class='footer-item " + (this.selectIndex == i ? "select" : "") + "' for='" + i + "'>"
                        + this.footer[i][0] + "</span>").appendTo(Dialog.footerElement);
                    this.footer[i][1] = $(this.footer[i][1]);
                }
                this.isShow = true;
                this.footerChanged(this.selectIndex);

            },
            show: function (nosend) {
                if (nosend) return;
                if (!this.selectIndex) SendCommand("score");
                else if (this.selectIndex == 1) SendCommand("score2");
                else SendCommand("score title");
                this.init_elem();
            },
            close: function () {
                this.footer[this.selectIndex][1].remove();
                Dialog.footer("");
                this.isShow = false;
            }, footerChanged: function (item) {
                var data = this.data;
                item = parseInt(item);
                this.footer[this.selectIndex][1].remove();
                this.selectIndex = item;

                var panel = $(this.footer[this.selectIndex][1]).appendTo(Dialog.contentElement.empty());
                if (item == 1) {
                    if (this.uid && Process.player != this.uid)
                        SendCommand("score2 " + this.uid);
                    else
                        SendCommand("score2");
                }
                else if (item == 2) {
                    if (!this.titles)
                        SendCommand("score title");
                    panel.on("click", ".btn-noused", function (e) {
                        var elem = $(e.target);
                        if (elem.is("red")) elem = elem.parent();
                        var index = parseInt(elem.attr("index"));
                        for (var i = 0; i < this.titles.length; i++) {
                            if (i == index) this.titles[i].use = this.titles[i].use ? false : true;
                            else this.titles[i].use = false;
                        }
                        SendCommand("title " + index);
                        this.create_titles();
                    }.bind(this));
                }
            }, create_titles: function () {
                var panel = $(".dialog-titles");
                var html = [];
                for (var i = 0; i < this.titles.length; i++) {
                    html.push("<div class='title-item'>");
                    html.push(this.titles[i].title);
                    html.push("<span class='btn-noused' index='");
                    html.push(i);
                    html.push("'>");
                    html.push(this.titles[i].use ? "<red>取消</red>" : "使用");
                    html.push("</span>");

                    html.push("</div>");
                }
                panel.html(html.length ? html.join("") : "<div class='empty'>你还没有获得任何称号</div>");
            }
        },
        map: {
            onData: function (data) {
                Dialog.title(data.title || "地图");
            },
            show: function () {
                Dialog.init();
                Dialog.footer("");
                Dialog.contentElement.append($(".map"));
                Dialog.icon("map-marker");
                Dialog.iconElement.attr("class", "dialog-icon glyphicon glyphicon-map-marker");
            }, hide: function () {
                $(".map").appendTo(".map-panel");
            }, close: function () {
                this.hide();
            }
        }

    };
    Dialog.skills = {
        isShow: false,
        selectItem: ".dialog-skills",
        hide: function () {
            if (this.skill_element) {
                this.skill_element.remove();
                this.skill_element = null;
                this.element.removeClass("hide-item");
                return false;
            }
        },
        close: function () {
            this.hide();
            this.element.remove();
            //Dialog.footerElement.addClass("hide");
            this.isShow = false;

        },
        level_desc: ["wht", "nor", "hic", "HIJ", "HIZ", "hio"],
        limit: 0,
        selected_item: 0,
        showdesc: function (data) {
            this.skill_element = $("<pre></pre>").html(data.desc).appendTo(this.element);
            // Dialog.title(data.title);
            this.element.addClass("hide-item");
        },
        footerChanged: function (index) {
            if (index == this.selected_item) return;
            this.selected_item = index;
            if (index == 0) {
                this.element.removeClass("spskill");
            } else {
                this.element.addClass("spskill");
            }
        },
        create_footer: function () {
            var footers = ["基础", "特殊"];
            var html = [];
            for (var i = 0; i < footers.length; i++) {
                html.push("<span class='footer-item" + (i == this.selected_item ? " select" : "") + "' for='" + i + "''>"
                    + footers[i] + "</span>");
            }
            html.push("<span class='obj-money'>你目前的技能上限为<HIC>" + this.limit + "</HIC>级</span>");
            Dialog.footer(html.join(""));
        },
        updateSkill: function (data) {
            if (!this.skills) return;
            var item = this.skills[data.id];
            if (!item) {

                return this.addSkill(item);
            }
            if (data.name) {
                item.name = data.name;
            }
            if (data.enable) {
                if (item.enable_skill) {
                    var old_skill = item.enable_skill;
                    item.enable_skill = null;
                    this.skills[old_skill][data.id] == false;
                    this.updateSkillItem(this.skills[old_skill]);
                }
                this.skills[data.enable][data.id] = true;
                item.enable_skill = data.enable;
                this.updateSkillItem(this.skills[data.enable]);
                this.updateSkillItem(this.skills[data.id]);
            } else if (data.exp != undefined || data.level != undefined) {
                if (data.level) item.level = data.level;
                if (data.exp) item.exp = data.exp;
                this.updateSkillItem(item);
            }
            else if (data.enable == false) {
                if (item.enable_skill) {
                    var old_skill = item.enable_skill;
                    this.skills[old_skill][data.id] == false;
                    item.enable_skill = null;
                    this.updateSkillItem(this.skills[old_skill]);
                    this.updateSkillItem(this.skills[data.id]);
                }
            }

        }, updateSkillItem: function (item) {
            var sk_elem = this.element.find(".skill-item[skid='" + item.id + "']");
            if (sk_elem) {
                sk_elem.replaceWith(this.createSkillItem(item));
            }
        },
        addSkill: function (item) {

            if (!this.items || !item) return;
            if (this.skills[item.id]) {
                return this.updateSkill(item);
            }
            this.items.push(item);
            this.skills[item.id] = item;
            this.items = this.sort_items(this.items);
            this.createSkillItems(this.items);
        }
        , onData: function (data) {
            if (!data) return;
            if (!this.isShow && Dialog.master.isShow) {

                if (data.exp == undefined && !data.item)
                    return Dialog.master.onData(data);
            }
            if (data.item) {
                //更新技能状态
                return this.addSkill(data.item);
            }
            if (data.id) {
                //更新技能状态
                return this.updateSkill(data);
            }
            if (data.desc) {
                //显示技能描述
                return this.showdesc(data);
            }
            if (data.remove && this.items) {
                this.items.Remove(this.skills[data.remove]);
                var skill = this.skills[data.remove];
                for (var i = 0; i < this.items.length; i++) {
                    if (this.items[i].enable_skill == data.remove) {
                        this.items[i].enable_skill = null;
                    }
                }
                delete this.skills[data.remove];

                return this.createSkillItems(this.items);
            }
            if (data.items) {
                this.title = data.title;
                Dialog.title(this.title);
                Dialog.icon("book");
                this.items = this.sort_items(data.items);
                this.skills = {};

                for (var i = 0; i < this.items.length; i++) {
                    var item = this.items[i];
                    this.skills[item.id] = item;
                }
                this.createSkillItems(this.items);
            }
            if (data.limit) {
                this.limit = data.limit;
                this.create_footer();
            }
        },
        show: function () {
            if (this.isShow) return;
            this.isShow = true;
            if (!this.element) {
                this.element = $('<div class="dialog-skills"></div >');
            }
            this.element.on("click", ".skill-item", Dialog.skills.item_click);
            //Dialog.footerElement.removeClass("hide");
            this.element.appendTo(Dialog.contentElement);
            this.element.removeClass("hide-item");
            if (!this.items) SendCommand("cha");
            else {
                SendCommand("cha none");
                Dialog.title(this.title);
                Dialog.icon("book");
                this.create_footer();
            }
        },
        isEnable: function (item, skills) {
            if (!item.can_enables) return false;
            for (var i = 0; i < item.can_enables.length; i++) {
                var base_skill = skills[item.can_enables[i]];
                if (base_skill && base_skill.enable_skill == item.id) return true;
            }
            return false;
        }
        , createSkillItem: function (item, skills) {
            skills = skills || this.skills;
            var html = [];
            html.push(' <div class="skill-item');
            if (!this.master) {
                if (item.can_enables) {
                    html.push(' skill');
                } else {
                    html.push(' base');
                }
            }

            var is_enable = this.isEnable(item, skills);
            if (is_enable) {
                html.push(' enable');
            }
            html.push('" skid="' + item.id + '">');

            //html.push('<');
            //html.push(this.level_color[item.type]);
            //html.push('>');
            if (is_enable) {
                html.push(item.name.replace(">", ">✔"));
            } else {
                html.push(item.name);
            }
            if (item.enable_skill && skills) {
                var sp_skill = skills[item.enable_skill];
                if (sp_skill) {
                    html.push('<span class="enable_skill">已装备：');
                    html.push(sp_skill.name);
                    html.push("</span>");
                }

            }

            html.push('<span class="skill-level">');
            // var lv_desc = this.get_lvdesc(item.level);
            //push(lv_desc.replace(">", ">" + item.level + '级 / ' + item.exp + "%" + '&nbsp;'));
            html.push(item.level);
            html.push('级 / ');
            html.push(item.exp);
            html.push("%");
            html.push('&nbsp;');
            html.push(Dialog.skills.get_lvdesc(item.level));
            html.push('</span></div>');
            return html.join("");
        },
        sort_items: function (items) {
            if (!items || !Setting.auto_sortitem) return items;
            var list = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var isok = false;
                if (!item.s_index) item.s_index = Dialog.pack.get_index(item);
                for (var j = 0; j < list.length; j++) {
                    if (item.s_index > list[j].s_index) {
                        list.splice(j, 0, item);
                        isok = true;
                        break;
                    }
                }
                if (!isok) {
                    list.push(item);
                }
            }
            return list;
        },
        createSkillItems: function (items, skills) {
            var html = [];

            for (var i = 0; i < items.length; i++) {
                html.push(this.createSkillItem(items[i], skills));
            }
            this.element.html(html.join(""));
        }, level_color: ["wht", "hig", "hic", "hij", "hiz", "hio"]
        , get_lvdesc: function (level) {
            if (level < 1000)
                return Dialog.skills.skill_levels[parseInt(level / 50)];
            var v = parseInt((level - 1000) / 500);
            if (v > 6) v = 6;
            return Dialog.skills.skill_levels[v + 20];
        },
        skill_levels: [
            "<BLU>初学乍练</BLU>", "<BLU>不知所以</BLU>", "<HIB>粗通皮毛</HIB>", "<HIB>渐有所悟</HIB>",
            "<YEL>半生不熟</YEL>", "<YEL>马马虎虎</YEL>", "<HIY>平淡无奇</HIY>", "<HIY>触类旁通</HIY>",
            "<HIG>心领神会</HIG>", "<HIG>挥洒自如</HIG>", "<HIC>驾轻就熟</HIC>", "<HIC>出类拔萃</HIC>",
            "<CYN>初入佳境</CYN>", "<CYN>神乎其技</CYN>", "<MAG>威不可当</MAG>",
            "<HIW>豁然贯通</HIW>", "<HIW>超群绝伦</HIW>", "<RED>登峰造极</RED>", "<WHT>登堂入室</WHT>",
            "<HIM>一代宗师</HIM>", "<WHT>超凡入圣</WHT>", "<HIO>出神入化</HIO>", "<HIO>独步天下</HIO>",
            "<HIR>空前绝后</HIR>", "<HIR>旷古绝伦</HIR>", "<HIW>深不可测</HIW>", "<HIW>返璞归真</HIW>"]
        ,
        item_click: function () {
            var elem = $(this);
            var html = ["<div class='item-commands'>"];
            var item = Dialog.skills.skills[elem.attr("skid")];
            if (!item) return;
            html.push('<span cmd="checkskill ' + item.id + '">查看详细</span>');
            if (item.can_enables) {
                for (var i = 0; i < item.can_enables.length; i++) {
                    var baseSkill = Dialog.skills.skills[item.can_enables[i]];
                    if (!baseSkill) continue;
                    if (baseSkill.enable_skill != item.id)
                        html.push('<span cmd="enable ' + baseSkill.id + ' ' + item.id + '">装备' + baseSkill.name + '</span>');
                    else {
                        html.push('<span cmd="enable ' + baseSkill.id + ' none">取消装备' + baseSkill.name + '</span>');
                    }
                }
            }
            if (item.enable_skill) {
                var sp_skill = Dialog.skills.skills[item.enable_skill];
                if (sp_skill) html.push('<span cmd="enable ' + item.id + ' none">取消装备' + sp_skill.name + '</span>');
                else item.enable_skill = null;
            }
            html.push('<span cmd="_confirm fangqi ' + item.id + '">遗忘</span>');
            html.push('<span cmd="lianxi ' + item.id + '">练习</span>');
            html.push("</div>");
            Dialog.skills.element.find(".item-commands").remove();
            $(html.join("")).appendTo(elem);
        }
    };

    Dialog.master = {
        isShow: false,
        hide: function () {
            if (this.skill_element) {
                this.skill_element.remove();
                this.skill_element = null;
                this.element.removeClass("hide-item");
                return false;
            }
            this.isShow = false;
        },
        close: Dialog.skills.close,
        createSkillItems: Dialog.skills.createSkillItems,
        createSkillItem: Dialog.skills.createSkillItem,
        updateSkill: Dialog.skills.updateSkill,
        updateSkillItem: Dialog.skills.updateSkillItem,
        showdesc: Dialog.skills.showdesc,
        isEnable: Dialog.skills.isEnable,
        onData: function (data) {
            if (data.desc) {
                //显示技能描述
                return this.showdesc(data);
            }
            if (data.id) {
                //更新技能状态
                return this.updateSkill(data);
            }
            if (data.remove) {
                this.items.Remove(this.skills[data.remove]);
                var skill = this.skills[data.remove];
                for (var i = 0; i < this.items.length; i++) {
                    if (this.items[i].enable_skill == data.remove) {
                        this.items[i].enable_skill = null;
                    }
                }
                delete this.skills[data.remove];

                return this.createSkillItems(this.items);
            }
            if (!data.master && !data.follower) return;
            Dialog.show("master");
            this.master = data.master || data.follower;
            this.is_follower = !!data.follower;
            var skills = {};
            for (var i = 0; i < data.items.length; i++) {
                var item = data.items[i];
                skills[item.id] = item;
            }
            this.skills = skills;
            this.items = data.items;
            Dialog.title(data.title);
            Dialog.icon("book");
            this.createSkillItems(data.items, skills);
            if (data.limit) {
                if (this.is_follower)
                    Dialog.footer("<span class='obj-money'>" + data.target + "目前的技能上限为<HIC>" + data.limit + "</HIC>级</span>");
                else
                    Dialog.footer("<span class='obj-money'>你目前的技能上限为<HIC>" + data.limit + "</HIC>级</span>");
            }
        }, show: function () {
            if (this.isShow) return;
            if (!this.element) {
                this.element = $('<div class="dialog-skills"></div >');
            }
            this.element.on("click", ".skill-item", this.item_click);
            this.element.appendTo(Dialog.contentElement);
            this.element.removeClass("hide-item");
            this.isShow = true;
        }, item_click: function () {
            var elem = $(this);
            var item = Dialog.master.skills[elem.attr("skid")];
            if (!item) return;
            var html = ["<div class='item-commands'>"];
            html.push('<span cmd="checkskill ' + item.id + ' ' + Dialog.master.master + '">查看详细</span>');
            html.push('<span cmd="xue ' + elem.attr("skid") + ' from ' + Dialog.master.master + '">学习</span>');
            if (Dialog.master.is_follower) {
                var bf = 'dc ' + Dialog.master.master;
                html.push('<span cmd="_confirm ' + bf + ' fangqi ' + elem.attr("skid") + '">遗忘</span>');
                html.push('<span cmd="' + bf + ' lianxi ' + elem.attr("skid") + '">练习</span>');
                if (item.can_enables) {
                    for (var i = 0; i < item.can_enables.length; i++) {
                        var baseSkill = Dialog.master.skills[item.can_enables[i]];
                        if (!baseSkill) continue;
                        if (baseSkill.enable_skill != item.id)
                            html.push('<span cmd="' + bf + ' enable ' + baseSkill.id + ' ' + item.id + '">装备' + baseSkill.name + '</span>');
                        else {
                            html.push('<span cmd="' + bf + ' enable ' + baseSkill.id + ' none">取消装备' + baseSkill.name + '</span>');
                        }
                    }
                }
                if (item.enable_skill) {
                    var sp_skill = Dialog.master.skills[item.enable_skill];
                    if (sp_skill) html.push('<span cmd="' + bf + ' enable ' + item.id + ' none">取消装备' + sp_skill.name + '</span>');
                    else item.enable_skill = null;
                }
            }
            html.push("</div>");
            Dialog.master.element.find(".item-commands").remove();
            $(html.join("")).appendTo(elem);
        }
    }
    Dialog.pack = {
        close: Dialog.skills.close,
        hide: Dialog.skills.hide,
        command_before: '',
        updateitem: function (data) {
            if (!this.items) return;

            if (data.money != undefined) {
                this.money = data.money;
                this.show_moeny();
            }

            if (data.eq != undefined) {
                for (var i = 0; i < this.items.length; i++) {
                    if (this.items[i].id == data.id) {
                        this.eqs[data.eq] = this.items[i];
                        this.items.splice(i, 1);

                        break;
                    }
                }
                return true;
            } else if (data.uneq != undefined) {
                var item = this.eqs[data.uneq];
                item.can_eq = 1;
                item.count = 1;
                this.items.push(item);
                this.eqs[data.uneq] = null;
                return true;
            } else if (data.jldesc) {
                var str = [];
                str.push(data.jldesc);
                str.push("<span class='item-commands'>");
                str.push('<span cmd="' + this.command_before + 'jinglian ' + data.id + ' ok">精炼</span>');
                str.push("</span>");
                this.show_sub(str.join(""));
                return false;
            } else if (data.xqdesc) {
                var str = [];
                str.push(data.xqdesc);
                str.push("<span class='item-commands'>");
                for (var i = 0; i < data.stones.length; i++) {
                    var st = data.stones[i];
                    str.push('<span cmd="' + this.command_before + 'xiangqian ' + data.id + ' '
                        + st.id + '">镶嵌' + st.name + '</span><br/>');
                }
                str.push("</span>");
                this.show_sub(str.join(""));
                return false;
            }
            else if (data.desc) {
                var str = [];
                str.push(data.desc);
                str.push("<span class='item-commands'>");
                var from = data.from;
                if (from == "eq") {
                    str.push('<span cmd="' + this.command_before + 'uneq ' + data.id + '">取消装备</span>');
                } else if (from == "item") {
                    var obj = this.get_item(data.id);
                    if (obj) {
                        this.create_item_command(obj, str, data.commands);
                    }
                } else if (from == "store") {
                    str.push('<span cmd="_confirm qu ' + data.id + '">取出</span>');
                }
                else {
                    str.push('<span cmd="_confirm buy ' + data.id + ' from ' + Dialog.list.seller + '">购买</span>');
                }
                str.push("</span>");
                this.show_sub(str.join(""));
                return false;
            } else if (data.remove) {//丢掉的
                var items = this.items;
                for (var i = 0; i < items.length; i++) {
                    if (items[i].id == data.id) {
                        if (data.remove >= items[i].count) {
                            items.splice(i, 1);
                        } else {
                            items[i].count -= data.remove;
                        }
                        break;
                    }
                }
                return true;

            } else if (data.name) {//更新的
                var item = this.get_item(data.id);
                if (item) {
                    item.count = data.count;
                    item.name = data.name;
                } else {
                    this.items.push(data);
                }
                return true;
            } else if (data.max_item_count) {
                this.max_count = data.max_item_count;
                ReceiveMessage((Dialog.pack2.isShow ? Dialog.pack2.target_name : "你") + "的背包容量扩充为" + this.max_count + "。");

                return true;
            }

            return false;
        },
        get_item: function (id, items) {
            items = items || this.items;
            if (!items) return;
            for (var i = 0; i < items.length; i++) {
                if (items[i] && items[i].id == id) return items[i];
            }
        }, show_sub: function (str) {
            if (this.objelement) this.objelement.remove();
            var parent = this.packElement;

            if (Dialog.list.isShow) {
                parent = Dialog.list.rightElement;
            }
            this.objelement = $("<pre class='obj-desc'>" + str + "</pre>").appendTo(
                parent.parent()).on("click", function () {
                    this.objelement.remove();
                    this.objelement = null;
                    parent.show();
                }.bind(this));
            parent.hide();
            // ReceiveMessage(str);
            //console.log(parent.html());
        }, onData: function (data) {
            if (!data) return;
            if (data.items) {
                this.eqs = data.eqs || [];
                this.money = data.money;
                this.items = data.items;
                this.max_count = data.max_item_count;
            } else {
                if (Dialog.pack2.isShow && !data.name) return Dialog.pack2.onData(data);
                if (this.updateitem(data) == false) return;
            }
            if (!this.isShow) {
                if (Dialog.list.isShow) {
                    Dialog.list.update_pack(data);
                }
                if (Dialog.trade.isShow) {
                    Dialog.trade.update_pack(data);
                }
            } else {
                this.show_items();
                this.show_moeny();
            }


        },
        show_moeny: function () {
            if (!this.isShow) return;
            if (this.money) {
                Dialog.footer("<div class='obj-money'>" + moneyToStr(this.money));
            } else {
                Dialog.footer("<div class='obj-money'>" + (this.target_name || "你") + "身上没有任何银两</div>");
            }
        },
        show_items: function () {

            this.createItems();
            this.create_eqs();
            Dialog.icon("briefcase");
            var name = this.target_name || "你";
            Dialog.title(this.items.length ? (name + "身上共有" + this.items.length + "/" + this.max_count + "件物品") : (name + "身上没有任何东西"));

        },
        init_element: function () {
            if (!this.element) {
                this.element = $('<div class="dialog-pack"><div class="eq-list"><div class="eq-item"><span class="eq-type">武器</span><span class="eq-name"></span></div><div class="eq-item"><span class="eq-type">衣服</span><span class="eq-name"></span>' +
                    '</div > <div class="eq-item"><span class="eq-type">鞋</span><span class="eq-name"></span></div> <div class="eq-item"><span class="eq-type">头部</span><span class="eq-name"></span></div> <div class="eq-item">' +
                    '<span class="eq-type">披风</span><span class="eq-name"></span></div> <div class="eq-item"><span class="eq-type">戒指</span><span class="eq-name"></span></div> <div class="eq-item"><span class="eq-type">项链</span><span class="eq-name"></span>' +
                    '</div> <div class="eq-item"><span class="eq-type">饰品</span><span class="eq-name"></span></div> <div class="eq-item"><span class="eq-type">护腕</span><span class="eq-name"></span></div>' +
                    '<div class="eq-item"><span class="eq-type">腰带</span><span class="eq-name"></span></div><div class="eq-item"><span class="eq-type">暗器</span><span class="eq-name"></span></div></div><div class="obj-list"></div></div>');
                this.packElement = this.element.find(".obj-list");
                this.eqElement = this.element.find(".eq-list");
            }
        },
        show: function () {
            if (!Dialog.isShow) Dialog.show();
            if (this.objelement) {
                this.objelement.remove();
                this.objelement = null;
                this.packElement && this.packElement.show();
            }
            if (this.isShow) return SendCommand(this.items ? "pack none" : "pack");
            this.isShow = true;
            this.init_element();
            this.packElement.on("click", ".obj-item", Dialog.pack.item_click)
            this.eqElement.on("click", ".eq-item", Dialog.pack.eqitem_click);
            this.element.appendTo(Dialog.contentElement);
            if (!this.items) SendCommand("pack");
            else {
                SendCommand("pack none");
                this.show_items();
            }
        }, create_eqs: function () {
            var items = this.eqElement.find(".eq-item>.eq-name");
            for (var i = 0; i < items.length; i++) {
                var eq = this.eqs[i];
                $(items[i]).attr("oindex", i);
                if (eq) {
                    $(items[i]).html(eq.name);
                } else {
                    $(items[i]).html("");
                }
            }
        }, levels: {
            "wht": 0, "hig": 1, "hic": 2, "hiy": 3, "hiz": 4, "hio": 5, "ord": 6
        }, get_index: function (item) {
            var name = item.name.substr(1, 3).toLowerCase();
            return this.levels[name] + 1;
        },
        sort_items: function (items) {
            if (!items || !Setting.auto_sortitem) return items;
            var list = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var isok = false;
                if (!item.s_index) item.s_index = this.get_index(item);
                for (var j = 0; j < list.length; j++) {
                    if (item.s_index < list[j].s_index) {
                        list.splice(j, 0, item);
                        isok = true;
                        break;
                    }
                }
                if (!isok) {
                    list.push(item);
                }
            }
            return list;
        },
        createItems: function () {
            if (!this.items) return;
            var items = Dialog.pack.sort_items(this.items);
            var html = [];
            for (var i = 0; i < this.max_count; i++) {
                var item = items[i];
                html.push('<div class="obj-item" oindex="');
                html.push(item ? item.id : "");
                html.push('">');
                if (item) {
                    html.push(item.name);
                    if (this.show_type == 1) {
                        html.push("<span class='obj-value'>");
                        html.push("每");
                        html.push(item.unit);
                        html.push(moneyToStr(item.value));
                        html.push("：");
                        html.push(item.count);
                        html.push(item.unit);
                        html.push('</span>');
                    } else if (item.count > 1) {
                        html.push("<span class='obj-value'>");
                        html.push(item.count);
                        html.push(item.unit);
                        html.push('</span>');
                    }
                }
                html.push('</div>');
            }
            this.packElement.html(html.join(""));

        }, create_item_command: function (item, html, commands) {

            html.push('<span cmd="_confirm ' + this.command_before + 'drop ' + item.count + ' ' + item.id + '">丢掉</span>');
            //if (item.count > 1) {
            //    html.push('<span cmd="drop ' + item.count + " " + item.id + '">全部丢掉</span>');
            //}
            if (item.can_eq) {
                html.push('<span cmd="' + this.command_before + 'eq ' + item.id + '">装备</span>');
                if (!this.command_before) {
                    html.push('<span cmd="jinglian ' + item.id + '">精炼</span>');
                    html.push('<span cmd="xiangqian ' + item.id + '">镶嵌</span>');
                    html.push('<span cmd="shortcut ' + item.id + '">设置快速装备</span>');
                }
                html.push('<span cmd="_confirm ' + this.command_before + 'fenjie ' + item.id + '">分解</span>');

            }
            if (item.can_use) {
                html.push('<span cmd="' + this.command_before + 'use ' + item.id + '">使用</span>');
                if (!item.can_eq && !this.command_before) {
                    html.push('<span cmd="shortcut ' + item.id + '">设置快速使用</span>');
                }
            }
            if (item.can_open) {
                html.push('<span cmd="' + this.command_before + 'open ' + item.id + '">打开</span>');
            }
            if (item.can_study) {
                html.push('<span cmd="' + this.command_before + 'study ' + item.id + '">学习</span>');
            }
            if (item.can_combine && item.count >= item.can_combine) {
                html.push('<span cmd="_confirm ' + this.command_before + 'combine ' + item.id + ' ' + item.can_combine + '">合成</span>');
            }
            if (this.command_before) {
                html.push('<span cmd="_confirm ' + this.command_before + 'give ' + Process.player + ' ' + item.count + ' ' + item.id + '">拿来</span>');
            }
            if (commands) {
                for (var i = 0; i < commands.length; i++) {
                    html.push('<span cmd="packitem ' + commands[i].cmd + ' ' + item.id + '">' + commands[i].name + '</span>');
                }
            }
        }
        , item_click: function () {
            var elem = $(this);
            var obj = elem.attr("oindex");
            if (!obj) return;
            var item = Dialog.pack.get_item(obj);
            Dialog.pack.element.find(".item-commands").remove();
            if (!item) return;
            var html = ["<span class='item-commands'>"];
            html.push('<span cmd="checkobj ' + item.id + ' from item">查看</span>');
            Dialog.pack.create_item_command(item, html);
            html.push("</span>");
            $(html.join("")).appendTo(elem);
        }, eqitem_click: function () {
            var elem = $(this).find(".eq-name");
            var item = Dialog.pack.eqs[elem.attr("oindex")];
            if (!item) return;
            SendCommand("checkobj " + item.id + " from eq");
        }
    };
    Dialog.pack2 = {
        onData: function (data) {
            this.show();
            if (data.items) {
                this.eqs = data.eqs || [];
                this.money = data.money;
                this.id = data.id;
                this.command_before = "dc " + this.id + " ";
                this.items = data.items;
                this.target_name = data.name;
                this.max_count = data.max_item_count;
            } else {
                if (this.updateitem(data) == false) return;
            }
            this.show_items();
            this.show_moeny();

        },
        createItems: Dialog.pack.createItems,
        create_eqs: Dialog.pack.create_eqs,
        init_element: Dialog.pack.init_element,
        show_items: Dialog.pack.show_items,
        updateitem: Dialog.pack.updateitem,
        show_moeny: Dialog.pack.show_moeny,
        show_sub: Dialog.pack.show_sub,
        close: Dialog.skills.close,
        hide: function () {
            this.element.remove();
            this.isShow = false;
        },
        get_item: Dialog.pack.get_item,
        create_item_command: Dialog.pack.create_item_command,
        show: function () {
            if (!Dialog.isShow) Dialog.show("pack2");
            if (this.objelement) {
                this.objelement.remove();
                this.objelement = null;
                this.packElement && this.packElement.show();
            }
            if (this.isShow) return;
            this.isShow = true;
            this.init_element();
            this.packElement.on("click", ".obj-item", this.item_click)
            this.eqElement.on("click", ".eq-item", this.eqitem_click);
            this.element.appendTo(Dialog.contentElement);
        }
        , item_click: function () {
            var elem = $(this);
            var obj = elem.attr("oindex");
            if (!obj) return;
            var item = Dialog.pack2.get_item(obj);
            Dialog.pack2.element.find(".item-commands").remove();
            if (!item) return;
            var html = ["<span class='item-commands'>"];
            html.push('<span cmd="' + Dialog.pack2.command_before + ' checkobj ' + item.id + ' from item">查看</span>');
            Dialog.pack2.create_item_command(item, html);
            html.push("</span>");
            $(html.join("")).appendTo(elem);
        }, eqitem_click: function () {
            var elem = $(this).find(".eq-name");
            var item = Dialog.pack2.eqs[elem.attr("oindex")];
            if (!item) return;
            SendCommand(Dialog.pack2.command_before + " checkobj " + item.id + " from eq");
        }

    };
    Dialog.trade = {
        hide: function () {
            this.element.remove();
            this.isShow = false;
        },
        close: function () {
            this.hide();
        }, onData: function (data) {
            if (!this.isShow) {
                Dialog.show("trade");
            }
            Dialog.title("和" + data.name + "交易中");
            var items = Dialog.pack.items;
            this.trade_target = data.target;
            this.trade_list.length = 0;
            if (!Dialog.pack.items) SendCommand("pack");
            else this.update_pack();
            Dialog.pack.isShow = false;
            this.create_items(this.leftElement.empty(), this.trade_list, this.max_count);
        },
        update_pack: function (data) {
            this.create_items(this.rightElement.empty(), Dialog.pack.items, Dialog.pack.max_count);
        },
        max_count: 10,
        trade_list: [],
        show: function (data) {
            if (this.isShow) return;
            Dialog.init();
            Dialog.curItem = "trade";
            if (!this.element) {
                this.element = $('<div class="dialog-list"><div class="obj-list"></div><div class="obj-list"></div></div >');
                this.leftElement = $(this.element.children()[0]);
                this.rightElement = $(this.element.children()[1]);
            }
            this.leftElement.on("click", ".obj-item", this.left_click);
            this.rightElement.on("click", ".obj-item", this.right_click);
            this.element.appendTo(Dialog.contentElement.empty());
            this.create_footer();
            this.isShow = true;

        }, create_footer: function () {
            var html = [];
            html.push("<span class='footer-item trade_btn ok' for='1''>确定</span>");
            html.push("<span class='footer-item  trade_btn' for='0''>取消</span>");
            Dialog.footer(html.join(""));
        }, footerChanged: function (i) {
            i = parseInt(i);
            if (i && this.trade_list.length) {
                for (var i = 0; i < this.trade_list.length; i++) {
                    SendCommand("give " + this.trade_target + " " + this.trade_list[i].count + " " + this.trade_list[i].id);
                }

            }
            Dialog.hide();

        },
        create_items: function (elem, items, max) {
            var html = [];
            items = Dialog.pack.sort_items(items);
            for (var i = 0; i < max; i++) {
                var item = items[i];
                html.push('<div class="obj-item" oindex="');
                html.push(item ? item.id : "");
                html.push('"');
                if (item) {
                    html.push(" oid='" + item.id + "'>");
                    html.push(item.name);
                    if (item.count > 1) {
                        html.push("<span class='obj-value'>");
                        html.push(item.count);
                        html.push(item.unit);
                        html.push('</span>');
                    }
                } else {
                    html.push("'>");
                }
                html.push('</div>');
            }
            elem.html(html.join(""));
        }, left_click: function () {
            var elem = $(this);
            var obj = elem.attr("oindex");
            if (!obj) return;
            var item = null;
            for (var i = 0; i < Dialog.trade.trade_list.length; i++) {
                if (Dialog.trade.trade_list[i].id == obj) {
                    item = Dialog.trade.trade_list[i];
                    break;
                }
            }
            if (!item) return;
            Dialog.trade.cancle_trade(item);
            return false;
        }, enable_item: function (obj, isenable) {
            var elem = this.rightElement.find(".obj-item[oid='" + obj.id + "']");
            if (!elem.length) return;
            if (isenable) {
                elem.removeClass("disabled");
            } else {
                elem.addClass("disabled");
            }
        }
        ,
        right_click: function () {
            var elem = $(this);
            if (elem.is(".disabled")) return;
            var obj = elem.attr("oindex");
            if (!obj) return;

            var item = Dialog.pack.get_item(obj);

            if (!item) return;
            if (item.count > 1) {
                Confirm.Show_trade_add(item);
            } else {
                Dialog.trade.add_trade(item);
            }
            return false;
        }, add_trade: function (obj) {
            for (var i = 0; i < this.trade_list.length; i++) {
                if (obj.id == this.trade_list[i].id) {
                    this.trade_list[i].count += obj.count;
                    return this.create_items();
                }
            }
            this.trade_list.push(obj);
            this.create_items(this.leftElement.empty(), this.trade_list, this.max_count);
            this.enable_item(obj, false);
        },
        cancle_trade: function (obj) {
            for (var i = 0; i < this.trade_list.length; i++) {
                if (obj.id == this.trade_list[i].id) {
                    this.trade_list.splice(i, 1);
                    i--;
                }
            }
            this.create_items(this.leftElement.empty(), this.trade_list, this.max_count);
            this.enable_item(obj, true);
        }
    }
    Dialog.list = {
        hide: function () {
            this.element.remove();
            this.isShow = false;
        },
        close: function () {
            this.hide();
        },
        level_desc: ["wht", "nor", "hic", "hiy", "him", "hio"],
        updateitem: function (data) {
            if (data.store) {
                var item = this.find_item(1, data.id);
                var store_item = this.find_item(3, data.storeid);
                if (!item) {
                    item = $.extend({}, store_item);
                    item.id = data.id; item.count = (-data.store);
                    Dialog.pack.items.push(item);
                } else {
                    item.count -= data.store;
                }
                if (!store_item) {
                    store_item = $.extend({}, item);
                    store_item.id = data.storeid; store_item.count = data.store;
                    this.stores.push(store_item);
                } else {
                    store_item.count += data.store;
                }
                if (store_item.count == 0) this.stores.Remove(store_item);
                if (item.count == 0) Dialog.pack.items.Remove(item);
            } else if (data.sell) {
                var item = this.find_item(2, data.id);
                if (item) {
                    item.count -= data.sell;
                    return this.create_items(this.selllist, this.leftElement, 2, this.selllist.length);
                }
            }
            if (this.isstore) {
                this.create_items(this.stores, this.leftElement, 3, this.max_store_count);
                Dialog.title("你的仓库中有" + this.stores.length + "/" + this.max_store_count + "件物品");
            }
            this.update_pack();
            if (data.money != undefined) this.show_footer(data.money);
        }, find_item: function (otype, id) {
            var items = Dialog.pack.items;
            if (otype == 2) items = this.selllist;
            else if (otype == 3) items = this.stores;
            for (var i = 0; i < items.length; i++) {
                if (items[i].id == id) { return items[i]; }
            }
        }, onData: function (data) {
            this.show();
            if (!data) return;
            if (data.id) {
                return this.updateitem(data);
            }
            var gongji = data.gongji || data.jungong;
            if (data.selllist) {
                this.isstore = false;
                this.gongji = gongji;
                this.money_name = null;
                if (data.gongji) this.money_name = '门派功绩';
                else if (data.jungong) this.money_name = "军功";

                this.selllist = data.selllist;
                this.create_items(data.selllist, this.leftElement, 2, data.selllist.length);
                Dialog.titleElement.html(data.title);
                Dialog.icon("shopping-cart");
            }
            this.update_pack();
            if (data.stores) {
                this.create_items(data.stores, this.leftElement, 3, data.max_store_count);
                this.isstore = true;
                this.stores = data.stores;
                Dialog.titleElement.html("你的仓库中有" + data.stores.length + "/" + data.max_store_count + "件物品");
                this.max_store_count = data.max_store_count;
                Dialog.icon("lock");
            }
            if (gongji) {
                this.gongji = gongji;
                this.show_footer(gongji);
            }

            if (data.seller) this.seller = data.seller;
        },
        show: function (data) {
            if (!Dialog.isShow || Dialog.curItem != "list")
                Dialog.show("list");
            if (this.rightElement) {
                this.rightElement.show();
                if (Dialog.pack.objelement) Dialog.pack.objelement.remove();
            }
            if (this.isShow) return;
            if (!this.element) {
                this.element = $('<div class="dialog-list"><div class="obj-list"></div><div class="obj-list"></div></div >');
                this.leftElement = $(this.element.children()[0]);
                this.rightElement = $(this.element.children()[1]);
            }
            this.element.on("click", ".obj-item", Dialog.list.item_click);
            this.element.appendTo(Dialog.contentElement.empty());
            this.isShow = true;

        },
        show_footer: function (money) {
            money = this.money_name ? this.gongji : money;
            if (money > 0) {
                var str = this.money_name ? ("你目前有" + money + "<hiy>" + this.money_name + "</hiy>") : ("你身上有" + moneyToStr(money));
                Dialog.footerElement.html("<div class='obj-money'>" + str + "<span cmd='sell all'>清理包裹</span></div>");
            } else {
                var str = this.money_name ? ("你还没有<hiy>" + this.money_name + "</hiy>") : "你身上没有任何银两";
                Dialog.footerElement.html("<div class='obj-money'>" + str + "<span cmd='sell all'>清理包裹</span></div>");
            }
        }, update_pack: function () {
            var items = Dialog.pack.items;
            if (!items) SendCommand("pack");
            else {
                this.create_items(items, this.rightElement, 1, Dialog.pack.max_count);
                this.show_footer(Dialog.pack.money);
            }
        }
        ,
        create_items: function (items, elem, otype, max_count) {
            var html = [];
            //otype 1自己的物品 2，贩卖的物品
            var list = items;
            if (otype == 1 || otype == 3) {
                list = Dialog.pack.sort_items(items);
            }
            for (var i = 0; i < max_count; i++) {
                var item = list[i];
                html.push('<div class="obj-item" ');
                if (item) {
                    html.push('obj="');
                    html.push(item.id);
                    html.push('" otype="')
                    html.push(otype);
                    html.push('">');

                    html.push(item.name);
                    html.push("<span class='obj-value'>");
                    if (otype == 2) {

                        html.push("每");
                        html.push(item.unit);

                        html.push(this.money_name ? (item.value + "<hiy>" + this.money_name + "</hiy>") : moneyToStr(item.value));
                        if (item.count == -1) {
                            html.push("：大量现货");
                        } else {
                            html.push("：剩余");
                            html.push(item.count);
                            html.push(item.unit);
                        }

                    } else if (otype == 1 && !this.isstore) {
                        if (item.value) {
                            html.push("每");
                            html.push(item.unit);
                            html.push(moneyToStr(item.value));
                            html.push("：");
                            html.push(item.count);
                            html.push(item.unit);
                        } else {
                            html.push("不可出售");
                        }

                    } else if (item.count > 1) {
                        html.push(item.count);
                        html.push(item.unit);
                    }
                    html.push('</span>');
                } else {
                    html.push('">');
                }

                html.push('</div>');
            }
            elem.html(html.join(""));
        }
        , item_click: function () {
            var elem = $(this);
            var obj = elem.attr("obj");
            var otype = elem.attr("otype");
            var item = Dialog.list.find_item(otype, obj);
            if (!item) return;
            var html = ["<div class='item-commands'>"];
            if (Dialog.list.isstore) {
                if (otype == 3) {
                    html.push('<span cmd="checkobj ' + obj + ' from store">查看</span>');
                    html.push('<span cmd="_confirm qu ' + obj + '">取出</span>');
                } else if (otype == 1) {
                    html.push('<span cmd="checkobj ' + obj + ' from item">查看</span>');
                    html.push('<span cmd="_confirm store ' + item.count + ' ' + obj + '">存到仓库</span>');
                }
            } else {
                if (otype == 2) {
                    html.push('<span cmd="checkobj ' + obj + ' from ' + Dialog.list.seller + '">查看</span>');
                    if (item.count)
                        html.push('<span cmd="_confirm buy ' + item.count + ' ' + obj + ' from ' + Dialog.list.seller + '">购买</span>');
                } else if (otype == 1) {

                    html.push('<span cmd="checkobj ' + obj + ' from item">查看</span>');
                    html.push('<span cmd="_confirm sell ' + item.count + ' ' + obj + ' to ' + Dialog.list.seller + '">卖掉</span>');
                }
            }


            html.push("</div>");
            Dialog.list.element.find(".item-commands").remove();
            $(html.join("")).appendTo(elem);
        }
    };
    function moneyToStr(value) {
        if (!value) return "";
        var str = [];
        if (value >= 10000) {
            str.push(parseInt(value / 10000) + "两<hiy>黄金</hiy>");
            value = value % 10000;
        }
        if (value > 100) {
            str.push(parseInt(value / 100) + "两<wht>白银</wht>");
            value = value % 100;
        }
        if (value > 0) {
            str.push(value + "个<yel>铜板</yel>");
        }
        return str.join("");
    }
    Dialog.channel = {
        footer: [["全部", ""], ["世界", "chat"], ["队伍", "tm"], ["门派", "fam"], ["全区", "es"], ["帮派", "pty"], ["系统", "sys"]],
        isScroll: true,
        last_click: 0,
        show: function () {
            if (Date.now() - this.last_click > 500) {
                this.last_click = Date.now();
                return;
            }
            if (Dialog.channel.isShow) return;
            Dialog.select("channel");
            Dialog.icon("comment");
            Dialog.title("");
            Dialog.footer("");
            for (var i = 0; i < Dialog.channel.footer.length; i++) {
                var elem = $("<span class='footer-item channel-item' for='" + Dialog.channel.footer[i][1] + "'>"
                    + Dialog.channel.footer[i][0] + "</span>").appendTo(Dialog.footerElement);
                if (i == 0) elem.addClass("select");
            }
            Dialog.contentElement.html("").append(Process.ChannelElement.addClass("channel-dialog"));

            Dialog.channel.isShow = true;
            Dialog.channel.scrollBottom();

        }, hide: function () {
            Dialog.channel.footerChanged("");
            Process.ChannelElement.removeClass("channel-dialog").insertBefore(MessageContent);

            //Process.ChannelElement.on("dblclick", Dialog.channel.show);
            //Process.ChannelElement.on("scroll", Dialog.channel.scroll);
            this.scrollBottom();
            this.isShow = false;
        }, close: function () {
            this.hide();
        }, scrollBottom: function () {
            if (Dialog.channel.isScroll)
                Process.ChannelElement[0].scrollTop = 999999;
        }, isBottom: function () {
            return true;
            //return Process.ChannelPro.height() == Process.ChannelElement.height() + Process.ChannelElement[0].scrollTop;
        }, endScroll: function () {
            Dialog.channel.isScroll = false;
        }, beginScroll: function () {
            Dialog.channel.isScroll = true;
        },
        footerChanged: function (type) {
            if (Dialog.channel.select_item == type) return;
            Dialog.channel.select_item = type;
            var str = [];
            for (var i = 0; i < this.datas.length; i++) {
                var item = this.datas[i];
                if (!type || item[0] == type) {
                    str.push(item[1]);
                }
            }

            Process.ChannelPro.html(str.join(""));
            this.scrollBottom();
        }, datas: [], createElement: function (data, isTop) {
            var color = "hic";
            var name = "";
            switch (data.ch) {
                case "tm":
                    color = "hig";
                    name = "队伍";
                    break;
                case "fam":
                    color = "hiy";
                    name = data.fam || "门派";
                    break;
                case "rumor":
                    color = "him";
                    name = "谣言";
                    data.name = "某人";
                    break;
                case "sys":
                    color = "hir";
                    name = "系统";
                    data.name = "";
                    break;
                case "es":
                    color = "hio";
                    name = data.server;
                    data.uid = null;
                    break;
                case "pty":
                    color = "hiz";
                    name = "帮派";
                    break;
                default:
                    name = ["闲聊", "闲聊", "闲聊", "<hiy>宗师</hiy>", "<HIZ>武圣</HIZ>", "<hio>武帝</hio>", "<ord>武神</ord>"][data.lv]
                    break;
            }
            var html = ["<", color, ">【"];
            html.push(name);
            html.push("】");
            if (data.name) {
                html.push("<span");
                if (data.uid) html.push(" cmd='look3 " + data.uid + "'");
                html.push(">");
                html.push(data.name);
                html.push("</span>：");
            }
            html.push(data.content);
            if (isTop) {
                html.push("\n");
            }
            var str = html.join("");
            if (this.datas.length > 500) {
                this.datas.length = 0;
            }
            if (data.ch == "rumor") data.ch = "sys";
            this.datas.push([
                data.ch, str
            ]);
            if (this.select_item && this.select_item != data.ch) {
                return "";
            }
            return str;
        }

    };
    Dialog.setting = {
        footer: [["显示", "setting"], ["帮助", "help"], ["<yel>高级</yel>", "custom"]],
        selectitem: null,
        init: function () {
            if (!this.settingElement) {
                this.settingElement = $(".dialog-setting");
                this.gamesettingElement = $(".dialog-gamesetting");
                this.helpElement = $(".dialog-help");
                this.customElement = $(".dialog-custom");
                var elems = $(".setting>.setting-item");
                for (var i = 0; i < elems.length; i++) {
                    var item = $(elems[i]);
                    var prop = item.attr("for");
                    if (!prop) continue;
                    var value = Setting[prop];
                    switch (prop) {
                        case "fontsize":
                            this.select_color(item.find(".color-item"), value, "fontSize");
                            break;
                        case "fontcolor":
                            this.select_color(item.find(".color-item"), value, "backgroundColor");
                            break;
                        case "backcolor":
                            this.select_color(item.find(".color-item"), value, "backgroundColor");
                            break;
                        case "auto_pfm":
                        case "auto_pfm2":
                            if (value) {
                                item.find(".switch ").addClass("on");
                                item.find(".switch-text").html("开");
                                $("#" + prop).show().val(value);
                            }
                            break;
                        case "auto_work":
                            if (value) {
                                item.find(".switch ").addClass("on");
                                item.find(".switch-text").html("开");
                                $("#" + prop).show().val(value != 1 ? value : "");
                            }
                            break;
                        default:
                            if (value == 1) {
                                item.find(".switch ").addClass("on");
                                item.find(".switch-text").html("开");
                            }
                            break;
                    }
                }
            }
        },
        show: function () {
            this.init();
            if (this.isShow) return;
            this.footerChanged("setting");
            Dialog.icon("cog");
            Dialog.title("设置");
            Dialog.footerElement.empty();
            for (var i = 0; i < this.footer.length; i++) {
                var elem = $("<span class='footer-item' for='" + this.footer[i][1] + "'>"
                    + this.footer[i][0] + "</span>").appendTo(Dialog.footerElement);
                if (i == 0) elem.addClass("select");
            }
            this.isShow = true;
        }, select_color: function (elems, value, style) {
            for (var i = 0; i < elems.length; i++) {
                if (elems[i].style[style] == value) {
                    $(elems[i]).addClass("select");
                } else {
                    $(elems[i]).removeClass("select");
                }
            }
        },
        footerChanged: function (item) {
            this.selectitem && this.selectitem.remove();
            this.selectitem = this[item + "Element"];
            if (item == "setting") {
                this.selectitem.on("click", ".switch", this.switchClick);
                this.selectitem.on("click", ".color-item", this.colorClick);
            } else if (item == "custom") {
                this.selectitem.on("click", ".switch", this.switchClick);
                this.selectitem.on("click", ".setting-ok", this.save_custom);
            } else {
                this.selectitem.on("click", ".help-item", this.helpClick);
            }
            this.selectitem.appendTo(Dialog.contentElement);
        }, helpClick: function () {
            var elem = $(this);
            var act = elem.attr("action");
            switch (act) {
                case "tologin":
                    break;
                case "torole":
                    GameClient.Close();
                    HideAndShow("#role_panel", function () {
                        Process.player = null;
                        Process.clear();
                    });
                    break;
                case "toserver":
                    Process.player = null;
                    GameClient.Close();
                    break;
                default:
                    Dialog.setting.show_help(act);
                    break;
            }
        }, show_help: function (page) {
            Util.Get('doc/' + page + '.html', function (x) {
                if (x) {
                    this.frame = $("<div class='help-content'>" + x + "</div>").appendTo(this.selectitem);
                }
            }.bind(this));
            // this.frame = $('<iframe src="/doc/' + page + '.html" width="100%" height="100%" frameborder="no" border="0" marginwidth="0" marginheight="0"  allowtransparency="yes"></iframe>').appendTo(this.selectitem);
            this.selectitem.addClass("help-detl");
        },
        close_help: function () {
            if (this.frame) {
                this.frame.remove();
                this.selectitem.removeClass("help-detl");
                this.frame = null;
            }
        }, hide: function () {
            if (this.frame) {
                this.close_help();
                return false;
            }
            else
                this.close();
        }
        ,
        close: function () {
            this.close_help();
            this.selectitem.remove();
            // Dialog.footerElement.addClass("hide");
            this.isShow = false;

        }
        , save_custom: function () {
            if ($(".dialog-custom>.setting-item[for='auto_pfm']>.switch").is(".on")) {
                var val = $("#auto_pfm").val();
                if (!val) return ReceiveMessage("<hir>你没有设置自动出招的绝招。</hir>");
                if (val.length > 300) return ReceiveMessage("<hir>你设置的出招过长。</hir>");
                Setting.save("auto_pfm", val);
            }
            if ($(".dialog-custom>.setting-item[for='auto_pfm2']>.switch").is(".on")) {
                var val = $("#auto_pfm2").val();
                if (!val) return ReceiveMessage("<hir>你没有设置自动反击的绝招。</hir>");
                if (val.length > 300) return ReceiveMessage("<hir>你设置的出招过长。</hir>");
                Setting.save("auto_pfm2", val);
            }
            if ($(".dialog-custom>.setting-item[for='auto_work']>.switch").is(".on")) {
                var val = $("#auto_work").val();
                if (val && val.length > 300) return ReceiveMessage("<hir>你设置的过长。</hir>");
                Setting.save("auto_work", val || 1);
            }
            ReceiveMessage("<hic>设置已保存。</hic>");

        }, get_pfms: function (id) {
            if (!Combat.Skills) {
                return ReceiveMessage("<hir>你没有可用的绝招设置。</hir>");
            }
            var str = [];
            for (var i = 0; i < Combat.Skills.length; i++) {
                if (str.length > 0) str.push(",");
                str.push(Combat.Skills[i].id);

            }
            $("#" + id).val(str.join(""));
            ReceiveMessage("<hic>已自动设置为你默认的绝招，你可以修改为适合你的出招顺序后点击保存。</hic>");


        }, switchClick: function (e) {
            var elem = $(this);
            var forProp = elem.parent().attr("for");
            //if (!forProp) return;
            var value = 0;
            if (elem.is(".on")) {
                elem.removeClass("on");
                elem.find(".switch-text").html("关");
            } else {
                elem.addClass("on");
                elem.find(".switch-text").html("开");
                value = 1;
            }
            switch (forProp) {
                case "auto_pfm":
                case "auto_pfm2":
                    if (value) {
                        $("#" + forProp).show();
                        Dialog.setting.get_pfms(forProp);
                        Setting[forProp] = 0;
                    } else {
                        $("#" + forProp).hide();
                        Setting.save(forProp, 0);
                    }
                    break;
                case "auto_work":
                    if (value) {
                        $("#" + forProp).show();
                    } else {
                        $("#" + forProp).hide();
                        Setting.save(forProp, 0);
                    }
                    break;
                default:
                    Setting.save(forProp, value);
                    break;
            }
            e.cancelable = true;
            return false;
        }, colorClick: function () {
            var elem = $(this);
            if (elem.is(".select")) return;
            var par = elem.parent();
            par.children().removeClass("select");
            elem.addClass("select");
            var forProp = par.closest(".setting-item").attr("for");
            if (!forProp) return;
            var value = "";
            switch (forProp) {
                case "fontsize":
                    value = elem[0].style.fontSize;
                    break;
                case "fontcolor":
                    value = elem[0].style.backgroundColor;
                    break;
                case "backcolor":
                    value = elem[0].style.backgroundColor;
                    break;
            }
            Setting.save(forProp, value);
        }
    };
    Dialog.tasks = {
        close: function () {
            this.element.remove();
            this.isShow = false;
        }, update_item: function (data) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id == data.id) {
                    if (data.state) {
                        this.items[i].title = data.title;
                        this.items[i].state = data.state;
                        this.items[i].desc = data.desc;
                    } else {
                        this.items.splice(i, 1);
                    }

                    break;
                }
            }
            this.create_items();
        }, onData: function (data) {

            if (data.id) return this.update_item(data);
            Dialog.title("任务列表");
            Dialog.icon("exclamation-sign");
            this.items = data.items;
            this.create_items();
        },
        show: function () {
            if (!this.element)
                this.element = $("<div class='dialog-tasks'></div>");
            SendCommand("tasks");
            if (this.isShow) return;
            this.element.appendTo(Dialog.contentElement);
            Dialog.footer("");
            this.isShow = true;
        }, create_items: function () {
            var str = [];
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];
                str.push("<div class='task-item'>");
                str.push("<h3>");
                str.push(i + 1);
                str.push("· ");
                str.push(item.title)
                str.push("</h3>");
                str.push("<pre class='task-desc'>");
                str.push(item.desc)
                str.push("</pre>");
                str.push("<span");
                if (item.state == 1) {
                    str.push(" class='task-btn start'>");
                    str.push("进行中");
                } else if (item.state == 2) {
                    str.push(" cmd=\"taskover ");
                    str.push(item.id);
                    str.push('"');
                    str.push(" class='task-btn finish'>");
                    str.push("可领取");
                } else if (item.state == 3) {
                    str.push(" class='task-btn over'>");
                    str.push("已完成");
                }
                str.push("</span>");
                str.push("</div>");
            }
            this.element.html(str.join(""));
        }
    };
    Dialog.stats = {
        footers: [{ cmd: "score", name: "综合榜" }, { cmd: "top", name: "高手榜" }, { cmd: "weapon", name: "兵器谱" }
        ],
        selectedItem: 0,
        close: function () {
            this.element.remove();
            this.isShow = false;
        }, onData: function (data) {
            if (data.close) return Dialog.hide();
            if (data.tops) {
                if (data.top) {
                    this.show_desc("你目前在第" + data.top + "名");
                } else {
                    this.show_desc("你目前没有上榜");
                }

                return this.create_tops(data.tops, data);
            }
            if (data.weapons) {
                this.show_desc("");
                return this.create_weapons(data.weapons);
            }
            if (data.scores) {
                this.show_desc("你目前的评分：" + data.score);
                return this.create_scores(data.scores);
            }

        }, create_scores: function (items, data) {
            var html = [];
            var str = ["一　", "二　", "三　", "四　", "五　",
                "六　", "七　", "八　", "九　", "十　",
                "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十"];
            for (var i = 0; i < str.length; i++) {
                html.push("<div class='top-item scores top")
                html.push(i + 1);
                html.push("' top='");
                html.push(i + 1);
                html.push("'><span class='top-title'>");
                html.push(str[i]);
                html.push("、</span>");
                html.push("<span class='top-name'>");
                html.push(items[i][0]);
                html.push("</span>");
                html.push("<span class='top-sc'>");
                html.push(items[i][1]);
                html.push("</span>");
                html.push("</div>")
            }
            this.element.html(html.join(""));
        }, create_tops: function (items, data) {
            var html = [];
            var str = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
            for (var i = 0; i < str.length; i++) {
                html.push("<div class='top-item top top")
                html.push(i + 1);
                html.push("' top='");
                html.push(i + 1);
                html.push("'><span class='top-title'>");
                html.push("天下第");
                html.push(str[i]);
                html.push("</span>");
                html.push("<span class='top-name'>");
                html.push(items[i]);
                html.push("</span>");
                html.push("</div>")
            }
            this.element.html(html.join(""));
            this.top = data.top;
        }, create_weapons: function (items) {
            var html = [];
            var str = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
            for (var i = 0; i < str.length; i++) {
                html.push("<div class='top-item weapon top")
                html.push(i + 1);
                html.push("' top='");
                html.push(i + 1);
                html.push("'><span class='top-title'>");
                html.push(str[i]);
                html.push("、</span>");
                html.push("<span class='top-name'>");
                html.push(items[i]);
                html.push("</span>");
                html.push("</div>")
            }
            this.element.html(html.join(""));
        }, show: function () {
            if (!this.selectedItem) this.selectedItem = this.footers[0];
            SendCommand("stats " + this.selectedItem.cmd);
            if (!this.element)
                this.element = $("<div class='dialog-stats'></div>");
            if (this.isShow) return;
            this.create_footer();
            Dialog.icon("stats");
            Dialog.contentElement.html(this.element);
            this.element.on("click", ".top-item", this.itemClick);
            this.isShow = true;
        }, create_footer: function () {
            var html = [];
            for (var i = 0; i < this.footers.length; i++) {
                var foot = this.footers[i];
                html.push("<span class='footer-item" + (foot == this.selectedItem ? " select" : "") + "' for='" + i + "''>"
                    + foot.name + "</span>");
            }
            html.push("<span class='stats-span'></span>");
            Dialog.footer(html.join(""));
        }, show_desc: function (msg) {
            Dialog.footerElement.find(".stats-span").html(msg);
        }
        , footerChanged: function (index) {
            var item = this.footers[index];
            if (item == this.selectedItem) return;
            this.selectedItem = item;
            Dialog.title(this.selectedItem.name);
            SendCommand("stats " + this.selectedItem.cmd);
        },
        itemClick: function () {
            var elem = $(this);
            var index = parseInt(elem.attr("top"));
            var istop = elem.is(".top");
            var isweapon = elem.is(".weapon");

            var html = ["<div class='item-commands'>"];
            if (istop) {
                html.push('<span cmd="look1 ' + index + '">查看</span>');
                if (!Dialog.stats.top || index < Dialog.stats.top) {
                    html.push('<span cmd="challenge ' + index + '">挑战</span>');
                } else if (index == Dialog.stats.top) {
                    html.push('<span cmd="stats copy">更新应战状态</span>');
                }
                html.push('<span cmd="reward top ' + index + '">查看奖励</span>');
            } else if (isweapon) {
                html.push('<span cmd="stats weapon ' + index + '">查看</span>');
                html.push('<span cmd="reward weapon ' + index + '">查看奖励</span>');
            } else {
                html.push('<span cmd="stats score ' + index + '">查看</span>');
                html.push('<span cmd="reward score ' + index + '">查看奖励</span>');
            }
            html.push("</div>");
            Dialog.stats.element.find(".item-commands").remove();
            $(html.join("")).appendTo(elem);
        }
    };
    Dialog.jh = {
        unlock: 0,
        close: function () {
            this.element.remove();
            this.isShow = false;
        }, update_item: function (data) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id == data.id) {
                    if (data.state) {
                        this.items[i].title = data.title;
                        this.items[i].state = data.state;
                        this.items[i].desc = data.desc;
                    } else {
                        this.items.splice(i, 1);
                    }

                    break;
                }
            }
            this.create_items();
        }, onData: function (data) {
            if (data.close) {
                return Dialog.isShow && Dialog.hide();
            }
            if (data.desc) {
                if (data.t == "fb") {
                    var fb = this.fbs[data.index];
                    if (!fb) return;
                    fb.desc = data.desc;
                    fb.reward = data.reward;
                    fb.is_diffi = data.is_diffi;
                    fb.is_multi = data.is_multi;
                    fb.no_single = data.no_single;
                    return this.show_fbdesc(fb);
                } else if (data.t == "fam") {
                    var fb = this.families[data.index];
                    if (!fb) return;
                    fb.desc = data.desc;
                    fb.sp = data.sp;
                    fb.skills = data.skills;
                    fb.no_cache = data.no_cache;
                    fb.iszc = data.iszc;
                    return this.show_famdesc(fb);
                }
            }
            if (data.unlock) {
                this.unlock = data.unlock || 0;
                if (this.unlock >= this.fbs.length)
                    this.unlock = this.fbs.length - 1;
                this.update_lock();
                return;
            }
            if (!data.fbs) return;
            this.fbs = data.fbs.map(function (x) { return { name: x }; });
            this.families = data.families.map(function (x) { return { name: x }; });
            this.create_footer();
            this.show_family();
        }, show_famdesc: function (fb) {
            if (!fb) return;
            var html = ["<pre><hig>"];
            html.push(fb.name);
            html.push("</hig>\n");
            html.push(fb.desc);
            if (fb.sp) {
                html.push("\n<hig>特点：");
                html.push(fb.sp);
                html.push("</hig>");
            }
            if (fb.iszc) {
                if (fb.wait) {
                    html.push('\n<span class="item-commands"><span  class="disabled">已报名参加正在等待进入战场</span></span>');
                } else {
                    html.push('\n<span class="item-commands" ><span  cmd="">报名参加</span></span>');
                }

            } else {
                html.push('\n<span class="item-commands"><span cmd="jh fam ' + fb.index + ' start">进入地图</span></span>');
            }
            if (fb.skills) {
                html.push(fb.skills);
            }

            html.push("</pre>");
            this.descElement.html(html.join(""));
            this.select(fb.index);
            if (fb.no_cache) fb.desc = null;
        }, select: function (index) {
            var elem = this.listElement.find("span[index='" + index + "']");
            if (elem.length && !elem.is(".selected")) {
                var top = elem[0].offsetTop;
                var height = this.listElement.height();
                if (top > height / 2) {
                    top = (height - elem.height()) / 2;
                    Dialog.jh.listElement[0].scrollTop = top;
                }
                if (Dialog.jh.selectedItem) Dialog.jh.selectedItem.removeClass("selected");
                Dialog.jh.selectedItem = elem;
                Dialog.jh.selectedItem.addClass("selected");
            }
        },
        show_fbdesc: function (fb) {
            if (!fb) return;
            var html = ["<pre>"];
            html.push(fb.name);
            if (this.unlock >= fb.index) {
                html.push("<hig>已解锁</hig>");
            } else {
                html.push("<red>未解锁</red>");
            }
            html.push(fb.desc);
            if (this.unlock >= fb.index) {
                html.push('<span class="item-commands">');
                if (!fb.no_single) {
                    html.push('<span cmd="jh fb ' + fb.index + ' start1">进入副本</span>');
                }
                if (fb.is_diffi) {
                    html.push('<span cmd="jh fb ' + fb.index + ' start2">困难模式</span>');
                }
                if (fb.is_multi) {
                    html.push('<span cmd="jh fb ' + fb.index + ' start3">组队进入</span>');
                }
                html.push("</span>");

            } else {
                html.push("");
            }
            html.push(fb.reward);
            html.push("</pre>");
            this.descElement.html(html.join("\n"));
            this.select(fb.index);
        },
        show: function () {
            if (this.isShow) return;
            if (!this.element)
                this.element = $("<div class='dialog-fb'><div class='fb-left'></div><div class='fb-right'></div></div>");
            this.listElement = this.element.find(".fb-left").on("click", ".fb-item,.fam-item", this.item_click);
            this.descElement = this.element.find(".fb-right");
            Dialog.title("江湖");
            Dialog.icon("home");
            this.element.appendTo(Dialog.contentElement);
            this.create_footer();
            if (this.fbs) SendCommand("jh fb lock");
            else SendCommand("jh");
            this.isShow = true;
        }, selected_item: 0,
        footers: ["门派", "副本"],
        create_footer: function () {
            if (!this.fbs) return;
            Dialog.footer("");
            var html = [];
            for (var i = 0; i < this.footers.length; i++) {
                html.push("<span class='footer-item" + (i == this.selected_item ? " select" : "") + "' for='" + i + "''>"
                    + this.footers[i] + "</span>");
            }
            $(html.join("")).appendTo(Dialog.footerElement);
        }, item_click: function () {
            var elem = $(this);
            if (elem.is(".selected")) return;
            var index = elem.attr("index");
            if (elem.is(".fb-item")) {
                var fb = Dialog.jh.fbs[index];
                if (!fb.desc) SendCommand("jh fb " + index);
                else Dialog.jh.show_fbdesc(fb);
            } else {
                var fam = Dialog.jh.families[index];
                if (!fam.desc) SendCommand("jh fam " + index);
                else Dialog.jh.show_famdesc(fam);
            }
            if (Dialog.jh.selectedItem) Dialog.jh.selectedItem.removeClass("selected");
            Dialog.jh.selectedItem = elem;
            Dialog.jh.selectedItem.addClass("selected");
        },
        update_lock: function () {
            if (!this.listElement) return;
            var item = this.listElement.find(".fb-item[index='" + this.unlock + "']");
            if (item.is(".lock")) item.removeClass("lock");
        }
        , footerChanged: function (index) {
            if (index == this.selected_item) return;
            this.selected_item = index;
            if (index == 0) {
                this.show_family();
            } else {
                this.show_fbs();
                if (!this.selectedItem || !this.selectedItem.is(".fb-item")) {
                    SendCommand("jh fb " + this.unlock);
                }
            }

        }, show_family: function () {
            var html = [];
            for (var i = 0; i < this.families.length; i++) {
                var fb = this.families[i];
                html.push('<div class="fam-item');
                html.push('" index="');
                html.push(i);
                html.push('">');
                fb.index = i;
                html.push(fb.name);
                html.push("</div>");
            }
            this.listElement.html(html.join(""));
            var items = this.listElement.children()[0];
            this.item_click.call(items);
        }, show_fbs: function () {
            var html = ["<div class='fb-content'>"];
            for (var i = 0; i < this.fbs.length; i++) {
                var fb = this.fbs[i];
                html.push('<div class="fb-item');
                if (i > this.unlock) {
                    html.push(" lock");
                }
                fb.index = i;
                html.push('" index="');
                html.push(i);
                html.push('">');
                html.push(fb.name);
                html.push("</div>");
                if (i != this.fbs.length - 1) {
                    html.push("<div class='line'></div>");
                }
            }
            html.join("</div>");
            this.listElement.html(html.join(""));
        }
    };

    Dialog.shop = {
        close: function () {
            this.element.remove();
            this.isShow = false;
        }, onData: function (data) {
            this.cash_money = data.cash_money;
            if (data.selllist) {
                this.selllist = data.selllist;
                this.show_items();
            }
            this.show_moeny();
        }, show_items: function () {
            this.create_items(this.selllist);


        }, show_moeny: function () {
            if (!this.isShow) return;
            if (window.isios) {
                Dialog.footer("<div class='dialog-shop-footer'>你身上有<hij> " + this.cash_money + " 元宝</hij></div>");
            } else {
                Dialog.footer("<div class='dialog-shop-footer'>你身上有<hij> " + this.cash_money + " 元宝</hij><span cmd='transmoney'>账号转入</span><span cmd='pay'>充值</span><span cmd='tg'>推广</span></div>");
            }

        },
        show: function (data) {
            if (!this.element)
                this.element = $("<div class='dialog-shop'></div>");
            if (this.isShow) return;

            Dialog.title("商品列表");
            Dialog.icon("shopping-cart");
            this.isShow = true;
            this.element.appendTo(Dialog.contentElement);
            if (!this.selllist) SendCommand("shop");
            else this.show_moeny();
        }, create_items: function (items) {
            var str = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                str.push("<div class='shop-item'>");
                str.push("<h3>");
                str.push(item.name);
                str.push("</h3>");
                str.push("<pre class='shop-desc'>");
                str.push(item.desc)
                str.push("</pre>");
                str.push("<div class='shop-btn' ");
                str.push('cmd="_confirm shop ');
                str.push(i)
                str.push('">');

                str.push(item.value);
                str.push("元宝</div>");
                str.push("</div>");
            }
            this.element.html(str.join(""));
        }
    };

    Dialog.message = {
        close: function () {

            this.element.remove();
            this.isShow = false;
        }, hide: function () {
            if (this.element.is(".detail")) {
                this.element.removeClass("detail");
                this.detailID = null;
                return false;
            }
        },
        selected_item: 0,
        messages: [],
        isLoad: false,
        unRead: 0,
        onData: function (data) {
            if (data.receive) return this.updateMessageState(data.receive, data.index);
            if (data.items) {
                return this.createMessageDetail(data.id, data.items);
            }

            if (data.unRead != undefined) {
                this.unRead = data.unRead;
            }
            if (data.messages) {
                for (var i = 0; i < data.messages.length; i++) {
                    this.addMessage(data.messages[i]);
                }
            }

            if (data.message) {
                if (!this.isShow) this.unRead++;
                if (this.messages)
                    this.addMessage(data.message);
                if (data.message.id == "notice") {
                    this.showNotice(data.message);
                }
            }
            if (this.isShow) this.showMessages(data.message);
            this.showUnread();

        }, showUnread: function () {
            if (this.unRead) ToolAction.showFlag("message", this.unRead);
            else ToolAction.showFlag("message", 0);
        },
        addMessage: function (msg) {
            for (var i = 0; i < this.messages.length; i++) {
                if (this.messages[i].id == msg.id) {
                    this.messages[i] = msg;
                    return;
                }
            }
            this.messages.push(msg);
        },
        show: function (data) {
            this.unRead = 0;
            this.showUnread();
            if (this.isShow) return;
            this.isShow = true;
            Dialog.title("消息");
            Dialog.icon("envelope");
            this.create_footer();
            this.footerChanged(this.selected_item);
            if (!this.isLoad) SendCommand("message");
            this.isLoad = true;
            this.element.on("click", ".message-item", this.showMessageDetail);
        },
        footers: ["消息", "队伍", "关系", "帮派"],
        footerElements: ["message", "team", "relation", "party"],
        create_footer: function () {
            var html = [];
            for (var i = 0; i < this.footers.length; i++) {
                html.push("<span class='footer-item" + (i == this.selected_item ? " select" : "") + "' for='" + i + "''>"
                    + this.footers[i] + "</span>");
            }

            Dialog.footer(html.join(""));
            this.showChild();

        }, footerChanged: function (index) {
            if (index == this.selected_item) return;
            this.selected_item = index;
            this.showChild();
        }, showChild: function () {
            var child = Dialog[this.footerElements[this.selected_item]];
            if (!child.element) child.element = child.createElement();
            Dialog.contentElement.html(child.element);
            if (this.selectedChild == child) return;
            if (this.selectedChild) this.selectedChild.close();
            child.show();

            this.selectedChild = child;
        }, showNotice: function (nt) {
            var str = ["\n<hiy>系统公告</hiy>\n"];
            var dt = new Date(nt.time);
            str.push(dt.getFullYear());
            str.push("年");
            str.push(dt.getMonth() + 1);
            str.push("月");
            str.push(dt.getDate());
            str.push("日 ");
            str.push(dt.getHours());
            str.push("时");
            str.push(dt.getMinutes());
            str.push("分\n<hic>");
            str.push(nt.content);
            str.push("\n</hic>");
            ReceiveMessage(str.join(""));
        }, showMessages: function (newmsg) {
            var str = [];
            for (var i = 0; i < this.messages.length; i++) {
                var msg = this.messages[i];
                str.push("<div class='message-item' fromid=\"");
                str.push(msg.id);
                str.push("\"><div class='message-title'>");
                str.push(msg.name);

                str.push("<span class='message-time'>");
                str.push(this.getTimedesc(msg.time));
                str.push("</span>");
                str.push("</div>");
                str.push("<div class='message-content'>");
                var title = msg.content;
                if (title.length > 20) title = title.substr(0, 20) + "...";
                str.push(title);
                str.push("</div>");
                str.push("</div>");
            }
            if (!str.length) str.push('<div class="empty">暂无新消息</div>');
            if (!this.listElement) this.listElement = this.element.find(".message-list");
            this.listElement.html(str.join(""));
            if (newmsg && this.detailID == newmsg.id) {
                this.detailElement.append($(this.createMessageDetailItem(newmsg.id, newmsg.name, newmsg)));
            }
        }, getTimedesc: function (long) {
            var now = new Date();
            var time = new Date(long);
            var dt = (now - time) / 1000;
            if (dt < 60) return "刚刚";
            else if (dt < 3600) return parseInt(dt / 60) + "分钟前";
            else if (time.getFullYear() == now.getFullYear() && time.getMonth() == now.getMonth()) {
                var diff_day = time.getDate() - now.getDate();
                var msg = "今天 " + this.add_zero(time.getHours()) + "：" + this.add_zero(time.getMinutes());
                if (diff_day == 0) return msg;
                else if (diff_day == 1) return "昨天 " + msg;
                else if (diff_day == 2) return "前天 " + msg;

            }
            return (time.getMonth() + 1) + "月" + time.getDate() + "日 " + this.add_zero(time.getHours()) + "：" + this.add_zero(time.getMinutes());
        }, add_zero: function (num) {
            if (num < 10) return "0" + num;
            return num;
        }, showMessageDetail: function () {
            var id = $(this).attr("fromid");
            if (!id) return;
            SendCommand("message " + id);
            Dialog.message.element.addClass("detail");

        }, getMessageitem: function (id) {
            for (var i = 0; i < this.messages.length; i++) {
                if (this.messages[i].id == id) return this.messages[i];
            }
        }, createMessageDetail: function (id, items) {
            if (!this.detailElement) {
                this.detailElement = this.element.find(".detail-list");
            }
            var msg = this.getMessageitem(id);
            if (!msg) return;
            var str = [];
            this.detailID = id;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                str.push(this.createMessageDetailItem(id, msg.name, item));
            }
            this.detailElement.html(str.join(""));;
        }, createMessageDetailItem: function (id, name, item) {
            var str = [];
            str.push("<div class='detail-item' index='" + item.index + "'>");
            str.push("<span class='detail-name'>");
            str.push(name);
            str.push("</span>");
            str.push("<span class='detail-time'>");
            str.push(this.getTimedesc(item.time));
            str.push("</span>");
            str.push("<pre class='detail-content'>");
            str.push(item.content);
            str.push("</pre>");
            if (item.attach) {
                for (var j = 0; j < item.attach.length; j++) {
                    str.push("<div class='detail-attach'>");
                    str.push(item.attach[j].name);
                    str.push("</div>");
                }
                if (item.rec) {
                    str.push("<div class='item-commands'><span class='disabled'>已领取</span></div>");
                } else {
                    str.push("<div class='item-commands'><span cmd='receive " + id
                        + " " + item.index + "'>领取</span></div>");
                }
            }
            str.push("</div>");
            return str.join("");
        },
        createElement: function () {
            return $('<div class="dialog-message"><div class="message-list"></div><div class="detail-list"></div></div>');
        }, updateMessageState: function (rec, index) {
            if (this.detailID != rec) return;
            var elem = this.detailElement.find(".detail-item[index='" + index + "']>.item-commands>span");
            elem.html("已领取").addClass("disabled");
        }
    };
    Dialog.relation = {
        createElement: function () {
            return $('<div class="dialog-relation"></div>');
        },
        show: function () {
            SendCommand("relation");
            this.isShow = true;
            Dialog.title("关系");
            Dialog.icon("heart");
        },
        onData: function (data) {
            var str = [];
            str.push("<div class='relation-item'>");
            if (data.husband) {
                str.push("你的丈夫：");
                str.push(data.husband);
            } else if (data.wife) {
                str.push("你的妻子：");
                str.push(data.wife);
            } else {
                str.push("你目前没有结婚。");
            }
            str.push("</div>");
            if (data.wife || data.husband) {
                str.push("<div class='item-commands'>");
                str.push("<span cmd='_confirm greet wife'>❀送花❀</span>")
                str.push("</div>");
            }
            str.push("<div class='relation-item'>");
            if (data.shifu) {
                str.push("你的师父：");
                str.push(data.shifu);
            } else if (data.tudi) {
                str.push("你的徒弟：");
                str.push(data.tudi);

            } else {
                str.push("你目前没有拜师，也没有收徒。");
            }
            if (data.shifu) {
                str.push("<div class='item-commands'>");
                str.push("<span cmd='greet master'>请安</span>")
                if (data.sid) {
                    str.push("<span cmd='team add " + data.sid + "'>邀请组队</span>")
                }
                str.push("</div>");
            }
            if (data.tid) {
                str.push("<div class='item-commands'>");
                str.push("<span cmd='team add " + data.tid + "'>邀请组队</span>")

                str.push("</div>");
            }
            if (data.st != undefined) {
                str.push("<div class='relation-item'>");
                str.push("你本周已完成" + data.st + "次师徒任务。")
                str.push("</div>");
            }
            if (data.reward) {
                str.push("<div class='relation-item'>");
                str.push(data.reward)
                str.push("</div>");
            }
            str.push("</div>");
            this.element.html(str.join(""));
        },
        close: function () {
            this.element.remove();
            this.isShow = false;
        }
    };

    Dialog.party = {
        createElement: function () {
            return $('<div class="dialog-party"></div>');
        },
        show: function () {
            SendCommand("party load");
            this.isShow = true;
            Dialog.title("");
            this.element.on("click", '.party-role', this.show_commands);
            Dialog.icon("flag");
        },
        levels: ["", "<hio>帮主<hio>", "<hiz>副帮主</hiz>", "<hiy>长老</hiy>", "<hic>堂主</hic>", "帮众"],
        level_roles: [1, 20, 30, 40, 50, 60],
        level: 5,
        get_role: function (id) {
            if (!this.roles) return;
            for (var i = 0; i < this.roles.length; i++) {
                if (this.roles[i].id == id) return this.roles[i];
            }
        },
        onData: function (data) {
            if (!data.name) {
                this.element.html("<wht>你没有加入帮派<wht>");
                return;
            }
            var party = data;
            var str = [];
            str.push("<div class='party-title'><hio>");
            str.push(party.name);
            str.push("</hio><span class='party-count'><nor>(" + data.roles.length + "/" + this.level_roles[data.level] + ")</nor></span>");
            str.push("</div>");
            if (party.notice) {
                str.push("<div class='party-notice'><hio><span class='glyphicon glyphicon-volume-up'></span>");
                str.push(party.notice);
                //str.push("\t");
                //var dt = new Date(party.n_time);
                //str.push(dt.getMonth() + 1);
                //str.push("月");
                //str.push(dt.getDate());
                //str.push("日");
                //str.push(dt.getHours());
                //str.push("时");
                //str.push(dt.getMinutes());
                //str.push("分");
                str.push("</hio></div>");
            }
            str.push("<div class='party-roles'>");
            for (var i = 0; i < party.roles.length; i++) {
                var role = party.roles[i];
                if (role.id == Process.player) {
                    this.level = role.level;
                }
                str.push("<div class='party-role' roleid='" + role.id + "'>");
                str.push("<span class='role-level'>");
                str.push(this.levels[role.level]);
                str.push("</span>");
                str.push("<span class='role-name'>");
                str.push(role.name);
                str.push("</span>");
                str.push("<span class='role-sc'>");
                str.push(role.sc);
                str.push("</span>");
                str.push("</div>");
            }
            str.push("</div>");
            this.roles = data.roles;
            this.element.html(str.join(""));
        }, show_commands: function () {
            var role = Dialog.party.get_role($(this).attr("roleid"));
            if (!role) return;
            var html = ["<div class='item-commands'>"];


            if (role.id == Process.player) {
                html.push('<span cmd="party out">退出帮派</span>');
                if (Dialog.party.level == 1) {
                    html.push('<span cmd="party dissmiss">解散</span>');
                }
            } else {
                if (role.level > Dialog.party.level - 1 && role.level > 2)
                    html.push('<span cmd="party uplevel ' + role.id + '">提升为' + (Dialog.party.levels[role.level - 1]) + '</span>');
                if (role.level > Dialog.party.level && role.level < 5) {
                    html.push('<span cmd="party downlevel ' + role.id + '">降级为' + (Dialog.party.levels[role.level + 1]) + '</span>');
                }
                if (Dialog.party.level == 1 && role.level == 2) {
                    html.push('<span cmd="party trans ' + role.id + '">让位</span>');
                }
                if (role.level > Dialog.party.level)
                    html.push('<span cmd="party remove ' + role.id + '">开除</span>');
                if (role.online) {
                    html.push('<span cmd="team add ' + role.id + '">邀请组队</span>');
                }
            }
            if (html.length == 1) return;
            html.push("</div>");
            Dialog.party.element.find(".item-commands").remove();
            $(html.join("")).appendTo(this);
        },
        close: function () {
            this.element.remove();
            this.isShow = false;
        }
    };
    Dialog.team = {
        createElement: function () {
            return $('<div class="dialog-team"></div>');
        },
        show: function () {
            SendCommand("team");
            this.isShow = true;
            Dialog.title("队伍");
            this.element.on("click", ".team-item", this.clickItem);
            Dialog.icon("list");
        },
        items: [],
        onData: function (data) {
            if (data.items) {
                this.items = data.items;
                if (data.items.length) this.isCap = data.items[0].id == Process.player;
                else this.isCap = 0;
            }
            if (data.dismiss) {
                this.items.length = 0;
                this.isCap = false;
            }
            if (data.remove) {
                if (!this.items.length) return;
                for (var i = 0; i < this.items.length; i++) {
                    if (this.items[i].id == data.remove) {
                        this.items.splice(i, 1);
                        break;
                    }
                }
            }
            this.createItems();
        },
        close: function () {
            this.element.remove();
            this.isShow = false;
        }, createItems: function () {
            if (!this.element) return;
            var str = [];
            for (var i = 0; i < this.items.length; i++) {
                var msg = this.items[i];
                str.push("<div class='team-item' index='" + i + "'>");
                str.push("<span class='team-flag'>");
                str.push(i > 0 ? "" : "<span class='glyphicon glyphicon-flag'></span>");
                str.push("</span>");
                str.push("<span class='team-title'>");
                str.push(msg.name);
                str.push("</span>");
                str.push("</div>");
            }
            if (!str.length) str.push('<div class="empty">你还没有加入任何队伍。</div>');
            this.element.html(str.join(""));
        }, clickItem: function () {
            var elem = $(this);
            var item = Dialog.team.items[elem.attr("index")];
            if (!item) return;
            var html = ["<div class='item-commands'>"];
            html.push('<span cmd="look3 ' + item.id + '">查看</span>');
            var isCap = Dialog.team.items[0].id == Process.player;
            if (isCap && item.id != Process.player) {
                html.push('<span cmd="team remove ' + item.id + '">移出队伍</span>');
            } else if (item.id == Process.player) {
                html.push('<span cmd="team out ' + item.id + '">退出队伍</span>');
            }
            if (isCap && item.id == Process.player) {
                html.push('<span cmd="team set">更改分配方式</span>');
            }
            html.push("</div>");
            Dialog.team.element.find(".item-commands").remove();
            $(html.join("")).appendTo(elem);
        }
    };


    Dialog.friend = {
        show: function () {
            if (!this.data) return SendCommand("friend");
        },
        onData: function (data) {

        }
    };
    var Setting = {
        keep_msg: 0,
        show_hpnum: 0,
        show_hp: 0,
        item_autoheight: 0,
        item_firstme: 0,
        hide_roomdesc: 0,
        exits_dir: 0,
        show_command: 0,
        fontsize: "0.875rem",
        no_spmsg: 0,
        fontcolor: "#008000",
        backcolor: "black",
        auto_showcombat: 0,
        auto_sortitem: 0,
        auto_hideroom: 0,
        fullscreen: 0,
        channel_chat: 1,
        channel_tm: 1,
        channel_fam: 1,
        channel_es: 1,
        ban_pk: 0,
        off_plist: 0,
        combat_wrap: 0,
        show_damage: 0,
        ban_master: 0,
        no_load: true,
        load: function (data) {
            if (!data) return;
            for (var key in data) {
                if (key == "fullscreen") {
                    continue;
                }
                this.set_prop(key, data[key]);
                this[key] = data[key];
            }
        }, set_prop: function (key, value) {
            switch (key) {
                case "fontsize":
                    $(".container").css("font-size", value);
                    break;
                case "fontcolor":
                    $(document.body).css("color", value);
                    break;
                case "backcolor":
                    $(document.body).css("background-color", value);
                    break;
                case "hide_roomdesc":
                    if (value)
                        $(".room_desc").hide()
                    else
                        $(".room_desc").show();
                    break;
                case "exits_dir":
                    Process.exits();
                    break;
                case "combat_wrap":
                    if (value) {
                        $(".combat-commands").addClass('combat-wrap');
                        console.log($(".combat-commands").height());
                    }
                    else {
                        $(".combat-commands").removeClass('combat-wrap');
                        console.log($(".combat-commands").height());
                    }
                    break;
                case "item_autoheight":
                    if (value) $(".room_items").removeAttr("style");
                    else $(".room_items").attr("style", "max-height: 8rem; overflow-y: auto;");
                    break;
                case "item_firstme":
                    if (value == 1) {
                        var elem = $(".room_items>.room-item[itemid='" + Process.player + "']");
                        $(".room_items").prepend(elem);
                    }
                    break;
                case "show_hp":
                    if (!Combat.IsShow) {
                        if (value == 1)
                            $(".room-item>.item-status").show();
                        else
                            $(".room-item>.item-status").hide();
                    }
                    break;
                case "show_hpnum":
                    Process.cur_room && Process.items(Process.cur_room);
                    break;
                case "show_damage":
                    $('.item-damage').remove();
                    break;
                case "fullscreen":
                    if (value) {
                        Setting.launchFullScreen();
                    } else {
                        Setting.exitFullscreen();
                    }
                    break;
                case "show_command":
                    Process.itemsElement.find(".item-commands").remove();
                    break;
                case "no_spmsg":
                    if (Process.ChannelElement) {
                        if (value) {
                            Process.ChannelElement.hide();
                        } else {
                            Process.ChannelElement.show();
                        }
                    }
                    break;

            }
        },
        save: function (key, value) {
            this[key] = value;
            this.set_prop(key, value);
            SendCommand("setting " + key + " " + value);
        },
        launchFullScreen: function (element) {
            element = element || document.documentElement;
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        },
        exitFullscreen: function () {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }
    var _name0 = "万俟司马上官欧阳夏侯诸葛闻人东方赫连皇甫尉迟公羊澹台公冶宗政濮阳淳于单于太叔申屠公孙仲孙轩辕令狐锺离宇文长孙慕容鲜于闾丘司徒司空丌官司寇子车颛孙端木巫马公西乐正公良拓拔夹谷谷梁梁丘左丘东门西门";
    var _name1 = "赵钱孙李周吴郑王冯陈楮卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎";

    var _name2 = "世舜丞主产仁仇仓仕仞任伋众伸佐佺侃侪促俟信俣修倝倡倧偿储僖僧僳儒俊伟列则刚创前剑助劭势勘参叔吏嗣士壮孺守宽宾宋宗宙宣实宰尊峙峻崇崈川州巡帅庚战才承拯操斋昌晁暠曹曾珺玮珹琒琛琩琮琸瑎玚璟璥瑜生畴矗矢石磊砂碫示社祖祚祥禅稹穆竣竦综缜绪舱舷船蚩襦轼辑轩子杰榜碧葆莱蒲天乐东钢铎铖铠铸铿锋镇键镰馗旭骏骢骥驹驾骄诚诤赐慕端征坚建弓强彦御悍擎攀旷昂晷健冀凯劻啸柴木林森朴骞寒函高魁魏鲛鲲鹰丕乒候冕勰备宪宾密封山峰弼彪彭旁日明昪昴胜汉涵汗浩涛淏清澜浦澉澎澔瀚瀛灏沧虚豪豹辅辈迈邶合部阔雄霆震韩俯颁颇频颔风飒飙飚马亮仑仝代儋利力劼勒卓哲喆展帝弛弢弩彰征律德志忠思振挺掣旲旻昊昮晋晟晸朕朗段殿泰滕炅炜煜煊炎选玄勇君稼黎利贤谊金鑫辉墨欧有友闻问";

    var _name3 = "筠柔竹霭凝晓欢霄枫芸菲寒伊亚宜姬舒影荔枝思丽秀娟英华慧巧美娜静淑惠珠翠雅芝玉萍红娥玲芬芳燕彩春菊勤珍贞莉兰凤洁梅琳素云莲真环雪荣妹霞香月莺媛艳瑞凡佳嘉琼桂娣叶璧璐娅琦晶妍茜秋珊莎锦黛青倩婷姣婉娴瑾颖露瑶怡婵雁蓓纨仪荷丹蓉眉君琴蕊薇菁梦岚苑婕馨瑗琰韵融园艺咏卿聪澜纯毓悦昭冰爽琬茗羽希宁欣飘育滢馥";

    function create_name(s, t) {
        t = t || (parseInt(Math.random() * 2) + 1);
        var str = [];
        if (t == 2) {
            var key = parseInt(Math.random() * _name0.length);
            if (key % 2 == 1) key -= 1;
            str.push(_name0[key++]);
            str.push(_name0[key]);
        } else {
            str.push(_name1[parseInt(Math.random() * _name1.length)]);
        }
        if (s == 0) {
            str.push(_name2[parseInt(Math.random() * _name2.length)]);
        } else {
            str.push(_name3[parseInt(Math.random() * _name3.length)]);
        }
        if (parseInt(Math.random() * 4) > 1) {
            if (s == 0) {
                str.push(_name2[parseInt(Math.random() * _name2.length)]);
            } else {
                str.push(_name3[parseInt(Math.random() * _name3.length)]);
            }
        }
        return str.join("");
    }
    function create_id() {
        var key1 = 'abcdefghijklmnopqrstuvwxyz';
        var key2 = '123456789';
        var str = [];
        var length = parseInt(Math.random() * 3) + 3;
        for (var i = 0; i < length; i++) {
            if (i < 3) {

                str.push(key1[parseInt(Math.random() * key1.length)]);
            } else {
                str.push(key2[parseInt(Math.random() * key2.length)]);
            }
        }
        return str.join("");
    }
    function create_prop() {
        var sum = 20;
        var ary = [];
        for (var i = 0; i < 4; i++) {
            var rand = parseInt(Math.random() * 15 + 1);
            if (sum >= rand) {
                i == 3 ? rand = sum : sum -= rand;
                ary[i] = rand;
            } else {
                ary[i] = sum;
                sum = 0;
            }
        }
        var me = {};
        me.str = ary[0] + 15;
        me.con = ary[1] + 15;
        me.dex = ary[2] + 15;
        me.int = ary[3] + 15;
        return me;
    }
    var Confirm = {
        DEFAULT: {
            height: 60,
            onOK: function () { },
            footer: true,

            btn_text: "确认"
        },
        Show: function (par) {
            this.Init();
            this.Parameter = $.extend({}, this.DEFAULT, par || {});
            this.content.empty().append(this.Parameter.content);
            this.element.css({ height: this.Parameter.height, bottom: 0, display: "block" });
            if (this.Parameter.footer) {
                this.btn.show();
                this.btn.find(".btn-text").html(this.Parameter.btn_text);
                this.content.css("width", "65%");
            } else {

                this.btn.hide();
                this.content.css("width", "100%");
            }

            this.isShow = true;
        }, Close: function () {
            if (!Confirm.isShow) return;
            Confirm.element.css("bottom", -Confirm.Parameter.height);
            setTimeout(function () {
                Confirm.element.hide();
            }, 200);
            Confirm.isShow = false;
        },
        Init: function () {
            if (this._init) return;
            this.element = $(".dialog-confirm");
            this.content = this.element.find(".dialog-content");
            this.btn = this.element.find(".dialog-btn");
            this.element.on("click", ".btn-ok", function (e) {
                Confirm.Parameter.onOK();
                Confirm.Close();
                return false;
            });
            this.element.on("click", ".btn", function (e) {
                var count = Confirm.max_count || 1000;
                var elem = $(e.target);
                var type = parseInt(elem.attr("ac"));
                var text = elem.parent().find("input");
                var v = parseInt(text.val());
                if (v.toString() == "NaN") v = 0;
                if (type == -10) {
                    v -= 10;
                } else if (type == 10) {
                    if (v == 1) v = 0;
                    v += 10;
                } else if (type == 1) {
                    v = count;
                } else {
                    v = 1;
                }
                if (v < 1) v = 1;
                else if (v > count) v = count;
                text.val(v);
                return false;
            });
            this._init = true;
        }

        , Process: function (pars) {
            var cmd = pars[1];
            var npc = "";
            if (cmd == "dc") {
                cmd = pars[3];
                npc = pars.splice(1, 2);
                npc = npc[0] + " " + npc[1] + " ";
            }
            var func = this["Show_" + cmd];
            func && func.call(this, pars, npc);
        }, get_countelement: function (count, maxcount) {
            if (!this.count_element) {
                this.count_element = $('<div  class="confirm-count"><span class="btn" ac="0">最少</span><span ac="-10" class="btn">减10</span><input type="text" value="1" /><span class="btn"  ac="10" >加10</span><span class="btn" ac="1" >最多</span></div>');

            }
            if (count) this.count_element.find("input").val(count);
            else this.count_element.find("input").val(1);
            if (maxcount) maxcount = parseInt(maxcount);
            this.max_count = maxcount || 1000;
            return this.count_element;
        }, Show_shop: function (p) {
            var objid = p[2];
            if (!objid) return;
            var obj = Dialog.shop.selllist[objid];
            if (!obj) return;

            this.Show({
                content: this.get_countelement(),
                btn_text: "购买" + obj.name,
                onOK: function () {
                    var text = Confirm.count_element.find("input");
                    var v = parseInt(text.val());
                    if (v.toString() == "NaN") v = 0;
                    if (!v) return;
                    if (v > Confirm.max_count) v = Confirm.max_count;
                    SendCommand("shop " + objid + " " + v);
                }
            });
        },
        Show_buy: function (p) {
            var objid = p[3];
            if (!objid) return;
            var count = parseInt(p[2]);

            this.Show({
                content: this.get_countelement(1, count == -1 ? 1000 : count),
                btn_text: "购买",
                onOK: function () {
                    var text = Confirm.count_element.find("input");
                    var v = parseInt(text.val());
                    if (v.toString() == "NaN") v = 0;
                    if (!v) return;
                    if (v > Confirm.max_count) v = Confirm.max_count;
                    SendCommand("buy " + v + " " + objid + " from " + p[5]);
                }
            });
        },
        Show_greet: function (p) {
            this.Show({
                content: this.get_countelement(1, 99),
                btn_text: "送花",
                onOK: function () {
                    var text = Confirm.count_element.find("input");
                    var v = parseInt(text.val());
                    if (v.toString() == "NaN") v = 0;
                    if (!v) return;
                    if (v > Confirm.max_count) v = Confirm.max_count;
                    SendCommand("greet " + v);
                }
            });
        }, Show_sell: function (p) {
            var objid = p[3];
            if (!objid) return;

            this.Show({
                content: this.get_countelement(p[2], p[2]),
                btn_text: "卖出",
                onOK: function () {
                    var text = Confirm.count_element.find("input");
                    var v = parseInt(text.val());
                    if (v.toString() == "NaN") v = 0;
                    if (!v) return;
                    if (v > Confirm.max_count) v = Confirm.max_count;
                    SendCommand("sell " + v + " " + objid + " to " + p[5]);
                }
            });
        }, Show_store: function (p) {
            var objid = p[3];
            if (!objid) return;
            if (p[2] == 1) {
                return SendCommand("store " + objid);
            }
            this.Show({
                content: this.get_countelement(p[2], p[2]),
                btn_text: "存入",
                onOK: function () {
                    var text = Confirm.count_element.find("input");
                    var v = parseInt(text.val());
                    if (v.toString() == "NaN") v = 0;
                    if (!v) return;
                    if (v > Confirm.max_count) v = Confirm.max_count;
                    SendCommand("store " + v + " " + objid);
                }
            });
        }, Show_fenjie: function (p, npc) {
            var objid = p[2];
            if (!objid) return;
            var obj = Dialog.pack.isShow ? Dialog.pack.get_item(objid) : Dialog.pack2.get_item(objid);
            if (!obj) return;
            if (obj.name.indexOf("★") == -1) return SendCommand("fenjie " + objid);
            this.Show({
                content: "是否确认分解" + obj.name + "？",
                btn_text: "确认分解",
                onOK: function () {
                    SendCommand(npc + "fenjie " + objid);
                }
            });

        }, Show_qu: function (p) {
            var objid = p[2];
            if (!objid) return;
            var obj = Dialog.list.find_item(3, objid);
            if (!obj) return;
            if (obj.count == 1) {
                return SendCommand("qu 1 " + objid);
            }
            this.Show({
                content: this.get_countelement(obj.count, obj.count),
                btn_text: "取出",
                onOK: function () {
                    var text = Confirm.count_element.find("input");
                    var v = parseInt(text.val());
                    if (v.toString() == "NaN") v = 0;
                    if (!v) return;
                    if (v > Confirm.max_count) v = Confirm.max_count;
                    SendCommand("qu " + v + " " + objid);
                }
            });
        }, Show_drop: function (p, npc) {
            var objid = p[3];
            if (!objid) return;
            var obj = Dialog.pack.isShow ? Dialog.pack.get_item(objid) : Dialog.pack2.get_item(objid);
            if (!obj) return;
            this.Show({
                content: p[2] == 1 ? "是否确认丢掉" + obj.name + "？" : this.get_countelement(p[2], p[2]),
                btn_text: "丢掉",
                onOK: function () {
                    if (p[2] == 1) {
                        return SendCommand(npc + "drop " + objid);
                    }
                    var text = Confirm.count_element.find("input");
                    var v = parseInt(text.val());
                    if (v.toString() == "NaN") v = 0;
                    if (v > Confirm.max_count) v = Confirm.max_count;
                    SendCommand(npc + "drop " + v + " " + objid);
                }
            });
        }, Show_give: function (p, npc) {
            var objid = p[4];
            if (!objid) return;
            var obj = Dialog.pack2.get_item(objid);
            if (!obj) return;
            if (obj.count == 1) return SendCommand(npc + "give " + Process.player + " 1 " + objid);
            this.Show({
                content: this.get_countelement(obj.count, obj.count),
                btn_text: "拿来",
                onOK: function () {
                    var text = Confirm.count_element.find("input");
                    var v = parseInt(text.val());
                    if (v.toString() == "NaN") v = 0;
                    if (v > Confirm.max_count) v = Confirm.max_count;
                    SendCommand(npc + "give " + Process.player + " " + v + " " + objid);
                }
            });
        }, Show_trade_add: function (obj) {
            if (!obj) return;
            this.Show({
                content: this.get_countelement(obj.count, obj.count),
                btn_text: "确定",
                onOK: function () {

                    var text = Confirm.count_element.find("input");
                    var v = parseInt(text.val());
                    if (v.toString() == "NaN" || v <= 0) return;
                    if (v > obj.count) v = obj.count;
                    var moveobj = Util.Clone(obj);

                    moveobj.count = v; console.log(moveobj);
                    Dialog.trade.add_trade(moveobj);
                }
            });
        }, Show_fangqi: function (p, npc) {
            var objid = p[2];
            if (!objid) return;
            var skill = npc ? Dialog.master.skills[objid] : Dialog.skills.skills[objid];
            if (!skill) return;
            this.Show({
                content: "是否确认放弃技能" + skill.name + "？",
                onOK: function () {
                    SendCommand(npc + "fangqi " + objid);
                }
            });
        }, Show_combine: function (p, npc) {
            var objid = p[2];
            if (!objid) return;
            var obj = Dialog.pack.get_item(objid);
            if (!obj) return;
            var com = parseInt(p[3]);
            if (!com) return;
            var max_count = parseInt(obj.count / com);
            if (max_count == 1) {
                return SendCommand("combine " + objid);
            }
            this.Show({
                content: this.get_countelement(max_count),
                btn_text: "合成",
                onOK: function () {
                    var text = Confirm.count_element.find("input");
                    var v = parseInt(text.val());
                    if (v.toString() == "NaN") v = 0;
                    if (!v) return;
                    if (v > Confirm.max_count) v = Confirm.max_count;
                    SendCommand(npc + "combine " + objid + " " + v);
                }
            });
        }, Show_pay: function () {
            window.location.href = "/pay.html";
        }
    };

    "use strict"
    var Util = {
        Json2Str: function (obj) {

            if (typeof obj == "object") {
                if (obj == undefined || obj == null) return "";
                return JSON.stringify(obj);
            }
            return obj;
        },
        Json2Str2: function (obj) {
            if (obj == undefined || obj == null) return "";
            return JSON.stringify(obj);
        },
        Date2Str: function (dt) {

            if (dt.valueOf) {
                return "\/Date(" + dt.valueOf() + ")\/";
            }
            return dt;
        }, Clone: function (obj) {
            var newobj = {};
            for (var key in obj) {
                newobj[key] = obj[key];
            }
            return newobj;
        },
        Str2Json: function (s) {
            if (s.substring(0, 1) != "{") {
                s = "{" + s + "}";
            }
            return (new Function("return " + s))();
        },
        Str2Json2: function (s) {
            return (new Function("return " + s))();
        },
        Str2XML: function (s) {
            //先转XML DOM，再转JQ对象
            var xmlDoc;
            if (!window.DOMParser) {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(s);
            }
            else {
                var parser = new DOMParser();
                xmlDoc = parser.parseFromString(s, "text/xml");
            }
            return $(xmlDoc.documentElement);
        },
        Settings: {
            MaxUploadFileLength: 1048576 * 30//1024*1204
        },
        encode: function (str) {
            return encodeURIComponent(str);
        },
        CookieHelper: {
            ///设置cookie
            setCookie: function (name, value, expireMinutes) {
                var ck = name + "=" + escape(value);
                if (expireMinutes) {
                    var expireDate = new Date();
                    expireDate.setTime(expireDate.getTime() + (expireMinutes * 60 * 1000));
                    ck += "; expires=" + expireDate.toGMTString();
                }
                document.cookie = ck;
            },
            ///获取cookie值
            getCookie: function (name) {
                if (document.cookie.length > 0) {
                    begin = document.cookie.indexOf(name + "=");
                    if (begin != -1) {
                        begin += name.length + 1;
                        end = document.cookie.indexOf(";", begin);
                        if (end == -1) {
                            end = document.cookie.length;
                        }
                        return unescape(document.cookie.substring(begin, end));
                    }
                }
                return "";
            },
            ///删除cookie
            delCookie: function (name) {
                if (this.getCookie(name)) {
                    var date = new Date();
                    date.setYear(1000);
                    document.cookie = name + "=" + ";" + date.toGMTString();
                }
            }
        },
        C_STR: "零一二三四五六七八九",
        C_STR2: ["", "十", "百", "千", "万", "亿"],
        C_STR3: ["", "万", "亿"],
        to_c: function (num) {
            if (!num) return "零";
            var str = "";
            var count = 0;
            var add = 0;//0=0,1=数 2=百十千 3=万亿
            while (num) {
                var d = num % 10;
                if (count) {
                    if (count % 4 == 0 && add != 3) {
                        str = Util.C_STR3[count / 4] + str;
                        add = 3;
                    } else if (d && add != 2) {

                        str = Util.C_STR2[count % 4] + str;
                        add = 2;
                    }
                }
                if (d) {
                    if (d != 1 || num > 10 || count % 4 != 1)
                        str = Util.C_STR[d] + str;
                    add = 1;
                } else if (add == 1) {
                    str = Util.C_STR[d] + str;
                    add = 0;
                }
                num = parseInt(num / 10);
                count++;
            }

            return str;
        },
        Get: function (url, arg, callback) {//调用后台方法
            if (!url) return;

            var args = [];
            if ($.isPlainObject(arg)) {
                for (var key in arg) {
                    if (arg[key])
                        args.push(key + "=" + Util.encode(Util.Json2Str(arg[key])));
                }
                url = url + "?" + args.join("&");
            } else if ($.isFunction(arg)) {
                callback = arg;
            } else if ($.isArray(arg)) {
                for (var i = 0; i < arg.length; i++) {
                    args.push(Util.encode(Util.Json2Str(arg[i])));
                }
                url = url + "/" + args.join("/");
            }
            var options = {
                url: "/" + url,
                callBack: callback,
                type: "get"
            };
            return Util.Request(options);
        },
        Post: function (url, arg, callback) {//调用后台方法
            var args = [], argStr;
            if ($.isPlainObject(arg)) {
                for (var key in arg) {
                    if (arg[key])
                        args.push(key + "=" + Util.Json2Str(arg[key]));
                }
                argStr = args.join("&");
            } else if (arg.length) {
                for (var i = 0; i < arg.length; i++) {
                    args.push(Util.Json2Str(arg[i]));
                }
                argStr = Util.Json2Str2(args);
            } else {
                return;
            }
            var options = {
                url: "/" + url,
                data: argStr,
                callBack: callback,
                type: "post"
            };
            return Util.Request(options);
        },
        Request: function (options) {
            var cb = options.callBack;
            var async = $.isFunction(cb);
            var re = null;
            var isParseData = (options.isParseData === true);
            $.ajax(options.url, {
                data: options.data,
                type: options.type || 'post',
                async: async,
                dataType: options.dataType || 'json',
                statusCode: {
                    404: function () {
                        //alert(404);
                    }
                },
                success: function (result) {
                    if ($.isFunction(cb)) {
                        cb(result);
                    }
                },
                error: function (xhr, ts, msg) {
                    var msg = xhr.responseText;
                    if ($.isFunction(cb)) {
                        cb(msg);
                    }
                }
            });
            if (async == false) {
                return re;
            }
        }, RequestOver: function (r) {
            if (r.Code < 0) {

                return false;
            }
            return true;
        },
        ToDate: function () {
            if (arguments.length == 0) {
                return new Date();
            }
            if (arguments.length == 1) {
                var s = arguments[0].split("-");
                return new Date(s[0], parseInt(s[1]) - 1, s[2]);
            } else {
                return new Date(arguments[0], arguments[1], arguments[2]);
            }
        }, CheckInputs: function (elem, vals) {
            var inpts = elem.find("input");
            for (var i = 0; i < inpts.length; i++) {
                var v = $(inpts[i]).val();
                var ishas = false;
                if (vals) {
                    for (var j = 0; j < vals.length; j++) {
                        if (vals[j] == v) {
                            ishas = true;
                            continue;
                        }
                    }
                }

                if (ishas) {
                    $(inpts[i]).prop("checked", true);
                } else {
                    $(inpts[i]).removeProp("checked");
                }
            }
        }
    }

    Array.prototype.Remove = function (o) {
        var len = this.length;
        for (var i = 0; i < len; i++) {
            if (this[i] == o) {
                this.splice(i, 1);
                return this;
            }
        }
        return this;
    }
    Array.prototype.Has = function (o) {
        var len = this.length;
        for (var i = 0; i < len; i++) {
            if (this[i] == o) return true;
        }
        return false;
    }
    Array.prototype.Map = function (fn) {
        var len = this.length;
        var ary = [];
        for (var i = 0; i < len; i++) {
            var o = fn(this[i]);
            if (o) ary.push(o);
        }
        return ary;
    }
    Array.prototype.First = function (fn) {
        var len = this.length;
        for (var i = 0; i < len; i++) {
            var o = this[i];
            if (fn(o)) {
                return o;
            }
        }
        return null;
    }
    Array.prototype.Where = function (fn) {
        var len = this.length;
        var arr = [];
        for (var i = 0; i < len; i++) {
            var o = this[i];
            if (fn(o)) {
                arr.push(o);
            }
        }
        return arr;
    }
    Date.prototype.AddDays = function (d) {
        this.setDate(this.getDate() + d);
        return this;
    }
    Date.prototype.AddMonths = function (m) {
        this.setMonth(this.getMonth() + m);
        return this;
    }

    Date.prototype.ToDateString = function () {
        var m = (this.getMonth() + 1);
        if (m < 10) m = "0" + m;
        var d = this.getDate();
        if (d < 10) d = "0" + d;
        return this.getFullYear() + "-" + m + "-" + d;
    }
    Date.prototype.AddYears = function (y) {
        this.setFullYear(this.getFullYear() + y);
        return this;
    }

    //var SERVERS = [
    //    { IP: "120.78.75.229", Port: 25631 }
    //];
    var wsindex = 0;
    var mysocket = WebSocket;
    window.WebSocket = null;
    function WSClient(ip, port) {
        this.IP = ip;
        this.Port = port;
    }
    WSClient.prototype.Connect = function (callback) {
        try {
            var pol = location.protocol == "http:" ? "ws" : "wss";
            this.ws = new mysocket('ws://' + this.IP + ':' + this.Port);
            this.ws.onopen = this.OnConnect;
            this.ws.onclose = this.OnClose.bind(this);
            this.ws.onerror = this.OnError;
            this.ws.onmessage = this.OnReceived.bind(this);
            this.index = wsindex++;
        } catch (e) {
            this.OnError && this.OnError(e);
        }
    }
    WSClient.prototype.OnReceived = function (evt) {
        if (!evt || !evt.data) return;
        var data = evt.data;
        if (data[0] == '{' || data[0] == '[') {
            var func = new Function("return " + data + ";");
            this.OnData(func());
        } else {
            this.OnMessage(data);
        }
    }
    WSClient.prototype.Send = function (text) {
        try {
            this.ws.send(text);
        } catch (e) {
            ReceiveMessage(e);
        }
    }
    WSClient.prototype.Close = function () {
        this.ws.close();
    }
    WSClient.prototype.Connected = function () {
        return this.ws && this.ws.readyState == 1;
    }
    var API = {};
    API.UserAPI = {
        Login: function (code, pwd, cb) {
            return Util.Post('UserAPI/Login', { code: code, pwd: pwd }, cb);
        },
        Regist: function (user, cb) {
            return Util.Post('UserAPI/Regist', { user: user }, cb);
        },
        Enter: function (guider, cb) {
            return Util.Get('e', [guider], cb);
        },
        ChangePassword: function (oldpwd, pwd, no, cb) {
            return Util.Post('UserAPI/ChangePassword', { oldpwd: oldpwd, pwd: pwd, no: no }, cb);
        },
        LoginOut: function (cb) {
            return Util.Get('UserAPI/LoginOut', cb);
        },
        GetRoles: function (userid, cb) {
            return Util.Get('UserAPI/GetRoles', [userid], cb);
        },
        AddRole: function (player, cb) {
            return Util.Post('UserAPI/AddRole', { player: player }, cb);
        },
        GetUser: function (cb) {
            return Util.Get('UserAPI/GetUser', cb);
        },
        Search: function (userid, key, type, cb) {
            return Util.Get('UserAPI/Search', [userid, key, type], cb);
        },
        ResetPassword: function (userid, cb) {
            return Util.Get('UserAPI/ResetPassword', [userid], cb);
        },
        RecoverUser: function (pid, cb) {
            return Util.Get('UserAPI/RecoverUser', [pid], cb);
        },
        LoadPlayer: function (pid, isDelete, cb) {
            return Util.Get('UserAPI/LoadPlayer', [pid, isDelete], cb);
        },
        GetPhone: function (cb) {
            return Util.Get('UserAPI/GetPhone', cb);
        },
        BindPhone: function (code, no, cb) {
            return Util.Post('UserAPI/BindPhone', { code: code, no: no }, cb);
        },
        SendValidateCode: function (no, cb) {
            return Util.Get('UserAPI/SendValidateCode', [no], cb);
        },
        ResetPasswordByPhone: function (name, phone, vcode, pwd, cb) {
            return Util.Post('UserAPI/ResetPasswordByPhone', { name: name, phone: phone, vcode: vcode, pwd: pwd }, cb);
        },
        NewServer: function (cb) {
            return Util.Get('UserAPI/NewServer', cb);
        },
        GetServer: function (cb) {
            return Util.Get('Game/GetServer', cb);
        }
    };
})();

function HideAndShow(elem2, callback) {
    var elem1;
    var p = $(".login-content").children();
    for (var i = 0; i < p.length; i++) {
        if ($(p[i]).css("display") != "none") {
            elem1 = $(p[i]); break;
        }
    }
    if (!elem1) elem1 = $("#login_panel");
    elem1.animate({ opacity: 0 }, "fast", function () {
        elem1.hide();
        if (elem2 == ".container") $(".login-content").hide();
        else $(".login-content").show();
        if (elem2) {
            elem2 = $(elem2);
            elem2.show();
            elem2.css("opacity", "0");
            elem2.animate({ opacity: 1 }, "slow", callback);
        }
    });
}

function initIos() {
    window.isios = true;
    $("<style type='text/css'>body{-webkit-user-select:none;-webkit-user-drag:none;}</style>").appendTo("head");
    $(".download_cmd").remove();
}

function showNews(name) {
    HideAndShow($("#new_panel "));
    $("#news_frame").attr("src", "/news/" + name + ".html");
}

function ClearRoomContent() {
    if (MessagePage) {
        MessagePage.remove();
        MessagePage = null;
    }
}