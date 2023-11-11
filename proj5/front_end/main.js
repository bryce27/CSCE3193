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
var Model = /** @class */ (function () {
    function Model() {
        this.sprites = [];
        this.sprites = [];
        this.sprites.push(new Sprite(200, 100, "lettuce.png", Sprite.prototype.sit_still, Sprite.prototype.ignore_click));
        this.character = new Sprite(50, 50, "blue_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination);
        this.sprites.push(this.character);
        sprite_map[g_id] = this.character;
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
        for (var _i = 0, _a = this.model.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            ctx.drawImage(sprite.image, sprite.x - sprite.image.width / 2, sprite.y - sprite.image.height);
            // find player connected to this sprite
            ctx.fillText(sprite.label, sprite.x - sprite.image.width / 2, sprite.y - sprite.image.height - 10);
        }
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
    Controller.prototype.onClick = function (event) {
        var x = event.pageX - this.view.canvas.offsetLeft;
        var y = event.pageY - this.view.canvas.offsetTop;
        this.model.onclick(x, y);
        httpPost('ajax', {
            id: g_id,
            name: g_name,
            action: 'click',
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
        // console.log(`ob = ${JSON.stringify(ob)}`)
        for (var i = 0; i < ob.updates.length; i++) {
            var update = ob.updates[i];
            var id = update[0];
            var name_1 = update[1];
            var x = update[2];
            var y = update[3];
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
    };
    Controller.prototype.request_updates = function () {
        var _this = this;
        var payload = {
            'id': g_id,
            'action': 'update',
        };
        httpPost('ajax', payload, function (ob) { return _this.on_receive_updates(ob); });
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
        // console.log(`Response to move: ${JSON.stringify(ob)}`);
    };
    return Controller;
}());
var Game = /** @class */ (function () {
    function Game() {
        this.model = new Model();
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
var start = function () {
    save_character_name();
    remove_input();
    insert_canvas();
    var game = new Game();
    var timer = setInterval(function () { game.onTimer(); }, 40);
};
var insert_story = function () {
    var content = document.getElementById('content');
    content.innerHTML = "<h2>Banana Quest: The Potassium Crisis</h2>"
        + "<p>In a land known as \"Fruitopia,\" the inhabitants thrived on the delicious and nutritious fruits that grew abundantly. One fruit, in particular, was highly treasured - the mighty banana. Fruitopia's inhabitants had always enjoyed the health benefits and energy provided by this potassium-rich treat, which fueled their daily adventures and brought joy to their lives.</p>"
        + "<p>But one day, a mysterious phenomenon occurred: the banana crops across Fruitopia began to wither, and the supply of this essential fruit dwindled rapidly.As the days passed, the once energetic and lively inhabitants of Fruitopia started to feel weak and fatigued. The doctors and scientists of the land quickly identified the cause - a severe potassium deficiency was spreading among the residents, and it threatened to plunge Fruitopia into a state of perpetual lethargy.Desperate to restore the health and vitality of their beloved land, the citizens of Fruitopia are turning to you to help them find 20 bananas.The fate of Fruitopia hangs in the balance.</p>"
        + "<p>tl;dr: Find 20 bananas to win.</p>"
        + "<p>If you are willing to undertake this noble quest, please enter your name:</p>";
    content.style.wordWrap = 'break-word';
    content.style.width = '600px';
};
// populate HTML
insert_story();
