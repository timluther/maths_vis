
function Bound(v, a, b)
{
    return v < a ? a : v > b ? b : v;
}


function lengthOf(x, y) 
{
    return Math.sqrt(x * x + y * y);
}

function lengthOfLngLat(lngLat) 
{
    return lengthOf(lngLat.lng, lngLat.lat);
}

function distBetween(a, b) 
{
    return lengthOf(b[0] - a[0], b[1] - a[1]);
}

function vecSub2(a,b)
{
    return [b[0]-a[0],b[1]-a[1]];
}

function vecMul2(a,b)
{
    return [a[0] * b, a[1] * b];
}

function vecNormalise2(a)
{
    var l = lengthOf(a[0],a[1]);
    if (l != 0)
    {
        var r = 1.0 / l;
        return [a[0] * r, a[1] * r];
    }
    return a;
}

function lerpVec2(a,b,d)
{
    return [a[0] + (b[0] - a[0]) * d, a[1] + (b[1] - a[1]) * d];
}

function vecLengthSquared(a,b)
{
    var v = vecSub2(b,a);
    return v[0] * v[0] + v[1] * v[1];
}

function compareVecs(v1, v2) 
{
    return (v1[0] == v2[0]) && (v1[1] == v2[1]);
}

function isEpsilon(number, eps = 1e-10)
{
  if(Math.abs(number) < eps)
    return true;
  else
    false;
}


function FindClosestPointV(v1, v2, pt)
{
    var d = v2.sub(v1);
    var pd = pt.sub(v1);
    var det = (d.x * d.x + d.y * d.y);
    if (det == 0.0)
        return v1;
    var u = Bound((pd.x * d.x + pd.y * d.y) / det, 0.0, 1.0);
    return v1.add(d.mul(u));
}


function FindClosestPointA(v1, v2, pt)
{
    var d = [v2[0] - v1[0], v2[1] - v1[1]];
    var pd = [pt[0] - v1[0],pt[1] - v1[1]] ;
    var det = (d[0] * d[0] + d[1] * d[1]);
    if (det == 0.0)
        return v1;
    var u = Bound((pd[0] * d[0] + pd[1] * d[1]) / det, 0.0, 1.0);
    return [v1[0] + (d[0] * u), v1[1] + (d[1] * u)];
}

function FindClosestPoint(v1, v2, pt)
{
    if (v1.constructor.name == "CVector2")    
        return FindClosestPointV(v1, v2, pt);    
    else
        return FindClosestPointA(v1, v2, pt);
}

function DistanceFromLineSquaredV(v1, v2, pt)
{
    return pt.sub(FindClosestPointV(v1, v2, pt)).getMagnitudeSquared();
}

function DistanceFromLineSquared(v1, v2, pt)
{
    var cpt = FindClosestPoint(v1, v2, pt);
    var vec = [pt[0] - cpt[0], pt[1] - cpt[1]];
    return vec[0] * vec[0] + vec[1] * vec[1];
}

function AbsDistanceFromLineSquared(v1, v2, pt)
{
	return Math.abs((pt.sub(FindClosestPoint(v1, v2, pt))).getMagnitudeSquared());
}

function ensureVector2(v)
{
    return (v.constructor.name == "CVector2") ? v : new CVector2(v[0], v[1]);         
}

function DistanceFromLineSquared(v1, v2, pt)
{    
    pt = ensureVector2(pt);
	return (pt.sub(FindClosestPointV(ensureVector2(v1), ensureVector2(v2), pt))).getMagnitudeSquared();
}

function DistanceFromLineSquaredV(v1, v2, pt)
{        
	return pt.sub(FindClosestPointV(v1, v2, pt)).getMagnitudeSquared();
}

function DistanceFromLineV(V1, V2, Pt)
{
	return Math.sqrt(DistanceFromLineSquaredV(V1, V2, Pt));
}

function DistanceFromLine(V1, V2, Pt)
{
	return Math.sqrt(DistanceFromLineSquared(V1, V2, Pt));
}

function isPointLeftOfRay(v1, v2, pt ) 
{
	return (pt.y - v1.y)*(v2.x- v1.x) >= (pt.x - v1.x)*(v2.y- v1.y);
}

class CLineEq
{

    constructor(a_,b_)
    {
        this.m = 0;
        this.d = 0;
      
        if (a_[1] > b_[1])
        {
            this.a = b_;
            this.b = a_;
        }
        else
        {
            this.a = a_;
            this.b = b_;
        }
        if (this.a[0] != this.b[0])
            this.m = (this.b[1] - this.a[1]) / (this.b[0] - this.a[0]);
        else
            this.m = 0;

        this.vec = vecSub2(this.b,this.a);
        this.lensq = (this.vec[0] * this.vec[0] + this.vec[1] * this.vec[1]);
        this.det = (this.vec[0] * this.vec[0] + this.vec[1] * this.vec[1]);

        this.d = -this.m * this.a[0] + this.a[1];
    }

    closestPt(pt)
    {
       var d = this.vec;//[this.b[0] - this.a[0], this.b[1] - this.a[1]];
        var pd = [pt[0] - this.a[0],pt[1] - this.a[1]] ;
        
        if (this.det == 0.0)
            return this.a;
        var u = Bound((pd[0] * d[0] + pd[1] * d[1]) / this.det, 0.0, 1.0);
        return [this.a[0] + (d[0] * u), this.a[1] + (d[1] * u)];
    }

    closestPtUnclamped(pt)
    {
        var d = this.vec;//
        var pd = [pt[0] - this.a[0],pt[1] - this.a[1]] ;
        if (this.det == 0.0)
            return this.a;
        var u = (pd[0] * d[0] + pd[1] * d[1]) / this.det;
        return [this.a[0] + (d[0] * u), this.a[1] + (d[1] * u)];
    }

    distanceSquaredUnclamped(pt)
    {
        var cpit = this.closestPtUnclamped(pt);
        return vecLengthSquared(cpit,pt);
    }

    distanceUnclamped(pt)
    {        
        return Math.sqrt(this.distanceSquaredUnclamped(pt));
    }

    distanceSquared(pt)
    {
        var cpit = this.closestPt(pt);
        return vecLengthSquared(cpit,pt);
    }

    distance(pt)
    {        
        return Math.sqrt(distanceSquared(pt));
    }
    

    linePos(pt)
    {
        var pd = vecSub2(pt, this.a);
        if (this.lensq == 0.0)
            return this.a;
        var u = (pd[0] * this.vec[0] + pd[1] * this.vec[1]) / this.lensq;
        return u;
    }
    
    solveY(y, func)
    {
        if ((y >= a[1]) && (y < b[1]))
        {
            func((a[0] == b[0]) ? a[0] : (d - y) / -m);            
            return true;
        }
        else
            return false;
    }
    
};

