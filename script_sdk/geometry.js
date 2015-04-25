
bmacSdk.GEO = 
{
	c_planeCorrection: new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI, 0, 0))
};

bmacSdk.GEO.makeSpriteMesh = function(tex, geo)
{
	var material = new THREE.MeshBasicMaterial({ map:tex, transparent:true });
	var mesh = new THREE.Mesh(geo, material);
	return mesh;
}

bmacSdk.GEO.makeSpriteGeo = function(width, height)
{
	var geo = new THREE.PlaneGeometry(width, height);
	geo.applyMatrix(bmacSdk.GEO.c_planeCorrection);
	return geo;
}

bmacSdk.GEO.distance = function(thing1, thing2)
{
	var dx = thing1.x - thing2.x;
	var dy = thing1.y - thing2.y;
	return Math.sqrt(dx*dx+dy*dy);
}

bmacSdk.GEO.loadAtlas = function(url,width,height,data)
{
	var atlas = {url:url,width:width,height:height,data:data};
	atlas.texture = THREE.ImageUtils.loadTexture(url);
	return atlas;
}

//make a sprite mesh for the given texture in the atlas
//pass dynamic if you want to be able to flip the sprite or dynamically switch its texture
bmacSdk.GEO.makeAtlasMesh = function(atlas,key,dynamic)
{
	if (atlas.data[key] === undefined)
	{
		console.error("Atlas '"+atlas.url+"' has no key '"+key+"'.");
		return null;
	}
	if (!atlas.data[key].geo)
	{
		atlas.data[key].geo = this.makeSpriteGeo(atlas.data[key][2],atlas.data[key][3]);
		this.setAtlasUVs(atlas.data[key].geo,atlas,key);
	}
	var geo = atlas.data[key].geo
	if (dynamic)
	{
		geo = geo.clone();
		geo.dynamic = true;
		geo.atlas_flipx=false;
		geo.atlas_flipy=false;
	}
	var mesh = bmacSdk.GEO.makeSpriteMesh(atlas.texture,geo);
	mesh.atlas = atlas;
	mesh.atlas_key = key;
	return mesh;
}

bmacSdk.GEO.setAtlasUVs = function(geo,atlas,key,flipX,flipY)
{
	if (!atlas)
	{
		console.error("Geometry is not atlased.");
		return;
	}
	if (atlas.data[key] === undefined)
	{
		console.error("Atlas '"+atlas.url+"' has not key '"+key+"'");
		return;
	}
	
	uvs = geo.faceVertexUvs[0];
	var l = atlas.data[key][0]/atlas.width;
	var b = (1-atlas.data[key][1]/atlas.height);
	var r = l+atlas.data[key][2]/atlas.width;
	var t = b-atlas.data[key][3]/atlas.height;
	if (geo.atlas_flipx){var temp=l;l=r;r=temp;}
	if (geo.atlas_flipy){var temp=t;t=b;b=temp;}
	uvs[0][0].set(l,b);
	uvs[0][1].set(l,t);
	uvs[0][2].set(r,b);
	uvs[1][0].set(l,t);
	uvs[1][1].set(r,t);
	uvs[1][2].set(r,b);
	geo.uvsNeedUpdate = true;
	
	verts = geo.vertices;
	
	geo.verticesNeedUpdate = true;
}

bmacSdk.GEO.setAtlasGeometry = function(geo,atlas,key,flipX,flipY)
{
	if (!atlas)
	{
		console.error("Geometry is not atlased.");
		return;
	}
	if (atlas.data[key] === undefined)
	{
		console.error("Atlas '"+atlas.url+"' has not key '"+key+"'");
		return;
	}
	this.setAtlasUVs(geo,atlas,key,flipX,flipY);
	
	var w = atlas.data[key][2]/2;
	var h = atlas.data[key][3]/2;
	verts = geo.vertices;
	verts[0].set(-w,-h,0);
	verts[1].set(w,-h,0);
	verts[2].set(-w,h,0);
	verts[3].set(w,h,0);
	geo.verticesNeedUpdate = true;
}

bmacSdk.GEO.setAtlasMeshFlip = function(mesh, flipX, flipY)
{
	if (!mesh.geometry.dynamic)
	{
		console.error("Geometry is not dynamic.");return;
	}
	if (flipX == mesh.geometry.atlas_flipx && flipY == mesh.geometry.atlas_flipy) return;
	mesh.geometry.atlas_flipx=flipX;
	mesh.geometry.atlas_flipy=flipY;
	this.setAtlasUVs(mesh.geometry,mesh.atlas,mesh.atlas_key);
}

bmacSdk.GEO.setAtlasMeshKey = function(mesh,key)
{
	if (!mesh.geometry.dynamic)
	{
		console.error("Geometry is not dynamic.");return;
	}
	if (key === mesh.atlas_key) return;
	mesh.atlas_key = key;
	this.setAtlasGeometry(mesh.geometry,mesh.atlas,mesh.atlas_key);
}
