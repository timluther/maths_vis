var CRect = function(x, y, w, h) 
{
	this.x = x || 0;
	this.y = y || 0;
	this.w = w || 0;
	this.h = h || 0;

};

Object.defineProperty(CRect.prototype, 'x2',
{
	get:function(){return this.x + this.w;},
	set:function(x2){ this.w = x2 - this.x;}    
});


Object.defineProperty(CRect.prototype, 'y2',
{
	get:function(){return this.y + this.h;},
	set:function(y2){ this.h = y2 - this.y;}
});


CRect.prototype.setx2 = function(x2)
{
	this.w = x2 - this.x;
}

CRect.prototype.sety2 = function(y2)
{
	this.h = y2 - this.y;
}

CRect.prototype.resetForMerge = function(other)
{
	this.x = 100000;
	this.y = 100000;
	this.x2 = -100000;
	this.y2 = -100000;
}

CRect.prototype.merge = function(other)
{	
	var x2 = this.x + this.w;
	var y2 = this.y + this.h;
	if (other.x < this.x)
		this.x = other.x;
	if (other.y < this.y)
		this.y = other.y;
	if (other.x2 > x2)
	{
		var newX2 = other.x2;
		this.w = newX2 - this.x;
	}
	
	if (other.y2 > y2)
	{
		var newY2 = other.y2;
		this.h = newY2 - this.y;
		
	}
	
}

CRect.prototype.getDimensions = function()
{
	return new CVector2(this.w, this.h);
}

CRect.prototype.getCentre = function()
{
	return new CVector2(this.x + this.w / 2,this.y + this.h / 2);
}

CRect.prototype.toJSON = function()
{
	return {x:this.x, y:this.y, w:this.w, h:this.h};
}

CRect.prototype.DistanceFrom = function( pt )
{
	//TODO: this
	var p0 = new CVector2(this.x, this.y);
	var p1 = new CVector2(this.x + this.w, this.y);
	var p2 = new CVector2(this.x + this.w, this.y + this.h);
	var p3 = new CVector2(this.x, this.y + this.h);
	var d0 = DistanceFromLine(p0,p1, pt);
	var d1 = DistanceFromLine(p1,p2, pt);
	var d2 = DistanceFromLine(p2,p3, pt);
	var d3 = DistanceFromLine(p3,p0, pt);
	/*console.log("point: " + pt.x.toString() + " , " + pt.y.toString());
	console.log("rect: " + p0.x.toString() + " , " + p0.y.toString() + ", " + p2.x.toString() + " , " + p2.y.toString());
	console.log("dists: " + d0.toString() + ", " + d1.toString() + ", " + d2.toString() + ", " + d3.toString());*/
	return Math.min(Math.min(d0,d1),
					Math.min(d2,d3));
							
}