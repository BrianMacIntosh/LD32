
balloons =
{
	list: [],
	colors: [ 0x8888ff, 0xff8888 ],
	
	ROPE_SEGS: 4,
	ROPE_LEN: 120, //pixels, from balloon center to basket center
	BASKET_OFF: 120+10,
	AIM_SPEED: 2.5,
	CONTROL_FORCE: 13,
	IMPACT_COOLDOWN: 0.5,
	BUOY_LOSS_PER_JET: 0.03,
	AI_FIRE_COOLDOWN: 1,
	
	RADIUS: 55,
	
	KEYS: 1,
	GAMEPAD: 2,
	
	controls:
	[
		{up:"w",down:"s",left:"a",right:"d",fire_left:"q",fire_right:"e"},
		{up:"i",down:"k",left:"j",right:"l",fire_left:"u",fire_right:"o"}
	],
	
	audio:
	{
		launch:["audio/launch1.mp3","audio/launch2.mp3"],
		pop:["audio/pop1.mp3","audio/pop2.mp3","audio/pop3.mp3"]
	}
};

balloons.added = function()
{
	//Air jet stuff
	this.tex_airjet = THREE.ImageUtils.loadTexture("media/air_jet.png");
	this.tex_airjet.wrapT = THREE.RepeatWrapping;
	this.geo_airjet = bmacSdk.GEO.makeSpriteGeo(16, 32);
	
	this.tex_airplume = THREE.ImageUtils.loadTexture("media/air_plume.png");
	this.geo_airplume = bmacSdk.GEO.makeSpriteGeo(36, 30);
	
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
	this.shape_balloon.set_m_radius(this.RADIUS / thegame.B2_SCALE);
	
	this.fdef_balloon = new Box2D.b2FixtureDef();
	this.fdef_balloon.set_filter(thegame.filter_all);
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
	this.fdef_ropeseg.set_filter(thegame.filter_none);
	this.fdef_ropeseg.set_shape(this.shape_ropeseg);
	this.fdef_ropeseg.set_density(1);
};

balloons.removed = function()
{
	this.destroyAll();
};

balloons.update = function()
{
	if (thegame.paused) return;
	
	for (var i = this.list.length-1; i >= 0; i--)
	{
		this.list[i].update();
	}
	
	this.tex_airjet.offset.set(0, this.tex_airjet.offset.y + bmacSdk.deltaSec*AirJet.SCROLL_SPEED);
};

balloons.destroyAll = function()
{
	for (var i = this.list.length - 1; i >= 0; i--)
	{
		this.list[i].destroy();
	}
	this.list.length = 0;
}

balloons.onBeginContact = function(contact)
{
	for (var i = 0; i < this.list.length; i++)
	{
		this.list[i].onBeginContact(contact);
	}
};

balloons.onEndContact = function(contact)
{
	for (var i = 0; i < this.list.length; i++)
	{
		this.list[i].onEndContact(contact);
	}
};

balloons.onPreSolve = function(contact, oldManifold)
{
	for (var i = 0; i < this.list.length; i++)
	{
		this.list[i].onPreSolve(contact);
	}
};

GameEngine.addObject(balloons);



//Params:
//-playerIndex: set if this is a player balloon
//-ai
//-dummy: true if this is a target-practice balloon
//-signtex signgeo: pass in the stuff
//-spawnX spawnY: override spawn point
//-targetX targetY: override dummy targets
Balloon = function(params)
{
	//Index is global index
	balloons.list.push(this);
	this.playerIndex = params.playerIndex;
	this.ai = params.ai;
	
	//damage
	this.airjets = [];
	this.impactCooldown = 0;
	this.respawns = 0;
	
	//aiming
	this.aimTarget = new THREE.Quaternion();
	this.aimTarget.setFromAxisAngle(thegame.Z_AXIS, 0);
	
	if (params.spawnX !== undefined)
		this.spawnX = params.spawnX/thegame.B2_SCALE;
	else if (params.dummy)
		this.spawnX = (GameEngine.screenWidth-300)/thegame.B2_SCALE;
	else if (this.playerIndex === 0)
		this.spawnX = 100/thegame.B2_SCALE;
	else
		this.spawnX = (GameEngine.screenWidth-100)/thegame.B2_SCALE;
	
	if (params.spawnY !== undefined)
		this.spawnY = params.spawnY/thegame.B2_SCALE;
	else
		this.spawnY = (GameEngine.screenHeight/2 - balloons.ROPE_LEN/2)/thegame.B2_SCALE;
	
	if (params.targetX !== undefined)
		this.targetX = params.targetX/thegame.B2_SCALE;
	else
		this.targetX = this.spawnX;
	
	if (params.targetY !== undefined)
		this.targetY = params.targetY/thegame.B2_SCALE;
	else
		this.targetY = this.spawnY;
	
	var material = new THREE.MeshBasicMaterial(
	{
		map:(params.dummy ? balloons.tex_basetarget : balloons.tex_base),
		transparent:true, color:(this.playerIndex !== undefined ? balloons.colors[this.playerIndex] : 0xffffffff)
	});
	this.mesh_base = new THREE.Mesh(balloons.geo_balloon, material);
	GameEngine.scene.add(this.mesh_base);
	
	//balloon deco
	this.mesh_extra = bmacSdk.GEO.makeSpriteMesh(balloons.tex_extra, balloons.geo_balloon);
	this.mesh_base.add(this.mesh_extra);
	this.mesh_extra.position.set(0, 0, 1);
	
	this.mesh_basket = bmacSdk.GEO.makeSpriteMesh(balloons.tex_basket, balloons.geo_basket);
	GameEngine.scene.add(this.mesh_basket);
	
	//sign
	if (params.signtex && params.signgeo)
	{
		this.mesh_sign = bmacSdk.GEO.makeSpriteMesh(params.signtex, params.signgeo);
		this.mesh_basket.add(this.mesh_sign);
		this.mesh_sign.position.set(0, 20, 1);
	}
	
	//create launcher assets
	if (this.playerIndex !== undefined)
	{
		this.mesh_launcher = bmacSdk.GEO.makeSpriteMesh(balloons.tex_launcher, balloons.geo_launcher);
		this.mesh_launcher.position.set(0, 0, 20);
		this.mesh_basket.add(this.mesh_launcher);
	}
	
	//knots
	var tempMesh = bmacSdk.GEO.makeSpriteMesh(balloons.tex_knot, balloons.geo_knot);
	this.mesh_base.add(tempMesh);
	tempMesh.position.set(-balloons.RADIUS, 0, 5);
	var tempMesh = bmacSdk.GEO.makeSpriteMesh(balloons.tex_knot, balloons.geo_knot);
	this.mesh_base.add(tempMesh);
	tempMesh.position.set(balloons.RADIUS, 0, 5);
	
	this.ropes = [];
	this.rebuildBodies();
	
	if (this.mesh_sign)
	{
		//give it a random kick for fun
		var dir = new Box2D.b2Vec2(Math.random()*10-5, -Math.random()*10);
		this.body_balloon.ApplyLinearImpulse(dir, this.body_balloon.GetPosition());
	}
	
	if (this.playerIndex !== undefined)
	{
		this.porcupine = new Porcupine(this);
	}
}

Balloon.DEPTH = -50;

Balloon.prototype.flyAway = function()
{
	this.killCeiling = -300;
	this.targetY = this.killCeiling;
}

Balloon.prototype.mouseHit = function(mousePos)
{
	if (bmacSdk.GEO.distance(this.mesh_base.position, mousePos) <= balloons.RADIUS)
		return true;
	
	var wpos = new THREE.Vector3();
	wpos.setFromMatrixPosition(this.mesh_sign.matrixWorld);
	if (this.mesh_sign && bmacSdk.GEO.distance(wpos, mousePos) <= 225/2)
		return true;
	return false;
}

Balloon.prototype.setSelected = function(state, tex, tex_sel)
{
	if (this.mesh_sign)
	{
		var desired = state ? tex_sel : tex;
		if (this.mesh_sign.material.map != desired)
		{
			this.mesh_sign.material.map = desired;
			this.mesh_sign.material.needsUpdate = true;
		}
		this.setBalloonColor(state ? 0xfffaa7 : 0xffffff);
	}
}

Balloon.prototype.setDisabled = function()
{
	this.setBalloonColor(0xCCCCCC);
}

Balloon.prototype.setBalloonColor = function(color)
{
	if (this.mesh_base.material.color != color)
	{
		this.mesh_base.material.color.setHex(color);
		this.mesh_base.material.needsUpdate = true;
	}
}

Balloon.prototype.destroy = function()
{
	this.destroyBodies();
	
	if (this.porcupine)
	{
		this.porcupine.destroy();
		this.porcupine = undefined;
	}
	
	if (this.mesh_base)
	{
		this.mesh_base.parent.remove(this.mesh_base);
		this.mesh_base = null;
	}
	if (this.mesh_basket)
	{
		this.mesh_basket.parent.remove(this.mesh_basket);
		this.mesh_basket = null;
	}
	if (this.mesh_sign)
	{
		this.mesh_sign.parent.remove(this.mesh_sign);
		this.mesh_sign = null;
	}
	for (var i = 0; i < this.ropes.length; i++)
	{
		if (this.ropes[i] && this.ropes[i].mesh)
		{
			this.ropes[i].mesh.parent.remove(this.ropes[i].mesh);
		}
	}
	
	for (var i = balloons.list.length-1; i >= 0; i--)
	{
		if (balloons.list[i] === this) balloons.list.splice(i,1);
	}
}

Balloon.prototype.destroyBodies = function()
{
	//destroy old
	if (this.body_balloon)
	{
		this.fixture_balloon.balloon = undefined;
		thegame.world.DestroyBody(this.body_balloon);
		this.body_balloon = null;
	}
	if (this.body_basket)
	{
		this.fixture_basket.basketFor = undefined;
		thegame.world.DestroyBody(this.body_basket);
		this.body_basket = null;
	}
	if (this.ropes)
	{
		for (var i = 0; i < this.ropes.length; i++)
		{
			if (this.ropes[i].body)
			{
				thegame.world.DestroyBody(this.ropes[i].body);
				this.ropes[i].body = null;
			}
		}
	}
}

Balloon.prototype.startFireCooldown = function()
{
	if (this.ai)
		this.fireCooldown = balloons.AI_FIRE_COOLDOWN;
}

Balloon.prototype.respawn = function()
{
	this.respawns++;
	
	//Respawn above the screen at a random X
	this.spawnX = (Math.random() * (GameEngine.screenWidth-balloons.RADIUS*2) + balloons.RADIUS) / thegame.B2_SCALE;
	this.spawnY = -200 / thegame.B2_SCALE;
	
	this.rebuildBodies();
	
	//clear jets
	for (var i = 0; i < this.airjets.length; i++)
		this.airjets[i].destroy();
	this.airjets.length = 0;
}

Balloon.prototype.rebuildBodies = function()
{
	this.destroyBodies();
	
	//set up spawn loc
	balloons.def_balloon.set_position(new Box2D.b2Vec2(this.spawnX, this.spawnY));
	balloons.def_basket.set_position(new Box2D.b2Vec2(this.spawnX, this.spawnY + balloons.BASKET_OFF / thegame.B2_SCALE));
	
	//make b2 body
	this.body_balloon = thegame.world.CreateBody(balloons.def_balloon);
	this.fixture_balloon = this.body_balloon.CreateFixture(balloons.fdef_balloon);
	this.fixture_balloon.balloon = this;
	
	//b2 basket
	this.body_basket = thegame.world.CreateBody(balloons.def_basket);
	this.fixture_basket = this.body_basket.CreateFixture(balloons.fdef_basket);
	this.fixture_basket.basketFor = this;
	
	//b2 rope connecting the two
	var ropeAng = Math.PI / 13;
	var lastBody = [this.body_balloon,this.body_balloon];
	for (var c = 0; c < balloons.ROPE_SEGS; c++)
	{
		if (!this.ropes[c*2+0]) this.ropes[c*2+0] = {};
		if (!this.ropes[c*2+1]) this.ropes[c*2+1] = {};
		for (var d = 0; d < 2; d++)
		{
			var ropeobj = this.ropes[c*2+d];
			
			var sig = (d*2-1);
			var x = this.spawnX+sig*balloons.RADIUS/thegame.B2_SCALE;
			var y = this.spawnY;
			var len = c*balloons.ROPE_SEG_LEN;
			
			var jy = y + len * Math.cos(ropeAng);
			var jx = x + -sig * len * Math.sin(ropeAng);
			
			len += .5*balloons.ROPE_SEG_LEN;
			
			y += len * Math.cos(ropeAng);
			x += -sig * len * Math.sin(ropeAng);
			
			balloons.def_ropeseg.set_angle(ropeAng*sig);
			
			balloons.def_ropeseg.set_position(new Box2D.b2Vec2(x,y));
			ropeobj.body = thegame.world.CreateBody(balloons.def_ropeseg);
			ropeobj.body.CreateFixture(balloons.fdef_ropeseg);
			
			//Create joint
			var jointdef = new Box2D.b2RevoluteJointDef();
			jointdef.set_collideConnected(false);
			jointdef.Initialize(lastBody[d], ropeobj.body, new Box2D.b2Vec2(jx,jy));
			thegame.world.CreateJoint(jointdef);
			
			//Create mesh
			if (!ropeobj.mesh)
			{
				ropeobj.mesh = bmacSdk.GEO.makeSpriteMesh(balloons.tex_rope, balloons.geo_rope);
				GameEngine.scene.add(ropeobj.mesh);
			}
			
			lastBody[d] = ropeobj.body;
		}
	}
	
	//Final joint
	for (var d = 0; d < 2; d++)
	{
		var sig = (d*2-1);
		var x = this.spawnX+sig*balloons.RADIUS/thegame.B2_SCALE;
		var y = this.spawnY;
		var len = c*balloons.ROPE_SEG_LEN;
		
		var jy = y + len * Math.cos(ropeAng);
		var jx = x + -sig * len * Math.sin(ropeAng);
		
		balloons.def_ropeseg.set_angle(ropeAng*sig);
		
		var jointdef = new Box2D.b2RevoluteJointDef();
		jointdef.Initialize(lastBody[d], this.body_basket, new Box2D.b2Vec2(jx,jy));
		jointdef.set_collideConnected(false);
		thegame.world.CreateJoint(jointdef);
	}
	
	//Calculate mass
	this.mass = this.body_balloon.GetMass();
	this.mass += this.body_basket.GetMass();
	for (var i = 0; i < this.ropes.length; i++)
		this.mass += this.ropes[i].body.GetMass();
}

Balloon.prototype.update = function()
{
	//destroyed
	if (!this.mesh_base) return;
	
	if (this.impactCooldown > 0) this.impactCooldown -= bmacSdk.deltaSec;
	if (this.fireCooldown > 0) this.fireCooldown -= bmacSdk.deltaSec;
	
	//kill
	if (this.killCeiling !== undefined && this.mesh_base.position.y < this.killCeiling)
	{
		this.destroy();
		return;
	}
	
	//respawn
	if (this.mesh_base.position.y > GameEngine.screenHeight + balloons.RADIUS)
	{
		//don't respawn menu balloons
		if (!this.mesh_sign)
		{
			this.respawn();
			if (this.playerIndex === 0 || this.playerIndex === 1)
				hud.recordWin(1-this.playerIndex);
		}
	}
	
	//air jets
	for (var i = 0; i < this.airjets.length; i++)
	{
		this.airjets[i].update();
	}
	
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
	var force = -this.mass*thegame.gravity.get_y();
	var buoyancyLoss = balloons.BUOY_LOSS_PER_JET*this.airjets.length;
	var effective = 1 - buoyancyLoss;
	this.body_balloon.ApplyForceToCenter(new Box2D.b2Vec2(0, force*effective));
	
	//force down from top
	if (balloonpos.get_y() < 0 && this.killCeiling === undefined)
	{
		//enforce max velocity
		if (this.body_balloon.GetLinearVelocity().get_y() < 2.5)
			this.body_balloon.ApplyForceToCenter(new Box2D.b2Vec2(0, balloons.CONTROL_FORCE*2));
	}
	
	var x = 0;
	var y = 0;
	var aimAngle = 0;
	var fire = 0;
	if (this.playerIndex !== undefined && !hud.readyWait)
	{
		if (this.porcupine && this.porcupine.mounted)
		{
			if (this.ai)
			{
				//ai control
				var enemy = undefined;
				for (var i = 0; i < balloons.list.length; i++)
				{
					if (balloons.list[i] !== this) enemy = balloons.list[i];
				}
				if (enemy)
				{
					var sourceToTargetDist = bmacSdk.GEO.distance(this.mesh_basket.position, enemy.mesh_base.position);
					var sourceToTargetX = enemy.mesh_base.position.x - this.mesh_basket.position.x;
					if (this.mesh_base.position.y > GameEngine.screenHeight - 160)
					{
						//try not to die
						y = -1;
					}
					else if (sourceToTargetDist <= 360)
					{
						//launch toward enemy
						fire = sourceToTargetX < 0 ? -1 : 1;
					}
					else
					{
						//move closer
						x = sourceToTargetX;
						if (this.mesh_base.position.y > 200) y = -1;
					}
				}
			}
			else
			{
				//player control
				if (this.controlScheme === balloons.GAMEPAD)
				{
					x = bmacSdk.INPUT.gamepadAxis(this.playerIndex, bmacSdk.INPUT.GA_LEFTSTICK_X);
					y = bmacSdk.INPUT.gamepadAxis(this.playerIndex, bmacSdk.INPUT.GA_LEFTSTICK_Y);
					
					x += bmacSdk.INPUT.gamepadButtonValue(this.playerIndex, bmacSdk.INPUT.GB_DPAD_RIGHT);
					x -= bmacSdk.INPUT.gamepadButtonValue(this.playerIndex, bmacSdk.INPUT.GB_DPAD_LEFT);
					y += bmacSdk.INPUT.gamepadButtonValue(this.playerIndex, bmacSdk.INPUT.GB_DPAD_DOWN);
					y -= bmacSdk.INPUT.gamepadButtonValue(this.playerIndex, bmacSdk.INPUT.GB_DPAD_UP);
					
					aimAngle = Math.atan2(
						bmacSdk.INPUT.gamepadAxis(this.playerIndex, bmacSdk.INPUT.GA_RIGHTSTICK_Y),
						bmacSdk.INPUT.gamepadAxis(this.playerIndex, bmacSdk.INPUT.GA_RIGHTSTICK_X));
					
					if (bmacSdk.INPUT.gamepadButtonPressed(this.playerIndex, bmacSdk.INPUT.GB_LEFTTRIGGER)
					 || bmacSdk.INPUT.gamepadButtonPressed(this.playerIndex, bmacSdk.INPUT.GB_RIGHTTRIGGER))
					{
						fire = true;
					}
				}
				else
				{
					if (GameEngine.keyboard.keyDown(balloons.controls[this.playerIndex].left))  x--;
					if (GameEngine.keyboard.keyDown(balloons.controls[this.playerIndex].right)) x++;
					if (GameEngine.keyboard.keyDown(balloons.controls[this.playerIndex].up))    y--;
					if (GameEngine.keyboard.keyDown(balloons.controls[this.playerIndex].down))  y++;
					
					if (GameEngine.keyboard.keyPressed(balloons.controls[this.playerIndex].fire_left)) fire = -1;
					if (GameEngine.keyboard.keyPressed(balloons.controls[this.playerIndex].fire_right)) fire = 1;
				}
			}
		}
		else
		{
			//If pilot is missing, just automatically adjust for lost buoyancy
			y = force*buoyancyLoss / balloons.CONTROL_FORCE;
		}
	}
	else
	{
		//dummy just moves toward spawn
		x = this.targetX-balloonpos.get_x();
		y = this.targetY-balloonpos.get_y();
		var len = Math.sqrt(x*x+y*y);
		x /= len;
		y /= len;
		
		if (hud.readyWait && this.playerIndex !== undefined)
		{
			//Pressing things readies me
			if (GameEngine.keyboard.keyDown(balloons.controls[this.playerIndex].left)
			 || GameEngine.keyboard.keyDown(balloons.controls[this.playerIndex].right)
			 || GameEngine.keyboard.keyDown(balloons.controls[this.playerIndex].up)
			 || GameEngine.keyboard.keyDown(balloons.controls[this.playerIndex].down)
			 || GameEngine.keyboard.keyPressed(balloons.controls[this.playerIndex].fire_left)
			 || GameEngine.keyboard.keyPressed(balloons.controls[this.playerIndex].fire_right))
			{
				hud.readyKeys(this.playerIndex);
				this.controlScheme = balloons.KEYS;
			}
			else if (bmacSdk.INPUT.gamepadButtonPressed(this.playerIndex, bmacSdk.INPUT.GB_START)
			 || bmacSdk.INPUT.gamepadButtonPressed(this.playerIndex, bmacSdk.INPUT.GB_A))
			{
				hud.readyGamepad(this.playerIndex);
				this.controlScheme = balloons.GAMEPAD;
			}
		}
	}
	
	if (x > 1) x = 1;
	else if (x < -1) x = -1;
	if (y > 1) y = 1;
	else if (y < -1) y = -1;
	
	this.controlX = x; this.controlY = y;
	
	//game over
	if (hud.gameOverTimer)
	{
		fire = false; x = 0; y = 0;
	}
	
	//Move
	this.body_balloon.ApplyForceToCenter(new Box2D.b2Vec2(x*balloons.CONTROL_FORCE, y*balloons.CONTROL_FORCE));
	
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
	
	if (this.fireCooldown && this.fireCooldown > 0) fire = false;
	
	if (this.porcupine)
	{
		this.porcupine.update();
		if (fire && this.mesh_launcher)
		{
			var quat = this.mesh_launcher.quaternion;
			if (fire === 1) quat.setFromAxisAngle(thegame.Z_AXIS, 0);
			else if (fire === -1) quat.setFromAxisAngle(thegame.Z_AXIS, Math.PI);
			this.porcupine.launch(quat);
			AUDIOMANAGER.playSound(balloons.audio.launch);
		}
	}
}

Balloon.prototype.onBeginContact = function(contact)
{
	if (this.porcupine) this.porcupine.onBeginContact(contact);
}

Balloon.prototype.onEndContact = function(contact)
{
	if (this.porcupine) this.porcupine.onEndContact(contact);
}

Balloon.prototype.onPreSolve = function(contact)
{
	if (this.porcupine) this.porcupine.onPreSolve(contact);
}

Balloon.prototype.impact = function(normal)
{
	if (this.impactCooldown <= 0)
	{
		AUDIOMANAGER.playSound(balloons.audio.pop);
		AUDIOMANAGER.playSound(porcupines.audio.dodamage);
		this.airjets.push(new AirJet(this.mesh_base, normal));
		this.impactCooldown = balloons.IMPACT_COOLDOWN;
	}
}



AirJet = function(parent, normal)
{
	this.mesh = bmacSdk.GEO.makeSpriteMesh(balloons.tex_airjet, balloons.geo_airjet);
	var dist = balloons.RADIUS + 12;
	this.mesh.position.set(dist*normal.x,dist*normal.y,1);
	this.mesh.quaternion.setFromAxisAngle(thegame.Z_AXIS, Math.atan2(normal.y, normal.x)-Math.PI/2);
	parent.add(this.mesh);
	
	this.mesh_plume = bmacSdk.GEO.makeSpriteMesh(balloons.tex_airplume, balloons.geo_airplume);
	this.mesh_plume.position.set(0, 16, 2);
	this.mesh.add(this.mesh_plume);
	
	this.plumeOsc = 0;
}

AirJet.SCROLL_SPEED = 6;
AirJet.PLUME_VAR = 0.15;
AirJet.PLUME_OSC_FREQ = Math.PI*5;

AirJet.prototype.update = function()
{
	//oscillate plume scale
	this.plumeOsc += bmacSdk.deltaSec * AirJet.PLUME_OSC_FREQ;
	var s = 1 + AirJet.PLUME_VAR * Math.sin(this.plumeOsc);
	this.mesh_plume.scale.set(s, s, 1);
}

AirJet.prototype.destroy = function()
{
	this.mesh.remove(this.mesh_plume);
	this.mesh.parent.remove(this.mesh);
}