"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var thing_names = [
    "chair",
    "lamp",
    "mushroom",
    "outhouse",
    "pillar",
    "pond",
    "rock",
    "statue",
    "tree",
    "turtle",
];
var Thing = /** @class */ (function () {
    function Thing(x, y, image_url, update_method, onclick_method) {
        this.x = x;
        this.y = y;
        this.image = new Image();
        this.image.src = image_url;
        this.update = update_method;
        this.onclick = onclick_method;
    }
    Thing.prototype.ignore_click = function (x, y) { };
    Thing.prototype.sit_still = function () { };
    return Thing;
}());
var Sprite = /** @class */ (function () {
    function Sprite(x, y, image_url, update_method, onclick_method) {
        this.x = x;
        this.y = y;
        this.dest_x = x;
        this.dest_y = y;
        this.speed = 4;
        this.image = new Image();
        this.image.src = image_url;
        this.update = update_method;
        this.onclick = onclick_method;
        this.label = '';
    }
    Sprite.prototype.set_label = function (name) {
        this.label = name;
    };
    Sprite.prototype.set_destination = function (x, y) {
        this.dest_x = x;
        this.dest_y = y;
    };
    Sprite.prototype.ignore_click = function (x, y) { };
    Sprite.prototype.move = function (dx, dy) {
        this.dest_x = this.x + dx;
        this.dest_y = this.y + dy;
    };
    Sprite.prototype.go_toward_destination = function () {
        if (this.dest_x === undefined)
            return;
        if (this.dest_y === undefined)
            return;
        var dist_remaining = Math.sqrt((this.dest_x - this.x) * (this.dest_x - this.x) + (this.dest_y - this.y) * (this.dest_y - this.y));
        var step_size = Math.min(2.5, dist_remaining);
        var angle = Math.atan2(this.dest_y - this.y, this.dest_x - this.x);
        this.x += step_size * Math.cos(angle);
        this.y += step_size * Math.sin(angle);
        // old way
        // if(this.x < this.dest_x)
        // 	this.x += Math.min(this.dest_x - this.x, this.speed);
        // else if(this.x > this.dest_x)
        // 	this.x -= Math.min(this.x - this.dest_x, this.speed);
        // if(this.y < this.dest_y)
        // 	this.y += Math.min(this.dest_y - this.y, this.speed);
        // else if(this.y > this.dest_y)
        // 	this.y -= Math.min(this.y - this.dest_y, this.speed);
    };
    Sprite.prototype.sit_still = function () { };
    return Sprite;
}());
// map IDs to sprites
var sprite_map = {};
var random_id = function (len) {
    var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return __spreadArray([], Array(len), true).reduce(function (a) { return a + p[Math.floor(Math.random() * p.length)]; }, '');
};
var g_origin = new URL(window.location.href).origin;
var g_id = random_id(12);
var g_name = '';
var g_scroll_x = 0;
var g_scroll_y = 0;
var g_gold = 0;
var g_bananas = 0;
var Model = /** @class */ (function () {
    function Model() {
        this.sprites = [];
        this.things = [];
        this.sprites = [];
        //this.sprites.push(new Sprite(200, 100, "lettuce.png", Sprite.prototype.sit_still, Sprite.prototype.ignore_click));
        this.character = new Sprite(350, 50, "blue_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination);
        this.sprites.push(this.character);
        sprite_map[g_id] = this.character;
        this.things = [];
    }
    Model.prototype.update = function () {
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            sprite.update();
        }
    };
    Model.prototype.onclick = function (x, y) {
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            sprite.onclick(x, y);
        }
    };
    Model.prototype.move = function (dx, dy) {
        this.character.move(dx, dy);
    };
    return Model;
}());
var View = /** @class */ (function () {
    function View(model) {
        this.model = model;
        this.canvas = document.getElementById("myCanvas");
        this.character = new Image();
        this.character.src = "blue_robot.png";
    }
    View.prototype.update = function () {
        var ctx = this.canvas.getContext("2d");
        ctx.font = "20px Verdana";
        ctx.clearRect(0, 0, 1000, 500);
        // auto scroll
        // const center_x = 500;
        // const center_y = 270;
        // const scroll_rate = 0.03;
        // g_scroll_x += scroll_rate * (this.model.character.x - g_scroll_x - center_x);
        // g_scroll_y += scroll_rate * (this.model.character.y - g_scroll_y - center_y);
        // console.log(g_scroll_x)
        // console.log(g_scroll_y)
        for (var _i = 0, _a = this.model.things; _i < _a.length; _i++) {
            var thing = _a[_i];
            ctx.drawImage(thing.image, (thing.x - thing.image.width / 2) - g_scroll_x, (thing.y - thing.image.height) - g_scroll_y);
        }
        for (var _b = 0, _c = this.model.sprites; _b < _c.length; _b++) {
            var sprite = _c[_b];
            ctx.drawImage(sprite.image, sprite.x - sprite.image.width / 2, sprite.y - sprite.image.height);
            ctx.fillText(sprite.label, sprite.x - sprite.image.width / 2, sprite.y - sprite.image.height - 10);
        }
    };
    View.prototype.insert_canvas = function () {
        var s = [];
        s.push("<canvas id=\"myCanvas\" width=\"1000\" height=\"500\" style=\"border:1px solid #cccccc;\">");
        s.push("</canvas>");
        var content = document.getElementById('content');
        content.innerHTML = s.join('');
        console.log('content with canvas', content);
    };
    View.prototype.save_character_name = function () {
        var character_name = document.getElementById('character_name');
        g_name = character_name.value; // casted to make work with TS per SO.com
    };
    View.prototype.remove_input = function () {
        var character_name = document.getElementById('character_name');
        var start_button = document.getElementById('start_button');
        character_name.remove();
        start_button.remove();
    };
    View.prototype.insert_scoreboard = function () {
        var content = document.getElementById('content');
        var scoreboard = "<br><big><big><b>Gold: <span id='gold'>0</span>, Bananas: <span id='bananas'>0</span></b></big></big><br>";
        content.innerHTML = content.innerHTML + scoreboard;
    };
    View.prototype.insert_chat = function () {
        var content = document.getElementById('content');
        var inputs = "<br><select id='chatWindow' size='8' style='width:1000px'></select><br><input type='input' id='chatMessage'></input><button onclick='game.controller.send_chat()'>Post</button>";
        content.innerHTML = content.innerHTML + inputs;
    };
    return View;
}());
var httpPost = function (page_name, payload, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200) {
                var response_obj = void 0;
                try {
                    response_obj = JSON.parse(request.responseText);
                }
                catch (err) { }
                if (response_obj) {
                    callback(response_obj);
                }
                else {
                    callback({
                        status: 'error',
                        message: 'response is not valid JSON',
                        response: request.responseText,
                    });
                }
            }
            else {
                if (request.status === 0 && request.statusText.length === 0) {
                    callback({
                        status: 'error',
                        message: 'connection failed',
                    });
                }
                else {
                    callback({
                        status: 'error',
                        message: "server returned status ".concat(request.status, ": ").concat(request.statusText),
                    });
                }
            }
        }
    };
    request.open('post', "".concat(g_origin, "/").concat(page_name), true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(payload));
};
var Controller = /** @class */ (function () {
    function Controller(model, view) {
        this.key_right = false;
        this.key_left = false;
        this.key_up = false;
        this.key_down = false;
        this.model = model;
        this.view = view;
        this.key_right = false;
        this.key_left = false;
        this.key_up = false;
        this.key_down = false;
        this.last_updates_request_time = Date.now();
        var self = this;
        view.canvas.addEventListener("click", function (event) { self.onClick(event); });
        document.addEventListener('keydown', function (event) { self.keyDown(event); }, false);
        document.addEventListener('keyup', function (event) { self.keyUp(event); }, false);
    }
    // sends MOVE to server
    Controller.prototype.onClick = function (event) {
        var x = event.pageX - this.view.canvas.offsetLeft;
        var y = event.pageY - this.view.canvas.offsetTop;
        this.model.onclick(x, y);
        // for Gashler backend
        httpPost('ajax.html', {
            id: g_id,
            name: g_name,
            action: 'move',
            x: x,
            y: y,
        }, this.onAcknowledgeClick);
    };
    Controller.prototype.keyDown = function (event) {
        if (event.keyCode == 39)
            this.key_right = true;
        else if (event.keyCode == 37)
            this.key_left = true;
        else if (event.keyCode == 38)
            this.key_up = true;
        else if (event.keyCode == 40)
            this.key_down = true;
    };
    Controller.prototype.keyUp = function (event) {
        if (event.keyCode == 39)
            this.key_right = false;
        else if (event.keyCode == 37)
            this.key_left = false;
        else if (event.keyCode == 38)
            this.key_up = false;
        else if (event.keyCode == 40)
            this.key_down = false;
    };
    Controller.prototype.on_receive_updates = function (ob) {
        console.log("ob = ".concat(JSON.stringify(ob)));
        if (ob.status === 'error') {
            console.log("!!! Server replied: ".concat(ob.message));
            return;
        }
        if (ob.gold && ob.bananas) {
            console.log('made it inside gold and bananas null check');
            g_gold = ob.gold;
            g_bananas = ob.bananas;
            var gold = document.getElementById('gold');
            var bananas = document.getElementById('bananas');
            gold.innerHTML = "<span id='gold'>${gold}</span>";
            bananas.innerHTML = "<span id='bananas'>${bananas}</span>";
        }
        for (var i = 0; i < ob.updates.length; i++) {
            var update = ob.updates[i];
            // gashler backend code
            var id = update.id;
            var name_1 = update.name;
            var x = update.x - g_scroll_x;
            var y = update.y - g_scroll_y;
            // my code
            // let id = update[0];
            // let name = update[1];
            // let x = update[2];
            // let y = update[3];
            var sprite = sprite_map[id];
            if (sprite === undefined) {
                var s = new Sprite(x, y, "green_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.ignore_click);
                s.set_label(name_1);
                s.set_destination(x, y);
                this.model.sprites.push(s);
                sprite_map[id] = s;
            }
            else {
                sprite.set_label(name_1);
                sprite.set_destination(x, y);
            }
        }
        // ob.chats // strings to add to chat window
        var select_element = document.getElementById('chatWindow');
        for (var i = 0; i < ob.chats.length; i++) {
            var chat_message = ob.chats[i];
            var opt = document.createElement('option');
            opt.value = chat_message;
            opt.innerHTML = chat_message;
            select_element.appendChild(opt);
            opt.scrollIntoView();
        }
    };
    // on_receive_map(ob:any) {
    // 	console.log(`ob = ${JSON.stringify(ob)}`)
    // 	if (ob.status === 'error') {
    // 		console.log(`!!! Server replied: ${ob.message}`);
    // 		return;
    // 	}
    // 	for (let i = 0; i < ob.map.things.length; i++) {
    // 		let thing = ob.map.things[i];
    // 		console.log("thing", thing)
    // 		let image_path = convert_thing_index_to_image(thing.kind)
    // 		let t = new Thing(thing.x, thing.y, image_path, Thing.prototype.sit_still, Thing.prototype.ignore_click);
    // 		this.model.things.push(t);
    // 		// ctx!.fillText(sprite.label, sprite.x - sprite.image.width / 2, sprite.y - sprite.image.height - 10);
    // 	}
    // }
    Controller.prototype.request_updates = function () {
        var _this = this;
        var payload = {
            'id': g_id,
            'action': 'update',
        };
        httpPost('ajax.html', payload, function (ob) { return _this.on_receive_updates(ob); });
    };
    // request_map() {
    // 	let payload = {
    // 		'action': 'get_map',
    // 	}
    // 	httpPost('ajax.html', payload, (ob) => {return this.on_receive_map(ob)} );
    // }
    Controller.prototype.send_chat = function () {
        var _this = this;
        var element = document.getElementById('chatMessage');
        var message = element === null || element === void 0 ? void 0 : element.value;
        var payload = {
            'id': g_id,
            'action': 'chat',
            'text': message
        };
        httpPost('ajax.html', payload, function (ob) { return _this.on_receive_updates(ob); });
    };
    Controller.prototype.update = function () {
        var dx = 0;
        var dy = 0;
        var speed = this.model.character.speed;
        if (this.key_right)
            dx += speed;
        if (this.key_left)
            dx -= speed;
        if (this.key_up)
            dy -= speed;
        if (this.key_down)
            dy += speed;
        if (dx != 0 || dy != 0)
            this.model.move(dx, dy);
        var time = Date.now();
        var diff = time - this.last_updates_request_time;
        if (diff >= 1000) {
            this.last_updates_request_time = time;
            this.request_updates();
        }
    };
    Controller.prototype.onAcknowledgeClick = function (ob) {
        console.log("Response to move: ".concat(JSON.stringify(ob)));
        if (ob.status === 'error') {
            console.log("!!! Server replied: ".concat(ob.message));
            return;
        }
    };
    return Controller;
}());
var Game = /** @class */ (function () {
    function Game(things) {
        this.model = new Model();
        this.model.things = things;
        this.view = new View(this.model);
        this.controller = new Controller(this.model, this.view);
    }
    Game.prototype.onTimer = function () {
        this.controller.update();
        this.model.update();
        this.view.update();
    };
    return Game;
}());
// Project 5 game intro stuff
// const insert_canvas = () => {
// 	let s: string[] = [];
// 	s.push(`<canvas id="myCanvas" width="1000" height="500" style="border:1px solid #cccccc;">`);
// 	s.push(`</canvas>`);
// 	const content = document.getElementById('content');
// 	content!.innerHTML = s.join('');
// }
// const save_character_name = () => {
// 	const character_name = document.getElementById('character_name');
// 	g_name = (<HTMLInputElement>character_name).value; // casted to make work with TS per SO.com
// }
// const remove_input = () => {
// 	const character_name = document.getElementById('character_name');
// 	const start_button = document.getElementById('start_button');
// 	character_name!.remove();
// 	start_button!.remove();
// }
// let start = () => {
// 	save_character_name();
// 	remove_input();
// 	insert_canvas();
// 	insert_scoreboard()
// 	insert_chat()
// }
// const insert_scoreboard = () => {
// 	let content = document.getElementById('content') as HTMLInputElement | null;
// 	let scoreboard = "<br><big><big><b>Gold: <span id='gold'>0</span>, Bananas: <span id='bananas'>0</span></b></big></big><br>"
// 	content!.innerHTML = content!.innerHTML + scoreboard;
// }
// const insert_input = () => {
// 	let content = document.getElementById('content') as HTMLInputElement | null;
// 	let inputs = "<input type='text' id='character_name'></input><button id='start_button' style='margin-top: 10px' onclick='start();'>Start</button>"
// 	content!.innerHTML = content!.innerHTML + inputs;
// }
// const insert_story = () => {
// 	let content = document.getElementById('content') as HTMLInputElement | null;
// 	content!.innerHTML = "<h2>Banana Quest: The Potassium Crisis</h2>"
// 		+ "<p>In a land known as \"Fruitopia,\" the inhabitants thrived on the delicious and nutritious fruits that grew abundantly. One fruit, in particular, was highly treasured - the mighty banana. Fruitopia's inhabitants had always enjoyed the health benefits and energy provided by this potassium-rich treat, which fueled their daily adventures and brought joy to their lives.</p>"
// 		+ "<p>But one day, a mysterious phenomenon occurred: the banana crops across Fruitopia began to wither, and the supply of this essential fruit dwindled rapidly.As the days passed, the once energetic and lively inhabitants of Fruitopia started to feel weak and fatigued. The doctors and scientists of the land quickly identified the cause - a severe potassium deficiency was spreading among the residents, and it threatened to plunge Fruitopia into a state of perpetual lethargy.Desperate to restore the health and vitality of their beloved land, the citizens of Fruitopia are turning to you to help them find 20 bananas.The fate of Fruitopia hangs in the balance.</p>"
// 		+ "<p>tl;dr: Find 20 bananas to win.</p>" 
// 		+ "<p>If you are willing to undertake this noble quest, please enter your name:</p>" 
// 	content!.style.wordWrap = 'break-word';
// 	content!.style.width = '600px';
// }
var convert_thing_index_to_image = function (index) {
    return "".concat(thing_names[index], ".png");
};
var insert_canvas = function () {
    var s = [];
    s.push("<canvas id=\"myCanvas\" width=\"1000\" height=\"500\" style=\"border:1px solid #cccccc;\">");
    s.push("</canvas>");
    var content = document.getElementById('content');
    content.innerHTML = s.join('');
};
var save_character_name = function () {
    var character_name = document.getElementById('character_name');
    g_name = character_name.value; // casted to make work with TS per SO.com
};
var remove_input = function () {
    var character_name = document.getElementById('character_name');
    var start_button = document.getElementById('start_button');
    character_name.remove();
    start_button.remove();
};
var insert_scoreboard = function () {
    var content = document.getElementById('content');
    var scoreboard = "<br><big><big><b>Gold: <span id='gold'>0</span>, Bananas: <span id='bananas'>0</span></b></big></big><br>";
    content.innerHTML = content.innerHTML + scoreboard;
};
var insert_input = function () {
    var content = document.getElementById('content');
    var inputs = "<input type='text' id='character_name'></input><button id='start_button' style='margin-top: 10px' onclick='start();'>Start</button>";
    content.innerHTML = content.innerHTML + inputs;
};
var insert_story = function () {
    console.log('insert story');
    var content = document.getElementById('content');
    content.innerHTML = "<h2>Banana Quest: The Potassium Crisis</h2>"
        + "<p>In a land known as \"Fruitopia,\" the inhabitants thrived on the delicious and nutritious fruits that grew abundantly. One fruit, in particular, was highly treasured - the mighty banana. Fruitopia's inhabitants had always enjoyed the health benefits and energy provided by this potassium-rich treat, which fueled their daily adventures and brought joy to their lives.</p>"
        + "<p>But one day, a mysterious phenomenon occurred: the banana crops across Fruitopia began to wither, and the supply of this essential fruit dwindled rapidly.As the days passed, the once energetic and lively inhabitants of Fruitopia started to feel weak and fatigued. The doctors and scientists of the land quickly identified the cause - a severe potassium deficiency was spreading among the residents, and it threatened to plunge Fruitopia into a state of perpetual lethargy.Desperate to restore the health and vitality of their beloved land, the citizens of Fruitopia are turning to you to help them find 20 bananas.The fate of Fruitopia hangs in the balance.</p>"
        + "<p>tl;dr: Find 20 bananas to win.</p>"
        + "<p>If you are willing to undertake this noble quest, please enter your name:</p>";
    content.style.wordWrap = 'break-word';
    content.style.width = '600px';
};
var insert_chat = function () {
    var content = document.getElementById('content');
    var inputs = "<br><select id='chatWindow' size='8' style='width:1000px'></select><br><input type='input' id='chatMessage'></input><button onclick='send_chat()'>Post</button>";
    content.innerHTML = content.innerHTML + inputs;
};
var things = [];
var on_receive_map = function (ob) {
    console.log("ob = ".concat(JSON.stringify(ob)));
    if (ob.status === 'error') {
        console.log("!!! Server replied: ".concat(ob.message));
        return;
    }
    for (var i = 0; i < ob.map.things.length; i++) {
        var thing = ob.map.things[i];
        var image_path = convert_thing_index_to_image(thing.kind);
        var t = new Thing(thing.x, thing.y, image_path, Thing.prototype.sit_still, Thing.prototype.ignore_click);
        things.push(t);
    }
};
// controller, should be in
var send_chat = function () {
    var element = document.getElementById('chatMessage');
    var message = element === null || element === void 0 ? void 0 : element.value;
    var payload = {
        'id': g_id,
        'action': 'chat',
        'text': message
    };
    httpPost('ajax.html', payload, function (ob) { return Controller.prototype.on_receive_updates(ob); });
};
var start = function () {
    save_character_name();
    remove_input();
    insert_canvas();
    insert_scoreboard();
    insert_chat();
    var game = new Game(things);
    var timer = setInterval(function () { game.onTimer(); }, 40);
};
// populate HTML
insert_story();
insert_input();
httpPost('ajax.html', {
    action: 'get_map',
}, on_receive_map);
