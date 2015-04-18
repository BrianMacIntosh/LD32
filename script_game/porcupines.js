
porcupines =
{
	width: 46,
	height: 56
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
	
	porcupines.def_porky.set_position(new Box2D.b2Vec2(5, 5));
	this.body = thegame.world.CreateBody(porcupines.def_porky);
	this.body.CreateFixture(porcupines.fdef_porky);
	
	this.mount();
};

Porcupine.DEPTH = -40;

Porcupine.prototype.mount = function()
{
	if (!this.mounted)
	{
		this.mounted = true;
		this.body.SetActive(false);
	}
}

Porcupine.prototype.launch = function(quat)
{
	if (this.mounted)
	{
		this.mounted = false;
		this.body.SetActive(true);
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
	
	var bodypos = this.body.GetPosition();
	this.mesh.position.set(bodypos.get_x()*thegame.B2_SCALE, bodypos.get_y()*thegame.B2_SCALE, Porcupine.DEPTH);
	this.mesh.rotation.z = this.body.GetAngle();
};