Math.sign = function(val)
{
	if (val < 0)
		return -1;
	else if (val > 0)
		return 1;
	else
		return 0;
}

Math.clamp = function(val, a, b)
{
	if (val < a) return a;
	if (val > b) return b;
	return val;
}

Math.randomInt = function(upperBoundExclusive)
{
	return Math.floor(Math.random() * upperBoundExclusive);
}

Math.randomRange = function(minInclusive, maxExclusive)
{
	return Math.randomInt(maxExclusive-minInclusive)+minInclusive;
}

Math.rad2Deg = function(rad)
{
	return (rad / Math.PI) * 180;
}

Math.deg2Rad = function(deg)
{
	return (deg / 180) * Math.PI;
}

//Robert Eisele
Math.angleBetween = function(n, a, b)
{
	var circle = Math.PI*2;
	n = (circle + (n % circle)) % circle;
	a = (circle*100 + a) % circle;
	b = (circle*100 + b) % circle;
	
	if (a < b)
		return a <= n && n <= b;
	return a <= n || n <= b;
}

String.prototype.trim =
	String.prototype.trim ||
	function trim()
	{
		return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	};

Array.prototype.remove =
	Array.prototype.remove ||
	function remove(object)
	{
		for (var c = 0; c < this.length; c++)
		{
			if (this[c] === object)
			{
				this.splice(c, 1);
				return;
			}
		}
	};

Array.prototype.contains =
	Array.prototype.contains ||
	function contains(object)
	{
		for (var c = 0; c < this.length; c++)
		{
			if (this[c] === object)
				return true;
		}
		return false;
	};

Vector2 = function(x, y)
{
	if (y === undefined)
	{
		this.x = x.x;
		this.y = x.y;
	}
	else
	{
		this.x = x;
		this.y = y;
	}
};

Vector2.prototype.normalize = function()
{
	var len = this.magnitude();
	this.x /= len;
	this.y /= len;
};

Vector2.prototype.normalized = function()
{
	var len = this.magnitude();
	return new Vector2(this.x / len, this.y / len);
};

Vector2.prototype.magnitude = function()
{
	return Math.sqrt(this.sqrMagnitude());
};

Vector2.prototype.sqrMagnitude = function()
{
	return this.x*this.x + this.y*this.y;
};

Vector2.prototype.rotate = function(angle)
{
	var x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
	this.y = this.x * Math.sin(angle) + this.y * Math.cos(angle);
	this.x = x;
};