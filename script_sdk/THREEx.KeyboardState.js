/** @namespace */
var THREEx = THREEx || {};


THREEx.KeyboardState	= function()
{
	this.keysDown = {};
	this.modifiers = {};
	
	this.keysPressed = {};
	this.keysReleased = {};
	this.keysPressedBuffer = {};
	this.keysReleasedBuffer = {};
	
	// create callback to bind/unbind keyboard events
	var self = this;
	this._onKeyDown = function(event){ self._onKeyChange(event, true); };
	this._onKeyUp = function(event){ self._onKeyChange(event, false);};

	// bind keyEvents
	document.addEventListener("keydown", this._onKeyDown, false);
	document.addEventListener("keyup", this._onKeyUp, false);
}

THREEx.KeyboardState.prototype.destroy	= function()
{
	// unbind keyEvents
	document.removeEventListener("keydown", this._onKeyDown, false);
	document.removeEventListener("keyup", this._onKeyUp, false);
}

THREEx.KeyboardState.MODIFIERS	= ['shift', 'ctrl', 'alt', 'meta'];
THREEx.KeyboardState.ALIAS	= {
	'left'		: 37,
	'up'		: 38,
	'right'		: 39,
	'down'		: 40,
	'space'		: 32,
	'pageup'	: 33,
	'pagedown'	: 34,
	'tab'		: 9,
	'escape'	: 27,
	'return'	: 13
};

THREEx.KeyboardState.prototype.update = function()
{
	//Cycle stored keypresses
	this.keysPressed = this.keysPressedBuffer;
	this.keysPressedBuffer = {}; //HACK:garbage
	this.keysReleased = this.keysReleasedBuffer;
	this.keysReleasedBuffer = {};
}

THREEx.KeyboardState.prototype._onKeyChange = function(event, pressed)
{
	var keyCode = event.keyCode;
	
	if (pressed)
		this.keysPressedBuffer[keyCode] = true;
	else
		this.keysReleasedBuffer[keyCode] = true;
	
	this.keysDown[keyCode] = pressed;
	
	this.modifiers['shift'] = event.shiftKey;
	this.modifiers['ctrl'] = event.ctrlKey;
	this.modifiers['alt'] = event.altKey;
	this.modifiers['meta'] = event.metaKey;
}

THREEx.KeyboardState.prototype.keyPressed = function(keyDesc)
{
	var keys = keyDesc.split("+");
	for(var i = 0; i < keys.length; i++)
	{
		var key = keys[i];
		var pressed;
		if ( THREEx.KeyboardState.MODIFIERS.indexOf( key ) !== -1 )
			pressed = this.modifiers[key];
		else if ( Object.keys(THREEx.KeyboardState.ALIAS).indexOf( key ) != -1 )
			pressed = this.keysPressed[ THREEx.KeyboardState.ALIAS[key] ];
		else
			pressed = this.keysPressed[key.toUpperCase().charCodeAt(0)]
		if (!pressed) return false;
	};
	return true;
}

THREEx.KeyboardState.prototype.keyDown = function(keyDesc)
{
	var keys = keyDesc.split("+");
	for(var i = 0; i < keys.length; i++)
	{
		var key = keys[i];
		var pressed;
		if ( THREEx.KeyboardState.MODIFIERS.indexOf( key ) !== -1 )
			pressed	= this.modifiers[key];
		else if ( Object.keys(THREEx.KeyboardState.ALIAS).indexOf( key ) != -1 )
			pressed	= this.keysDown[ THREEx.KeyboardState.ALIAS[key] ];
		else
			pressed	= this.keysDown[key.toUpperCase().charCodeAt(0)]
		if (!pressed) return false;
	};
	return true;
}
