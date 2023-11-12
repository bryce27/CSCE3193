type UpdateMethod = () => void;
type OnClickMethod = (x: number, y: number) => void;

const thing_names = [
	"chair", // 0
	"lamp",
	"mushroom", // 2
	"outhouse",
	"pillar", // 4
	"pond",
	"rock", // 6
	"statue",
	"tree", // 8
	"turtle",
];

const convert_thing_index_to_image = (index:number) => {
	return `${thing_names[index]}.png`
}

class Sprite {
	label: string;
	x: number;
	y: number;
	dest_x?: number;
    dest_y?: number;
	speed: number;
	image: HTMLImageElement;
	update: UpdateMethod;
	onclick: OnClickMethod;

	constructor(x: number, y: number, image_url: string, update_method: UpdateMethod, onclick_method: OnClickMethod) {
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

	set_label(name: string) {
		this.label = name;
	}

	set_destination(x: number, y: number) {
		this.dest_x = x;
		this.dest_y = y;
	}

	ignore_click(x: number, y: number) {}

	move(dx: number, dy: number) {
		this.dest_x = this.x + dx;
		this.dest_y = this.y + dy;
	}

	go_toward_destination() {
		if(this.dest_x === undefined)
			return;

		if(this.dest_y === undefined)
			return;

		let dist_remaining = Math.sqrt((this.dest_x - this.x) * (this.dest_x - this.x) + (this.dest_y - this.y) * (this.dest_y - this.y));
		let step_size = Math.min(2.5, dist_remaining);
		let angle = Math.atan2(this.dest_y - this.y, this.dest_x - this.x)
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
	}

	sit_still() {}
}

// map IDs to sprites
let sprite_map: Record<string, Sprite> = {};

const random_id = (len:number) => { // for ID generation
    let p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return [...Array(len)].reduce(a => a + p[Math.floor(Math.random() * p.length)], '');
}

const g_origin = new URL(window.location.href).origin;
const g_id = random_id(12);
let g_name = '';
let g_scroll_x = 0;
let g_scroll_y = 0;
let g_gold = 0;
let g_bananas = 0;

class Model {
	sprites: Sprite[] = [];
	character: Sprite;

	constructor() {
		this.sprites = [];
		this.sprites.push(new Sprite(200, 100, "lettuce.png", Sprite.prototype.sit_still, Sprite.prototype.ignore_click));
		this.character = new Sprite(350, 50, "blue_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination);
		this.sprites.push(this.character);
		sprite_map[g_id] = this.character;
	}

	update() {
		for (let sprite of this.sprites) {
			sprite.update();
		}
	}

	onclick(x: number, y: number) {
		for (let sprite of this.sprites) {
			sprite.onclick(x, y);
		}
	}

	move(dx: number, dy: number) {
		this.character.move(dx, dy);
	}
}


class View
{
	model: Model;
    canvas: HTMLCanvasElement;
    character: HTMLImageElement;

	constructor(model: Model) {
		this.model = model;
		this.canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
		this.character = new Image();
		this.character.src = "blue_robot.png";
	}

	update() {
		let ctx = this.canvas.getContext("2d");
		ctx!.font = "20px Verdana";
		ctx!.clearRect(0, 0, 1000, 500);

		// auto scroll

		// const center_x = 500;
		// const center_y = 270;
		// const scroll_rate = 0.03;
		// g_scroll_x += scroll_rate * (this.model.character.x - g_scroll_x - center_x);
		// g_scroll_y += scroll_rate * (this.model.character.y - g_scroll_y - center_y);
		// console.log(g_scroll_x)
		// console.log(g_scroll_y)

		for (let sprite of this.model.sprites) {
			ctx!.drawImage(sprite.image, sprite.x - sprite.image.width / 2, sprite.y - sprite.image.height);
			ctx!.fillText(sprite.label, sprite.x - sprite.image.width / 2, sprite.y - sprite.image.height - 10);
		}
		
	}
}

interface HttpPostCallback {
	(x:any): any;
}

const httpPost = (page_name: string, payload: any, callback: HttpPostCallback) => {
	let request = new XMLHttpRequest();
	request.onreadystatechange = () => {
		if(request.readyState === 4)
		{
			if(request.status === 200) {
				let response_obj;
				try {
					response_obj = JSON.parse(request.responseText);
				} catch(err) {}
				if (response_obj) {
					callback(response_obj);
				} else {
					callback({
						status: 'error',
						message: 'response is not valid JSON',
						response: request.responseText,
					});
				}
			} else {
				if(request.status === 0 && request.statusText.length === 0) {
					callback({
						status: 'error',
						message: 'connection failed',
					});
				} else {
					callback({
						status: 'error',
						message: `server returned status ${request.status}: ${request.statusText}`,
					});
				}
			}
		}
	};
	request.open('post', `${g_origin}/${page_name}`, true);
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(JSON.stringify(payload));
}

class Controller
{
	model: Model;
    view: View;
    key_right: boolean = false;
    key_left: boolean = false;
    key_up: boolean = false;
    key_down: boolean = false;
	last_updates_request_time: number;

	constructor(model: Model, view: View) {
		this.model = model;
		this.view = view;
		this.key_right = false;
		this.key_left = false;
		this.key_up = false;
		this.key_down = false;
		this.last_updates_request_time = Date.now();
		let self = this;
		view.canvas.addEventListener("click", function(event) { self.onClick(event); });
		document.addEventListener('keydown', function(event) { self.keyDown(event); }, false);
		document.addEventListener('keyup', function(event) { self.keyUp(event); }, false);
	}

	// sends MOVE to server
	onClick(event: MouseEvent) {
		let x = event.pageX - this.view.canvas.offsetLeft;
		let y = event.pageY - this.view.canvas.offsetTop;
		this.model.onclick(x, y);

		// for Gashler backend
		httpPost('ajax.html', {
			id: g_id,
			name: g_name,
			action: 'move',
			x: x,
			y: y,
		}, this.onAcknowledgeClick);

		// my code
		// httpPost('ajax', {
		// 	id: g_id,
		// 	name: g_name,
		// 	action: 'click',
		// 	x: x,
		// 	y: y,
		// }, this.onAcknowledgeClick);
	}

	keyDown(event: KeyboardEvent) {
		if(event.keyCode == 39) this.key_right = true;
		else if(event.keyCode == 37) this.key_left = true;
		else if(event.keyCode == 38) this.key_up = true;
		else if(event.keyCode == 40) this.key_down = true;
	}

	keyUp(event: KeyboardEvent) {
		if(event.keyCode == 39) this.key_right = false;
		else if(event.keyCode == 37) this.key_left = false;
		else if(event.keyCode == 38) this.key_up = false;
		else if(event.keyCode == 40) this.key_down = false;
	}

	on_receive_updates(ob:any) {
		console.log(`ob = ${JSON.stringify(ob)}`)
		if (ob.status === 'error') {
			console.log(`!!! Server replied: ${ob.message}`);
			return;
		}

		if (!!ob.gold && !!ob.bananas) {
			g_gold = ob.gold;
			g_bananas = ob.bananas;

			const gold = document.getElementById('gold');
			const bananas = document.getElementById('bananas');
			gold!.innerHTML = "<span id='gold'>${gold}</span>"
			bananas!.innerHTML = "<span id='bananas'>${bananas}</span>"
		}
		
		for (let i = 0; i < ob.updates.length; i++) {
			let update = ob.updates[i];

			// gashler backend code
			let id = update.id;
			let name = update.name;
			let x = update.x;
			let y = update.y;

			// my code
			// let id = update[0];
			// let name = update[1];
			// let x = update[2];
			// let y = update[3];

			let sprite = sprite_map[id];
			if (sprite === undefined) {
				let s = new Sprite(x, y, "green_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.ignore_click);
				s.set_label(name);
				s.set_destination(x,y);
				this.model.sprites.push(s)
				sprite_map[id] = s
			} else {
				sprite.set_label(name);
				sprite.set_destination(x,y);
			}
		}

		// ob.chats // strings to add to chat window
		const select_element = document.getElementById('chatWindow');
		
		for (let i = 0; i < ob.chats.length; i++) {
			let chat_message = ob.chats[i];
			let opt = document.createElement('option');
    		opt.value = chat_message;
    		opt.innerHTML = chat_message;
    		select_element!.appendChild(opt);
			opt.scrollIntoView()
			// <input type='input' id='chatMessage'></input>
		}
	}

	request_updates() {
		let payload = {
			'id': g_id,
			'action': 'update',
		}

		httpPost('ajax.html', payload, (ob) => {return this.on_receive_updates(ob)} );
	}

	update() {
		let dx = 0;
		let dy = 0;
        let speed = this.model.character.speed;
		if(this.key_right) dx += speed;
		if(this.key_left) dx -= speed;
		if(this.key_up) dy -= speed;
		if(this.key_down) dy += speed;
		if(dx != 0 || dy != 0)
			this.model.move(dx, dy);

		const time = Date.now();
		let diff = time - this.last_updates_request_time;
		if (diff >= 1000) {
			this.last_updates_request_time = time;
			this.request_updates();
		}
	}

	onAcknowledgeClick(ob: any) {
		console.log(`Response to move: ${JSON.stringify(ob)}`);
		if (ob.status === 'error') {
			console.log(`!!! Server replied: ${ob.message}`);
			return;
		}
	}
}

class Game {
	model: Model;
    view: View;
    controller: Controller;

	constructor() {
		this.model = new Model();
		this.view = new View(this.model);
		this.controller = new Controller(this.model, this.view);
	}

	onTimer() {
		this.controller.update();
		this.model.update();
		this.view.update();
	}
}

// Project 5 game intro stuff
const insert_canvas = () => {
	let s: string[] = [];
	s.push(`<canvas id="myCanvas" width="1000" height="500" style="border:1px solid #cccccc;">`);
	s.push(`</canvas>`);
	const content = document.getElementById('content');
	content!.innerHTML = s.join('');
}

const save_character_name = () => {
	const character_name = document.getElementById('character_name');
	g_name = (<HTMLInputElement>character_name).value; // casted to make work with TS per SO.com
}

const remove_input = () => {
	const character_name = document.getElementById('character_name');
	const start_button = document.getElementById('start_button');
	character_name!.remove();
	start_button!.remove();
}

let start = () => {
	save_character_name();
	remove_input();
	insert_canvas();
	insert_scoreboard()
	insert_chat()
	
	let game = new Game();
	let timer = setInterval(() => { game.onTimer(); }, 40);
}

const insert_scoreboard = () => {
	let content = document.getElementById('content') as HTMLInputElement | null;
	let scoreboard = "<br><big><big><b>Gold: <span id='gold'>0</span>, Bananas: <span id='bananas'>0</span></b></big></big><br>"
	content!.innerHTML = content!.innerHTML + scoreboard;
}

const insert_input = () => {
	let content = document.getElementById('content') as HTMLInputElement | null;
	let inputs = "<input type='text' id='character_name'></input><button id='start_button' style='margin-top: 10px' onclick='start();'>Start</button>"
	content!.innerHTML = content!.innerHTML + inputs;
}

const insert_story = () => {
	let content = document.getElementById('content') as HTMLInputElement | null;
	content!.innerHTML = "<h2>Banana Quest: The Potassium Crisis</h2>"
		+ "<p>In a land known as \"Fruitopia,\" the inhabitants thrived on the delicious and nutritious fruits that grew abundantly. One fruit, in particular, was highly treasured - the mighty banana. Fruitopia's inhabitants had always enjoyed the health benefits and energy provided by this potassium-rich treat, which fueled their daily adventures and brought joy to their lives.</p>"
		+ "<p>But one day, a mysterious phenomenon occurred: the banana crops across Fruitopia began to wither, and the supply of this essential fruit dwindled rapidly.As the days passed, the once energetic and lively inhabitants of Fruitopia started to feel weak and fatigued. The doctors and scientists of the land quickly identified the cause - a severe potassium deficiency was spreading among the residents, and it threatened to plunge Fruitopia into a state of perpetual lethargy.Desperate to restore the health and vitality of their beloved land, the citizens of Fruitopia are turning to you to help them find 20 bananas.The fate of Fruitopia hangs in the balance.</p>"
		+ "<p>tl;dr: Find 20 bananas to win.</p>" 
		+ "<p>If you are willing to undertake this noble quest, please enter your name:</p>" 
	content!.style.wordWrap = 'break-word';
	content!.style.width = '600px';
}

const insert_chat = () => {
	let content = document.getElementById('content') as HTMLInputElement | null;
	let inputs = "<br><select id='chatWindow' size='8' style='width:1000px'></select><br><input type='input' id='chatMessage'></input><button onclick='send_chat()'>Post</button>"
	content!.innerHTML = content!.innerHTML + inputs;
}

const on_receive_map = (ob:any) => {
	console.log(`ob = ${JSON.stringify(ob)}`)
	if (ob.status === 'error') {
		console.log(`!!! Server replied: ${ob.message}`);
		return;
	}
}

const send_chat = () => {
	let element = document.getElementById('chatMessage') as HTMLInputElement | null;
	let message = element?.value;

	let payload = {
		'id': g_id,
		'action': 'chat',
		'text': message
	}

	httpPost('ajax.html', payload, (ob) => {return Controller.prototype.on_receive_updates(ob)} );
}

// populate HTML
insert_story()
insert_input()

// request map from Gashler server
httpPost('ajax.html', {
	action: 'get_map',
}, on_receive_map);