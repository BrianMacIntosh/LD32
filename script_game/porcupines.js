
porcupines =
{
	width: 46,
	height: 56,
	LAUNCH_FORCE: 6,
	RESPAWN_LINE: 0
};

porcupines.added = function()
{
	this.tex_porcupine = THREE.ImageUtils.loadTexture("media/porcupine.png");
	this.geo_porcupine = bmacSdk.GEO.makeSpriteGeo(this.width, this.height);
	
	//body defs
	this.def_porky = new Box2D.b2BodyDef();
	this.def_porky.set_type(Box2D.b2_dynamicBody);
	this.def_porky.set_allowSleep(false);
	
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
	
	this.body = thegame.world.CreateBody(porcupines.def_porky);
	this.fixture = this.body.CreateFixture(porcupines.fdef_porky);
	
	this.mount();
};

Porcupine.DEPTH = -40;

Porcupine.prototype.mountNextFrame = function()
{
	this.wantsMount = true;
}

Porcupine.prototype.mount = function()
{
	if (!this.mounted)
	{
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

Porcupine.prototype.update = function()
{
	if (this.mounted)
	{
		var x = this.owner.mesh_basket.position.x;
		var y = this.owner.mesh_basket.position.y-porcupines.height/2+10;
		this.body.SetTransform(new Box2D.b2Vec2(x / thegame.B2_SCALE, y / thegame.B2_SCALE), 0);
	}
	else
	{
		if (this.wantsMount)
		{
			this.wantsMount = false;
			this.mount();
		}
	}
	
	var bodypos = this.body.GetPosition();
	this.mesh.position.set(bodypos.get_x()*thegame.B2_SCALE, bodypos.get_y()*thegame.B2_SCALE, Porcupine.DEPTH);
	this.mesh.rotation.z = this.body.GetAngle();
	
	//Respawn
	var spawnline = (GameEngine.screenHeight + porcupines.RESPAWN_LINE) / thegame.B2_SCALE
	if (bodypos.get_y() > spawnline)
	{
		this.mount();
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
	
	if (other.basketFor === this.owner)
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
	
	if (other.basketFor === this.owner)
	{
		//Cleared
		this.clear = true;
	}
}
