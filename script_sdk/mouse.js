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