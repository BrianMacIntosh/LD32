
GameEngine = new bmacSdk.Engine("canvasDiv");


thegame =
{
	B2_SCALE: 50,
	X_AXIS: new THREE.Vector3(1, 0, 0),
	Y_AXIS: new THREE.Vector3(0, 1, 0),
	Z_AXIS: new THREE.Vector3(0, 0, 1),
};

thegame.togglePause = function()
{
	this.setPause(!this.paused);
};

thegame.setPause = function(val)
{
	this.paused = val;
	menus.pauseGame(val);
}

thegame.added = function()
{
	//Create sky
	this.tex_sky = THREE.ImageUtils.loadTexture("media/bg.png");
	this.geo_sky = bmacSdk.GEO.makeSpriteGeo(GameEngine.screenWidth, GameEngine.screenHeight);
	this.mesh_sky = bmacSdk.GEO.makeSpriteMesh(this.tex_sky, this.geo_sky);
	this.mesh_sky.position.set(GameEngine.screenWidth/2, GameEngine.screenHeight/2, -99);
	GameEngine.scene.add(this.mesh_sky);
	
	//Create clouds
	var cloudHeight = (128/512)*GameEngine.screenWidth;
	this.tex_clouds = THREE.ImageUtils.loadTexture("media/clouds.png");
	this.tex_clouds.wrapS = THREE.RepeatWrapping;
	this.geo_clouds = bmacSdk.GEO.makeSpriteGeo(GameEngine.screenWidth, cloudHeight);
	this.mesh_clouds = bmacSdk.GEO.makeSpriteMesh(this.tex_clouds, this.geo_clouds);
	this.mesh_clouds.position.set(GameEngine.screenWidth/2, GameEngine.screenHeight-cloudHeight/2, -90);
	GameEngine.scene.add(this.mesh_clouds);
	
	//Create b2d world
	this.gravity = new Box2D.b2Vec2(0.0, 10.0);
	this.world = new Box2D.b2World(this.gravity);
	//this.world.SetContactFilter(this.contactFilter);
	
	this.contactListener = new Box2D.JSContactListener();
	this.contactListener.BeginContact = function(contact)
	{
		//console.log("begin");
		//console.log(contact);
		contact = Box2D.wrapPointer(contact, Box2D.b2Contact);
		//console.log(contact);
		for (var i = 0; i < GameEngine.objects.length; i++)
		{
			if (GameEngine.objects[i] && GameEngine.objects[i].onBeginContact)
				GameEngine.objects[i].onBeginContact(contact);
		}
	}
	this.contactListener.EndContact = function(contact)
	{
		//console.log("end");
		//console.log(contact);
		contact = Box2D.wrapPointer(contact, Box2D.b2Contact);
		//console.log(contact);
		for (var i = 0; i < GameEngine.objects.length; i++)
		{
			if (GameEngine.objects[i] && GameEngine.objects[i].onEndContact)
				GameEngine.objects[i].onEndContact(contact);
		}
	}
	this.contactListener.PreSolve = function(contact, oldManifold)
	{
		contact = Box2D.wrapPointer(contact, Box2D.b2Contact);
		for (var i = 0; i < GameEngine.objects.length; i++)
		{
			if (GameEngine.objects[i] && GameEngine.objects[i].onPreSolve)
				GameEngine.objects[i].onPreSolve(contact);
		}
	}
	this.contactListener.PostSolve = function(contact, impulse)
	{
		contact = Box2D.wrapPointer(contact, Box2D.b2Contact);
		for (var i = 0; i < GameEngine.objects.length; i++)
		{
			if (GameEngine.objects[i] && GameEngine.objects[i].onPostSolve)
				GameEngine.objects[i].onPostSolve(contact);
		}
	}
	this.world.SetContactListener(this.contactListener);
	
	this.filter_all = new Box2D.b2Filter();
	this.filter_all.set_maskBits(0xFFFF);
	this.filter_all.set_categoryBits(0xFFFF);
	
	this.filter_none = new Box2D.b2Filter();
	this.filter_none.set_maskBits(0);
	this.filter_none.set_categoryBits(0);
	
	//Create b2d screen edges
	this.shape_topbot = new Box2D.b2EdgeShape();
	this.shape_topbot.Set(new Box2D.b2Vec2(0, 0), new Box2D.b2Vec2(GameEngine.screenWidth / this.B2_SCALE, 0));
	this.shape_lr = new Box2D.b2EdgeShape();
	this.shape_lr.Set(new Box2D.b2Vec2(0, -100), new Box2D.b2Vec2(0, GameEngine.screenHeight / this.B2_SCALE + 100));
	
	this.fdef_topbot = new Box2D.b2FixtureDef();
	this.fdef_topbot.set_shape(this.shape_topbot);
	this.fdef_topbot.set_density(0);
	this.fdef_topbot.set_friction(0);
	this.fdef_topbot.set_restitution(0.6);
	
	this.fdef_lr = new Box2D.b2FixtureDef();
	this.fdef_lr.set_shape(this.shape_lr);
	this.fdef_lr.set_density(0);
	this.fdef_lr.set_friction(0);
	this.fdef_lr.set_restitution(0.6);
	
	//this.def_top = new Box2D.b2BodyDef();
	//this.def_top.set_position(new Box2D.b2Vec2(0, 0));
	//this.body_top = this.world.CreateBody(this.def_top);
	//this.body_top.CreateFixture(this.fdef_topbot);
	
	//this.def_bottom = new Box2D.b2BodyDef();
	//this.def_bottom.set_position(new Box2D.b2Vec2(0, GameEngine.screenHeight / this.B2_SCALE));
	//this.body_bottom = this.world.CreateBody(this.def_bottom);
	//this.body_bottom.CreateFixture(this.fdef_topbot);
	
	this.def_left = new Box2D.b2BodyDef();
	this.def_left.set_position(new Box2D.b2Vec2(0, 0));
	this.body_left = this.world.CreateBody(this.def_left);
	this.body_left.CreateFixture(this.fdef_lr);
	
	this.def_right = new Box2D.b2BodyDef();
	this.def_right.set_position(new Box2D.b2Vec2(GameEngine.screenWidth / this.B2_SCALE, 0));
	this.body_right = this.world.CreateBody(this.def_right);
	this.body_right.CreateFixture(this.fdef_lr);
};

thegame.removed = function()
{
	
};

thegame.update = function()
{
	if (this.paused) return;
	
	//skip long timestep
	if (!bmacSdk.wasUnfocused)
	{
		this.world.Step(bmacSdk.deltaSec, 2, 2);
	}
	
	//Scroll clouds
	this.tex_clouds.offset.set(this.tex_clouds.offset.x + bmacSdk.deltaSec*0.03, 0);
};


GameEngine.addObject(thegame);
