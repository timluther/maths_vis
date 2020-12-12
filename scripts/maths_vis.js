import {CScene, getActiveScene} from './CScene.js';


export { calculateMatrices, getMatrixValuesFromText, multiplyMatrices, ensureVector, drawCross, CLineEq,CBaseShape, CQuadraticCurve, CGrid, CPolygonShape, CExponentialCurve};
/*jshint esversion: 6 */
var dataFlows = null;
var responseDataFlows = null;
var dataFlowCodeToIdx = null;
var dataDatabase = null;
var dataDataCodeToIndex = null;

var flowTable = null;
var gDrawIDs = false;


var gFlowVis = null;

function getMatrixValuesFromText(matrixString)
{
	var rows = matrixString.split("\n");
	var ret_matrix = [];
	for (var rowi = 0; rowi < rows.length; rowi++)
	{
		var row = rows[rowi];
		var row_vals = [];
		var cells = row.split(",");
		if (cells.length > 1)
		{
			for (var celli = 0; celli < cells.length; celli++)
			{
				var val = cells[celli].trim();			
				/*if (!isNaN(val))
					console.log(val.toString() + " is a number");
				else
					console.log(val.toString() + " is not a number");*/
				row_vals.push(val);
			
			}
			ret_matrix.push(row_vals);
		}
	}
	return ret_matrix;
}


/*
tempMat.mat[0][0] = (mat[0][0] * matb[0][0]) + (mat[1][0] * matb[0][1]) + (mat[2][0] * matb[0][2]) + (mat[3][0] * matb[0][3]);
tempMat.mat[1][0] = (mat[0][0] * matb[1][0]) + (mat[1][0] * matb[1][1]) + (mat[2][0] * matb[1][2]) + (mat[3][0] * matb[1][3]);
tempMat.mat[2][0] = (mat[0][0] * matb[2][0]) + (mat[1][0] * matb[2][1]) + (mat[2][0] * matb[2][2]) + (mat[3][0] * matb[2][3]);
tempMat.mat[3][0] = (mat[0][0] * matb[3][0]) + (mat[1][0] * matb[3][1]) + (mat[2][0] * matb[3][2]) + (mat[3][0] * matb[3][3]);
tempMat.mat[0][1] = (mat[0][1] * matb[0][0]) + (mat[1][1] * matb[0][1]) + (mat[2][1] * matb[0][2]) + (mat[3][1] * matb[0][3]);
tempMat.mat[1][1] = (mat[0][1] * matb[1][0]) + (mat[1][1] * matb[1][1]) + (mat[2][1] * matb[1][2]) + (mat[3][1] * matb[1][3]);
tempMat.mat[2][1] = (mat[0][1] * matb[2][0]) + (mat[1][1] * matb[2][1]) + (mat[2][1] * matb[2][2]) + (mat[3][1] * matb[2][3]);
tempMat.mat[3][1] = (mat[0][1] * matb[3][0]) + (mat[1][1] * matb[3][1]) + (mat[2][1] * matb[3][2]) + (mat[3][1] * matb[3][3]);
tempMat.mat[0][2] = (mat[0][2] * matb[0][0]) + (mat[1][2] * matb[0][1]) + (mat[2][2] * matb[0][2]) + (mat[3][2] * matb[0][3]);
tempMat.mat[1][2] = (mat[0][2] * matb[1][0]) + (mat[1][2] * matb[1][1]) + (mat[2][2] * matb[1][2]) + (mat[3][2] * matb[1][3]);
tempMat.mat[2][2] = (mat[0][2] * matb[2][0]) + (mat[1][2] * matb[2][1]) + (mat[2][2] * matb[2][2]) + (mat[3][2] * matb[2][3]);
tempMat.mat[3][2] = (mat[0][2] * matb[3][0]) + (mat[1][2] * matb[3][1]) + (mat[2][2] * matb[3][2]) + (mat[3][2] * matb[3][3]);
tempMat.mat[0][3] = (mat[0][3] * matb[0][0]) + (mat[1][3] * matb[0][1]) + (mat[2][3] * matb[0][2]) + (mat[3][3] * matb[0][3]);
tempMat.mat[1][3] = (mat[0][3] * matb[1][0]) + (mat[1][3] * matb[1][1]) + (mat[2][3] * matb[1][2]) + (mat[3][3] * matb[1][3]);
tempMat.mat[2][3] = (mat[0][3] * matb[2][0]) + (mat[1][3] * matb[2][1]) + (mat[2][3] * matb[2][2]) + (mat[3][3] * matb[2][3]);
tempMat.mat[3][3] = (mat[0][3] * matb[3][0]) + (mat[1][3] * matb[3][1]) + (mat[2][3] * matb[3][2]) + (mat[3][3] * matb[3][3]);
*/




 function multiplyMatrices(mata, matb)
{
	var output = [];
	for (var i = 0; i < mata.length; ++i)
	{
		var row = [];
		for (var j = 0; j < mata[i].length; ++j)
		{
			var v = 0;
			for (var k = 0; k < matb[i].length; ++k)
			{
				var va = mata[i][j];
				var vb = matb[k][j];				
				if (isNaN(va) || isNaN(vb))
				{
					if ((va != "0") && (vb != "0"))
					{
						var vr = ""
						if (va == "1")
							vr = vb;
						else if (vb == "1")
							vr = va;
						else
							vr = va + " * " + vb;					
						if (v == "0")
							v = vr.toString();
						else
							v = v + " + " + vr.toString();
					}
				}
				else
				{
					var vr = parseFloat(va) * parseFloat(vb);
					if (isNaN(v))					
					{					
						if (vr != 0.0)
							v = v + " + " + vr.toString();
						else
							v = vr.toString();
					}						
					else
						v = v + vr;
				}
			}
			row.push(v);
		}
		output.push(row);
	}
	return output;
}


function matrixToString(mat)
{
	var res = "";
	for (var i = 0; i < mat.length; ++i)
	{
		
		for (var j = 0; j < mat[i].length - 1;++j)
		{
			res += mat[i][j] + ", ";
		}
		res += mat[i][mat[i].length-1] + "\n";
	}
	return res;
}

function calculateMatrices()
{
	var matrix_a_ta = $("#matrixA");
	var matrix_b_ta = $("#matrixB");

	var matrix_a = getMatrixValuesFromText(matrix_a_ta.val());
	var matrix_b = getMatrixValuesFromText(matrix_b_ta.val());

	console.log(matrix_a);
	console.log(matrix_b);

	var result = multiplyMatrices(matrix_a, matrix_b);

	var resultHolder = $("#result");


	resultHolder.html(matrixToString(result));

}


function ensureVector(pt)
{
	if (pt.hasOwnProperty('x'))	
		return pt;
	else
		return new CVector2(pt[0], pt[1]);
}

function drawCross(ctx, x, y, size)
{
	ctx.beginPath();
	ctx.moveTo(x - size, y - size);
	ctx.lineTo(x + size, y + size);
	ctx.moveTo(x - size, y + size);
	ctx.lineTo(x + size, y - size);
	ctx.stroke();
}


 class CLineEq
{
	constructor(a,b)
	{
		if (a.y > b.y)
		{
			this.a = b;
			this.b = a;	
		}
		else
		{
			this.a = a;
			this.b = b;	
		}
		this.m = (this.b.y - this.a.y) / (this.b.x - this.a.x);
		this.d = -this.m * this.a.x + this.a.y;
	}
	
	withinY(y)
	{
		return (y >= this.a.y) && (y< this.b.y);
	}

	solveY(y)
	{		
		return (this.a.x == this.b.x) ? this.a.x : (this.d - y) / -this.m;		
	}
}

function solveQuadratic(y, a,b, c)
{
	c-=y;
	
	
	var d = 2 * a;
	if (d == 0.0)
		return undefined;
	var det = Math.sqrt((b * b) - (4 * a * c));
	if (isNaN(det))
	    return undefined;
	return [(-b - det)/d,(-b + det)/d];
}


function ConicBezierInterpolate(p0, p1, p2, t)
{
	var oot = (1 - t);
	return  oot * oot * p0 + 2 * (oot)*t*p1 + (t*t)*p2;
}


export default class CCurveEq
{
	constructor(a, ctrl, b)
	{
		if (a.y > b.y)
		{
			this.a = b;
			this.b = a;	
		}
		else
		{
			this.a = a;
			this.b = b;	
		}
		this.ctrl = ctrl;
	}

	withinY(y)
	{
		return true;
	}
		
	solveY(y, intersections)
	{
		//t = (1 - b + sqrt(x + c *x + 2 * b * x + 2 * a * b + b *b - c - c*a- a))/ 1+ c -2*b
		var a = this.a.y;
		var b = this.ctrl.y;
		var c = this.b.y;
		//var upper = Math.sqrt(y + c *y + 2 * b * y + 2 * a * b + b *b - c - c*a- a);

		//var lower = 1+ c -2 * b;
		var upper = Math.sqrt(a*y + c*y - 2*b*y + b * b - a*c);
		var lower  = a - 2 *b + c
		if (lower != 0)
		{
			var t1 =  (a-b - upper) /lower;
			var t2 =  (a-b + upper) /lower;

			if (t1 >= 0 && t1 < 1)
				intersections.push(ConicBezierInterpolate(this.a.x, this.ctrl.x, this.b.x, t1));
			if (t2 >= 0 && t2 < 1)
				intersections.push(ConicBezierInterpolate(this.a.x, this.ctrl.x, this.b.x, t2));
		}

	}
}

//solution to equation of lines where 'm1' & 'm2' are slopes and 'b1' * 'b'2 are the x position where the line intersects the 0 yaxis
function solveLines( l1, l2)
{
	if (l2.a.x == l2.b.x)
		return l2.a.x;
	else
		return (l2.d - l1.d) / (l1.m - l2.m);
}

export class CIntersector
{
	constructor()
	{
		this.ypos = 0;
		this.intersections = [];
	}

	render(ctx)
	{

		ctx.beginPath();
		ctx.strokeStyle = "#FF220077";
		ctx.lineWidth = 2.5;
		ctx.moveTo(-1000,this.ypos);
		ctx.lineTo(1000,this.ypos);
		ctx.stroke();
		ctx.strokeStyle = "#FF2200EE";
		this.calcIntersections();
		if (this.intersections.length > 0)
		{
			ctx.fillText(0, this.ypos, this.intersections.length.toString() + " intersections");
			for (var i = 0; i < this.intersections.length; ++i)
			{
				drawCross(ctx,this.intersections[i], this.ypos, 5.0);
			}
		}
	}

	mouseMove(e)
	{
		var scene = e.scene;
		var mousePos = e.worldSpaceMousePos;
		this.ypos = mousePos.y;
		
		scene.invalidate();		
	}

	calcIntersections()
	{
		var scene = this.parentLayer.scene;
		this.intersections = [];
		var obs = scene.layers[0].shapes;
		var hleq = new CLineEq(new CVector2(-10000, this.ypos), new CVector2(10000, this.ypos));
		for (var i = 0; i < obs.length; ++i) {
			var ob = obs[i];
			if (ob)
			{
			    var objt = ob.__proto__.constructor.name;
			    if (ob.intersection !== undefined && typeof ob.intersection == 'function') {
				    var inarray = ob.intersection(this.ypos);
				    this.intersections = this.intersections.concat(inarray);
			    }
			}
		}
	}

	mouseEnter()
	{

	}

	mouseLeave()
	{
		
	}


	alwaysVisible() {
		return true;
	}

	onInsertion(scene) {

	}

	pointInside() {
		return true;
	}
}

const PT_ONCURVE = 0;
const PT_CTRLPT = 1;


function quadraticEval(x, a,b,c)
{
	return (a*x*x) + (b*x) + c;
}

class CBaseShape
{
	mouseEnter()
	{
	}

	mouseLeave()
	{
		
	}

	alwaysVisible()
	{
		return false;
	}

	onInsertion(scene)
	{

	}

	pointInside()
	{
		return false;
	}

	invalidate()
	{
		var scene = getActiveScene();
		scene.invalidate();
	}
}


function deNaNPos(v)
{
	return isNan(v) ? infinity : v;
}

function deNaNNeg(v) {
	return isNan(v) ? -infinity : v;
}

class CFunctionEvaluatorBase extends CBaseShape
{
	constructor(steps=10)
	{		
		super();
		this.colour = "#002244DD";
		this.position = new CVector2(0,0);
		
		
		this.numsteps = steps;
		this.lineWidth = 2;
		
		this.dimensions = new CVector2(1000,10000);		
	}

	expandDimensions(pt)
	{
		if (pt.x > this.dimensions.x)
			this.dimensions.x = pt.x;
		if (pt.y > this.dimensions.y)
			this.dimensions.y = pt.y;
	}

	evalFunction(c)
	{
		return 0.0; //default, horizontal line 
	}

	intersection(ypos)
	{
		return [];
	}
	
	render(ctx)
	{
		ctx.beginPath();
		ctx.strokeStyle = this.colour;
		ctx.lineWidth = this.lineWidth		
		var vp = this.parentLayer.scene.calcViewBounds();		
		var intersects = (this.intersection(vp.y2).concat(this.intersection(vp.y)));
		intersects = intersects.sort(function (a, b) { return a - b });

		var x1 = vp.x;
		var x2 = vp.x2;
		if (intersects.length >= 2)
		{
			if (intersects[0] > x1)
				x1 = intersects[0];
			var last = intersects[intersects.length - 1]
			if (last < x2)
				x2 = last;
		}
		
		

	
		var dx = (x2-x1) / this.numsteps;
		var c = x1;//vp.x;		
		var cx = this.position.x + c;
		var cy = this.position.y + this.evalFunction(c);
		ctx.moveTo(cx,cy);			
		var i= 0;
		
		c += dx;	
		while (i < this.numsteps)
		{
			cx = this.position.x + c ;
			cy = this.position.y + this.evalFunction(c);
			ctx.lineTo(cx,cy);
			c+=dx;
			++i;
		}				
		ctx.stroke();
		ctx.beginPath();
		//ctx.strokeStyle = "#2200FF88";
		if (this.debugMode || this.parentLayer.scene.debugMode)
		{
			var fades = ["#22FF0055", "#22FF00AA", "#22FF00DD", "#22FF00FF"];
			ctx.lineWidth = 1.0;
			for (var i in intersects)
			{
				ctx.strokeStyle = fades[i];
				ctx.moveTo(intersects[i], vp.y);
				ctx.lineTo(intersects[i], vp.y2);
				ctx.stroke();
			}
		}
		/*ctx.moveTo(x2, vp.y);
		ctx.lineTo(x2, vp.y2);*/
		
		//ctx.strokeRect(vp.x + 10.0, vp.y + 10.0, vp.w - 20.0, vp.h - 20.0);
		//ctx.strokeRect(vp.x, vp.y, vp.w / 2 - 10, vp.h / 2 - 10);

	}

	
	alwaysVisible()
	{
		return true;
	}

	setA(v) {this.a = v; this.invalidate();}
	setB(v) {this.b = v; this.invalidate();}
	setC(v) {this.c = v; this.invalidate();}
	
}

class CQuadraticCurve extends CFunctionEvaluatorBase
{
	constructor(a=-0.1,b=10.0,c=0,steps=20)
	{		
		super(steps);
		this.a = a;
		this.b = b;
		this.c = c;		
	}

	evalFunction(c)
	{
		return quadraticEval(c, this.a, this.b, this.c) ;
	}

    intersection(ypos)
    {
		var res = solveQuadratic(ypos, this.a, this.b, this.c);
	    if (res != undefined)
		{
			return [this.position.x + res[0],this.position.y + res[1]];
	    }				
	    return [];
    }
			
	setA(v) {this.a = v; this.invalidate();}
	setB(v) {this.b = v; this.invalidate();}
}


class CExponentialCurve extends CFunctionEvaluatorBase
{
	constructor(a=1,b=2,steps=20)
	{		
		super(steps);
		this.a = a;
		this.b = b;

	}

	evalFunction(c)
	{
		return Math.pow(c * this.a,this.b);
	}

	intersection(ypos) 
	{
		var res = Math.log(this.b) / Math.log(ypos * this.a);
		return (isNaN(res)) ? [] : [res];		
	}
			
	setA(v) {this.a = v; this.invalidate();}
	setB(v) {this.b = v; this.invalidate();}	
}


class CTan extends CFunctionEvaluatorBase
{
	constructor(a=1,b=2,steps=100)
	{		
		super(steps);
		this.a = a;
		this.b = b;

	}

	evalFunction(c)
	{
		return Math.tan2(a,b);
	}
			
	setA(v) {this.a = v; this.invalidate();}
	setB(v) {this.b = v; this.invalidate();}	
}


class CGrid extends CBaseShape
{
	constructor()
	{		
		super();
		
		this.colours = ["#22222233","#22222299","#222222BB"];
		this.thickness = [0.5,1.0,2.0]
		this.dimensions = new CVector2(1000,1000);
		this.position = new CVector2(0,0);		
		this.scale = new CVector2(10,10);
		this.majorGridSpacing = 5;		
	}
	
	render(ctx)
	{
		
		
		
		const gridXCount = 500;
		const gridYCount = 500;
		const gridExtentsX = gridXCount * this.scale.x * 0.5;
		const gridExtentsY = gridYCount * this.scale.y * 0.5;
		var p = this.position;

		ctx.beginPath();
	
		ctx.lineWidth = this.thickness[2];
		ctx.strokeStyle = this.colours[2];
		ctx.moveTo(p.x - gridExtentsX, p.y);
		ctx.lineTo(p.x + gridExtentsX, p.y);
		ctx.moveTo(p.x,p.y - gridExtentsY);
		ctx.lineTo(p.x,p.y + gridExtentsY);
		
		ctx.stroke();
		
		for (var x = 0; x < gridXCount; ++x)
		{
			ctx.beginPath();
			var ml = (x % this.majorGridSpacing == 0) ? 1: 0;
			ctx.lineWidth = this.thickness[ml];
			ctx.strokeStyle = this.colours[ml];
			var xp = p.x - gridExtentsX + x * this.scale.x;
			ctx.moveTo(xp,p.y - gridExtentsY);
			ctx.lineTo(xp,p.y + gridExtentsY);
		
			ctx.stroke();
		}
		for (var y = 0; y < gridYCount; ++y)
		{
			ctx.beginPath();
			var ml = (y % this.majorGridSpacing == 0) ? 1: 0;
			ctx.lineWidth = this.thickness[ml];
			ctx.strokeStyle = this.colours[ml];
			var yp = p.y -gridExtentsY + y * this.scale.y;
			ctx.moveTo(p.x - gridExtentsX, yp);
			ctx.lineTo(p.x + gridExtentsX, yp);
		
			ctx.stroke();
		}
	
	}

	alwaysVisible()
	{
		return true;
	}
}

class CPolygonShape extends CBaseShape
{
	constructor()
	{
		super();
		this.points = [];
		this.pointMode = [];
		this.colour = "#EEEE99";
		this.position = new CVector2(0,0);
		this.dimensions = new CVector2(0,0);
	}

	expandDimensions(pt)
	{
		if (pt.x > this.dimensions.x)
			this.dimensions.x = pt.x;
		if (pt.y > this.dimensions.y)
			this.dimensions.y = pt.y;
	}


	addPoint(pt, pty)
	{
		if (pty != undefined)
			this.points.push(new CVector2(pt, pty));
		else
			this.points.push(ensureVector(pt));
		this.pointMode.push(PT_ONCURVE);
	}

	addControlPoint(pt, pty)
	{
		if (pty != undefined)
			this.points.push(new CVector2(pt, pty));
		else
			this.points.push(ensureVector(pt));
		this.pointMode.push(PT_CTRLPT);
	}

	render(ctx)
	{
		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#00000055";
		ctx.fillStyle = this.colour;
		
		ctx.moveTo(this.points[0].x,this.points[0].y);
		var i= 0;

		while (i < this.points.length)
		{
			if (this.pointMode[i] == PT_ONCURVE)
				ctx.lineTo(this.points[i].x, this.points[i].y);
			else
			{
				ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, this.points[i+1].x, this.points[i+1].y);
				++i;
			}
			++i;
		}
		ctx.closePath();

		ctx.fill();
		ctx.stroke();
	}
    
    intersection(ypos)
    {
    	var intersections = [];
    	var j = 0;
		var lastJ = points.length-1; 

		while (j < points.length)
		{					
			if (pointMode[j] == PT_ONCURVE)
			{
				var leq = new CLineEq(this.points[lastJ], this.points[j]);
				if (leq.withinY(ypos))
				{
					var solved = leq.solveY(ypos);
					intersections.push(solved);						
				}
				lastJ = j;
				++j;
			}
			else //is a curve
			{					
				var ceq = new CCurveEq(this.points[lastJ], this.points[j], this.points[j + 1]);
				if (ceq.withinY(ypos))
				{
					ceq.solveY(ypos, intersections);							
				}
				lastJ = j + 1;
				j+=2;	
			}								
		}
		return intersections;
    }
}

$(document).ready(
	function() 
	{
		initPopupInfrastructure();
	}
);	