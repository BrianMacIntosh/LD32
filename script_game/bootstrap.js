
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

thegame.clearGameState = function()
{
	this.setPause(false);
	balloons.destroyAll();
}

thegame.updateKDR = function()
{
	for (var i = 0; i < 2; i++)
	{
		if (!this.kills[i])
		{
			this.dom_kills[i].innerHTML = "0";
		}
		else
		{
			max = 20;
			var extra = this.kills[i]-max;
			var content = "";
			for (var c = 0; c < this.kills[i] && c < max; c++)
			{
				content += '<img src="media/killdecal.png" alt="K">';
			}
			if (extra > 0)
			{
				if (i == 0)
					content += " + " + extra;
				else
					content = extra + " + " + content;
			}
			this.dom_kills[i].innerHTML = content;
		}
		this.dom_deaths[i].innerHTML = "" + this.deaths[i];
		
		if (this.deaths[i] == 0)
			this.dom_ratio[i].innerHTML = "--";
		else
			this.dom_ratio[i].innerHTML = "" + (Math.round(100 * this.kills[i] / this.deaths[i]));
	}
}

thegame.added = function()
{
	//load atlas
	this.atlas = bmacSdk.GEO.loadAtlas("media/atlas.png",806,409,{
	"air_plume":[117,377,36,30],
	"balloon_base":[694,0,111,111],
	"balloon_extra":[694,112,111,111],
	"balloon_target":[452,264,113,113],
	"basket":[658,283,64,60],
	"bg":[0,0,256,150],
	"but_1player":[0,151,225,98],
	"but_1player_sel":[257,0,225,98],
	"but_2player":[257,99,225,98],
	"but_2player_sel":[0,250,225,98],
	"but_menu":[483,0,210,65],
	"but_menu_sel":[483,66,210,65],
	"but_resume":[483,132,210,65],
	"but_resume_sel":[452,198,210,65],
	"but_tutorial":[226,198,225,98],
	"but_tutorial_sel":[226,297,225,98],
	"ctrl_gamepad":[566,264,91,58],
	"ctrl_keyboard1":[566,323,91,58],
	"ctrl_keyboard2":[663,224,91,58],
	"knot":[226,164,12,12],
	"launcher":[0,387,100,22],
	"paused":[0,349,116,37],
	"porcupine":[755,224,46,63],
	"porcupine_arm":[226,151,13,12],
	"porcupine_fly":[658,344,46,63],
	"ready":[117,349,96,27],
	"rope":[788,288,6,111],
	"ui_divider":[765,288,22,63],
	"ui_nowin":[723,288,41,41],
	"ui_win":[705,344,41,41]});
	
	//load k/d
	this.dom_kills = [document.getElementById("kills0"),document.getElementById("kills1")];
	this.dom_deaths = [document.getElementById("deaths0"),document.getElementById("deaths1")];
	this.dom_ratio = [document.getElementById("ratio0"),document.getElementById("ratio1")];
	this.kills = [0,0];
	this.deaths = [0,0];
	this.updateKDR();
	
	//Create sky
	this.mesh_sky = bmacSdk.GEO.makeAtlasMesh(this.atlas,"bg");
	this.mesh_sky.position.set(GameEngine.screenWidth/2, GameEngine.screenHeight/2, -99);
	this.mesh_sky.scale.set(GameEngine.screenWidth/this.atlas.data["bg"][2],GameEngine.screenHeight/this.atlas.data["bg"][3],1);
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
