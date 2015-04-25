
porcupines =
{
	width: 46,
	height: 63,
	LAUNCH_FORCE: 6,
	RESPAWN_LINE: 60,
	RESPAWN_TIMER: 2.5,
	
	audio:
	{
		dodamage:["audio/dodamage1.mp3","audio/dodamage2.mp3","audio/dodamage3.mp3"],
		lowhealth:["audio/lowhealth1.mp3","audio/lowhealth2.mp3","audio/lowhealth3.mp3"],
		collide:["audio/collide1.mp3","audio/collide2.mp3","audio/collide3.mp3","audio/collide4.mp3"],
		basket:["audio/basket1.mp3","audio/basket2.mp3","audio/basket3.mp3"],
	}
};

porcupines.added = function()
{
	//body defs
	this.def_porky = new Box2D.b2BodyDef();
	this.def_porky.set_type(Box2D.b2_dynamicBody);
	this.def_porky.set_allowSleep(false);
	this.def_porky.set_fixedRotation(true);
	
	this.shape_porky = new Box2D.b2CircleShape();
	this.shape_porky.set_m_radius(22 / thegame.B2_SCALE);
	
	this.fdef_porky = new Box2D.b2FixtureDef();
	this.fdef_porky.set_shape(this.shape_porky);
	this.fdef_porky.set_density(0.8);
	this.fdef_porky.set_friction(0.4);
	this.fdef_porky.set_restitution(0.5);
};

porcupines.removed = function()
{
	
};

porcupines.update = function()
{
	
};

GameEngine.addObject(porcupines);



Porcupine = function(shipOwner)
{
	this.owner = shipOwner;
	
	//create stuff
	this.mesh = bmacSdk.GEO.makeAtlasMesh(thegame.atlas,"porcupine",true);
	GameEngine.scene.add(this.mesh);
	
	this.mesh_arm = bmacSdk.GEO.makeAtlasMesh(thegame.atlas,"porcupine_arm");
	this.mesh_arm.position.set(-4, 9, 15);
	this.mesh.add(this.mesh_arm);
	
	this.body = thegame.world.CreateBody(porcupines.def_porky);
	this.fixture = this.body.CreateFixture(porcupines.fdef_porky);
	this.fixture.porcupine = this;
	
	this.mount();
};

Porcupine.DEPTH = -40;
Porcupine.ANGLE_SPEED = Math.PI;

Porcupine.prototype.destroy = function()
{
	this.mesh_arm.parent.remove(this.mesh_arm);
	this.mesh.parent.remove(this.mesh);
	
	this.fixture.porcupine = undefined;
	thegame.world.DestroyBody(this.body);
	this.body = null;
	this.fixture = null;
}

Porcupine.prototype.mountNextFrame = function()
{
	this.wantsMount = true;
}

Porcupine.prototype.mount = function()
{
	if (!this.mounted)
	{
		this.owner.startFireCooldown();
		bmacSdk.GEO.setAtlasMeshKey(this.mesh,"porcupine");
		bmacSdk.GEO.setAtlasMeshFlip(this.mesh,false,false);
		this.mesh.rotation.z = 0;
		this.mesh_arm.visible = true;
		this.clear = false;
		this.mounted = true;
		this.wantsMount = false;
		this.body.SetLinearVelocity(new Box2D.b2Vec2(0,0));
		this.body.SetAngularVelocity(0);
		this.body.SetActive(false);
	}
}

Porcupine.prototype.launch = function(quat)
{
	if (this.mounted)
	{
		bmacSdk.GEO.setAtlasMeshKey(this.mesh,"porcupine_fly");
		this.mesh_arm.visible = false;
		this.clear = false;
		this.wantsMount = false;
		
		this.mounted = false;
		this.body.SetActive(true);
		
		var dir = thegame.X_AXIS.clone();
		dir.applyQuaternion(quat);
		var b2dir = new Box2D.b2Vec2(dir.x * porcupines.LAUNCH_FORCE, dir.y * porcupines.LAUNCH_FORCE);
		this.body.ApplyLinearImpulse(b2dir, this.body.GetPosition());
	}
}

Porcupine.prototype.respawn = function()
{
	if (!this.respawnTimer)
	{
		this.respawnTimer = porcupines.RESPAWN_TIMER;
	}
}

Porcupine.prototype.update = function()
{
	//Respawn
	if (this.respawnTimer)
	{
		this.respawnTimer -= bmacSdk.deltaSec;
		if (this.respawnTimer <= 0)
		{
			this.mount();
			this.respawnTimer = undefined;
		}
		return;
	}
	
	if (this.mounted)
	{
		var x = this.owner.mesh_basket.position.x;
		var y = this.owner.mesh_basket.position.y-porcupines.height/2+13;
		this.body.SetTransform(new Box2D.b2Vec2(x / thegame.B2_SCALE, y / thegame.B2_SCALE), 0);
	}
	else
	{
		var x = 0;
		
		if (this.owner.playerIndex !== undefined)
		{
			if (this.owner.ai)
			{
				//ai control
				var enemy = undefined;
				for (var i = 0; i < balloons.list.length; i++)
				{
					if (balloons.list[i] !== this.owner) enemy = balloons.list[i].mesh_base;
				}
				
				var velocity = this.body.GetLinearVelocity();
				var v = velocity.Length();
				var ke = 0.5 * this.body.GetMass() * v * v;
				
				//determine what we are capable of reaching
				var dy = (this.mesh.position.y - this.owner.mesh_basket.position.y) / thegame.B2_SCALE;
				var gpe = this.body.GetMass() * dy * thegame.gravity.get_y();
				var canRetreat = ke >= gpe;
				var shouldRetreat = ke >= gpe && ke * 0.8 <= gpe;
				
				var dy = (this.mesh.position.y - enemy.position.y) / thegame.B2_SCALE;
				var gpe = this.body.GetMass() * dy * thegame.gravity.get_y();
				var canAttack = ke >= gpe;
				
				if (shouldRetreat)
				{
					enemy = this.owner.mesh_basket;
				}
				else if (canAttack)
				{
					enemy = enemy;
				}
				else if (canRetreat)
				{
					enemy = this.owner.mesh_basket;
				}
				else
				{
					enemy = undefined;
				}
				
				var sourceToTargetX = (enemy ? enemy.position.x : 0) - this.mesh.position.x;
				var sourceToTargetY = (enemy ? enemy.position.y : 5000) - this.mesh.position.y;
				var angToTarget = Math.atan2(sourceToTargetY, sourceToTargetX);
				var myAng = Math.atan2(velocity.get_y(), velocity.get_x());
				
				if ((myAng - angToTarget + Math.PI*2) % (Math.PI*2) > Math.PI)
					x = 1;
				else
					x = -1;
			}
			else
			{
				//player control
				if (this.owner.controlScheme === balloons.GAMEPAD)
				{
					x = bmacSdk.INPUT.gamepadAxis(this.owner.playerIndex, bmacSdk.INPUT.GA_LEFTSTICK_X);
					
					x += bmacSdk.INPUT.gamepadButtonValue(this.owner.playerIndex, bmacSdk.INPUT.GB_DPAD_RIGHT);
					x -= bmacSdk.INPUT.gamepadButtonValue(this.owner.playerIndex, bmacSdk.INPUT.GB_DPAD_LEFT);
				}
				else
				{
					if (GameEngine.keyboard.keyDown(balloons.controls[this.owner.playerIndex].left))  x--;
					if (GameEngine.keyboard.keyDown(balloons.controls[this.owner.playerIndex].right)) x++;
				}
			}
		}
		
		if (x > 1) x = 1;
		else if (x < -1) x = -1;
		
		if (hud.gameOverTimer || hud.readyWait)
		{
			x = 0; y = 0;
		}
		
		
		//Redirect the velocity based on the angle of travel
		var velocity = this.body.GetLinearVelocity();
		var angle = Math.atan2(velocity.get_y(), velocity.get_x());
		var amt = velocity.Length();
		angle += Porcupine.ANGLE_SPEED * x * bmacSdk.deltaSec;
		velocity.Set(amt * Math.cos(angle), amt * Math.sin(angle));
		this.body.SetLinearVelocity(velocity);
		
		//Rotate sprite to face velocity
		this.mesh.rotation.z = angle + Math.PI/2;
		
		//Flip sprite
		bmacSdk.GEO.setAtlasMeshFlip(this.mesh, velocity.get_x()<0, false);
		
		if (this.wantsMount)
		{
			this.wantsMount = false;
			this.mount();
		}
	}
	
	var bodypos = this.body.GetPosition();
	this.mesh.position.set(bodypos.get_x()*thegame.B2_SCALE, bodypos.get_y()*thegame.B2_SCALE, Porcupine.DEPTH);
	//this.mesh.rotation.z = this.body.GetAngle();
	
	//Respawn
	var spawnline = (GameEngine.screenHeight + porcupines.RESPAWN_LINE) / thegame.B2_SCALE
	if (!this.mounted && bodypos.get_y() > spawnline)
	{
		this.respawn();
	}
};

Porcupine.prototype.onPreSolve = function(contact, oldManifold)
{
	var fixtureA = contact.GetFixtureA();
	var fixtureB = contact.GetFixtureB();
	
	if (fixtureA === this.fixture)
		var other = fixtureB;
	else if (fixtureB === this.fixture)
		var other = fixtureA;
	else
		return;
	
	if (!this.clear && other.basketFor === this.owner)
	{
		//Not yet clear, ignore contact with basket
		contact.SetEnabled(false);
	}
}

Porcupine.prototype.onBeginContact = function(contact)
{
	var fixtureA = contact.GetFixtureA();
	var fixtureB = contact.GetFixtureB();
	
	if (fixtureA === this.fixture)
		var other = fixtureB;
	else if (fixtureB === this.fixture)
		var other = fixtureA;
	else
		return;
	
	if (other.balloon)
	{
		//Damage balloons
		var normal = new THREE.Vector3(
			this.mesh.position.x-other.balloon.mesh_base.position.x,
			this.mesh.position.y-other.balloon.mesh_base.position.y);
		normal.normalize();
		other.balloon.impact(normal);
	}
	else if (this.fixture == fixtureA && other.porcupine) //'A' check to play only once
	{
		//Play collide sound
		AUDIOMANAGER.playSound(porcupines.audio.collide);
	}
	else if (other.basketFor)
	{
		AUDIOMANAGER.playSound(porcupines.audio.basket);
		if (this.clear && other.basketFor === this.owner)
		{
			//Reboard own balloon
			this.mountNextFrame();
		}
	}
}

Porcupine.prototype.onEndContact = function(contact)
{
	var fixtureA = contact.GetFixtureA();
	var fixtureB = contact.GetFixtureB();
	
	if (fixtureA === this.fixture)
		var other = fixtureB;
	else if (fixtureB === this.fixture)
		var other = fixtureA;
	else
		return;
	
	//Ending any contact clears me
	this.clear = true;
}
