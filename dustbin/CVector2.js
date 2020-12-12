//export {CVector2};

var CVector2 = function(x, y) 
{
  this.x = x || 0;
  this.y = y || 0;
};

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
