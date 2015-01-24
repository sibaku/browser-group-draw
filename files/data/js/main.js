(function () {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
                window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            },
                    timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());




DT = {};

DT.ColorChooser = function () {
};
DT.ColorChooser.prototype.changeColor = function (color) {

};
DT.ColorChooser.prototype.getColor = function () {
};

DT.ColorChooser.prototype.initDialog = function () {
};

DT.ColorChooser.prototype.activated = function () {
};
DT.RGBChooser = function () {
    this.color = DT.Color.fromRGBA(0, 0, 0, 1);
};

DT.RGBChooser.prototype = new DT.ColorChooser();

DT.RGBChooser.prototype.changeColor = function (color) {
    this.color = color.toRGBA();
    this.update();

};

DT.RGBChooser.prototype.getColor = function () {
    return this.color;
};

DT.RGBChooser.prototype.activated = function () {
    this.changeColor(DT.State.currentFGColor);
};
DT.RGBChooser.prototype.update = function () {
    var rs = $('#redSlider');
    var gs = $('#greenSlider');
    var bs = $('#blueSlider');
    var c = this.color;
    var r = c.r;
    var g = c.g;
    var b = c.b;
    rs.slider('value', r);
    gs.slider('value', g);
    bs.slider('value', b);
    $('#currentColorDisplay').css('background-color', "rgb(" + r + "," + g + "," + b + ")");
};
DT.RGBChooser.prototype.initDialog = function (box) {
    box.css("padding", "10px");
    var r = $('<div id="redSlider" />');
    var g = $('<div id="greenSlider" />');
    var b = $('<div id="blueSlider" />');
    var resultBox = $('<div id="currentColorDisplay" />');

    var rgb = r.add(g).add(b);


    resultBox.addClass("ui-widget-content ui-corner-all");
    resultBox.css({width: "50px", height: "50px", margin: "auto"});
//    resultBox.css("margin-left", "135px");
//    resultBox.css("margin-top", "55px");

    resultBox.css("background-image", "none");


    var that = this;
    var changeFunc = function (e) {
        // Value vas changed programatically
        if (!e.originalEvent) {
            return;
        }
        var red = Math.round(r.slider('value'));
        var green = Math.round(g.slider('value'));
        var blue = Math.round(b.slider('value'));
        var c = DT.Color.fromRGBA(red, green, blue, 1);
        DT.colorChooserColorChanged(c);
        that.color = c;


//        console.log("Changed color");
        that.update();

    };
    rgb.css({
        width: "200px",
        margin: "15px"});

    rgb.slider({
        min: 0,
        max: 255,
        orientation: "horizontal",
        step: 1
    });

    rgb.slider("value", 140);

    rgb.on("slidechange", changeFunc);
    rgb.on("slide", changeFunc);

    r.select(".ui-slider-range").css({background: "rgb(255,0,0)"});
    g.select(".ui-slider-range").css({background: "rgb(0,255,0)"});
    b.select(".ui-slider-range").css({background: "rgb(0,0,255)"});


    var sliders = $('<div>').append(rgb);
    box.append(sliders);
    box.append(resultBox);


//    box.draggable();
//    box.css({width: 200, height: 200});
    box.css({width: "auto", height: "auto"});

    box.addClass("ui-widget-content");
    box.addClass("ui-widget-content");
    this.update();
};

DT.HSVChooser = function () {
    this.color = DT.Color.fromHSVA(0, 0, 0, 1);
};
DT.HSVChooser.prototype = new DT.ColorChooser();

DT.HSVChooser.prototype.activated = function () {
    this.changeColor(DT.State.currentFGColor);
};
DT.HSVChooser.prototype.changeColor = function (color) {
    var c = color.toHSVA();
    var old = this.color;
    this.color = c;



    this.update();

};

DT.HSVChooser.prototype.update = function () {
    var c = this.color;
    var crgb = c.toRGBA().floorRGB();
    DT.fillCanvasH(this.canvasH, this.ctxH);
    DT.fillCanvasSV(c.h, this.canvasSV, this.ctxSV);

    var ctxSV = this.ctxSV;
    var ctxH = this.ctxH;

    var indicatorColor = "rgba" + crgb.invert();
    var indicatorColorH = "rgba" + DT.Color.fromHSVA(c.h, 1, 1, 1).toRGBA().floorRGB().invert();
    ctxSV.save();
    ctxSV.strokeStyle = indicatorColorH;
    ctxSV.lineWidth = 4;

    ctxSV.beginPath();
    ctxSV.arc(c.s * this.canvasSV.width, c.v * this.canvasSV.height, 6, 0, Math.PI * 2);
    ctxSV.stroke();
    ctxSV.restore();

    ctxH.save();
    ctxH.fillStyle = indicatorColorH;

    ctxH.fillRect(0, c.h / 360 * this.canvasH.height - 2, this.canvasH.width, 5);

    ctxH.restore();


    var r = Math.floor(crgb.r);
    var g = Math.floor(crgb.g);
    var b = Math.floor(crgb.b);
    $('#colorDisplayHSVA').css('background-color', "rgb(" + r + "," + g + "," + b + ")");
};
DT.HSVChooser.prototype.initDialog = function (box) {
    box.css("padding", "10px");
    var a = $('<div id="alphaSlider" />');
    var final = $('<div id="#finalColorContainer" />');
    var resultBox = $('<div id="colorDisplayHSVA" />');



    var canvasSV = document.createElement("canvas");
    var canvasH = document.createElement("canvas");


    canvasSV.width = 150;
    canvasSV.height = 150;
    canvasH.width = 20;
    canvasH.height = 150;
    var ctxSV = canvasSV.getContext("2d");
    var ctxH = canvasH.getContext("2d");

    this.canvasSV = canvasSV;
    this.canvasH = canvasH;
    this.ctxSV = ctxSV;
    this.ctxH = ctxH;


//    DT.fillCanvasH(canvasH, ctxH);
//    DT.fillCanvasSV(0, canvasSV, ctxSV);

    resultBox.addClass("ui-widget-content ui-corner-all");
    resultBox.css({width: "50px", height: "50px", margin: "auto"});
//    resultBox.css("margin-left", "135px");
//    resultBox.css("margin-top", "55px");
    resultBox.css("background-image", "none");

//    alphaBox.css("margin-left", "135px");
//    alphaBox.css("margin-top", "10px");

    var that = this;
    var changeHueFunc = function (e) {
        var offset = $(canvasSV).offset();
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;

        var currentColor = DT.State.currentFGColor.toHSVA();
        var s = currentColor.s;
        var v = currentColor.v;
        var h = y / canvasH.height * 360;
        that.color = DT.Color.fromHSVA(h, s, v, 1);
        var c = that.color.toRGBA().floorRGB();
//        DT.State.currentFGColor = c;

        DT.colorChooserColorChanged(c);

        that.update(c);
//        DT.fillCanvasH(canvasH, ctxH);
//        DT.fillCanvasSV(h, canvasSV, ctxSV);  

    };
    var changeFunc = function (e) {

        var offset = $(canvasSV).offset();
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;

        var s = x / canvasSV.width;
        var v = y / canvasSV.height;

        that.color = DT.Color.fromHSVA(that.color.h, s, v, 1);
        var c = that.color.toRGBA().floorRGB();
//        DT.State.currentFGColor = c;

        DT.colorChooserColorChanged(c);

        that.update(c);
//        DT.fillCanvasH(canvasH, ctxH);
//        DT.fillCanvasSV(h, canvasSV, ctxSV);
    };


    $(canvasSV).mousedown(function (e) {
        that.svdown = true;
        changeFunc(e);
        e.preventDefault();
    });

    $(canvasSV).mousemove(function (e) {
        if (!that.svdown) {
            return;
        }
        changeFunc(e);
        e.preventDefault();
    });

    $(canvasSV).on("mouseup mouseleave", function (e) {
        if (that.svdown) {

            that.svdown = false;
            changeFunc(e);
            e.preventDefault();
        }

    });
    $(canvasH).mousedown(function (e) {
        that.hdown = true;
        changeHueFunc(e);
        e.preventDefault();
    });

    $(canvasH).mousemove(function (e) {
        if (!that.hdown) {
            return;
        }
        changeHueFunc(e);
        e.preventDefault();
    });

    $(canvasH).on("mouseup mouseleave", function (e) {
        if (that.hdown) {

            that.hdown = false;
            changeHueFunc(e);
        }
        e.preventDefault();
    });



    a.on("slidechange slide", function (e) {
        var a = $('#alphaSlider').slider('value');
        that.color = DT.Color.fromHSVA(that.color.h, that.color.s, that.color.v, a);
        var c = that.color.toRGBA().floorRGB();
//        DT.State.currentFGColor = c;

        DT.changeFGColor(c);
        var ac = Math.round(a * 255);

        var r = Math.floor(c.r);
        var g = Math.floor(c.g);
        var b = Math.floor(c.b);
        alphaBox.css('background-color', "rgb(" + ac + "," + ac + "," + ac + ")");
        resultBox.css('background-color', "rgb(" + r + "," + g + "," + b + ")");
        that.update();
    });


    var canvases = $(canvasSV).add(canvasH);
    canvases.css({margin: "10px"});
    var canvasBox = $('<div>').append(canvases);
//    canvasBox.css({float:"left"});

//    final.addClass("ui-widget-content ui-corner-all");
//    final.css({width: "auto", height: "auto"});

    box.append(canvasBox);
    final.append(resultBox);
    box.append(final);

//    box.draggable();
    box.css({width: "auto", height: "auto"});

    box.addClass("ui-widget-content");

    this.update();
//    changeFunc();

//    this.changeColor(DT.State.currentFGColor);
};


DT.createResultBox = function () {
    var container = $('<div id="imageResultEffect" title="Image"/>');

    var context = DT.getLocalContext();
    var canvas = document.createElement("canvas");
    var canvasSrc = context.canvas;
    canvas.width = canvasSrc.width;
    canvas.height = canvasSrc.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(canvasSrc, 0, 0);

    container.append(canvas);

    container.addClass("ui-widget-content ui-corner-all");
    container.css("padding", "10px");
//    container.css("width", (canvas.width + 30) + "px");
//    container.css("height", (canvas.height + 30) + "px");
    container.dialog({width: (canvas.width + 30), height: (canvas.height + 30)});
};


DT.connectionOpenCallback = function () {

    var host = $('#host').val();
    var port = parseInt($('#port').val());
    var adr = $('#uri').val();

    if (typeof host === "undefined" || typeof port === "undefined" || typeof adr === "undefined") {
        return;
    }
    console.log("Host: " + host);
    console.log("Port: " + port);
    console.log("Adress: " + adr);

    DT.openConnection(host, port, adr);

};



DT.connectionCloseCallback = function () {
    if (!DT.State.socket) {
        return;
    }
    DT.State.socket.close();


};
DT.createConnectDialog = function () {

    if ($('#connectDialog').length !== 0) {
        return;
    }
    var diag = $('<div id="connectDialog">\n\
        <label for="host">host:</label>\n\
        <input type="text" id="host" value="' + window.location.hostname + '" style="background:#ff0000;"/><br />\n\
        <label for="port">port:</label><input type="text" id="port" value="' + window.location.port + '" style="background:#ff0000;"/><br />\n\
        <label for="uri">uri:</label><input type="text" id="uri" value="/ws" style="background:#ff0000;"/><br />\n\
        <button id="open">Open</button></div>');
    diag.dialog({title: "Connect to Server",
        close: function () {
            $(this).dialog('destroy').remove();
        }
    });

    var button = diag.find('#open');
    button.button().click(DT.connectionOpenCallback);

};
DT.Tool = function () {

    this.attributes = {};
};

DT.Tool.prototype.playBack = function (stroke) {
};
DT.Tool.prototype.mousemove = function () {
};
DT.Tool.prototype.mousedown = function () {
};
DT.Tool.prototype.mouseup = function () {
};
DT.Tool.prototype.init = function () {

};

DT.Tool.prototype.tearDown = function () {

};


DT.executables = [];
DT.enableWacom = function (plugin) {
    DT.State.wacomPlugin = plugin;
};
DT.Tool.prototype.attribute = function (name, value) {
    if (typeof value === "undefined") {
        return this.attributes[name];
    } else {
        this.attributes[name] = value;
    }
};

DT.Tool.prototype.generatePropertyDialog = function (container) {


};

DT.getCurrentTool = function () {
    return DT.State.currentToolbox.tools[DT.State.currentTool];
};

DT.changeTool = function (name) {
    console.log(name);

    var tool = DT.State.tools[name];
    if (name === DT.State.currentTool) {
        return;
    }

    var current = DT.getCurrentTool();
    if (current) {
        $('#penPropertyContainer').children().remove();
        current.tearDown();
    }

    DT.State.currentTool = name;
    var t = DT.getCurrentTool();
    t.init();

    t.generatePropertyDialog($('#penPropertyContainer'));
//    DT.resetPositions();


};
DT.generateToolMenu = function () {
    var list = $('<ol id="selectable" />');
    list.css("list-style-type", "none");

    for (var i in DT.State.tools) {
        var item = $('<li />');
        item.data("toolname", i);
        item.append(document.createTextNode(i));
        item.addClass("ui-widget-content");
        list.append(item);
    }
    var func = function (e, ui) {
        DT.changeTool($(ui.selected).data("toolname"));
//        console.log(ui);
    };

    var container = $('#toolbox');
    container.append(list);

    list.selectable({
        selected: func
    });

    container.dialog({title: "Tools", resizable: false, dialogClass: "no-close", closeOnEscape: false, width: "auto", height: "auto"});
};

DT.colorChooserColorChanged = function (c) {
    DT.State.currentFGColor = c;
};
DT.changeFGColor = function (c) {
//    var rs = $('#redSlider');
//    var gs = $('#greenSlider');
//    var bs = $('#blueSlider');
//    var as = $('#alphaSlider');
//    rs.slider('value', r);
//    gs.slider('value', g);
//    bs.slider('value', b);
//    as.slider('value', a);

    DT.State.currentFGColor = c;
    DT.State.currentColorChooser.changeColor(c);

//    r.trigger('slide');
//    DT.State.currentFGColor = {r: r, g: g, b: b, a: a};
//    DT.State.currentFGColor = {r: r, g: g, b: b, a: a};
//    var ac = Math.round(a * 255);
//
//    var alphaBox = $('#currentAlphaDisplay');
//    resultBox = $('#currentColorDisplay');
//
//    alphaBox.css('background-color', "rgb(" + ac + "," + ac + "," + ac + ")");
//    resultBox.css('background-color', "rgb(" + red + "," + green + "," + blue + ")");

};
DT.createColorDialogHSVA = function () {

};
DT.createColorDialog = function () {

};
DT.addPressureToEvent = function (e) {
    var pl = DT.State.wacomPlugin;
    var pressure = pl ? (pl.penAPI ? pl.penAPI.pressure : 1.0) : 1.0;
    e.pressure = pressure;
};

DT.Toolbox = function () {
    this.tools = {};

    for (var id in DT.State.tools) {
        this.tools[id] = new DT.State.tools[id]();
    }

};
DT.User = function () {
    this.canvas = null;
    this.ctx = null;
    this.name = "";
    this.toolbox = new DT.Toolbox();
};


DT.createUser = function (name) {
    var user = new DT.User();
    user.name = name + "";

    return user;


};
DT.State = {};
DT.State.tools = {};
DT.State.users = {};
DT.State.currentUser = "";
DT.State.shortcuts = {};
DT.State.currentColorChooser = null;

DT.toolChooser = function (name) {
    DT.changeTool(name);
};
DT.State.colorChoosers = {};

DT.registerColorChooser = function (name, constr) {
    DT.State.colorChoosers[name] = constr;
};


DT.sendEvent = function (event) {
    if (!DT.State.socket || !DT.State.connected)
        return;

    var ws = DT.State.socket;

    ws.send(JSON.stringify(event));

};
DT.sendToolEvent = function (event) {

    if (!DT.State.socket || !DT.State.connected || !DT.State.currentUser.activated)
        return;

    var ws = DT.State.socket;

    ws.send(JSON.stringify(event));

};
DT.State.connected = false;

DT.getOffscreenBuffer = function () {

};

DT.getOverlayCanvas = function () {

};

DT.closeConnection = function () {

    if (!DT.State.socket) {
        return;
    }

    DT.State.socket.close();
    DT.State.socket = null;
    DT.State.connected = false;

    $("#host").css("background", "#ff0000");
    $("#port").css("background", "#ff0000");
    $("#uri").css("background", "#ff0000");
};
DT.openConnection = function (host, port, uri) {
    DT.State.socket = new WebSocket("ws://" + host + ":" + port + uri);
    var ws = DT.State.socket;
    ws.onmessage = function (evt) {
//        console.log("message received: " + evt.data);
//
        var obj = null;
        try {
            obj = JSON.parse(evt.data);
        } catch (exception) {

        }
        if (obj)
            DT.enqueueEvent(obj);
    };

    ws.onclose = function (evt) {
        console.log("Connection close");
        DT.State.socket = null;
        DT.State.connected = false;
        $('#initServerConnect').text("Connect to server").button().off('click').click(DT.createConnectDialog);
        $("#host").css("background", "#ff0000");
        $("#port").css("background", "#ff0000");
        $("#uri").css("background", "#ff0000");
        $('#open').show();

        $('#chatUserList').children().remove();
        DT.State.users = {};

    };

    ws.onopen = function (evt) {
        $("#host").css("background", "#00ff00");
        $("#port").css("background", "#00ff00");
        $("#uri").css("background", "#00ff00");



        DT.createNicknameDialog("Choose a nickname");
        DT.State.connected = true;

        $('#initServerConnect').text("Disconnect from server").button().off('click').click(DT.connectionCloseCallback);
        $('#open').hide();


    };
};
DT.createNicknameDialog = function (text) {
    var container = $('<div>');
    container.append($('<p>Nickname</p>'));
    var input = $('<input id="nicknameText" type="text" />');
    container.append(input);




    var style = $('<style> .no-close .ui-dialog-titlebar-close {display: none;}</style>');
    container.append(style);
    var func = function () {
        var t = $('#nicknameText');
        var value = t.val();
        DT.sendEvent({type: "User", action: "DesireNickname", name: value});
        container.dialog("destroy").remove();
    };
    input.keyup(function (e) {
        if (e.which === 13) {
            func();
        }
    });
    container.dialog({title: text, modal: true,
        dialogClass: "no-close",
        closeOnEscape: false,
        buttons: [
            {
                text: "Send",
                click: func
            }
        ]});
};

DT.setupChatWindow = function () {
    var c = $('#chatContainer');
    c.css("padding", "10px");
    c.find("div").css("margin", "5px");
    var b = c.find("button");
    var log = $('#chatlog');
    log.css("overflow-y", "scroll");
    log.css("text-align", "left");
    log.css({float: "left", width: "70%", height: "6em"});
    log.addClass('ui-widget-content');
    b.button();
    var sendFunc = function () {
        DT.sendEvent({
            type: "Chat", action: "Msg", data: $('#chatInput').val(), user: DT.State.currentUser.name
        });
    };
    b.click(sendFunc);
    $('#chatInput').keyup(function (e) {
        if (e.which !== 13) {
            return;
        }
        DT.sendEvent({
            type: "Chat", action: "Msg", data: $('#chatInput').val(), user: DT.State.currentUser.name
        });
        $('#chatInput').val("");
    });
    $('#chatUserList').css({height: "6em", width: "20%"}).css("list-style-type", "none").css("text-align", "left");
    c.dialog({title: "Chat",
        dialogClass: "no-close",
        closeOnEscape: false,
        width: "auto",
        height: "auto"
    });

    $('#initServerConnect').button().click(function () {
        DT.createConnectDialog();
    });

};

DT.userJoined = function (name) {

    if (name !== DT.State.currentUser.name) {

        var u = DT.createUser(name);
        DT.State.users[name] = u;
    }
    var li = $("<li>" + name + "</li>");
    li.addClass('ui-widget-content');
    $('#chatUserList').append(li);
};
DT.serverMessageReceived = function (e) {
    if (e.action === "AdminStatusGained") {
        DT.addChatMessage("Server", "You are now admin");
    } else if (e.action === "AccessDenied") {
        DT.addChatMessage("Server", e.msg);
    } else if (e.action === "clear") {
        DT.clear();
    } else {
        if (e.msg) {
            DT.addChatMessage("Server", e.msg);
        }
    }
};

DT.addChatMessage = function (name, message)
{
    var log = $('#chatlog');
    var childs = log.children();
    if (childs.length > 50) {
        childs.first().remove();
    }
    var p = $('<p class=chatMessage><span class="chatUsername">' + name + ': </span><span class="chatMessage">' + message + '</span></p>');
    log.append(p);

    log.scrollTop(log[0].scrollHeight);
};

DT.chatMessageReceived = function (e) {

    var msg = e.data;
    var user = e.user;

    DT.addChatMessage(user, msg);
//    var log = $('#chatlog');
//    var childs = log.children();
//    if (childs.length > 50) {
//        childs.first().remove();
//    }
//    var p = $('<p class=chatMessage><span class="chatUsername">' + user + ': </span><span class="chatMessage">' + msg + '</span></p>');
//    log.append(p);
//
//    log.scrollTop(log[0].scrollHeight);
};
DT.userLeave = function (name) {

    if (!DT.State.users[name]) {
        return;
    }

    delete DT.State.users[name];
    $('#chatUserList').find("li").filter(function (index, element) {
        var text = $(element).text();
        return text === name;
    }).remove();
};
DT.getUser = function (name) {
    if (name === DT.State.currentUser.name) {
        return DT.State.currentUser;
    }
    return DT.State.users[name];
};

DT.mouseup = function (e) {

    var off = $('#drawCanvas').offset();
    var p = {x: e.pageX - off.left, y: e.pageY - off.top};
    var penEvent = {point: p, pressure: e.pressure, which: e.which};
    var t = DT.getCurrentTool();
    if (t) {
        t.mouseup(penEvent);
    }
    e.preventDefault();
};
DT.mousemove = function (e) {
    orig = e.originalEvent;
    if (orig.mozPressure) {
        e.pressureSensitivity = e.mozPressure;
    } else {
        e.pressureSensitivity = 1.0;
    }
    DT.addPressureToEvent(e);

    var off = $('#drawCanvas').offset();
    var p = {x: e.pageX - off.left, y: e.pageY - off.top};
    var penEvent = {point: p, pressure: e.pressure, which: e.which};
//    console.log("Sensitivity: " + e.pressureSensitivity);
    var t = DT.getCurrentTool();
    if (t) {
        t.mousemove(penEvent);
    }
//    DT.sendEvent({type: "mousemove", x: e.pageX, y: e.pageY});
    e.preventDefault();
};

DT.mousedown = function (e) {
    orig = e.originalEvent;
//    console.log(orig);
    if (typeof orig.mozPressure !== "undefined") {
        e.pressureSensitivity = orig.mozPressure;
    } else {
        e.pressureSensitivity = 1.0;
    }

    var off = $('#drawCanvas').offset();
    var p = {x: e.pageX - off.left, y: e.pageY - off.top};
    var penEvent = {point: p, pressure: e.pressure, which: e.which};
    var t = DT.getCurrentTool();
    if (t) {
        t.mousedown(penEvent);
    }


    $("h1").text(e.pressureSensitivity);
//    console.log("Sensitivity Down: " + e.pressureSensitivity);
    e.preventDefault();
};


DT.Executable = function (f) {
    this.f = f;
};

DT.Executable.prototype.run = function (time) {
    var f = this.f;
    if (f) {
        f();
    }
};
DT.Executable.prototype.isFinished = function () {
    return true;
};
DT.Executable.prototype.postRun = function () {

};

DT.State.MAX_LOG_SIZE = -1;
DT.addEventToLog = function (e) {
    if (DT.State.MAX_LOG_SIZE === DT.State.localLog.length) {
        DT.State.localLog.shift();
    }

    DT.State.localLog.push(e);
};

DT.Player = function (data) {
    this.data = data;
    this.time = -1;
    this.toolbox = new DT.Toolbox();

};

DT.Player.prototype = new DT.Executable();
DT.Player.prototype.run = function (time) {
    if (this.time < 0) {
        this.time = time;
    }

    var delta = time - this.time;
    this.time = time;


    if (this.data.length < 1) {
        return;
    }
    var event = this.data.shift();
    DT.addEventToLog(event);
    var stroke = event.stroke;
    var toolname = stroke.tool;
    var t = this.toolbox.tools[toolname];
    if (!t) {
        return;
    }

    t.playBack(stroke);
//    console.log("Time delta: " + delta);



};
DT.Player.prototype.isFinished = function () {
    return this.data.length === 0;
};

//
//DT.VideoExportPlayer = function (data, frameDuration, framePerFile) {
//    this.data = data;
//    this.toolbox = new DT.Toolbox();
//    this.framePerFile = framePerFile ? framePerFile : -1;
//    this.frameDuration = frameDuration;
//    this.context = DT.createPlayerContext();
//    this.dialog = $('<div id="videoExportID"><p>Applying log:: 0%</p></div>');
//    this.initialSize = data.length;
//
//
//    other = other ? other : {};
//
//    this.res = other.res;
//
//    // Check if different resolution
//    var canvas = this.context.canvas;
//
//    if (this.res && (canvas.width !== this.res.w || canvas.height !== this.res.h)) {
//        this.sourceCanvas = document.createElement("canvas");
//        this.sourceCanvas.width = this.res.w;
//        this.sourceCanvas.height = this.res.h;
//        this.sourceCtx = this.sourceCanvas.getContext("2d");
//        this.resize = true;
//    } else {
//        this.sourceCanvas = canvas;
//        this.sourceCtx = this.context.ctx;
//        this.res = {w: canvas.width, h: canvas.heigh};
//    }
//
//
//    this.vidCount = 0;
//    this.strokeCount = 0;
//    var d = this.dialog;
//    d.dialog({title: "Converting log to video", modal: true,
//        dialogClass: "no-close",
//        closeOnEscape: false
//    });
//
//
//    this.video = new DT.WhammyWrapper();
//    this.type = "webm";
//
//};
//DT.VideoExportPlayer.prototype = new DT.Executable();
//

DT.Encoder = function () {

};

DT.Encoder.prototype.finish = function (callback) {
    this.finishCB = callback;
};

DT.Encoder.prototype.add = function () {

};

DT.Encoder.prototype.compile = function () {

};
DT.Encoder.prototype.reset = function () {
};

DT.WhammyWrapper = function () {
    this.video = new Whammy.Video();
};

DT.WhammyWrapper.prototype = new DT.Encoder();

DT.WhammyWrapper.prototype.add = function () {
    this.video.add.apply(this.video, Array.prototype.slice.call(arguments));
};

DT.WhammyWrapper.prototype.compile = function () {
    var r = this.video.compile();
    if (this.finishCB) {
        this.finishCB(r);
    }
};
DT.WhammyWrapper.prototype.reset = function () {
    this.video = new Whammy.Video();
};


//DT.VideoExportPlayer.prototype.run = function (time) {
//    if (this.time < 0) {
//        this.time = time;
//    }
//    if (this.computing) {
//        return;
//    }
//
//    var delta = time - this.time;
//    this.time = time;
//
//
//    if (this.data.length < 1) {
//        return;
//    }
//    var event = this.data.shift();
//    var stroke = event.stroke;
//    var toolname = stroke.tool;
//    var t = this.toolbox.tools[toolname];
//    if (!t) {
//        return;
//    }
//
//
//    t.playBack(stroke, this.context);
//    var frame = this.context.canvas;
////    if(!DT.State.WebPSupport){
////       var out =  DT.encodeCanvasToWebP(0.8,this.context.canvas,this.context.ctx);
////       var base64URI = btoa(out.output);
////       var url = "data:image/webp;base64," + base64URI;
////       frame = url;
////       
////    }
//    this.video.add(frame, this.frameDuration);
////    console.log("Time delta: " + delta);
//    this.dialog.children('p').text("Applying log: " + ((1 - (this.data.length / this.initialSize)) * 100).toFixed(2) + "%");
//    if (this.data.length === 0) {
//        this.dialog.children('p').text("Start generating file");
//        var that = this;
//        this.video.finish(function (output) {
//            that.dialog.children('p').text("Generated file");
//            var url = (window.webkitURL || window.URL).createObjectURL(output);
//            var link = document.createElement("a");
//            link.download = "videoLog_" + that.vidCount + "." + that.type;
//            link.href = url;
//
//            var event = document.createEvent("MouseEvents");
//            event.initEvent("click", true, false);
//            link.dispatchEvent(event);
//            that.computing = false;
//            that.strokeCount = 0;
//            that.vidCount++;
////        link.click();
//
//
//        });
//        this.computing = true;
//        this.video.compile();
////        this.dialog.children('p').text("Generated file");
////        var url = (window.webkitURL || window.URL).createObjectURL(output);
////        var link = document.createElement("a");
////        link.download = "videoLog." + this.type;
////        link.href = url;
////
////        var event = document.createEvent("MouseEvents");
////        event.initEvent("click", true, false);
////        link.dispatchEvent(event);
//////        link.click();
////        this.dialog.dialog('destroy').remove();
//
////        $('<a href="' + url + '" download="videoLog.webm"></a>').click();
//    }
//
//
//
//};


//
//DT.VideoExportPlayer.prototype.isFinished = function () {
//    return this.data.length === 0 && !this.computing;
//};
//
//DT.VideoExportPlayer.prototype.postRun = function () {
//    this.dialog.dialog('destroy').remove();
//};


DT.VideoExportPlayer = function (data, frameDuration, other) {
    this.data = data;
    this.toolbox = new DT.Toolbox();

    this.frameDuration = frameDuration;
    this.context = DT.createPlayerContext();
    this.dialog = $('<div id="videoExportID"><p>Applying log:: 0%</p></div>');
    this.initialSize = data.length;
    other = other ? other : {type: "AVI"};

    this.res = other.res;


    this.framePerFile = other.maxFrames ? other.maxFrames : -1;
    // Check if different resolution
    var canvas = this.context.canvas;

    if (this.res && (canvas.width !== this.res.w || canvas.height !== this.res.h)) {
        this.sourceCanvas = document.createElement("canvas");
        this.sourceCanvas.width = this.res.w;
        this.sourceCanvas.height = this.res.h;
        this.sourceCtx = this.sourceCanvas.getContext("2d");
        this.resize = true;
        this.sourceCtx.save();
        this.sourceCtx.fillStyle = "rgba(255,255,255,1)";

        this.sourceCtx.fillRect(0, 0, this.sourceCanvas.width, this.sourceCanvas.height);

        this.sourceCtx.restore();

    } else {
        this.sourceCanvas = canvas;
        this.sourceCtx = this.context.ctx;

        this.res = {w: canvas.width, h: canvas.height};
    }

    this.vidCount = 0;
    this.strokeCount = 0;
    var d = this.dialog;
    d.dialog({title: "Converting log to video", modal: true,
        dialogClass: "no-close",
        closeOnEscape: false
    });

    if (other.type === "AVI") {

        this.video = new DT.MJPGEncoder(frameDuration, this.res.w, this.res.h);
        this.type = "avi";
    } else if (other.type === "WEBM") {
        this.video = new DT.WhammyWrapper();
        this.type = "webm";
    }

    // Initial frame
    this.video.add(this.sourceCanvas, this.frameDuration);
    this.strokeCount++;
    this.otherParams = other;

};

DT.VideoExportPlayer.prototype = new DT.Executable();


DT.VideoExportPlayer.prototype.run = function (time) {
    if (this.time < 0) {
        this.time = time;
    }
    if (this.computing) {
        return;
    }

    var delta = time - this.time;
    this.time = time;


    if (this.data.length < 1) {
        return;
    }

    var event = this.data.shift();
    var stroke = event.stroke;
    var toolname = stroke.tool;
    var t = this.toolbox.tools[toolname];
    if (!t) {
        return;
    }


    t.playBack(stroke, this.context);
    if (this.resize) {
        this.sourceCtx.drawImage(this.context.canvas, 0, 0, this.context.canvas.width, this.context.canvas.height, 0, 0, this.res.w, this.res.h);
    }
    this.strokeCount++;
    var frame = this.sourceCanvas;
//    if(!DT.State.WebPSupport){
//       var out =  DT.encodeCanvasToWebP(0.8,this.context.canvas,this.context.ctx);
//       var base64URI = btoa(out.output);
//       var url = "data:image/webp;base64," + base64URI;
//       frame = url;
//       
//    }
    this.video.add(frame, this.frameDuration);
//    console.log("Time delta: " + delta);
    this.dialog.children('p').text("Applying log: " + ((1 - (this.data.length / this.initialSize)) * 100).toFixed(2) + "%");
    if ((this.framePerFile > 0 && this.strokeCount >= this.framePerFile) || this.data.length === 0) {
        this.dialog.children('p').text("Start generating file");
        var that = this;
        this.video.finish(function (output) {
            that.dialog.children('p').text("Generated file");
            var url = (window.webkitURL || window.URL).createObjectURL(output);
            output = null;
            var link = document.createElement("a");
            link.download = "videoLog_" + that.vidCount + "." + that.type;
            link.href = url;

            var event = document.createEvent("MouseEvents");
            event.initEvent("click", true, false);
            link.dispatchEvent(event);

            that.video.reset();
            that.computing = false;
            that.strokeCount = 0;
            that.vidCount++;
//        link.click();


        });
        this.computing = true;
        this.video.compile();
//        this.dialog.children('p').text("Generated file");
//        var url = (window.webkitURL || window.URL).createObjectURL(output);
//        var link = document.createElement("a");
//        link.download = "videoLog." + this.type;
//        link.href = url;
//
//        var event = document.createEvent("MouseEvents");
//        event.initEvent("click", true, false);
//        link.dispatchEvent(event);
////        link.click();
//        this.dialog.dialog('destroy').remove();

//        $('<a href="' + url + '" download="videoLog.webm"></a>').click();
    }



};



DT.VideoExportPlayer.prototype.isFinished = function () {
    return this.data.length === 0 && !this.computing;
};

DT.VideoExportPlayer.prototype.postRun = function () {
    this.dialog.dialog('destroy').remove();
};




DT.MJPGEncoder = function (duration, w, h) {
    this.frames = [];
    this.frameDuration = duration;
    this.w = w;
    this.h = h;

};

DT.MJPGEncoder.prototype = new DT.Encoder();
DT.MJPGEncoder.prototype.add = function (frame) {
    this.frames.push(frame.toDataURL("image/jpeg", 0.8));
};

DT.numToBytes = function (n) {
    var hex = n.toString(16);

    while (hex.length < 8) {
        hex = "0" + hex;
    }

    var array = new Uint8Array(4);
    array[0] = (Number.parseInt(hex.substr(6, 2), 16));
    array[1] = (Number.parseInt(hex.substr(4, 2), 16));
    array[2] = (Number.parseInt(hex.substr(2, 2), 16));
    array[3] = (Number.parseInt(hex.substr(0, 2), 16));

    return array;

};

DT.insertNumberIntoByteArray = function (a, n) {
    var size = DT.numToBytes(n);
    for (var i = 0; i < size.length; i++) {
        a.push(size[i]);
    }
};

DT.stringToBytes = function (s) {
    var data = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) {
        data[i] = s.charCodeAt(i);
    }
    return data;
};
DT.insertStringIntoByteArray = function (a, s) {
    for (var i = 0; i < s.length; i++) {
        a.push(s.charCodeAt(i));
    }
};


DT.TypedChunk = function (id, type) {
    this.type = type ? type : "";
    this.id = id;
    this.children = [];

    // Id + size
    this.headerLength = 8;
    this.parent = null;
};

DT.TypedChunk.prototype.length = function () {
    var sum = 0;
    for (var i = 0; i < this.children.length; i++) {
        var c = this.children[i];
        if (c instanceof Array || c instanceof Uint8Array) {
            sum += c.length;
        } else {
            sum += c.length();
        }
    }

    return sum += this.headerLength + 8;
};


DT.TypedChunk.prototype.addChild = function (c) {
    this.children.push(c);
    c.parent = this;
};


DT.TypedChunk.prototype.flatten = function () {
    var a = [];
    DT.insertStringIntoByteArray(a, this.id);
    var childs = [];
    DT.insertStringIntoByteArray(childs, this.type);
    var children = this.children;
    var l = children.length;
    for (var i = 0; i < l; i++) {
        var c = children[i];
        if (c instanceof Array) {
            childs = childs.concat(c);
        } else {
            childs = childs.concat(c.flatten());
        }
    }
    DT.insertNumberIntoByteArray(a, childs.length);
    this.children = [];
    return a.concat(childs);
};

DT.TypedChunk.prototype.flattenTimeout = function (maxIt, cb) {

    var list = [];
    var indices = [];
    var current = this;
    var last = this;
    var currentIndex = 0;
    var totalData = [];

    var that = this;
    while (current) {
        var children = current.children;
        last = current;
        // Leaf
        if (children.length === 1 && (children[0] instanceof Array || children[0] instanceof Uint8Array)) {
            list.push(current);
            currentIndex = indices.pop() + 1;

//
//                var a = [];
//                DT.insertStringIntoByteArray(a, current.id);
//
//                var temp = [];
//                DT.insertStringIntoByteArray(temp, current.type);
//                DT.insertNumberIntoByteArray(a, current.children[0].length + temp.length);

//                current.data = [new Uint8Array(a)].concat([new Uint8Array(temp)]).concat([new Uint8Array(current.children[0])]);
//                current.dataSize = a.length + temp.length + current.children[0].length;
//                
            // Header
            current.dataSize = current.children[0].length;
            // Id + type
            current.headerSize = 4 + current.type.length;
//                current.children = [];
            current.leaf = true;
            current = current.parent;

        } else if (currentIndex === children.length) {

            list.push(current);


//                var a = [];
//                DT.insertStringIntoByteArray(a, current.id);

//                var childs = [];
            var size = 0;
//                var temp = [];
//                DT.insertStringIntoByteArray(temp, current.type);
//                childs.push(new Uint8Array(temp));
//                size += temp.length;
            for (var i = 0; i < children.length; i++) {

//                    childs = childs.concat(children[i].data);
                size += children[i].dataSize + children[i].headerSize;
//                    children[i].data = null;
//                    children[i].dataSize = 0;
            }
//                DT.insertNumberIntoByteArray(a, size + temp.length);

//                current.data = [new Uint8Array(a)].concat([new Uint8Array(temp)]).concat(childs);
            current.dataSize = size;
            current.headerSize = 4 + current.type.length;

//                current.children = [];


            currentIndex = indices.pop() + 1;
            current = current.parent;
        } else {
            indices.push(currentIndex);
            current = children[currentIndex];
            currentIndex = 0;
        }

    }

    current = this;

    function worker() {
        var it = 0;
        while (current && it < maxIt) {

            if (!current.visited) {

                var size = current.dataSize;
                totalData.push(DT.stringToBytes(current.id));
                totalData.push(DT.numToBytes(size));
                totalData.push(DT.stringToBytes(current.type));
                current.visited = true;
                console.log("Header: " + current.id);
            }
            if (current.leaf) {
                console.log("Data: " + current.id);
                if (current.children[0] instanceof Uint8Array) {
                    totalData.push(current.children[0]);
                } else {

                    totalData.push(new Uint8Array(current.children[0]));
                }
                current.children = [];
                current = current.parent;
                it++;
            } else {
                if (current.children.length > 0) {

                    current = current.children.shift();
                } else {
                    current = current.parent;
                }
            }


        }
        if (current) {
            window.setTimeout(worker, 60);
        } else {
            cb(totalData);
        }

    }


    worker();

//
};

DT.MJPGEncoder.prototype.compile = function () {



//    Chunk.prototype.flattenAndClear = function () {
//        var data = this.flatten();
//        this.children = [];
//        return data;
//    };







//    var header = [];
//    var headerFourCC = "RIFF";
//    DT.insertStringIntoByteArray(header, headerFourCC);
//    DT.insertNumberIntoByteArray(header, data.length + 4);
//
//
//    var fileType = "AVI ";
//
//    DT.insertStringIntoByteArray(header, fileType);


    var riffChunk = new DT.TypedChunk("RIFF", "AVI ");

    var hdrlList = new DT.TypedChunk("LIST", "hdrl");

    var moviList = new DT.TypedChunk("LIST", "movi");

    var avihChunk = new DT.TypedChunk("avih");

    var strlList = new DT.TypedChunk("LIST", "strl");

    var strhChunk = new DT.TypedChunk("strh");

    var strfChunk = new DT.TypedChunk("strf");

    var idx1Chunk = new DT.TypedChunk("idx1");
    strlList.addChild(strhChunk);
    strlList.addChild(strfChunk);

    hdrlList.addChild(avihChunk);
    hdrlList.addChild(strlList);

    riffChunk.addChild(hdrlList);
    riffChunk.addChild(moviList);
    riffChunk.addChild(idx1Chunk);



    var fps = Math.round(1000 / this.frameDuration);

    var struct = [];
    DT.insertNumberIntoByteArray(struct, this.frameDuration * 1000);
    DT.insertNumberIntoByteArray(struct, this.w * this.h * 3 * fps);
    DT.insertNumberIntoByteArray(struct, 0);
    // Flags
    DT.insertNumberIntoByteArray(struct, 0);
    // Number of frames
    DT.insertNumberIntoByteArray(struct, this.frames.length);
    // Number Of InitialFrames
    DT.insertNumberIntoByteArray(struct, 0);
    // Number of streams
    DT.insertNumberIntoByteArray(struct, 1);
    // Buffersize
    DT.insertNumberIntoByteArray(struct, this.w * this.h * 3);
    // Width
    DT.insertNumberIntoByteArray(struct, this.w);
    // Height
    DT.insertNumberIntoByteArray(struct, this.h);

    // Timescale
    DT.insertNumberIntoByteArray(struct, 1);
    // Datarate
    DT.insertNumberIntoByteArray(struct, fps);
    // StartTime
    DT.insertNumberIntoByteArray(struct, 0);
    // Data length
    DT.insertNumberIntoByteArray(struct, 0);


    avihChunk.addChild(struct);


//    typedef struct _StreamHeader
//{
//    char  DataType[4];           /* Chunk identifier ("strl") */
//    char  DataHandler[4];        /* Device handler identifier */
//    DWORD Flags;                 /* Data parameters */
//    DWORD Priority;              /* Set to 0 */
//    DWORD InitialFrames;         /* Number of initial audio frames */
//    DWORD TimeScale;             /* Unit used to measure time */
//    DWORD DataRate;              /* Data rate of playback */
//    DWORD StartTime;             /* Starting time of AVI data */
//    DWORD DataLength;            /* Size of AVI data chunk */
//    DWORD SuggestedBufferSize;   /* Minimum playback buffer size */
//    DWORD Quality;               /* Sample quailty factor */
//    DWORD SampleSize;            /* Size of the sample in bytes */
//} STREAMHEADER;

    struct = [];
    DT.insertStringIntoByteArray(struct, "vids");
    // fcc Handler
    DT.insertStringIntoByteArray(struct, "MJPG");

    // dw Flags
    DT.insertNumberIntoByteArray(struct, 0);

    // wPriority
    DT.insertNumberIntoByteArray(struct, 0);

    // dwInitialFrames
    DT.insertNumberIntoByteArray(struct, 0);

    // dwScale

    DT.insertNumberIntoByteArray(struct, 1);
    // dwRate
    DT.insertNumberIntoByteArray(struct, fps);

    // dwStart
    DT.insertNumberIntoByteArray(struct, 0);

    // dwLength
    DT.insertNumberIntoByteArray(struct, this.frames.length);

    // dwSuggestedBufferSize
    DT.insertNumberIntoByteArray(struct, this.w * this.h * 3);

    // dwQuality
    DT.insertNumberIntoByteArray(struct, 8000);

    // dwSampleSize
    DT.insertNumberIntoByteArray(struct, 0);

    strhChunk.addChild(struct);


    struct = [];


    // biSize
    DT.insertNumberIntoByteArray(struct, 40);

    // biWidth
    DT.insertNumberIntoByteArray(struct, this.w);

    //biHeight
    DT.insertNumberIntoByteArray(struct, this.h);

    // planes and bitcount only words -> 16 bit
    // biPlanes


//    DT.insertNumberIntoByteArray(strf, 1);

    var planeNum = DT.numToBytes(1);
    var bitCount = DT.numToBytes(24);

    // biBitCount

    struct.push(planeNum[0]);
    struct.push(planeNum[1]);

    struct.push(bitCount[0]);
    struct.push(bitCount[1]);

//    DT.insertNumberIntoByteArray(strf, 16);
    //biCompression
    DT.insertStringIntoByteArray(struct, "MJPG");
    // biSizeImage

    DT.insertNumberIntoByteArray(struct, this.w * this.h * 3);
    // biXPelsPermeter
    DT.insertNumberIntoByteArray(struct, 0);

    // biYPelsPerMeter
    DT.insertNumberIntoByteArray(struct, 0);

    // biClrUsed

    DT.insertNumberIntoByteArray(struct, 0);
    // biClrImportant
    DT.insertNumberIntoByteArray(struct, 0);

    strfChunk.addChild(struct);


    var frames = this.frames;
    var frameNum = frames.length;

    console.log("Frames: " + frameNum);
    var indexData = [];
    var currentOffset = 4;
    for (var i = 0; i < frameNum; i++) {

        var f = frames[i];
        var bin = atob(f.split(",")[1]);
        var l = bin.length;
        var padding = l % 4 === 0 ? 0 : 4 - l % 4;
        var data = new Uint8Array(l + padding);
        for (var j = 0; j < l; j++) {
            data[j] = bin.charCodeAt(j);
        }
//
//        while (data.length % 4 !== 0) {
//            data.push(0);
//        }
        // ckid
        DT.insertStringIntoByteArray(indexData, "00dc");

        // Flags
        DT.insertNumberIntoByteArray(indexData, 0x00000010);
        // Offset
        DT.insertNumberIntoByteArray(indexData, currentOffset);
        // chunklength
        DT.insertNumberIntoByteArray(indexData, l);



        var frameChunk = new DT.TypedChunk("00dc");
        frameChunk.addChild(data);

        currentOffset += frameChunk.length();
        moviList.addChild(frameChunk);
        bin = null;
        data = null;

        if (i % 100 === 0) {
            console.log(i);
        }
    }
    idx1Chunk.addChild(indexData);

    this.frames = [];
//    dataChunk.addChild(data);
//
//    moviList.addChild(dataChunk);
    console.log("Flatten data");
    var that = this;
    riffChunk.flattenTimeout(10, function (data) {
        console.log("Flattened data");
        $('#videoExportID').children('p').text("Packed data");
//    var byteArray = new Uint8Array(data.length);

        // Maybe better for memory? o.o
//    while (data.length !== 0) {
//        byteArray[i] = data.shift();
//    }
//        that.finishCB(new Blob([new Uint8Array(data)], {type: "video/avi"}));
        that.finishCB(new Blob(data, {type: "video/avi"}));
    });
//    data = riffChunk.flatten();


//    console.log("Flattened data");
//    $('#videoExportID').children('p').text("Packed data");
////    var byteArray = new Uint8Array(data.length);
//
//    // Maybe better for memory? o.o
////    while (data.length !== 0) {
////        byteArray[i] = data.shift();
////    }
//    return new Blob([new Uint8Array(data)], {type: "video/avi"});
//    return new Blob([byteArray], {type: "video/avi"});
};

DT.Color = function () {

};
DT.Color.prototype.copy = function () {
    if (this.space === "RGBA") {
        return DT.Color.fromRGBA(this.r, this.g, this.b, this.a);
    } else if (this.space === "HSVA") {
        return DT.Color.fromHSVA(this.h, this.s, this.v, this.a);
    }
};
DT.Color.prototype.invert = function () {
    if (this.space === "RGBA") {
        return DT.Color.fromRGBA(255 - this.r, 255 - this.g, 255 - this.b, this.a);
    } else if (this.space === "HSVA") {
        return DT.Color.fromHSVA(360 - this.h, 1 - this.s, 1 - this.v, this.a);
    }
};
DT.Color.fromRGBA = function (r, g, b, a) {
    var c = new DT.Color();
    c.r = r ? r : 0;
    c.g = g ? g : 0;
    c.b = b ? b : 0;
    c.a = a ? a : 0;
    c.space = "RGBA";
    return c;
};
DT.Color.prototype.toString = function () {
    if (this.space === "RGBA") {
        return "(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
    } else if (this.space === "HSVA") {
        return "(" + this.h + "," + this.s + "," + this.v + "," + this.a + ")";
    }
};
DT.createHSVColorBox = function () {

    var div = $('<div />');

    var canvasSV = $('<canvas id="hsvColorSV">No canvas for you :( </canvas>');
    var cSV = canvasSV[0];
    var ctxSV = cSV.getContext('2d');

    var canvasH = $('<canvas id="hsvColorH">No canvas for you :( </canvas>');
    var cH = canvasH[0];
    var ctxH = cH.getContext('2d');


    var cc = canvasSV.add(canvasH);
    cc.css("padding", "10px");

//    canvasSV.css({width:"60%",height:"90%"});
//    canvasH.css({width:"20%",height:"90%"});
    var colorChooser = $('<div />');

    colorChooser.append(cc);
    colorChooser.addClass("ui-widget-content");


    div.append(colorChooser);
    div.addClass("ui-widget-content ui-corner-all");
    div.css({width: "100px", height: "100px"});
    $(document.body).append(div);
//    div.dialog();
    var w = div.width();
    var h = div.height();
    cSV.width = w * 0.6;
    cSV.height = h * 0.9;
    cH.width = w * 0.1;
    cH.height = h * 0.9;
    DT.fillCanvasH(cH, ctxH);
    DT.fillCanvasSV(0, cSV, ctxSV);


};

DT.fillCanvasH = function (canvas, ctx) {

    var w = canvas.width;
    var h = canvas.height;

    var imageData = ctx.createImageData(w, h);
    var d = imageData.data;

    var idx = 0;
    var fac = 360 / h;
    for (var hue = 0; hue < h; hue++)
    {
        var color = DT.Color.fromHSVA(hue * fac, 1, 1, 1).toRGBA();
        var r = color.r;
        var g = color.g;
        var b = color.b;
        var a = color.a * 255;
        for (var x = 0; x < w; x++) {
            d[idx++] = r;
            d[idx++] = g;
            d[idx++] = b;
            d[idx++] = a;
        }
    }

    ctx.putImageData(imageData, 0, 0);
};
DT.fillCanvasSV = function (hue, canvas, ctx) {
    var w = canvas.width;
    var h = canvas.height;

    var imageData = ctx.createImageData(w, h);
    var d = imageData.data;

    for (var v = 0; v < h; v++) {
        for (var s = 0; s < w; s++) {
            var index = v * w + s;
            index *= 4;

            var color = DT.Color.fromHSVA(hue, s / w, v / h, 1).toRGBA();

            d[index] = color.r;
            d[index + 1] = color.g;
            d[index + 2] = color.b;
            d[index + 3] = color.a * 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
};
DT.Color.prototype.toHSVA = function () {
    if (this.space === "HSVA") {
        return this;
    }

    var r = this.r;
    var g = this.g;
    var b = this.b;
    var a = this.a;

    r = r / 255;
    g = g / 255;
    b = b / 255;

    var cmax = Math.max(r, g, b);
    var cmin = Math.min(r, g, b);
    var d = cmax - cmin;

    var h = 0;
    if (cmax === r) {
        h = (g - b) / d;

    } else if (cmax === g) {
        h = (b - r) / d + 2;

    } else if (cmax === b) {
        h = (r - g) / d + 4;

    }



    h *= 60;

    if (h < 0) {
        h += 360;
    }
    var s = 0;
    if (cmax !== 0) {
        s = d / cmax;
    }

    var v = cmax;

    return DT.Color.fromHSVA(h, s, v, a);
};


DT.Color.prototype.toRGBA = function () {
    if (this.space === "RGBA") {
        return this;
    }

    var h = this.h;
    var v = this.v;
    var s = this.s;
    var a = this.a;
    var c = v * s;
    var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    var m = v - c;

    var r = 0;
    var g = 0;
    var b = 0;
    if (h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (h < 360) {
        r = c;
        g = 0;
        b = x;
    }


    return DT.Color.fromRGBA((r + m) * 255, (g + m) * 255, (b + m) * 255, a);
};
DT.Color.fromHSVA = function (h, s, v, a) {
    var c = new DT.Color();
    c.h = h ? h : 0;
    c.s = s ? s : 0;
    c.v = v ? v : 0;
    c.a = a ? a : 0;
    c.space = "HSVA";
    return c;
};


DT.Color.prototype.floorRGB = function () {
    if (this.space !== "RGBA") {
        return;
    }

    this.r = Math.floor(this.r);
    this.g = Math.floor(this.g);
    this.b = Math.floor(this.b);

    return this;
};
DT.ColorPicker = function () {

};
DT.ColorPicker.prototype = new DT.Tool();

DT.ColorPicker.prototype.handleEvent = function (e) {
    if (e.which !== 1) {
        return;
    }
    var p = e.point;

    var size = 1;
    var x = p.x;
    var y = p.y;
    var localContext = DT.getLocalContext();
    var ctx = localContext.ctx;
    var data = ctx.getImageData(x, y, 1, 1);
    var color = data.data;
    var c = DT.Color.fromRGBA(color[0], color[1], color[2], DT.State.currentFGColor.a);
    DT.changeFGColor(c);
//    console.log(color[0]);
//    console.log(color[1]);
//    console.log(color[2]);
//    console.log(color[3]);
//    console.log("---------------");
};
DT.ColorPicker.prototype.mousedown = function (e) {
    this.down = true;
    this.handleEvent(e);
};
DT.ColorPicker.prototype.mousemove = function (e) {
    if (this.down)
        this.handleEvent(e);
};

DT.ColorPicker.prototype.mouseup = function (e) {
    this.down = false;
    this.handleEvent(e);
};
DT.Pen = function () {



    this.size = 10;
    this.opacity = 1;
    this.softness = 1;

    this.spacing = 0.5;
    this.color = new DT.Color(0, 0, 0);
    this.leftOverDistance = 0;

    this.pressureControl = {};
    var pc = this.pressureControl;
    pc.size = false;
    pc.flow = false;

    this.resetStroke();

    this.smoothingFactor = 0.5;
    this.smooth = false;

    this.pathOp = DT.Pen.spline;

};


DT.Pen.prototype = new DT.Tool();


DT.Pen.prototype.resetStroke = function () {
    this.stroke = {};
    this.stroke.tool = "SimplePen";
    this.points = [];
    this.down = false;
};

DT.Pen.nop = function (points) {
    return points;
};


DT.cubicSpline = function (p0, p1, p2, p3, num) {
    var delta = 1 / (num - 1);
    var result = [];
    result.push(p0);
    for (var j = 1; j < num - 1; j++) {
        var t = j * delta;
        var tinv = 1 - t;
        var f0 = tinv * tinv * tinv;
        var f1 = 3 * t * tinv * tinv;
        var f2 = 3 * t * t * tinv;
        var f3 = t * t * t;

        var x = p0.x * f0 + p1.x * f1 + p2.x * f2 + p3.x * f3;
        var y = p0.y * f0 + p1.y * f1 + p2.y * f2 + p3.y * f3;

        // TODO Maybe use arc lengths
        // Only endpoints have information :(
        // Easy way : interpolate by t
        // Better would be some kind of arc-length comparison, maybe later


        var size = p0.size * tinv + p3.size * t;
        var flow = p0.flow * tinv + p3.flow * t;

        var p = {x: x, y: y, size: size, flow: flow};
        result.push(p);


    }
    return result;
};

DT.quadraticSpline = function (p0, p1, p2, num) {
    var delta = 1 / (num - 1);
    var result = [];
    result.push(p0);
    for (var j = 1; j < num - 1; j++) {
        var t = j * delta;
        var f0 = t * t - 2 * t + 1;
        var f1 = 2 * t * (1 - t);
        var f2 = t * t;

        var x = p0.x * f0 + p1.x * f1 + p2.x * f2;
        var y = p0.y * f0 + p1.y * f1 + p2.y * f2;

        // TODO Maybe use arc lengths
        // Only endpoints have information :(
        // Easy way : interpolate by t
        // Better would be some kind of arc-length comparison, maybe later
        var tinv = 1 - t;
        var size = p0.size * tinv + p2.size * t;
        var flow = p0.flow * tinv + p2.flow * t;

        var p = {x: x, y: y, size: size, flow: flow};
        result.push(p);


    }
    return result;
};
// Not yet working
// Adapted from http://scaledinnovation.com/analytics/splines/aboutSplines.html
DT.Pen.spline = function (points, tk) {


    if (points.length < 3) {
        return points;
    }
    // 4 point packages
    var i = 0;
//    var tk = -0.5;
    var subdivisions = 8;
    var result = [];
    var clast = null;


    for (; i + 2 < points.length; i++) {

        var p0 = points[i];
        var p1 = points[i + 1];
        var p2 = points[i + 2];

        var x0 = p0.x;
        var x1 = p1.x;
        var x2 = p2.x;

        var y0 = p0.y;
        var y1 = p1.y;
        var y2 = p2.y;


        var d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        var d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        var fa = tk * d01 / (d01 + d12);   // scaling factor for triangle Ta
        var fb = tk * d12 / (d01 + d12);   // ditto for Tb, simplifies to fb=t-fa
        var p1x = x1 - fa * (x2 - x0);    // x2-x0 is the width of triangle T
        var p1y = y1 - fa * (y2 - y0);    // y2-y0 is the height of T
        var p2x = x1 + fb * (x2 - x0);
        var p2y = y1 + fb * (y2 - y0);

        var control1 = {x: p1x, y: p1y};
        var control2 = {x: p2x, y: p2y};


        if (clast) {
            result = result.concat(DT.cubicSpline(p0, clast, control1, p1, subdivisions));
        }
        else {
            // First
            result = result.concat(DT.quadraticSpline(p0, control1, p1, subdivisions));
        }
        clast = control2;

    }

    result = result.concat(DT.quadraticSpline(points[i], clast, points[i + 1]));
    result.push(points[i + 1]);

    return result;
};

DT.Pen.prototype.tearDown = function () {
    var localContext = DT.getLocalContext();
    this.resetStroke();
    var ctx = localContext.ctxTemp;
    var canvas = localContext.canvasTemp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx = localContext.ctxOffscreen;
    canvas = localContext.canvasOffscreen;
    ctx.clearRect(0, 0, canvas.width, canvas.height);


};
DT.Pen.prototype.generatePropertyDialog = function (container) {

//    container.css({width: "250px", height: "auto"});
    var box = $('<div />');
//    box.addClass("ui-widget-content ui-corner-all");
    var box2 = $('<div />');
    var boxGeneral = $('<div />');
//    var list = $('<ol />');

    var size = $('<input />', {type: "checkbox"});
    var flow = $('<input />', {type: "checkbox"});
    var smooth = $('<input />', {type: "checkbox"});
    size.prop('checked', this.pressureControl.size);
    flow.prop('checked', this.pressureControl.flow);
    smooth.prop('checked', this.smooth);


    var sizeSlider = $('<div />');
    sizeSlider.css({width: "200px"});

    var spacingSlider = $('<div />');
    spacingSlider.css({width: "200px"});

    var opacitySlider = $('<div />');
    opacitySlider.css({width: "200px"});

    var smoothnessSlider = $('<div />');
    smoothnessSlider.css({width: "200px"});

    boxGeneral.append($('<p>Pen size:</p>'));
    boxGeneral.append(sizeSlider);
    boxGeneral.append($('<p>Spacing: </p>'));
    boxGeneral.append(spacingSlider);
    boxGeneral.append($('<p>Opacity: </p>'));
    boxGeneral.append(opacitySlider);
    boxGeneral.append($('<p><h5>Path smoothing</h5></p>'));
    boxGeneral.append($('<p>Activate Smoothing: </p>'));
    boxGeneral.append(smooth);

    boxGeneral.append($('<p>Smothness Factor: </p>'));
    boxGeneral.append(smoothnessSlider);


    var that = this;
    var func = function () {
        var s = sizeSlider.slider('value');

        that.size = s;

    };
    smooth.click(function () {

        that.smooth = smooth.prop('checked');
    });

    var softFunc = function () {
        var s = spacingSlider.slider('value');
        that.spacing = s;
    };

    var opFunc = function () {
        var s = opacitySlider.slider('value');
        var t = DT.getCurrentTool();
        that.opacity = s;
    };
    var smoothFunc = function () {
        var s = smoothnessSlider.slider('value');
        that.smoothingFactor = s;
    };

    sizeSlider.slider({min: 1, max: 200, step: 1});
    sizeSlider.slider('value', this.size);
    sizeSlider.on("slide", func);
    sizeSlider.on("slidechange", func);

    spacingSlider.slider({min: 0, max: 1, step: 1 / 255});
    spacingSlider.slider('value', this.spacing);
    spacingSlider.on("slide", softFunc);
    spacingSlider.on("slidechange", softFunc);

    opacitySlider.slider({min: 0, max: 1, step: 1 / 255});
    opacitySlider.slider('value', this.opacity);
    opacitySlider.on("slide", opFunc);
    opacitySlider.on("slidechange", opFunc);

    smoothnessSlider.slider({min: 0, max: 1, step: 1 / 255});
    smoothnessSlider.slider('value', this.smoothingFactor);
    smoothnessSlider.on("slide", smoothFunc);
    smoothnessSlider.on("slidechange", smoothFunc);

//    var flow = $('<li>Flow</li>').addClass('ui-widget-content');
//    list.append(size);
//    list.append(flow);

    var overview = $('<p><h5>Tablet pressure controls</h5></p>');

    boxGeneral.children().css("margin", "10px");
//    list.css("list-style-type", "none");

//    var sfo = list.add(overview);
    box2.append(overview);
    box2.append(document.createTextNode("Size: "));
    box2.append(size);
    box2.append(document.createTextNode("Flow: "));
    box2.append(flow);

    box.append($('<p><h5>Pen properties</h5></p>'));
    box.append(boxGeneral);


    box.append(box2);

    container.append(box);

    box.children().css("margin", "10px");

    box.css({width: "200px", height: "auto"});
//    box.draggable();

    flow.click(function () {
        var t = DT.getCurrentTool();
        t.flowPressure(flow.prop('checked'));
    });
    size.click(function () {
        var t = DT.getCurrentTool();
        t.sizePressure(size.prop('checked'));
    });

//    list.append(style);
//    console.log(list.filter(".ui-selecting").length);
//     list.filter(".ui-selecting").css({background: "rgb(255,0,0)"});
//      list.filter(".ui-selected").css({background: "rgb(0,255,0)",color:"white"});
//    list.filter("li").append("<p>Text</p>");

};
DT.Pen.prototype.sizeAccessor = function (s) {
    if (typeof s === "undefined") {
        return this.size;
    }
    else {
        this.size = s;
    }
};

DT.Pen.prototype.sizePressure = function (s) {
    if (typeof s === "undefined") {
        return this.pressureControl.size;
    }
    else {
        this.pressureControl.size = s;
    }
};
DT.Pen.prototype.enableSizePressure = function () {
    this.pressureControl.size = true;
};
DT.Pen.prototype.disableSizePressure = function () {
    this.pressureControl.size = false;
};

DT.Pen.prototype.flowPressure = function (f) {
    if (typeof f === "undefined") {
        return this.pressureControl.flow;
    }
    else {
        this.pressureControl.flow = f;
    }
};
DT.Pen.prototype.enableFlowPressure = function () {
    this.pressureControl.flow = true;
};
DT.Pen.prototype.disableFlowPressure = function () {
    this.pressureControl.flow = false;
};

DT.Pen.prototype.opacityAccessor = function (o) {
    if (typeof o === "undefined") {
        return this.opacity;
    }
    else {
        this.opacity = o;
    }
};
DT.Pen.prototype.getSize = function (e) {
    var p = e.pressure;

    return this.pressureControl.size ? this.size * p : this.size;
};
DT.Pen.prototype.getFlow = function (e) {
    var p = e.pressure;

    return this.pressureControl.flow ? p : 1;
};
DT.Pen.prototype.getSoftness = function (e) {
    var p = e.pressure;

    return this.pressureControl.softness ? p : 1;
};




DT.Pen.prototype.updateDrawable = function (p, last, color, spacing, leftOverDistance, ctx) {

//    var spacing = this.lineWidth * 0.1;
//
//    spacing = spacing < 0.5 ? 0.5 : spacing;

    var spacing = spacing * p.size;
    spacing = spacing < 0.5 ? 0.5 : spacing;
    var s = last;
    var e = p;


    if (!s) {
        return;
    }

    var dx = e.x - s.x;
    var dy = e.y - s.y;

    var l = Math.sqrt(dx * dx + dy * dy);
    var sx = 0;
    var sy = 0;
    var il = 1 / l;
    if (l > 0) {


        sx = dx * il;
        sy = dy * il;
    }

    var ox = 0;
    var oy = 0;

    var leftOver = leftOverDistance;
    var totalDist = leftOver + l;

    var sw = s.size;
    var ew = e.size;

    var sf = s.flow;
    var ef = e.flow;

    var color = color;
    var r = color.r;
    var g = color.g;
    var b = color.b;

    ctx.save();

    while (totalDist > spacing) {


        if (leftOver > 0) {
            // If we're making up distance we didn't cover the last
            //	time we drew a line, take that into account when calculating
            //	the offset. leftOverDistance is always < spacing.
            ox += sx * (spacing - leftOver);
            oy += sy * (spacing - leftOver);

            leftOver -= spacing;
        } else {
            // The normal case. The offset increment is the normalized vector
            //	times the spacing
            ox += sx * spacing;
            oy += sy * spacing;
        }

        var wa = Math.sqrt(ox * ox + oy * oy) * il;

        var iwa = 1 - wa;
        var w = sw * iwa + ew * wa;

        var f = sf * iwa + ef * wa;

        var d = w / 2;

//        ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + f + ")";
//        ctx.beginPath();
//
//        ctx.arc(s.x + ox - d, s.y + oy - d, d, 0, 2 * Math.PI);
//
//        ctx.fill();

        this.stamp(s.x + ox, s.y + oy, w, f, r, g, b, ctx);
        totalDist -= spacing;
    }
//    this.leftOverDistance = totalDist;
    ctx.restore();

    return totalDist;

};
DT.Pen.prototype.mousedown = function (e) {

    DT.addPressureToEvent(e);


    var off = $('#drawCanvas').offset();


    this.leftOverDistance = 0;
    var point = e.point;
    var p = {x: point.x, y: point.y};

    p.size = this.getSize(e);
    p.flow = this.getFlow(e);
    p.color = DT.State.currentFGColor.copy();
    var c = DT.State.currentFGColor.copy();
    c.a = this.opacity;
    p.softness = this.softness;
    p.spacing = this.spacing;

    this.color = c;
//    this.points.push(p);

    var stroke = this.stroke;
    stroke.color = c;
    stroke.spacing = this.spacing;
    stroke.softness = this.softness;
    stroke.points = [];
    stroke.points.push(p);
//    var p = {x: e.pageX - off.left, y: e.pageY - off.top, pressure: e.pressure};
//    var event = {type: "Tool", tool: "SimplePen", point: p, action: "Start", user: DT.State.currentUser.name};
//    DT.enqueueEvent(event);
//    var ctx = DT.State.ctxTemp;
//    var lw = ctx.lineWidth;
//    ctx.lineWidth = this.lineWidth * pressure;
//    ctx.beginPath();
//    ctx.moveTo(p.x, p.y);
//
//    ctx.lineTo(p.x, p.y);
//
//    ctx.stroke();
//    ctx.lineWidth = lw;
    var localContext = DT.getLocalContext();
    var ctx = localContext.ctxOffscreen;
    var canvas = localContext.canvasOffscreen;
    this.last = p;
    this.down = true;
//    this.updateDrawable(p, ctx);
    this.stamp(p.x, p.y, p.size, p.flow, c.r, c.g, c.b, ctx);

//    this.updateDrawable(p, ctx);
    var ctx2 = localContext.ctxTemp;
    var canvas2 = localContext.canvasTemp;
    ctx2.save();
    ctx2.globalAlpha = c.a;
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx2.drawImage(canvas, 0, 0);
    ctx2.restore();
//    DT.sendToolEvent(event);


};



DT.Pen.prototype.mouseup = function (e) {
    if (!this.down)
        return;
    DT.addPressureToEvent(e);
    this.down = false;
    var off = $('#drawCanvas').offset();
    var point = e.point;
    var p = {x: point.x, y: point.y};

    p.size = this.getSize(e);
    p.flow = this.getFlow(e);
    p.softness = this.softness;
//    ctx.beginPath();
//    ctx.moveTo(last.x, last.y);
//
//    ctx.lineTo(p.x, p.y);
//    
//    var lw = ctx.lineWidth;
//    ctx.lineWidth = this.lineWidth * pressure;
//    ctx.stroke();
//    ctx.lineWidth = lw;



    var localContext = DT.getLocalContext();
    var ctx = localContext.ctxOffscreen;
    var canvas = localContext.canvasOffscreen;

//    this.updateDrawable(p,this.last,this.color, ctx);
    this.leftOverDistance = this.updateDrawable(p, this.last, this.color, this.spacing, this.leftOverDistance, ctx);
    this.last = null;

    var ctx2 = localContext.ctx;
    var canvas2 = localContext.canvas;

//    ctx2.save();
//    ctx2.globalAlpha = this.color.a;
////      ctx2.globalCompositeOperation = 'none';
//    ctx2.drawImage(canvas, 0, 0);
//    ctx2.restore();



    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx = localContext.ctxTemp;
    canvas = localContext.canvasTemp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);


//    this.points.push(p);
    this.stroke.points.push(p);
    if (this.smooth) {

        this.stroke.points = DT.Pen.spline(this.stroke.points, this.smoothingFactor);
    }
    var event = {type: "Tool", tool: "SimplePen", stroke: this.stroke, action: "Stroke"};
//    this.playBack(this.stroke, localContext);
    DT.enqueueEvent(event);
    this.stroke = {};
    this.stroke.tool = "SimplePen";
    DT.sendToolEvent(event);
//    DT.enqueueEvent(event);
//    this.points = [];

};

DT.Pen.prototype.drawIndicator = function (e) {
    var localContext = DT.getLocalContext();
    var ctx = localContext.ctxTemp;
    var canvas = localContext.canvasTemp;
    ctx.beginPath();

    var p = e.point;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.arc(p.x, p.y, this.size / 2, 0, 2 * Math.PI);
    ctx.stroke();
};
DT.Pen.prototype.mousemove = function (e) {

    if (!this.down)
    {
        this.drawIndicator(e);
        return;
    }
    DT.addPressureToEvent(e);
    var off = $('#drawCanvas').offset();
    var point = e.point;
    var p = {x: point.x, y: point.y};

    p.size = this.getSize(e);
    p.flow = this.getFlow(e);
    p.softness = this.softness;
//     this.points.push(p);
    this.stroke.points.push(p);
//    var event = {type: "Tool", tool: "SimplePen", point: p, action: "Move", user: DT.State.currentUser.name};

//    var ctx = DT.State.ctxTemp;
//    ctx.beginPath();
//    var last = this.last;
//    ctx.moveTo(last.x, last.y);
//
//    ctx.lineTo(p.x, p.y);
//    var lw = ctx.lineWidth;
//    ctx.lineWidth = this.lineWidth * pressure;
//    ctx.stroke();
//    ctx.lineWidth = lw;
    var localContext = DT.getLocalContext();
    var ctx = localContext.ctxOffscreen;
    var canvas = localContext.canvasOffscreen;

//    this.updateDrawable(p, this.last, this.color, ctx);
    this.leftOverDistance = this.updateDrawable(p, this.last, this.color, this.spacing, this.leftOverDistance, ctx);
    var ctx2 = localContext.ctxTemp;
    var canvas2 = localContext.canvasTemp;

    ctx2.save();
    ctx2.globalAlpha = this.color.a;

    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx2.drawImage(canvas, 0, 0);
    ctx2.restore();

    this.last = p;



//    DT.sendToolEvent(event);
//    event.local = true;
//    DT.enqueueEvent(event);
};

DT.Pen.prototype.stamp = function (x, y, size, flow, r, g, b, ctx) {

    ctx.save();
    var d = Math.max(0.5, size / 2);
    ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + flow + ")";
    ctx.beginPath();


    ctx.arc(x, y, d, 0, 2 * Math.PI);

    ctx.fill();

    ctx.restore();
};

DT.Pen.prototype.playBack = function (stroke, playerContext) {
    playerContext = playerContext ? playerContext : DT.getDefaultContext();
    var ctx = playerContext.ctxTemp;
    var canvas = playerContext.canvasTemp;
    var po = stroke.points;
//        this.points.push(e.point);


    var col = stroke.color;
    var spacing = stroke.spacing;
    var leftover = 0;
    var last = po[0];

    this.stamp(last.x, last.y, last.size, last.flow, col.r, col.g, col.b, ctx);
    if (po.length < 2) {
//            this.points = [];
        return;
    }
    for (var i = 1; i < po.length; i++) {

        var p = po[i];
        leftover = this.updateDrawable(p, last, col, spacing, leftover, ctx);
        last = p;
    }


    var ctx2 = playerContext.ctx;

    ctx2.save();
    ctx2.globalAlpha = stroke.color.a;
//    console.log(stroke.color);
    ctx2.drawImage(canvas, 0, 0);
    ctx2.restore();



    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

DT.Pen.prototype.update = function (e, ctx) {

    if (e.action === "Start") {
        this.points.push(e.point);
        this.color = e.point.color;
        this.spacing = e.point.spacing;
    } else if (e.action === "Move") {
        this.points.push(e.point);

    } else if (e.action === "Stroke") {
        this.playBack(e.stroke);

    }
};

DT.keyup = function (e) {
    var tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea')
        return;
    var key = String.fromCharCode(e.which).toLowerCase();
    console.log(key);
    var handler = DT.State.shortcuts[key];
    if (handler) {
        handler.func(handler.data);
    }
};

DT.State.tools["SimplePen"] = DT.Pen;
DT.State.tools["ColorPicker"] = DT.ColorPicker;
DT.State.eventQueue = [];

DT.enqueueEvent = function (e) {
    DT.State.eventQueue.push(e);
};

DT.setColorChooser = function (name) {
    if (!DT.State.colorChoosers[name]) {
        return;
    }
    var chooser = DT.State.colorChoosers[name];
//    $('#colors').children('div').children().remove();

    DT.State.currentColorChooser = chooser;

};

DT.start = function () {
    DT.State.currentUser = DT.createUser("default");
    DT.registerColorChooser("RGBA", new DT.RGBChooser());
    DT.registerColorChooser("HSVA", new DT.HSVChooser());



    DT.setShortcut("p", DT.toolChooser, "SimplePen");
    DT.setShortcut("c", DT.toolChooser, "ColorPicker");



    var container = $('<div id="colors" />');
    var list = $('<ul>');
    for (var key in DT.State.colorChoosers) {
        var item = $('<li><a href="#color-' + key + '">' + key + '</a></li>');
        list.append(item);
        var div = $('<div id="color-' + key + '"></div>');
        container.append(div);
        DT.State.colorChoosers[key].initDialog(div);
        div.data('name', key);
    }
    var activateFunc = function (e, ui) {
        var name = $(ui.newPanel).data('name');
        DT.State.colorChoosers[name].activated();
        DT.State.currentColorChooser = DT.State.colorChoosers[name];
    };
    container.prepend(list);
    container.tabs({activate: activateFunc, active: 1});
    $('#colorPen').append(container);

    DT.setColorChooser("HSVA");
    DT.changeFGColor(DT.Color.fromRGBA(128, 128, 128, 1));

    DT.State.defaultToolbox = new DT.Toolbox();
    DT.State.defaultContext = DT.createDefaultPlayerContext();

    DT.checkForWebP();
    console.log("Supports webp: " + DT.State.WebPSupport);
    window.requestAnimationFrame(DT.mainLoop);

//    DT.State.currentToolbox = new DT.Toolbox();
};

DT.getDefaultToolbox = function () {
    return DT.State.defaultToolbox;
};

DT.addExecutable = function (ex) {
    DT.executables.push(ex);
};
DT.mainLoop = function (time) {


    var ctx = DT.State.ctx;


    var eq = DT.State.eventQueue;


    while (eq.length !== 0) {
        var e = eq.shift();
//        console.log(e);
        if (e.type === "Tool") {

            if (e.action === "Playback") {
                var lzw = e.lzwData;

                console.log("LZW data length: " + lzw.length);
                var decomp = LZW.decompress(lzw);
                console.log("DECOMP length: " + decomp.length);
//                console.log(decomp);
                DT.addExecutable(new DT.Player(JSON.parse(decomp)));
            } else {
//                var user = DT.getUser(e.user);
//                console.log("User: " + user);
//                if (!user) {
//                    continue;
//                }
                DT.addEventToLog(e);
                var toolbox = DT.getDefaultToolbox();
                console.log("Toolbox: " + toolbox);
                var tool = toolbox.tools[e.tool];
                if (!tool) {
                    continue;
                }
                tool.update(e);
            }
        } else if (e.type === "User") {
            if (e.action === "Join") {
                DT.userJoined(e.name);

            } else if (e.action === "AcceptedNickname") {
                DT.State.currentUser.name = e.name;
                DT.State.currentUser.activated = true;

            } else if (e.action === "NicknameAlreadyInUse") {
                DT.createNicknameDialog("Nickname already in use");

            } else if (e.action === "Leave") {
                DT.userLeave(e.name);

            }
        } else if (e.type === "Chat") {
            if (e.action === "Msg") {
                DT.chatMessageReceived(e);
            }
        } else if (e.type === "Server") {

            DT.serverMessageReceived(e);

        }
    }

    var execsNew = [];
    for (var i = 0; i < DT.executables.length; i++) {
        var exec = DT.executables[i];
        exec.run(time);
        if (!exec.isFinished()) {
            execsNew.push(exec);
        } else {
            exec.postRun();
        }

    }
    DT.executables = execsNew;

//    console.log("Update: "+time);
    window.requestAnimationFrame(DT.mainLoop);

};
DT.setShortcut = function (keystroke, func, data) {
    DT.State.shortcuts[keystroke] = {func: func, data: data};
};
DT.resetPositions = function () {
    $('#connectDialog').position({
        my: "left top",
        at: "right top",
        of: "#drawCanvas"
    });

    $('#colorbox').position({
        my: "top",
        at: "bottom",
        of: "#connectDialog",
        collision: "fit"
    });
    $('#toolbox').position({
        my: "top",
        at: "bottom",
        of: "#colorbox",
        collision: "fit"
    });
    $('#penPropertyContainer').position({
        my: "left",
        at: "right",
        of: "#toolbox",
        collision: "fit"
    });

    $('#saveImage').position({
        my: "left",
        at: "right",
        of: "#connectDialog",
        collision: "fit"
    });

};

function pluginLoaded() {
    DT.State.WacomPluginLoaded = true;
    console.log("Loaded plugin");

    DT.enableWacom(document.getElementById('wtPlugin'));
//     $('#pluginContainer').hide();
}
DT.State.currentTool = "";
DT.State.localLog = [];
DT.State.localContext = {};
DT.State.playerContext = {};

DT.makeLocalContext = function () {
    $('#drawCanvas').css({position: "absolute",
        left: "0px",
        top: "0px"});
    var canvas = $('#drawCanvas')[0];
    DT.State.localContext.canvas = canvas;
    DT.State.localContext.ctx = canvas.getContext("2d");


    DT.State.res = {w: canvas.width, h: canvas.height};
    DT.State.localContext.ctx.save();
    DT.State.localContext.ctx.fillStyle = "rgba(255,255,255,1)";
    DT.State.localContext.ctx.fillRect(0, 0, canvas.width, canvas.height);

    DT.State.localContext.ctx.restore();
    DT.State.localContext.ctx.lineCap = 'round';
    var canvasTemp = $('<canvas>');
    $('#drawCanvas').parent().append(canvasTemp);
    var z = $('#drawCanvas').css('z-index') + 1;
    canvasTemp.css('z-index', z);
    canvasTemp.css({position: "absolute",
        left: "0px",
        top: "0px",
        border: "solid"
    });
    DT.State.localContext.canvasTemp = canvasTemp[0];
    DT.State.localContext.canvasTemp.width = $('#drawCanvas').width();
    DT.State.localContext.canvasTemp.height = $('#drawCanvas').height();
    DT.State.localContext.ctxTemp = DT.State.localContext.canvasTemp.getContext("2d");
    DT.State.localContext.ctxTemp.lineCap = 'round';


    DT.State.localContext.canvasOffscreen = document.createElement('canvas');
    DT.State.localContext.canvasOffscreen.width = $('#drawCanvas').width();
    DT.State.localContext.canvasOffscreen.height = $('#drawCanvas').height();
    DT.State.localContext.ctxOffscreen = DT.State.localContext.canvasOffscreen.getContext("2d");
    $('#drawCanvas').on('mousemove touchmove', DT.mousemove);
    $('#drawCanvas').on('mousedown touchstart', DT.mousedown);
    $('#drawCanvas').on('mouseup touchend', DT.mouseup);

    canvasTemp.on('mousemove touchmove', DT.mousemove);
    canvasTemp.on('mousedown touchstart', DT.mousedown);
    canvasTemp.on('mouseup touchend', DT.mouseup);

};

DT.getLocalContext = function () {
    return DT.State.localContext;
};

DT.getDefaultContext = function () {
    return DT.State.defaultContext;
};
DT.createDefaultPlayerContext = function () {
    return DT.createPlayerContext(DT.getLocalContext().canvas);
};
DT.createPlayerContext = function (output) {

    var context = {};


    context.canvasTemp = document.createElement('canvas');
    context.canvasTemp.width = $('#drawCanvas').width();
    context.canvasTemp.height = $('#drawCanvas').height();
    context.ctxTemp = context.canvasTemp.getContext("2d");

    context.canvasTemp.lineCap = 'round';


    if (!output) {
        output = document.createElement('canvas');
        output.width = $('#drawCanvas').width();
        output.height = $('#drawCanvas').height();
        context.canvas = output;
        context.ctx = output.getContext("2d");
        context.ctx.save();
        context.ctx.fillStyle = "rgba" + DT.Color.fromRGBA(255, 255, 255, 1);
        context.ctx.fillRect(0, 0, output.width, output.height);


        context.ctx.restore();

    } else {
        context.canvas = output;
        context.ctx = output.getContext("2d");
    }



    return context;
};

DT.saveLocalLog = function () {








    // +1 for initial clear frame
    var logLength = DT.State.localLog.length + 1;
    function startVideoDialog(type) {
        var container = $('<div></div');
        var def = 100;
        var res = DT.State.res;
        var input = $('<input id="inputStrokeDur" value ="' + def + '"/>');
        var inputtime = $('<input id="inputTime" value ="' + (def * logLength / 1000).toFixed(2) + '"/>');
        var inputwidth = $('<input id="inputWidth" value ="' + res.w + '"/>');
        var inputheight = $('<input id="inputHeight" value ="' + res.h + '"/>');
        var inputMaxFrames = $('<input id="inputMaxFrames" value ="1500"/>');
        input.keyup(function () {
            var val = parseInt($('#inputStrokeDur').val());
            if (isNaN(val) || val < 1) {
//                inputtime.val("Duration has to be a positive integer");
                input.css('color', 'red');
                inputtime.css('color', 'red');
            } else {
                inputtime.val((val * logLength / 1000).toFixed(2));
                input.css('color', 'black');
                inputtime.css('color', 'black');

            }
        });

        inputwidth.keyup(function () {
            var val = parseInt($('#inputWidth').val());
            if (isNaN(val) || val < 1) {
//                inputwidth.val("Width has to be a positive integer");
                inputwidth.css('color', 'red');
            } else {
                inputwidth.css('color', 'black');
            }
        });
        inputheight.keyup(function () {
            var val = parseInt($('#inputHeight').val());
            if (isNaN(val) || val < 1) {
//                inputheight.val("Height has to be a positive integer");
                inputheight.css('color', 'red');
            } else {
                inputheight.css('color', 'black');
            }
        });
        inputMaxFrames.keyup(function () {
            var val = parseInt($('#inputMaxFrames').val());
            if (!val || isNaN(val)) {
//                inputheight.val("Maximum frames must be a number");
                inputMaxFrames.css('color', 'red');
            } else {
                inputMaxFrames.css('color', 'black');
                if (val > 0)
                    $('#videoNumber').text('Number of videos: ' + Math.ceil(logLength / val));
                else {
                    $('#videoNumber').text('Number of videos: ' + 0);

                }

            }
        });
        inputtime.keyup(function () {
            var val = parseFloat(inputtime.val());

            if (isNaN(val) || val <= 0) {
//                input.val("Time has to be positive");
                input.css('color', 'red');
                inputtime.css('color', 'red');
            } else {
                input.val(Math.round(val / logLength * 1000));
                input.css('color', 'black');
                inputtime.css('color', 'black');
            }
        });
        container.append('<p>Stroke duration in ms:</p>');
        container.append(input);
        container.append('<p>Video time in s:</p>');
        container.append(inputtime);
        container.append('<p>Video width:</p>');
        container.append(inputwidth);
        container.append('<p>Video height:</p>');
        container.append(inputheight);
        container.append('<p>Maximum frames per video number (-1 for no limit):</p>');
        container.append(inputMaxFrames);
        container.append('<p id="videoNumber">Number of videos: 1 </p>');

        container.dialog({resizable: false,
            height: "auto",
            modal: true,
            closeOnEscape: false,
            close: function (e, ui) {
                $(this).remove();
            },
            buttons: {
                "Render video": function () {
                    var val = parseInt($('#inputStrokeDur').val());
                    var w = parseInt($('#inputWidth').val());
                    var h = parseInt($('#inputHeight').val());
                    var maxFrams = parseInt($('#inputMaxFrames').val());
//                console.log("Duration: " + val);

                    var message = $('<div></div>');
                    var error = false;
                    if (isNaN(val) || val < 1) {
                        message.append($('<p>Duration has to be a positive integer</p>'));
                        error = true;
                    }
                    if (isNaN(w) || w < 1) {
                        message.append($('<p>Width has to be a positive integer</p>'));
                        error = true;
                    }
                    if (isNaN(h) || h < 1) {
                        message.append($('<p>Height has to be a positive integer</p>'));
                        error = true;
                    }
                    if (isNaN(maxFrams)) {
                        message.append($('<p>Maximum frames per file need to be an integer</p>'));
                        error = true;

                    }
                    $(this).dialog("close").remove();

                    if (error) {
                        message.dialog({modal: true,
                            buttons: {
                                Ok: function () {
                                    $(this).dialog("close");
                                }
                            }});

                        return;
                    }
                    var player = new DT.VideoExportPlayer(DT.State.localLog.concat(), val, {res: {w: w, h: h}, maxFrames: maxFrams, type: type});

//                    var player = new DT.VideoExportPlayer(DT.State.localLog.concat(), val, 1000);

                    DT.addExecutable(player);


                },
                Cancel: function () {
                    $(this).dialog("close").remove();
                }
            }
        });

    }

//    function startAviDialog() {
//        var container = $('<div></div');
//        var def = 100;
//        var res = DT.State.res;
//        var input = $('<input id="inputStrokeDur" value ="' + def + '"/>');
//        var inputtime = $('<input id="inputTime" value ="' + (def * DT.State.localLog.length / 1000).toFixed(2) + '"/>');
//        var inputwidth = $('<input id="inputWidth" value ="' + res.w + '"/>');
//        var inputheight = $('<input id="inputHeight" value ="' + res.h + '"/>');
//        var inputMaxFrames = $('<input id="inputMaxFrames" value ="-1"/>');
//        input.keyup(function () {
//            var val = parseInt($('#inputStrokeDur').val());
//            if (isNaN(val) || val < 1) {
//                inputtime.val("Duration has to be a positive integer");
//            } else {
//                inputtime.val((val * DT.State.localLog.length / 1000).toFixed(2));
//            }
//        });
//
//        inputwidth.keyup(function () {
//            var val = parseInt($('#inputWidth').val());
//            if (isNaN(val) || val < 1) {
//                inputwidth.val("Width has to be a positive integer");
//            }
//        });
//        inputheight.keyup(function () {
//            var val = parseInt($('#inputHeight').val());
//            if (isNaN(val) || val < 1) {
//                inputheight.val("Height has to be a positive integer");
//            }
//        });
//        inputMaxFrames.keyup(function () {
//            var val = parseInt($('#inputMaxFrames').val());
//            if (isNaN(val)) {
//                inputheight.val("Maximum frames must be a number");
//            }
//        });
//        inputtime.keyup(function () {
//            var val = parseFloat(inputtime.val());
//
//            if (isNaN(val) || val <= 0) {
//                input.val("Time has to be positive");
//            } else {
//                input.val(Math.round(val / DT.State.localLog.length * 1000));
//            }
//        });
//        container.append('<p>AVI files will be split in multiple parts. Your browser might experience freezing, but it should work!</p>');
//        container.append('<p>Stroke duration in ms:</p>');
//        container.append(input);
//        container.append('<p>Video time in s:</p>');
//        container.append(inputtime);
//        container.append('<p>Video width:</p>');
//        container.append(inputwidth);
//        container.append('<p>Video height:</p>');
//        container.append(inputheight);
//        container.append('<p>Maximum frames per video number (-1 for no limit):</p>');
//        container.append(inputMaxFrames);
//        container.dialog({resizable: false,
//            height: "auto",
//            modal: true,
//            closeOnEscape: false,
//            close: function (e, ui) {
//                $(this).remove();
//            },
//            buttons: {
//                "Render video": function () {
//                    var val = parseInt($('#inputStrokeDur').val());
//                    var w = parseInt($('#inputWidth').val());
//                    var h = parseInt($('#inputHeight').val());
//                    var maxFrams = parseInt($('#inputMaxFrames').val());
////                console.log("Duration: " + val);
//
//                    var message = $('<div></div>');
//                    var error = false;
//                    if (isNaN(val) || val < 1) {
//                        message.append($('<p>Duration has to be a positive integer</p>'));
//                        error = true;
//                    }
//                    if (isNaN(w) || w < 1) {
//                        message.append($('<p>Width has to be a positive integer</p>'));
//                        error = true;
//                    }
//                    if (isNaN(h) || h < 1) {
//                        message.append($('<p>Height has to be a positive integer</p>'));
//                        error = true;
//                    }
//                    if (isNaN(maxFrams)) {
//                        message.append($('<p>Maximum frames per file need to be an integer</p>'));
//                        error = true;
//
//                    }
//                    $(this).dialog("close").remove();
//
//                    if (error) {
//                        message.dialog({modal: true,
//                            buttons: {
//                                Ok: function () {
//                                    $(this).dialog("close");
//                                }
//                            }});
//
//                        return;
//                    }
//                    var player = new DT.VideoExportPlayer(DT.State.localLog.concat(), val, {res: {w: w, h: h}, maxFrames: maxFrams, type: "MJPG"});
//
//                    DT.addExecutable(player);
//
//
//                },
//                Cancel: function () {
//                    $(this).dialog("close").remove();
//                }
//            }
//        });
//
//    }
    var types = {};
    if (DT.State.WebPSupport) {

        types["WEBM"] = true;
    }
    types["AVI"] = true;


    var chooseFileType = $('<div />');
    chooseFileType.append('<p>Available Types: <p>');

    var select = $('<select id="fileTypeChooser"></select>');

    for (var i in types) {
        select.append('<option>' + i + '</option>');
    }
    chooseFileType.append(select);


    chooseFileType.dialog({resizable: false,
        height: "auto",
        modal: true,
        closeOnEscape: false,
        close: function (e, ui) {
            $(this).remove();
        },
        buttons: {
            "Configure video": function () {
                var fileType = $('#fileTypeChooser').find(":selected").text();
                $(this).dialog("close").remove();
                if (types[fileType]) {
                    console.log("Start " + fileType);
                    startVideoDialog(fileType);
                }

            }
        }
    }
    );

};


DT.checkForWebP = function () {

    var localContext = DT.getLocalContext();
    var canvas = localContext.canvas;
    var url = canvas.toDataURL('image/webp', 1);
    DT.State.WebPSupport = (/^data:image\/webp;base64,/ig).test(url);
};
DT.clear = function () {
    var localContext = DT.getLocalContext();
    var ctx = localContext.ctx;
    var canvas = localContext.canvas;
    ctx.save();
    ctx.fillStyle = "rgba" + DT.Color.fromRGBA(255, 255, 255, 1);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();

    DT.State.localLog = [];

};
$(document).ready(function () {


    DT.State.currentToolbox = new DT.Toolbox();
    DT.changeTool("SimplePen");
//    $('#drawCanvas').parent().css("position", "relative");






    $(document).keyup(DT.keyup);

    $('#loadWacomButton').click(function () {
        if (DT.State.WacomPluginLoaded) {

            DT.State.wacomPlugin = document.getElementById('wtPlugin');
            console.log("ActivwatedPlugin");
            console.log(DT.State.wacomPlugin);
        }
    });



    DT.makeLocalContext();



    var t = DT.getCurrentTool();
    t.sizePressure($('#pressureSizeInput').prop('checked'));
    t.flowPressure($('#pressureFlowInput').prop('checked'));


//    $('#open')
//    DT.createColorDialog();
    $('#penPropertyContainer').css({width: "250px", height: "auto"}).addClass("ui-widget-content ui-corner-all");


    $('#connectDialog').addClass('ui-widget-content ui-corner-all').css({width: "250px"}).draggable();
    $('#connectDialog').children().css("margin", "10px");
    $('#connectDialog input[type="submit"]').button();

//    $('#loadWacomBox').addClass('ui-widget-content ui-corner-all').css({width: "250px"}).draggable();
//    $('#loadWacomBox').children().css("margin", "10px");
//    $('#loadWacomButton').button();

    $('#pluginContainer').css("position", "absolute");
//    $('#pluginContainer').css("top", ($('#drawCanvas').offset().top + canvas.height + 10) + "px");


    $('#saveImage').addClass('ui-widget-content ui-corner-all').css({width: "250px", padding: "10px"});
    $('#saveImageButton').button();

    $('#saveImageButton').click(DT.createResultBox);

    $('#saveVideo').addClass('ui-widget-content ui-corner-all').css({width: "250px", padding: "10px"});
    $('#saveVideoButton').button();

    $('#saveVideoButton').click(function () {
        DT.addExecutable(new DT.Executable(DT.saveLocalLog));
    });
//    $('#pluginContainer').hide();

//    $('#toolbox').addClass('ui-widget-content ui-corner-all').css({width: "200px", padding: "10px"}).draggable();
    DT.generateToolMenu();
    DT.setupChatWindow();
    var style = $('<style> .no-close .ui-dialog-titlebar-close {display: none;}</style>');
    $('#colorPen').dialog({title: "Tool menu", resizable: false, dialogClass: "no-close", closeOnEscape: false, width: "auto", height: "auto"}).append(style);
//     $("#selectable").selectable();
// $('#selectable').selectable();

//    $('#loadWacomBox').position({
//        my: "left top",
//        at: "right top",
//        of: "#drawCanvas"
//    });

//    DT.resetPositions();



//    DT.createHSVColorBox();
    DT.start();
});