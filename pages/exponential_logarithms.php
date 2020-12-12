
    <p>
       At its most basic, an exponent is a short hand way of saying 'multiply this value by itself n times' but beyond that, exponents and their inverse, the logarithmic functions, find many uses in mathematics and its practical applicaitons.
    </p>
<p>
\[f(x) = xa^b\]
</p>
    
<script language="javascript" type="module">

import {CScene} from "/scripts/CScene.js";
import {CSlider,initSliders} from "/scripts/CSlider.js";
import * as maths_vis from "/scripts/maths_vis.js";

class CLogarithmDisplay extends CScene
{


	constructor(options={name:'#logarithm_view_canvas',debugMode:true})
	{		
		super({...options,...{noWheelZoom:true}});
		//this.background="#FF2200";
		this.grid = new maths_vis.CGrid();	
		this.addShape(this.grid);
		this.hIntersector = new maths_vis.CIntersector();
		this.addShape(this.hIntersector);
		this.func = new maths_vis.CExponentialCurve(0.0538,2);
		this.addShape(this.func);		
		var fthis = this;
		setTimeout(() => {
			//give it a little bit for the sizes to settle down
			var sa = $("#expsliderA")[0];
			var sb = $("#expsliderB")[0];			

			sa.slider.setValues(this.quadratic.a,-10,10);
			sb.slider.setValues(this.quadratic.b,-20,20);			
			sa.slider.addListener(function(val){fthis.func.setA(val);});
			sb.slider.addListener(function(val){fthis.func.setB(val);});			
		}, 100);
		
	}	
}

$(document).ready(
	function() 
	{
		initSliders();
		
		var mv = new CLogarithmDisplay();
		mv.run();
		
		
		

		
	}
);	
</script>



<div id="graph_widget" class="inpage_graphwidget_small">
<span id="graph_view" class="inpage_graphcontainer">
    <canvas id="logarithm_view_canvas" class="graphcanvas" style="border:1px solid #000000;">
	</canvas>	
</span>
<div class="inpage_graphcontainer_controls">
	<span class="sliderblockspan coeffa"><span class="divtitle">A</span><span class="divbody"><div id="expsliderA" class="slider"></div></span> </span>
	<span class="sliderblockspan coeffb"><span class="divtitle">B</span><span class="divbody"><div id="expsliderB" class="slider"></div></span> </span>
	</div>
</div>
<br>
