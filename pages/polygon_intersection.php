
<script language="javascript" type="module">

import {CScene} from "/scripts/CScene.js";
import * as maths_vis from "/scripts/maths_vis.js";

class CPolygonIntersection extends CScene
{
	constructor(options={name:'#graph_view_canvas'})
	{
		super(options);
		var newPoly = new maths_vis.CPolygonShape();
		newPoly.addPoint(10, 0);
		newPoly.addPoint(100, 0);
		newPoly.addPoint(100, 100);
		newPoly.addControlPoint(60, 30);
		newPoly.addPoint(20, 150);
		newPoly.addPoint(10, 100);
		this.addShape(newPoly);
		var hIntersector = new maths_vis.CIntersector();
		this.addShape(hIntersector);
	}	
}

$(document).ready(
	function() 
	{
		var mv = new CPolygonIntersection();
		mv.run();		
	}
);	
</script>

<span id="graph_view" class="graphcontainer">
    <canvas id="graph_view_canvas" class="golden_flow_canvas" width="100%" height="100%" class="" style="border:1px solid #000000;">
	</canvas>
</span>