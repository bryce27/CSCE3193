type UpdateMethod = () => void;
type OnClickMethod = (x: number, y: number) => void;

class Sprite {
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

class Model {
	sprites: Sprite[] = [];
	character: Sprite;

	constructor() {
		this.sprites = [];
		this.sprites.push(new Sprite(200, 100, "lettuce.png", Sprite.prototype.sit_still, Sprite.prototype.ignore_click));
		this.character = new Sprite(50, 50, "blue_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination);
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
		ctx!.clearRect(0, 0, 1000, 500);
		for (let sprite of this.model.sprites) {
			ctx!.drawImage(sprite.image, sprite.x - sprite.image.width / 2, sprite.y - sprite.image.height);
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

	onClick(event: MouseEvent) {
		let x = event.pageX - this.view.canvas.offsetLeft;
		let y = event.pageY - this.view.canvas.offsetTop;
		this.model.onclick(x, y);

		httpPost('ajax', {
			id: g_id,
			action: 'click',
			x: x,
			y: y,
		}, this.onAcknowledgeClick);
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
		// console.log(`ob = ${JSON.stringify(ob)}`)

		for (let i = 0; i < ob.updates.length; i++) {
			let update = ob.updates[i];

			let id = update[0];
			let x = update[1];
			let y = update[2];

			let sprite = sprite_map[id];
			if (sprite === undefined) {
				let s = new Sprite(x, y, "green_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.ignore_click);
				s.set_destination(x,y);
				this.model.sprites.push(s)
				sprite_map[id] = s
			} else {
				sprite.set_destination(x,y);
			}
		}
	}

	request_updates() {
		let payload = {
			'id': g_id,
			'action': 'update',
		}

		httpPost('ajax', payload, (ob) => {return this.on_receive_updates(ob)} );
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
		// console.log(`Response to move: ${JSON.stringify(ob)}`);
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


let game = new Game();
let timer = setInterval(() => { game.onTimer(); }, 40);