
menus =
{
	MODE_MAIN: 1,
	MODE_PLAY: 2,
	MODE_2PLAYER_LOBBY: 3,
	MODE_2PLAYER: 4,
	MODE_1PLAYER: 5,
	MODE_TUTORIAL: 6
};

menus.added = function()
{
	this.tex_tutorial = THREE.ImageUtils.loadTexture("media/but_tutorial.png");
	this.tex_1player = THREE.ImageUtils.loadTexture("media/but_1player.png");
	this.tex_2player = THREE.ImageUtils.loadTexture("media/but_2player.png");
	this.tex_tutorial_sel = THREE.ImageUtils.loadTexture("media/but_tutorial_sel.png");
	this.tex_1player_sel = THREE.ImageUtils.loadTexture("media/but_1player_sel.png");
	this.tex_2player_sel = THREE.ImageUtils.loadTexture("media/but_2player_sel.png");
	this.geo_sign = bmacSdk.GEO.makeSpriteGeo(225, 98);
	
	this.changeMode(this.MODE_MAIN);
};

menus.changeMode = function(mode, delay)
{
	console.log("Change mode to '" + mode + "'.");
	
	//Exit old mode
	switch (this.currentMode)
	{
	case this.MODE_MAIN:
		//Forget about the button balloons
		if (this.balloon_tutorial)
		{
			this.balloon_tutorial.flyAway();
			this.balloon_tutorial.setDisabled();
			this.balloon_tutorial = null;
		}
		if (this.balloon_1player)
		{
			this.balloon_1player.flyAway();
			this.balloon_1player.setDisabled();
			this.balloon_1player = null;
		}
		if (this.balloon_2player)
		{
			this.balloon_2player.flyAway();
			this.balloon_2player.setDisabled();
			this.balloon_2player = null;
		}
		break;
		
	case this.MODE_TUTORIAL:
		hud.hide();
		break;
		
	case this.MODE_1PLAYER:
		hud.hide();
		break;
		
	case this.MODE_2PLAYER:
		hud.hide();
		break;
	}
	
	this.nextMode = mode;
	this.modeDelay = delay || 0.001;
};

menus.enterMode = function(mode)
{
	//Enter new mode
	switch (mode)
	{
	case this.MODE_MAIN:
		//main menu
		this.balloon_tutorial = new Balloon({
			signtex:this.tex_tutorial, signgeo:this.geo_sign,
			spawnX:GameEngine.screenWidth/4, spawnY:GameEngine.screenHeight+balloons.RADIUS+60,
			targetY:GameEngine.screenHeight/2 - balloons.RADIUS
		});
		this.balloon_1player = new Balloon({
			signtex:this.tex_1player, signgeo:this.geo_sign,
			spawnX:GameEngine.screenWidth*2/4, spawnY:GameEngine.screenHeight+balloons.RADIUS+60,
			targetY:GameEngine.screenHeight/2 - balloons.RADIUS
		});
		this.balloon_2player = new Balloon({
			signtex:this.tex_2player, signgeo:this.geo_sign,
			spawnX:GameEngine.screenWidth*3/4, spawnY:GameEngine.screenHeight+balloons.RADIUS+60,
			targetY:GameEngine.screenHeight/2 - balloons.RADIUS
		});
		break;
		
	case this.MODE_TUTORIAL:
		//play the game
		hud.hide();
		new Balloon({playerIndex:0});
		new Balloon({dummy:true});
		break;
		
	case this.MODE_1PLAYER:
		//play the game
		hud.show(3);
		new Balloon({playerIndex:0});
		new Balloon({playerIndex:1, ai:true});
		break;
		
	case this.MODE_2PLAYER:
		//play the game
		hud.show(3);
		new Balloon({playerIndex:0});
		new Balloon({playerIndex:1});
		break;
	}
	
	this.currentMode = mode;
	this.nextMode = undefined;
}

menus.removed = function()
{
	
};

menus.update = function()
{
	//Delayed transition
	if (this.modeDelay > 0)
	{
		this.modeDelay -= bmacSdk.deltaSec;
		if (this.modeDelay <= 0)
		{
			this.modeDelay = 0;
			this.enterMode(this.nextMode);
		}
		return;
	}
	
	var mousePos = MOUSEPOSREL(GameEngine.canvasDiv);
	var gamepad = undefined;
	if (navigator)
	{
		var gamepadList = navigator.getGamepads();
		if (gamepadList)
			gamepad = gamepadList[0];
	}
	
	var advance = GameEngine.keyboard.pressed("space") || GameEngine.keyboard.pressed("\n")
		|| GameEngine.mouse.mouseUpNew[1] || gamepad && gamepad.buttons[0].pressed;
	
	switch (this.currentMode)
	{
	case this.MODE_MAIN:
		var option = undefined;
		if (this.balloon_2player.mouseHit(mousePos))
			option = this.balloon_2player;
		if (this.balloon_1player.mouseHit(mousePos))
			option = this.balloon_1player;
		if (this.balloon_tutorial.mouseHit(mousePos))
			option = this.balloon_tutorial;
		
		//Update highlights
		this.balloon_2player.setSelected(!advance && option === this.balloon_2player, this.tex_2player, this.tex_2player_sel);
		this.balloon_1player.setSelected(!advance && option === this.balloon_1player, this.tex_1player, this.tex_1player_sel);
		this.balloon_tutorial.setSelected(!advance && option === this.balloon_tutorial, this.tex_tutorial, this.tex_tutorial_sel);
		
		if (advance)
		{
			if (option == this.balloon_2player)
				this.changeMode(this.MODE_2PLAYER, 3);
			else if (option == this.balloon_1player)
				this.changeMode(this.MODE_1PLAYER, 4);
			else if (option == this.balloon_tutorial)
				this.changeMode(this.MODE_TUTORIAL, 4);
		}
		
		break;
	}
};


GameEngine.addObject(menus);


hud = 
{
	record: [0,0],
	
	ICO_SCALEMAX: 2.2,
	ICO_SCALESPEED: 1.6
};

hud.recordWin = function(playerIndex)
{
	//change in new mesh
	if (this.record[playerIndex] < this.widgets[playerIndex].length)
	{
		var widget = this.widgets[playerIndex][this.record[playerIndex]];
		widget.scale.set(this.ICO_SCALEMAX, this.ICO_SCALEMAX, 1);
		widget.material.map = this.tex_win;
		widget.material.needsUpdate = true;
	}
	
	this.record[playerIndex]++;
};

hud.hide = function()
{
	this.show(0);
	this.divider.visible = false;
};

hud.show = function(neededToWin)
{
	this.divider.visible = true;
	
	//reset record
	for (var d = 0; d < this.record.length; d++) this.record[d] = 0;
	
	var i = 0;
	for (; i < neededToWin; i++)
	{
		for (var d = 0; d < this.widgets.length; d++)
		{
			if (this.widgets[d][i])
			{
				this.widgets[d][i].visible = true;
				this.widgets[d][i].material.map = this.tex_nowin;
				this.widgets[d][i].material.needsUpdate = true;
			}
			else
			{
				this.widgets[d][i] = bmacSdk.GEO.makeSpriteMesh(this.tex_nowin, this.geo_win);
				this.root.add(this.widgets[d][i]);
				this.widgets[d][i].position.set((d*2-1) * (36*i + 36), 0, 0);
			}
		}
	}
	var j = i;
	for (var d = 0; d < this.widgets.length; d++)
	{
		for (i = j; i < this.widgets[d].length; i++)
		{
			this.widgets[d][i].visible = false;
		}
	}
};

hud.added = function()
{
	this.tex_win = THREE.ImageUtils.loadTexture("media/ui_win.png");
	this.tex_nowin = THREE.ImageUtils.loadTexture("media/ui_nowin.png");
	this.tex_divider = THREE.ImageUtils.loadTexture("media/ui_divider.png");
	this.geo_win = bmacSdk.GEO.makeSpriteGeo(41, 41);
	this.geo_divider = bmacSdk.GEO.makeSpriteGeo(22, 63);
	
	this.root = new THREE.Object3D();
	this.root.position.set(GameEngine.screenWidth/2, 40, -2);
	GameEngine.scene.add(this.root);
	
	this.divider = bmacSdk.GEO.makeSpriteMesh(this.tex_divider, this.geo_divider);
	this.root.add(this.divider);
	
	this.widgets = [[],[]];
	this.hide();
};

hud.removed = function()
{
	
};

hud.update = function()
{
	//scale down large win icons
	for (var d = 0; d < this.widgets.length; d++)
	{
		for (var i = 0; i < this.widgets[d].length; i++)
		{
			var widget = this.widgets[d][i];
			if (widget.scale.x > 1)
			{
				widget.scale.x -= bmacSdk.deltaSec * this.ICO_SCALESPEED;
				if (widget.scale.x < 1) widget.scale.x = 1;
				widget.scale.y = widget.scale.x;
			}
		}
	}
};

GameEngine.addObject(hud);
