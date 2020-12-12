var CVector2 = function(x, y) 
{
  if (y != undefined)
  {
    this.x = parseFloat(x || 0);
    this.y = parseFloat(y || 0);
  }
  else
  {
    if (x.constructor.name == "CVector2")
    {
      this.x = x.x;
      this.y = x.y;
    }
    else
    {
      this.x = x[0];
      this.y = x[1];
    }
  }
};


function vecDist(ax, ay, bx, by)
{
  var dx = ax - bx;
  var dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}



CVector2.prototype.toJSON = function(key) 
{  
    return [this.x, this.y];    
}


CVector2.prototype.distance = function(other)
{
  var dx = this.x - other.x;
  var dy = this.y - other.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// return the angle of the vector in radians
CVector2.prototype.getDirection = function() {
    return Math.atan2(this.y, this.x);
};

// set the direction of the vector in radians
CVector2.prototype.setDirection = function(direction) {
    var magnitude = this.getMagnitude();
  this.x = Math.cos(angle) * magnitude;
  this.y = Math.sin(angle) * magnitude;
};

// get the magnitude of the vector
CVector2.prototype.getMagnitude = function() {
    // use pythagoras theorem to work out the magnitude of the vector
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

// get the magnitude of the vector
CVector2.prototype.getMagnitudeSquared = function() {
    // use pythagoras theorem to work out the magnitude of the vector
    return (this.x * this.x + this.y * this.y);
};


// set the magnitude of the vector
CVector2.prototype.setMagnitude = function(magnitude) {
    var direction = this.getDirection(); 
    this.x = Math.cos(direction) * magnitude;
    this.y = Math.sin(direction) * magnitude;
};

// add two vectors together and return a new one
CVector2.prototype.add = function(v2) {
    return new CVector2(this.x + v2.x, this.y + v2.y);
};

// add a vector to this one
CVector2.prototype.addTo = function(v2) {
    this.x += v2.x;
  this.y += v2.y;
};

// subtract two vectors and reutn a new one
CVector2.prototype.subtract = function(v2) {
    return new CVector2(this.x - v2.x, this.y - v2.y);
};

// subtract two vectors and reutn a new one
CVector2.prototype.sub = function(v2) {
    return new CVector2(this.x - v2.x, this.y - v2.y);
};


// subtract a vector from this one
CVector2.prototype.subtractFrom = function(v2) {
    this.x -= v2.x;
  this.y -= v2.y;
};

// multiply this vector by a scalar and return a new one
CVector2.prototype.multiply = function(scalar) {
  return new CVector2(this.x * scalar, this.y * scalar);
};


// multiply this vector by a scalar and return a new one
CVector2.prototype.normal = function(scalar) 
{
  var s = 1.0 / this.getMagnitude();
  return new CVector2(this.x * s, this.y * s);
};

CVector2.prototype.normalise = function(scalar) 
{
  var s = 1.0 / getMagnitude();
  x *= s;
  y *= s;
};

CVector2.prototype.dot = function(other) 
{
  return this.x * other.x + this.y * other.y;
};



// multiply this vector by a scalar and return a new one
CVector2.prototype.mul = function(scalar) {
  return new CVector2(this.x * scalar, this.y * scalar);
};

// multiply this vector by the scalar
CVector2.prototype.multiplyBy = function(scalar) {
  this.x *= scalar;
  this.y *= scalar;
};

// scale this vector by scalar and return a new Cvector2
CVector2.prototype.divide = function(scalar) {
  return new CVector2(this.x / scalar, this.y / scalar);
};

// scale this vector by scalar
CVector2.prototype.divideBy = function(scalar) {
  this.x /= scalar;
  this.y /= scalar;
};

CVector2.prototype.negate = function() 
{
  return new CVector2(-this.x, -this.y);
};


// Aliases
CVector2.prototype.getLength = CVector2.prototype.getMagnitude;
CVector2.prototype.setLength = CVector2.prototype.setMagnitude;

CVector2.prototype.getAngle = CVector2.prototype.getDirection;
CVector2.prototype.setAngle = CVector2.prototype.setDirection;

// Utilities
CVector2.prototype.copy = function() {
  return new CVector2(this.x, this.y);
};

CVector2.prototype.toString = function() {
  return 'x: ' + this.x + ', y: ' + this.y;
};

CVector2.prototype.toArray = function() {
  return [this.x, this.y];
};

CVector2.prototype.toObject = function() {
  return {x: this.x, y: this.y};
};


CVector2.prototype.toJSON = function()
{
	return {x:this.x, y:this.y};
}