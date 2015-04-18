
//Load with:
//new Audio(path)

bmacSdk.SOUND = 
{
	
};

bmacSdk.SOUND.playSound = function(snd)
{
	snd.currentPosition = 0;
	snd.play();
}