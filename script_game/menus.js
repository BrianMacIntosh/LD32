
menus =
{
	MODE_MAIN: 1,
	MODE_PLAY: 2,
	MODE_2PLAYER_LOBBY: 3,
	MODE_2PLAYER: 4,
	MODE_1PLAYER: 5,
	MODE_TUTORIAL: 6,
	
	tutorials:
	[
		"So you want to join the porcupine air force, huh? Let's see if you've got what it takes.",
		"You need to use WASD or the Left Stick to move your craft.",
		"Once you're in an advantageous position, launch yourself at the enemy with Q, E, or the Triggers.",
		"What do you mean you don't know how to fly? Just use A and D or the Left Stick!",
		"After attacking, return to your craft or you'll find out just how far away the ground is.",
		"Let's see if you can bring down that target dummy.",
		"You can do more target practice or return to the menu to see some real combat."
	],
	tutorialPhase: 0
};

menus.added = function()
{
	this.dom_chatparent = document.getElementById("chatGroup");
	this.dom_chattext = document.getElementById("chatBox");
	
	this.dom_kdr = [document.getElementById("kdr0"),document.getElementById("kdr1")];
	
	this.tex_white = THREE.ImageUtils.loadTexture("media/white.png");
	
	this.geo_screen = bmacSdk.GEO.makeSpriteGeo(GameEngine.screenWidth, GameEngine.screenHeight);
	
	this.mesh_fader = bmacSdk.GEO.makeSpriteMesh(this.tex_white, this.geo_screen);
	GameEngine.scene.add(this.mesh_fader);
	this.mesh_fader.material.color.setHex(0x000000);
	this.mesh_fader.material.opacity = 0.5;
	this.mesh_fader.position.set(GameEngine.screenWidth/2, GameEngine.screenHeight/2, -10);
	
	//Create pause menu
	this.mesh_paused = bmacSdk.GEO.makeAtlasMesh(thegame.atlas,"paused");
	this.mesh_paused.position.set(GameEngine.screenWidth/2, 250, -8);
	GameEngine.scene.add(this.mesh_paused);
	
	this.pauseButtons = [];
	
	this.pauseButtons[0] = bmacSdk.GEO.makeAtlasMesh(thegame.atlas,"but_menu",true);
	this.mesh_paused.add(this.pauseButtons[0]);
	this.pauseButtons[0].position.set(0, 110, 0);
	this.pauseButtons[0].state_neutral = "but_menu";
	this.pauseButtons[0].state_selected = "but_menu_sel";
	
	this.pauseButtons[1] = bmacSdk.GEO.makeAtlasMesh(thegame.atlas,"but_resume",true);
	this.mesh_paused.add(this.pauseButtons[1]);
	this.pauseButtons[1].position.set(0, 160, 0);
	this.pauseButtons[1].state_neutral = "but_resume";
	this.pauseButtons[1].state_selected = "but_resume_sel";
	
	this.changeMode(this.MODE_MAIN);
	this.pauseGame(false);
};

menus.advanceTutorial = function()
{
	this.dom_chatparent.style.visibility = "visible";
	this.dom_chattext.innerHTML = this.tutorials[this.tutorialPhase];
	
	this.tutorialTimer = 5;
	this.tutorialPhase++;
}

menus.pauseGame = function(state)
{
	this.mesh_fader.visible = state;
	this.mesh_paused.visible = state;
	for (var i = 0; i < this.pauseButtons.length; i++)
		this.pauseButtons[i].visible = state;
};

menus.changeMode = function(mode, delay)
{
	console.log("Change mode to '" + mode + "'.");
	
	if (hud.dom_announcement) hud.dom_announcement.style.visibility = "hidden";
	hud.hideAllControls();
	
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
		
		//Hide kdr
		for (var d = 0; d < this.dom_kdr.length; d++)
			this.dom_kdr[d].style.visibility = "hidden";
		break;
		
	case this.MODE_TUTORIAL:
		hud.hide();
		thegame.clearGameState();
		this.dom_chatparent.style.visibility = "hidden";
		break;
		
	case this.MODE_1PLAYER:
		hud.hide();
		thegame.clearGameState();
		break;
		
	case this.MODE_2PLAYER:
		hud.hide();
		thegame.clearGameState();
		break;
	}
	
	this.nextMode = mode;
	this.modeDelay = delay || 0.001;
};

menus.enterMode = function(mode)
{
	this.currentOption = undefined;
	
	//Enter new mode
	switch (mode)
	{
	case this.MODE_MAIN:
		//main menu
		this.balloon_tutorial = new Balloon({
			signtex:"but_tutorial",
			spawnX:GameEngine.screenWidth/4, spawnY:GameEngine.screenHeight+balloons.RADIUS+60,
			targetY:GameEngine.screenHeight/2 - balloons.RADIUS
		});
		this.balloon_1player = new Balloon({
			signtex:"but_1player",
			spawnX:GameEngine.screenWidth*2/4, spawnY:GameEngine.screenHeight+balloons.RADIUS+60,
			targetY:GameEngine.screenHeight/2 - balloons.RADIUS
		});
		this.balloon_2player = new Balloon({
			signtex:"but_2player",
			spawnX:GameEngine.screenWidth*3/4, spawnY:GameEngine.screenHeight+balloons.RADIUS+60,
			targetY:GameEngine.screenHeight/2 - balloons.RADIUS
		});
		
		//Show kdr
		thegame.updateKDR();
		for (var d = 0; d < this.dom_kdr.length; d++)
			this.dom_kdr[d].style.visibility = "visible";
		break;
		
	case this.MODE_TUTORIAL:
		//play the game
		hud.hide();
		new Balloon({playerIndex:0});
		new Balloon({dummy:true});
		this.tutorialPhase = 0;
		this.advanceTutorial();
		hud.readyWait = true;
		hud.showControls(0);
		break;
		
	case this.MODE_1PLAYER:
		//play the game
		hud.show();
		new Balloon({playerIndex:0});
		new Balloon({playerIndex:1, ai:true});
		hud.readyWait = true;
		hud.showControls(0);
		break;
		
	case this.MODE_2PLAYER:
		//play the game
		hud.show();
		new Balloon({playerIndex:0});
		new Balloon({playerIndex:1});
		hud.readyWait = true;
		hud.showControls(0);
		hud.showControls(1);
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
	
	var advance = bmacSdk.INPUT.actionMenuAccept();
	
	switch (this.currentMode)
	{
	case this.MODE_MAIN:
		var option = undefined;
		if (this.balloon_2player.mouseHit(mousePos))
			option = 2;
		if (this.balloon_1player.mouseHit(mousePos))
			option = 1;
		if (this.balloon_tutorial.mouseHit(mousePos))
			option = 0;
		
		if (this.lastMouse && (this.lastMouse.x != mousePos.x || this.lastMouse.y != mousePos.y))
		{
			//Mouse control
			this.currentOption = option;
		}
		else if (bmacSdk.INPUT.actionMenuLeft())
		{
			if (this.currentOption !== undefined)
				this.currentOption--;
			else
				this.currentOption = 2;
		}
		else if (bmacSdk.INPUT.actionMenuRight())
		{
			if (this.currentOption !== undefined)
				this.currentOption++;
			else
				this.currentOption = 0;
		}
		
		//Wrap
		if (this.currentOption > 2) this.currentOption = 0;
		else if (this.currentOption < 0) this.currentOption = 2;
		
		//Update highlights
		this.balloon_2player.setSelected(!advance && this.currentOption === 2, "but_2player","but_2player_sel");
		this.balloon_1player.setSelected(!advance && this.currentOption === 1, "but_1player","but_1player_sel");
		this.balloon_tutorial.setSelected(!advance && this.currentOption === 0, "but_tutorial","but_tutorial_sel");
		
		if (advance)
		{
			if (this.currentOption == 2)
				this.changeMode(this.MODE_2PLAYER, 3);
			else if (this.currentOption == 1)
				this.changeMode(this.MODE_1PLAYER, 4);
			else if (this.currentOption == 0)
				this.changeMode(this.MODE_TUTORIAL, 4);
		}
		
		break;
		
	case this.MODE_2PLAYER:
	case this.MODE_1PLAYER:
	case this.MODE_TUTORIAL:
		if (thegame.paused)
		{
			//control the pause menu
			var option = undefined;
			//if (this.balloon_1player.mouseHit(mousePos))
			//	option = 1;
			//if (this.balloon_tutorial.mouseHit(mousePos))
			//	option = 0;
			
			if (bmacSdk.INPUT.actionMenuCancel() || bmacSdk.INPUT.actionGamePause())
			{
				thegame.togglePause();
			}
			else if (bmacSdk.INPUT.actionMenuUp())
			{
				if (this.currentOption !== undefined)
					this.currentOption--;
				else
					this.currentOption = 1;
			}
			else if (bmacSdk.INPUT.actionMenuDown())
			{
				if (this.currentOption !== undefined)
					this.currentOption++;
				else
					this.currentOption = 0;
			}
			
			//Wrap
			if (this.currentOption > 1) this.currentOption = 0;
			else if (this.currentOption < 0) this.currentOption = 1;
			
			//Update highlights
			for (var i = 0; i < this.pauseButtons.length; i++)
			{
				if (!advance && this.currentOption === i)
					bmacSdk.GEO.setAtlasMeshKey(this.pauseButtons[i],this.pauseButtons[i].state_selected);
				else
					bmacSdk.GEO.setAtlasMeshKey(this.pauseButtons[i],this.pauseButtons[i].state_neutral);
			}
			
			if (advance)
			{
				if (this.currentOption == 0)
					this.changeMode(this.MODE_MAIN, 0);
				else if (this.currentOption == 1)
					thegame.togglePause();
			}
		}
		else
		{
			//control the in-game hud
			if (bmacSdk.INPUT.actionGamePause() && !hud.readyWait)
			{
				thegame.togglePause();
			}
		}
		break;
	}
	
	if (this.currentMode == this.MODE_TUTORIAL)
	{
		this.tutorialTimer -= bmacSdk.deltaSec;
		if (!this.tutorialTimer || this.tutorialTimer <= 0)
		{
			switch (this.tutorialPhase)
			{
			case 1:
				//timed
				this.advanceTutorial();
				break;
			case 2:
				//movement
				if (Math.abs(balloons.list[0].controlX) >= 0.7 || Math.abs(balloons.list[0].controlY) >= 0.7)
					this.advanceTutorial();
				break;
			case 3:
				//launching
				if (!balloons.list[0].porcupine.mounted)
					this.advanceTutorial();
				break;
			case 4:
				//impact enemy
				if (balloons.list[1].airjets.length > 0)
					this.advanceTutorial();
				break;
			case 5:
				//reboard
				if (balloons.list[0].porcupine.mounted)
					this.advanceTutorial();
				break;
			case 6:
				//destroy enemy
				if (balloons.list[1].respawns > 0)
					this.advanceTutorial();
				break;
			}
		}
	}
	
	this.lastMouse = mousePos;
};


GameEngine.addObject(menus);


hud = 
{
	record: [0,0],
	
	ICO_SCALEMAX: 2.2,
	ICO_SCALESPEED: 1.6,
	
	DEPTH: -12,
	
	NEEDED_TO_WIN: 6
};

hud.recordWin = function(playerIndex)
{
	if (this.gameOverTimer || this.readyWait) return;
	
	//change in new mesh
	if (this.record[playerIndex] < this.widgets[playerIndex].length)
	{
		var widget = this.widgets[playerIndex][this.record[playerIndex]];
		widget.scale.set(this.ICO_SCALEMAX, this.ICO_SCALEMAX, 1);
		bmacSdk.GEO.setAtlasMeshKey(widget,"ui_win");
	}
	
	this.record[playerIndex]++;
	if (this.record[playerIndex] >= this.NEEDED_TO_WIN)
	{
		this.gameOverTimer = 6;
		this.winner = playerIndex;
		
		this.dom_announcement.style.visibility = "visible";
		this.dom_announcement.innerHTML = "Player " + (playerIndex+1) + " wins!";
	}
};

hud.hide = function()
{
	this.show(0);
	this.divider.visible = false;
};

hud.show = function(neededToWin)
{
	if (neededToWin === undefined) neededToWin = this.NEEDED_TO_WIN;
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
				bmacSdk.GEO.setAtlasMeshKey(this.widgets[d][i],"ui_nowin");
			}
			else
			{
				this.widgets[d][i] = bmacSdk.GEO.makeAtlasMesh(thegame.atlas,"ui_nowin",true);
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

hud.showControls = function(pl)
{
	this.controlui[pl].keyboard.visible = true;
	this.controlui[pl].gamepad.visible = true;
	this.controlui[pl].ready.visible = false;
};

hud.readyKeys = function(pl)
{
	this.controlui[pl].ready.visible = true;
	this.controlui[pl].ready.position.y = 0;
};

hud.readyGamepad = function(pl)
{
	this.controlui[pl].ready.visible = true;
	this.controlui[pl].ready.position.y = 90;
};

hud.hideAllControls = function()
{
	if (!this.controlui) return;
	for (var i = 0; i < this.controlui.length; i++)
	{
		this.controlui[i].keyboard.visible = false;
		this.controlui[i].gamepad.visible = false;
		this.controlui[i].ready.visible = false;
	}
};

hud.added = function()
{
	this.dom_announcement = document.getElementById("announcement");
	
	this.controlui = [];
	for (var i = 0; i < 2; i++)
	{
		var obj = new THREE.Object3D();
		GameEngine.scene.add(obj);
		obj.position.set(GameEngine.screenWidth / 4 + i*(GameEngine.screenWidth/2), 350, -15);
		obj.keyboard = bmacSdk.GEO.makeAtlasMesh(thegame.atlas,"ctrl_keyboard"+(i+1));
		obj.add(obj.keyboard);
		obj.gamepad = bmacSdk.GEO.makeAtlasMesh(thegame.atlas,"ctrl_gamepad");
		obj.gamepad.position.set(0, 90, 0);
		obj.add(obj.gamepad);
		obj.ready = bmacSdk.GEO.makeAtlasMesh(thegame.atlas,"ready");
		obj.ready.position.set(-100 * (i*2-1), 0, 1);
		obj.add(obj.ready);
		this.controlui[i] = obj;
	}
	this.hideAllControls();
	
	this.root = new THREE.Object3D();
	this.root.position.set(GameEngine.screenWidth/2, 40, this.DEPTH);
	GameEngine.scene.add(this.root);
	
	this.divider = bmacSdk.GEO.makeAtlasMesh(thegame.atlas,"ui_divider");
	this.root.add(this.divider);
	
	this.widgets = [[],[]];
	this.hide();
};

hud.removed = function()
{
	
};

hud.update = function()
{
	//start game if all players are ready
	if (this.readyWait)
	{
		var unready = false;
		for (var i = 0; i < balloons.list.length; i++)
		{
			if (!balloons.list[i].controlScheme && !balloons.list[i].ai && balloons.list[i].playerIndex !== undefined)
				unready = true;
		}
		if (!unready)
		{
			this.readyWait = false;
			this.hideAllControls();
		}
	}
	
	//game over timer
	if (this.gameOverTimer)
	{
		this.gameOverTimer -= bmacSdk.deltaSec;
		if (this.gameOverTimer <= 0)
		{
			this.gameOverTimer = 0;
			menus.changeMode(menus.MODE_MAIN);
		}
	}
	
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
