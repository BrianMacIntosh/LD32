
porcupines =
{
	width: 46,
	height: 63,
	LAUNCH_FORCE: 5.5,
	RESPAWN_LINE: 60,
	RESPAWN_TIMER: 2.5,
	
	audio:
	{
		dodamage:[
		"audio/dodamage1.mp3","audio/dodamage2.mp3","audio/dodamage3.mp3"
		],
		lowhealth:[
		"audio/lowhealth1.mp3","audio/lowhealth2.mp3","audio/lowhealth3.mp3"
		],
		collide:[
		"audio/collide1.mp3","audio/collide2.mp3","audio/collide3.mp3","audio/collide4.mp3"
		]
	}
};

porcupines.added = function()
{
	this.tex_porcupine = THREE.ImageUtils.loadTexture("media/porcupine.png");
	this.tex_porcupine_fly = THREE.ImageUtils.loadTexture("media/porcupine_fly.png");
	this.tex_porcupine_fly_inv = THREE.ImageUtils.loadTexture("media/porcupine_fly_inv.png");
	this.geo_porcupine = bmacSdk.GEO.makeSpriteGeo(this.width, this.height);
	
	this.tex_arm = THREE.ImageUtils.loadTexture("media/porcupine_arm.png");
	this.geo_arm = bmacSdk.GEO.makeSpriteGeo(13, 12);
	
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
	this.mesh = bmacSdk.GEO.makeSpriteMesh(porcupines.tex_porcupine, porcupines.geo_porcupine);
	GameEngine.scene.add(this.mesh);
	
	this.mesh_arm = bmacSdk.GEO.makeSpriteMesh(porcupines.tex_arm, porcupines.geo_arm);
	this.mesh_arm.position.set(-4, 9, 15);
	this.mesh.add(this.mesh_arm);
	
	this.body = thegame.world.CreateBody(porcupines.def_porky);
	this.fixture = this.body.CreateFixture(porcupines.fdef_porky);
	
	this.mount();
};

Porcupine.DEPTH = -40;
Porcupine.ANGLE_SPEED = Math.PI;

Porcupine.prototype.mountNextFrame = function()
{
	this.wantsMount = true;
}

Porcupine.prototype.mount = function()
{
	if (!this.mounted)
	{
		this.mesh.material.map = porcupines.tex_porcupine;
		this.mesh.material.needsUpdate = true;
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
		this.mesh.material.map = porcupines.tex_porcupine_fly;
		this.mesh.material.needsUpdate = true;
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
			//player control
			if (navigator)
			{
				var gamepadList = navigator.getGamepads();
				if (gamepadList)
				{
					var gamepad = gamepadList[this.owner.playerIndex];
					if (gamepad)
					{
						x = gamepad.axes[0];
						y = gamepad.axes[1];
						
						x += gamepad.buttons[15].value;
						x -= gamepad.buttons[14].value;
					}
				}
			}
			if (x == 0)
			{
				if (GameEngine.keyboard.pressed(balloons.controls[this.owner.playerIndex].left))  x--;
				if (GameEngine.keyboard.pressed(balloons.controls[this.owner.playerIndex].right)) x++;
			}
		}
		else if (this.playerIndex !== undefined)
		{
			//ai control
			
		}
		
		if (x > 1) x = 1;
		else if (x < -1) x = -1;
		
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
		var desiredSprite = velocity.get_x() > 0 ? porcupines.tex_porcupine_fly : porcupines.tex_porcupine_fly_inv;
		if (desiredSprite != this.mesh.material.map)
		{
			this.mesh.material.map = desiredSprite;
			this.mesh.material.needsUpdate = true;
		}
		
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
	if (bodypos.get_y() > spawnline)
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
		
		//Play damage sound
		AUDIOMANAGER.playSound(porcupines.audio.dodamage);
	}
	else if (this.clear && other.basketFor === this.owner)
	{
		//Reboard own balloon
		this.mountNextFrame();
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
