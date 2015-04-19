
var AudioManager = function()
{
	this.enabled = true;
	
	this.pool = {};
}

AUDIOMANAGER = new AudioManager();

var audibleRange = 800;
var dropoffRange = 350;

var soundEndCallback = function(clip, url)
{
	return function(event)
	{
		if (!AUDIOMANAGER.pool[url])
			AUDIOMANAGER.pool[url] = [];
		AUDIOMANAGER.pool[url].push(clip);
	}
}

AudioManager.prototype.setListener = function(position)
{
	this.listener = position;
}

//TODO: update volume on frame
AudioManager.prototype.updateVolume = function(clip)
{
	//Do ranges
	if (clip.position && this.listener)
	{
		var dist = clip.position.subtracted(this.listener).lengthSq();
		if (dist < audibleRange * audibleRange)
		{
			if (dist < dropoffRange * dropoffRange)
				clip.volume = 1;
			else
				clip.volume = 1 - (Math.sqrt(dist) - dropoffRange) / (audibleRange-dropoffRange);
		}
		else
			clip.volume = 0;
	}
	else
		clip.volume = 1;
}

AudioManager.prototype.preloadSound = function(url)
{
	if (url instanceof Array)
	{
		for (var c = 0; c < url.length; c++)
			this.preloadSound(url[c]);
	}
	else
		soundEndCallback(new Audio(url), url);
}

/// Returns the Audio object being used
AudioManager.prototype.playSound = function(url, vol)
{
	if (!this.enabled) return;
	
	if (url instanceof Array)
		url = url[Math.floor(Math.random() * url.length)];
	
	if (this.pool[url] && this.pool[url].length > 0)
	{
		//Use a pooled clip
		var last = this.pool[url].length-1;
		var clip = this.pool[url][last];
		clip.currentTime = 0;
		clip.volume = vol || 1.0;
		clip.playbackRate = 1.0;
		this.pool[url].length = last;
	}
	else
	{
		//Make a new clip
		var clip = new Audio(url);
		clip.volume = vol || 1.0;
		clip.addEventListener("ended", soundEndCallback(clip, url));
	}
	clip.play();
	return clip;
}