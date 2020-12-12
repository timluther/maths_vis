<script language="javascript" type="module">
	import { calculateMatrices } from '/scripts/maths_vis.js';
	console.log("Here!");
	window.calculateMatrices = calculateMatrices;			
</script>

<h4>Enter matrices by row, comma seperated</h4>
<div class="matrixeditor">

<div class="matrixblock">
<span>					
	<div class="mbdiv">
	<textarea id="matrixA" class="matrixTextArea" >
		1,0,0,0
		0,1,0,0
		0,0,1,0
		0,0,0,1
	</textarea>
</div>
	<div class="caption">
		Matrix A
	</div>
	
</span>
<span>
	<div class="mbdiv">
	<textarea id="matrixB" class="matrixTextArea">
		1,0,0,0
		0,1,0,0
		0,0,1,0
		0,0,0,1
	</textarea>
	</div>
	<div class="caption">
		Matrix B
	</div>
</span>
</div>

<button id="calculate" onClick="window.calculateMatrices()">
	Calculate
</button>
<pre id="result">
</pre>

</div>

