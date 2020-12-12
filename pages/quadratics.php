

<script language="javascript" type="module">

import {CScene} from "/scripts/CScene.js";
import {CSlider,initSliders} from "/scripts/CSlider.js";
import * as maths_vis from "/scripts/maths_vis.js";

class CQuadraticDisplay extends CScene
{


	constructor(options={name:'#quadratic_view_canvas'})
	{		
		super({...options,...{noWheelZoom:true}});
		//this.background="#FF2200";
		this.grid = new maths_vis.CGrid();	
		this.addShape(this.grid);
		this.hIntersector = new maths_vis.CIntersector();
		this.addShape(this.hIntersector);
		this.quadratic = new maths_vis.CQuadraticCurve(-0.01,0,0);
		this.addShape(this.quadratic);		
		var quadThis = this;
		setTimeout(() => {
			//give it a little bit for the sizes to settle down
			var sa = $("#sliderA")[0];
			var sb = $("#sliderB")[0];
			var sc = $("#sliderC")[0];

			sa.slider.setValues(this.quadratic.a,-1,1);
			sb.slider.setValues(this.quadratic.b,-20,20);
			sc.slider.setValues(this.quadratic.c,-500,500);
			sa.slider.addListener(function(val){quadThis.quadratic.setA(val);});
			sb.slider.addListener(function(val){quadThis.quadratic.setB(val);});
			sc.slider.addListener(function(val){quadThis.quadratic.setC(val);});	
		}, 100);
		
	}	
}

$(document).ready(
	function() 
	{
		initSliders();
		
		var mv = new CQuadraticDisplay();
		mv.run();
		
		
		

		
	}
);	
</script>


<h2>Quadratic Equations</h2>
<p> Quadratic equations form a type of curve known as a <i>parabola</i> and these take the following form
	\[{\color{#D20}a}x^2 + {\color{#280}b}x + {\color{#20D}c} = 0\]
</p>
<p>
	This interactive diagram should help you get a feel for how the three coefficients behave in the quadratic formula. 
	
	When we talk about a 'solution' to a formula, we're usually talking about trying to find out where our diagram intersects with the x axis, the horizontal line at a height of \(0y\).
	Another way of saying this is that we're solving for '\(x\)'.
	The formula for solving the quadratic equation is as follows:
	\[x = {-{\color{#280}b} \pm \sqrt{{\color{#280}b}^2-4{\color{#D20}a}{\color{#20D}c}} \over 2{\color{#D20}a}}.\]
	
	In the case below, you'll see that the red horizontal line is intersecting the quadratic curve and presenting two crosses that intersect the curve - that's using the formula listed above, giving two answers (that's the +/- bit)
	when intersecting. In our case, we're effectively translating the formula (which is the same as changing '\({\color{#20D}c}\)' so that our horizontal line intersects with different parts of the curve as we move the mouse.    
   
</p>

<div id="graph_widget" class="inpage_graphwidget_small">
<span id="graph_view" class="inpage_graphcontainer">
    <canvas id="quadratic_view_canvas" class="graphcanvas" style="border:1px solid #000000;">
	</canvas>	
</span>
<div class="inpage_graphcontainer_controls">
	<span class="sliderblockspan coeffa"><span class="divtitle">A</span><span class="divbody"><div id="sliderA" class="slider"></div></span> </span>
	<span class="sliderblockspan coeffb"><span class="divtitle">B</span><span class="divbody"><div id="sliderB" class="slider"></div></span> </span>
	<span class="sliderblockspan coeffc"><span class="divtitle">C</span><span class="divbody"><div id="sliderC" class="slider"></div></span></span>
	</div>
</div>
<br>
<br>
<h2>Further notes on quadratics</h2>
<p>
	Whenever you see a formula with a term raised to a power, you know that when you plot that formula, you're going to get a curve. </p>
	<p> In the where there's a single power raising your coefficient \(x\) in this case) of raising to the power 2, it'll 
	be a curve with a single hump. The \( {\color{#D20}a} \) coefficient controls the curvature of the curve with values close to 0 producing a shallower curve, \(\color{#280}b\) controls where the curve intersects with the origin (at \({\color{#280}b}=0\) the 'hump' of the curve is centred at the origin) and \(\color{#20D}c\) is a vertical offset from the origin. 
</p>
<p> 
<h3>But what's it <i>for</i></h3>
<p>
As with everything in mathematics, you can study it for its own sake but most of these equations find hundreds of uses. Quadratic and Cubic curves pop up all over the place, in areas including:

	<ul>
		<li> Animation </li>
		<li> Automotive design </li>		
		<li> Computer games </li>
		<li> Graphic design</li>
		<li> Architecture </li>
		<li> Civil engineering </li>
		<li> Launching rockets </li>
		<li> 'Firing solutions' when blowing things up with artillery</li>
		<li> And much more!</li>
	</ul>
</p>
		
		

</p>
	