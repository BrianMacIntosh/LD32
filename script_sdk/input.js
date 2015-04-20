//Position tracking
var MOUSEPOS = { x: 0, y: 0 };
var MOUSEPOSREL = function(element)
{
	//Find global position of element
	var elemX = element.offsetLeft;
	var elemY = element.offsetTop;
	while (element = element.offsetParent)
	{
		elemX += element.offsetLeft;
		elemY += element.offsetTop;
	}
	
	var vec = {};
	vec.x = MOUSEPOS.x - elemX;
	vec.y = MOUSEPOS.y - elemY;
	return vec;
};
document.onmousemove = function(e)
{
	e = e || window.event;
	MOUSEPOS.x = e.pageX;
	MOUSEPOS.y = e.pageY;
};
document.ondragover = function(e)
{
	e = e || window.event;
	MOUSEPOS.x = e.pageX,
	MOUSEPOS.y = e.pageY;
}

//Creatable object for tracking clicks on an element
var MOUSEMON = function(elem)
{
	this.mouseUp = [0, 0, 0];
	this.mouseDown = [0, 0, 0];
	this.mouseUpNew = [0, 0, 0];
	this.mouseDownNew = [0, 0, 0];
	var thisup = this;
	elem.onmousedown = function(e)
	{
		var but = e.which || e.keyCode;
		thisup.mouseDown[but] = 1;
		thisup.mouseDownNew[but] = 1;
		thisup.mouseUp[but] = 0;
	}
	document.onmouseup = function(e)
	{
		var but = e.which || e.keyCode;
		thisup.mouseUp[but] = 1;
		thisup.mouseUpNew[but] = 1;
		thisup.mouseDown[but] = 0;
	}
	this.resetMouseNew = function()
	{
		for (var i in this.mouseUpNew)
		{
			this.mouseUpNew[i] = 0;
			this.mouseDownNew[i] = 0;
		}
	}
}

bmacSdk.INPUT = 
{
	STICK_THRESHOLD: 0.3,
	DEAD_ZONE: 0.15,
	
	GB_A: 0,
	GB_B: 1,
	GB_X: 2,
	GB_Y: 3,
	GB_LEFTSHOLDER: 4,
	GB_RIGHTSHOULDER: 5,
	GB_LEFTTRIGGER: 6,
	GB_RIGHTTRIGGER: 7,
	GB_BACK: 8,
	GB_START: 9,
	GB_LEFTSTICK: 10,
	GB_RIGHTSTICK: 11,
	GB_DPAD_UP: 12,
	GB_DPAD_DOWN: 13,
	GB_DPAD_LEFT: 14,
	GB_DPAD_RIGHT: 15,
	GB_HOME: 16,
	
	GA_LEFTSTICK_X: 0,
	GA_LEFTSTICK_Y: 1,
	GA_RIGHTSTICK_X: 2,
	GA_RIGHTSTICK_Y: 3,
	
	FIRST_PLAYER: 0, //TODO: dynamic
};

bmacSdk.INPUT.actionMenuLeft = function()
{
	return GameEngine.keyboard.keyPressed("left") || GameEngine.keyboard.keyPressed("a")
		|| this.gamepadAxisPressed(this.FIRST_PLAYER, this.GA_LEFTSTICK_X) < 0
		|| this.gamepadButtonPressed(this.FIRST_PLAYER, this.GB_DPAD_LEFT);
}

bmacSdk.INPUT.actionMenuRight = function()
{
	return GameEngine.keyboard.keyPressed("right") || GameEngine.keyboard.keyPressed("d")
		|| this.gamepadAxisPressed(this.FIRST_PLAYER, this.GA_LEFTSTICK_X) > 0
		|| this.gamepadButtonPressed(this.FIRST_PLAYER, this.GB_DPAD_RIGHT);
}

bmacSdk.INPUT.actionMenuUp = function()
{
	return GameEngine.keyboard.keyPressed("up") || GameEngine.keyboard.keyPressed("w")
		|| this.gamepadAxisPressed(this.FIRST_PLAYER, this.GA_LEFTSTICK_Y) < 0
		|| this.gamepadButtonPressed(this.FIRST_PLAYER, this.GB_DPAD_UP);
}

bmacSdk.INPUT.actionMenuDown = function()
{
	return GameEngine.keyboard.keyPressed("down") || GameEngine.keyboard.keyPressed("s")
		|| this.gamepadAxisPressed(this.FIRST_PLAYER, this.GA_LEFTSTICK_Y) > 0
		|| this.gamepadButtonPressed(this.FIRST_PLAYER, this.GB_DPAD_DOWN);
}

bmacSdk.INPUT.actionMenuAccept = function()
{
	return GameEngine.keyboard.keyPressed("space") || GameEngine.keyboard.keyPressed("return")
		|| this.gamepadButtonPressed(this.FIRST_PLAYER, this.GB_A)
		|| GameEngine.mouse.mouseUpNew[1];
}

bmacSdk.INPUT.actionMenuCancel = function()
{
	return GameEngine.keyboard.keyPressed("escape") || this.gamepadButtonPressed(this.FIRST_PLAYER, this.GB_B);
}

bmacSdk.INPUT.actionGamePause = function()
{
	return GameEngine.keyboard.keyPressed("escape") || this.gamepadButtonPressed(this.FIRST_PLAYER, this.GB_START);
}

bmacSdk.INPUT.getGamepad = function(gamepad)
{
	if (this.gamepads && this.gamepads[gamepad])
		return this.gamepads[gamepad];
	else
		return null;
};

bmacSdk.INPUT.gamepadExists = function(gamepad)
{
	if (this.gamepads && this.gamepads[gamepad])
		return true;
	else
		return false;
};

bmacSdk.INPUT.gamepadConnected = function(gamepad)
{
	if (this.gamepads && this.gamepads[gamepad] && this.gamepads[gamepad].connected)
		return true;
	else
		return false;
};

bmacSdk.INPUT.gamepadButtonPressed = function(gamepad, button)
{
	return this.gamepadButtonDown(gamepad, button) && !this.gamepadButtonDownOld(gamepad, button);
};

bmacSdk.INPUT.gamepadButtonReleased = function(gamepad, button)
{
	return this.gamepadButtonUp(gamepad, button) && !this.gamepadButtonUpOld(gamepad, button);
};

bmacSdk.INPUT.gamepadButtonUp = function(gamepad, button)
{
	if (this.gamepads && this.gamepads[gamepad] && this.gamepads[gamepad].buttons.length > button)
		return !this.gamepads[gamepad].buttons[button].pressed;
	else
		return false;
};

bmacSdk.INPUT.gamepadButtonDown = function(gamepad, button)
{
	if (this.gamepads && this.gamepads[gamepad] && this.gamepads[gamepad].buttons.length > button)
		return this.gamepads[gamepad].buttons[button].pressed;
	else
		return false;
};

bmacSdk.INPUT.gamepadButtonUpOld = function(gamepad, button)
{
	if (this.oldGamepads && this.oldGamepads[gamepad] && this.oldGamepads[gamepad].buttons.length > button)
		return !this.oldGamepads[gamepad].buttons[button].pressed;
	else
		return false;
};

bmacSdk.INPUT.gamepadButtonDownOld = function(gamepad, button)
{
	if (this.oldGamepads && this.oldGamepads[gamepad] && this.oldGamepads[gamepad].buttons.length > button)
		return this.oldGamepads[gamepad].buttons[button].pressed;
	else
		return false;
};

bmacSdk.INPUT.gamepadButtonValue = function(gamepad, button)
{
	if (this.gamepads && this.gamepads[gamepad] && this.gamepads[gamepad].buttons.length > button)
		return this.gamepads[gamepad].buttons[button].value;
	else
		return 0;
};

bmacSdk.INPUT.gamepadAxis = function(gamepad, axis)
{
	if (this.gamepads && this.gamepads[gamepad] && this.gamepads[gamepad].axes.length > axis)
	{
		var val = this.gamepads[gamepad].axes[axis];
		if (Math.abs(val) <= this.DEAD_ZONE) val = 0;
		return val;
	}
	else
		return 0;
};

bmacSdk.INPUT.gamepadOldAxis = function(gamepad, axis)
{
	if (this.oldGamepads && this.oldGamepads[gamepad] && this.oldGamepads[gamepad].axes.length > axis)
	{
		var val = this.oldGamepads[gamepad].axes[axis];
		if (Math.abs(val) <= this.DEAD_ZONE) val = 0;
		return val;
	}
	else
		return 0;
};

bmacSdk.INPUT.gamepadAxisPressed = function(gamepad, axis)
{
	if (this.gamepadOldAxis(gamepad, axis) < this.STICK_THRESHOLD && this.gamepadAxis(gamepad, axis) >= this.STICK_THRESHOLD)
		return 1;
	else if (this.gamepadOldAxis(gamepad, axis) > -this.STICK_THRESHOLD && this.gamepadAxis(gamepad, axis) <= -this.STICK_THRESHOLD)
		return -1;
	else
		return 0;
};

bmacSdk.INPUT.cloneGamepadState = function(source)
{
	if (!source) return null;
	
	var target = [];
	target.length = source.length;
	for (var i = 0; i < source.length; i++)
	{
		if (source[i])
		{
			var gamepad = source[i];
			var state = {};
			state.buttons = [];
			state.buttons.length = gamepad.buttons.length;
			state.axes = gamepad.axes.splice(0);
			for (var b = 0; b < gamepad.buttons.length; b++)
			{
				var obj = {pressed:gamepad.buttons[b].pressed, value:gamepad.buttons[b].value};
				state.buttons[b] = obj;
			}
			target[i] = state;
		}
		else
		{
			target[i] = null;
		}
	}
	return target;
}

bmacSdk.INPUT.update = function()
{
	if (navigator && navigator.getGamepads)
	{
		//TODO: so much garbage
		this.oldGamepads = this.cloneGamepadState(this.gamepads);
		this.gamepads = this.cloneGamepadState(navigator.getGamepads());
	}
	else
	{
		this.oldGamepads = undefined;
		this.gamepads = undefined;
	}
}