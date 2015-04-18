
balloons =
{
	list: [],
	colors: [ 0xff8888ff, 0x8888ffff ],
	
	ROPE_SEGS: 4,
	ROPE_LEN: 120, //pixels, from balloon center to basket center
	AIM_SPEED: 2.5,
	
	controls:
	[
		{up:"w",down:"s",left:"a",right:"d",fire:"e"}
	]
};

balloons.added = function()
{
	this.ROPE_SEG_LEN = (this.ROPE_LEN/this.ROPE_SEGS) / thegame.B2_SCALE;
	
	this.tex_base = THREE.ImageUtils.loadTexture("media/balloon_base.png");
	this.tex_basetarget = THREE.ImageUtils.loadTexture("media/balloon_target.png");
	this.tex_extra = THREE.ImageUtils.loadTexture("media/balloon_extra.png");
	this.tex_basket = THREE.ImageUtils.loadTexture("media/basket.png");
	this.tex_rope = THREE.ImageUtils.loadTexture("media/rope.png");
	this.tex_knot = THREE.ImageUtils.loadTexture("media/knot.png");
	this.tex_launcher = THREE.ImageUtils.loadTexture("media/launcher.png");
	this.tex_launcher_inv = THREE.ImageUtils.loadTexture("media/launcher_inv.png");
	
	this.geo_balloon = bmacSdk.GEO.makeSpriteGeo(111, 111);
	this.geo_basket = bmacSdk.GEO.makeSpriteGeo(64, 60);
	this.geo_rope = bmacSdk.GEO.makeSpriteGeo(6, this.ROPE_LEN/this.ROPE_SEGS + 1);
	this.geo_knot = bmacSdk.GEO.makeSpriteGeo(12, 12);
	this.geo_launcher = bmacSdk.GEO.makeSpriteGeo(100, 22);
	
	//Balloon defs
	this.def_balloon = new Box2D.b2BodyDef();
	this.def_balloon.set_type(Box2D.b2_dynamicBody);
	this.def_balloon.set_allowSleep(false);
	this.def_balloon.set_linearDamping(0.65);
	
	this.shape_balloon = new Box2D.b2CircleShape();
	this.shape_balloon.set_m_radius((111/2) / thegame.B2_SCALE);
	
	this.fdef_balloon = new Box2D.b2FixtureDef();
	this.fdef_balloon.set_shape(this.shape_balloon);
	this.fdef_balloon.set_density(0.8);
	this.fdef_balloon.set_friction(0.6);
	this.fdef_balloon.set_restitution(0.85);
	
	//Basket
	this.def_basket = new Box2D.b2BodyDef();
	this.def_basket.set_type(Box2D.b2_dynamicBody);
	this.def_basket.set_angularDamping(1);
	
	this.shape_basket = new Box2D.b2PolygonShape();
	this.shape_basket.SetAsBox((64/2) / thegame.B2_SCALE, (60/2) / thegame.B2_SCALE);
	
	this.fdef_basket = new Box2D.b2FixtureDef();
	this.fdef_basket.set_shape(this.shape_basket);
	this.fdef_basket.set_density(1.4);
	this.fdef_basket.set_friction(0.7);
	this.fdef_basket.set_restitution(0.5);
	
	//Rope
	this.def_ropeseg = new Box2D.b2BodyDef();
	this.def_ropeseg.set_type(Box2D.b2_dynamicBody);
	this.def_ropeseg.set_angularDamping(1);
	
	this.shape_ropeseg = new Box2D.b2PolygonShape();
	this.shape_ropeseg.SetAsBox((6/2) / thegame.B2_SCALE, this.ROPE_SEG_LEN);
	
	this.fdef_ropeseg = new Box2D.b2FixtureDef();
	this.fdef_ropeseg.set_filter(1);
	this.fdef_ropeseg.set_shape(this.shape_ropeseg);
	this.fdef_ropeseg.set_density(1);
	
	//Create a test balloon
	var testBalloon = new Balloon(this.list.length, 0, 0);
	this.list.push(testBalloon);
	var testBalloon = new Balloon(this.list.length);
	this.list.push(testBalloon);
};

balloons.removed = function()
{
	
};

balloons.update = function()
{
	for (var i = 0; i < this.list.length; i++)
	{
		this.list[i].update();
	}
};

GameEngine.addObject(balloons);



Balloon = function(arrIndex, playerIndex, controlIndex)
{
	//Index is global index
	this.index = arrIndex;
	this.playerIndex = playerIndex;
	this.controlIndex = controlIndex;
	
	//aiming
	this.aimTarget = new THREE.Quaternion();
	this.aimTarget.setFromAxisAngle(thegame.Z_AXIS, 0);
	
	if (this.playerIndex === undefined)
		var spawnX = this.spawnX = (GameEngine.screenWidth-300)/thegame.B2_SCALE;
	else if (this.index == 0)
		var spawnX = this.spawnX = 100/thegame.B2_SCALE;
	else
		var spawnX = this.spawnX = (GameEngine.screenWidth-100)/thegame.B2_SCALE;
	var spawnY = this.spawnY = (GameEngine.screenHeight/2 - balloons.ROPE_LEN/2)/thegame.B2_SCALE;
	
	var material = new THREE.MeshBasicMaterial(
	{
		map:(this.playerIndex !== undefined ? balloons.tex_base : balloons.tex_basetarget),
		transparent:true, color:(playerIndex !== undefined ? balloons.colors[this.playerIndex] : 0xffffffff)
	});
	this.mesh_base = new THREE.Mesh(balloons.geo_balloon, material);
	GameEngine.scene.add(this.mesh_base);
	
	this.mesh_extra = bmacSdk.GEO.makeSpriteMesh(balloons.tex_extra, balloons.geo_balloon);
	this.mesh_base.add(this.mesh_extra);
	this.mesh_extra.position.set(0, 0, 1);
	
	this.mesh_basket = bmacSdk.GEO.makeSpriteMesh(balloons.tex_basket, balloons.geo_basket);
	GameEngine.scene.add(this.mesh_basket);
	
	if (this.playerIndex !== undefined)
	{
		this.mesh_launcher = bmacSdk.GEO.makeSpriteMesh(balloons.tex_launcher, balloons.geo_launcher);
		this.mesh_launcher.position.set(0, 0, 20);
		this.mesh_basket.add(this.mesh_launcher);
	}
	
	//knots
	var tempMesh = bmacSdk.GEO.makeSpriteMesh(balloons.tex_knot, balloons.geo_knot);
	this.mesh_base.add(tempMesh);
	tempMesh.position.set(-111/2, 0, 5);
	var tempMesh = bmacSdk.GEO.makeSpriteMesh(balloons.tex_knot, balloons.geo_knot);
	this.mesh_base.add(tempMesh);
	tempMesh.position.set(111/2, 0, 5);
	
	//set up spawn loc
	balloons.def_balloon.set_position(new Box2D.b2Vec2(spawnX, spawnY));
	balloons.def_basket.set_position(new Box2D.b2Vec2(spawnX, spawnY + (balloons.ROPE_LEN+10) / thegame.B2_SCALE));
	
	//make b2 body
	this.body_balloon = thegame.world.CreateBody(balloons.def_balloon);
	this.body_balloon.CreateFixture(balloons.fdef_balloon);
	
	//b2 basket
	this.body_basket = thegame.world.CreateBody(balloons.def_basket);
	this.body_basket.CreateFixture(balloons.fdef_basket);
	
	//b2 rope connecting the two
	this.ropes = [];
	var ropeAng = Math.PI / 13;
	var lastBody = [this.body_balloon,this.body_balloon];
	for (var c = 0; c < balloons.ROPE_SEGS; c++)
	{
		var ropeobj = [{},{}];
		for (var d = 0; d < 2; d++)
		{
			var sig = (d*2-1);
			var x = spawnX+sig*(111/2)/thegame.B2_SCALE;
			var y = spawnY;
			var len = c*balloons.ROPE_SEG_LEN;
			
			var jy = y + len * Math.cos(ropeAng);
			var jx = x + -sig * len * Math.sin(ropeAng);
			
			len += .5*balloons.ROPE_SEG_LEN;
			
			y += len * Math.cos(ropeAng);
			x += -sig * len * Math.sin(ropeAng);
			
			balloons.def_ropeseg.set_angle(ropeAng*sig);
			
			balloons.def_ropeseg.set_position(new Box2D.b2Vec2(x,y));
			ropeobj[d].body = thegame.world.CreateBody(balloons.def_ropeseg);
			ropeobj[d].body.CreateFixture(balloons.fdef_ropeseg);
			
			this.ropes.push(ropeobj[d]);
			
			//Create joint
			var jointdef = new Box2D.b2RevoluteJointDef();
			jointdef.set_collideConnected(false);
			jointdef.Initialize(lastBody[d], ropeobj[d].body, new Box2D.b2Vec2(jx,jy));
			thegame.world.CreateJoint(jointdef);
			
			//Create mesh
			ropeobj[d].mesh = bmacSdk.GEO.makeSpriteMesh(balloons.tex_rope, balloons.geo_rope);
			GameEngine.scene.add(ropeobj[d].mesh);
			
			lastBody[d] = ropeobj[d].body;
		}
	}
	
	//Final joint
	for (var d = 0; d < 2; d++)
	{
		var sig = (d*2-1);
		var x = spawnX+sig*(111/2)/thegame.B2_SCALE;
		var y = spawnY;
		var len = c*balloons.ROPE_SEG_LEN;
		
		var jy = y + len * Math.cos(ropeAng);
		var jx = x + -sig * len * Math.sin(ropeAng);
		
		balloons.def_ropeseg.set_angle(ropeAng*sig);
		
		var jointdef = new Box2D.b2RevoluteJointDef();
		jointdef.Initialize(lastBody[d], this.body_basket, new Box2D.b2Vec2(jx,jy));
		jointdef.set_collideConnected(false);
		thegame.world.CreateJoint(jointdef);
	}
	
	if (this.playerIndex !== undefined)
	{
		this.porcupine = new Porcupine(this);
	}
	
	//Calculate mass
	this.mass = this.body_balloon.GetMass();
	this.mass += this.body_basket.GetMass();
	for (var i = 0; i < this.ropes.length; i++)
		this.mass += this.ropes[i].body.GetMass();
}

Balloon.DEPTH = -50;
Balloon.CONTROL_FORCE = 8.5;

Balloon.prototype.update = function()
{
	//move to match Box2D body
	var balloonpos = this.body_balloon.GetPosition();
	this.mesh_base.position.set(balloonpos.get_x()*thegame.B2_SCALE, balloonpos.get_y()*thegame.B2_SCALE, Balloon.DEPTH);
	this.mesh_base.rotation.z = this.body_balloon.GetAngle();
	
	var basketpos = this.body_basket.GetPosition();
	this.mesh_basket.position.set(basketpos.get_x()*thegame.B2_SCALE, basketpos.get_y()*thegame.B2_SCALE, Balloon.DEPTH);
	this.mesh_basket.rotation.z = this.body_basket.GetAngle();
	
	for (var i = 0; i < this.ropes.length; i++)
	{
		var pos = this.ropes[i].body.GetPosition();
		this.ropes[i].mesh.position.set(pos.get_x()*thegame.B2_SCALE, pos.get_y()*thegame.B2_SCALE, Balloon.DEPTH+1);
		this.ropes[i].mesh.rotation.z = this.ropes[i].body.GetAngle();
	}
	
	//buoyancy
	this.body_balloon.ApplyForceToCenter(new Box2D.b2Vec2(0, this.mass*-10));
	
	
	var x = 0;
	var y = 0;
	var aimAngle = 0;
	var fire = false;
	if (this.controlIndex !== undefined)
	{
		//player control
		if (navigator)
		{
			var gamepadList = navigator.getGamepads();
			if (gamepadList)
			{
				var gamepad = gamepadList[this.controlIndex];
				if (gamepad)
				{
					x = gamepad.axes[0];
					y = gamepad.axes[1];
					
					x += gamepad.buttons[15].value;
					x -= gamepad.buttons[14].value;
					y += gamepad.buttons[13].value;
					y -= gamepad.buttons[12].value;
					
					aimAngle = Math.atan2(gamepad.axes[3], gamepad.axes[2]);
					
					if (gamepad.buttons[6].pressed || gamepad.buttons[7].pressed) fire = true;
				}
			}
		}
		if (x == 0 && y == 0)
		{
			if (GameEngine.keyboard.pressed(balloons.controls[this.index].left))  x--;
			if (GameEngine.keyboard.pressed(balloons.controls[this.index].right)) x++;
			if (GameEngine.keyboard.pressed(balloons.controls[this.index].up))    y--;
			if (GameEngine.keyboard.pressed(balloons.controls[this.index].down))  y++;
			
			if (GameEngine.keyboard.pressed(balloons.controls[this.index].fire)) fire = true;
		}
	}
	else if (this.playerIndex !== undefined)
	{
		//ai control
		
	}
	else
	{
		//dummy just moves toward spawn
		x = this.spawnX-balloonpos.get_x();
		y = this.spawnY-balloonpos.get_y();
		var len = Math.sqrt(x*x+y*y);
		x /= len;
		y /= len;
	}
	
	if (x > 1) x = 1;
	else if (x < -1) x = -1;
	if (y > 1) y = 1;
	else if (y < -1) y = -1;
	
	//Move
	this.body_balloon.ApplyForceToCenter(new Box2D.b2Vec2(x*Balloon.CONTROL_FORCE, y*Balloon.CONTROL_FORCE));
	
	//Aim
	if (this.mesh_launcher)
	{
		this.aimTarget.setFromAxisAngle(thegame.Z_AXIS, aimAngle);
		this.mesh_launcher.quaternion.slerp(this.aimTarget, balloons.AIM_SPEED * bmacSdk.deltaSec);
		
		//invert graphic if aim is flipped
		var temp = thegame.X_AXIS.clone();
		temp.applyQuaternion(this.mesh_launcher.quaternion);
		if (temp.x < 0)
			var targetMap = balloons.tex_launcher_inv;
		else
			var targetMap = balloons.tex_launcher;
		if (this.mesh_launcher.material.map != targetMap)
		{
			this.mesh_launcher.material.map = targetMap;
			this.mesh_launcher.material.needsUpdate = true;
		}
	}
	
	if (this.porcupine)
	{
		this.porcupine.update();
		
		if (fire && this.mesh_launcher)
		{
			this.porcupine.launch(this.mesh_launcher.quaternion);
		}
	}
}