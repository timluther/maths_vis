
function vectorToString(v, precision = 2) {
	return v.x.toFixed().toString() + "," + v.y.toFixed().toString();
}

export class CCamera {
	constructor(scene) {
		this.position = new CVector2(0, 0);
		this.fov = 91;
		this.maxfov = 180;
		this.minfov = 2.0;
		this.viewPort = new CRect(0, 0, 100, 100);
		this.targetPosition = new CVector2(0, 0);
		this.targetFov = this.fov;
		this.moveSpeed = 0.5;
		this.viewMatrix = new Matrix();
		this.projectionMatrix = new Matrix();
		this.matrix = new Matrix();
		this.mScene = scene;
	}

	resetAll() {
		//this.position = new CVector2(0,0);	
		this.fitToBounds(this.mScene.worldBounds);
		this.minfov = this.targetFov;
	}

	fitToBounds(bounds, margin) {

		var c = bounds.getCentre().negate();
		var worldDim = bounds.getDimensions();
		if (margin) {
			worldDim.x += margin;
			worldDim.y += margin;
		}
		var screenDim = this.viewPort.getDimensions();
		var scalex = screenDim.x / worldDim.x;
		var scaley = screenDim.y / worldDim.y;
		var scale = Math.min(scalex, scaley) * 0.9;
		this.maxScale = scale;
		this.setTargetPosition(c);
		this.setTargetFov(scale * 90);
	}

	setViewport(vp) {
		this.viewPort = vp;
		this.buildMatrix();
	}

	setTargetPosition(pos) {
		this.targetPosition.x = pos.x;
		this.targetPosition.y = pos.y;
	}

	getScaleFactor() {
		return this.matrix.a;
	}

	getZoomScale() {
		return new CVector2(this.viewMatrix.a, this.viewMatrix.d);
	}

	setTargetFov(fov) {
		//this.maxScale * 50
		fov = fov.clamp(0.7, 1000);
		this.targetFov = fov;
	}

	zoomBy(amount) {
		this.setTargetFov(this.fov + amount);
	}

	setPosition(pos) {
		this.position.x = pos.x;
		this.position.y = pos.y;
		this.targetPosition.x = pos.x;
		this.targetPosition.y = pos.y;
		this.buildMatrix();
	}

	setFovCheck(fov) {
		if (fov > this.maxfov)
			fov = this.maxfov;
		if (fov < this.minfov)
			fov = this.minfov;
		this.fov = fov;
		this.updateNeeded = true;
	}

	setFov(fov) {
		//fov = fov > 10 ? fov < 400 ? fov : 400 : 10;

		this.fov = fov;
		this.updateNeeded = true;

	}

	update(dt) {
		var diff = this.targetPosition.sub(this.position);

		var dist = diff.getMagnitude();
		diff.divideBy(dist);
		this.updateNeeded = false;
		if (dist > 0.1) {
			var newDist = dist * this.moveSpeed;
			var newPos = this.position.add(diff.multiply(newDist));
			this.position.x = newPos.x;
			this.position.y = newPos.y;
			this.updateNeeded = true;
		}

		var fovDist = this.targetFov - this.fov;
		if (Math.abs(fovDist) > 0.1) {
			var newFov = this.fov + (fovDist * this.moveSpeed);
			this.setFovCheck(newFov);
			this.updateNeeded = true;
		}
		if (this.updateNeeded) {
			this.buildMatrix();
			this.mScene.invalidate();
		}

	}

	buildMatrix() {
		this.projectionMatrix.setTransform(1, 0, 0, 1, this.viewPort.w / 2, this.viewPort.h / 2);
		this.viewMatrix.setTransform(1, 0, 0, 1, this.position.x, this.position.y);
		//this.matrix.setTo(this.viewMatrix);
		//this.matrix.multiply(this.projectionMatrix);
		this.matrix.setTo(this.projectionMatrix);
		var ar = this.viewPort.w / this.viewPort.h;
		this.matrix.scale(this.fov / 90, this.fov / 90);
		this.matrix.multiply(this.viewMatrix);

	}

	getViewCentre() {
		return this.viewPort.getCentre();
	}

	setContextMatrix(ctx) {
		this.matrix.applyToContext(ctx);
	}

	worldSpaceToView(vsp) {
		return this.matrix.applyToPoint(vsp.x, vsp.y);
	}

	worldSpaceToViewVector(vsp) {
		return this.matrix.applyToVector(vsp.x, vsp.y);
	}

	viewSpaceToWorld(vsp) {
		var inverseMatrix = this.matrix.inverse(); //.inverse()
		return inverseMatrix.applyToPoint(vsp.x, vsp.y);
	}

	updateFromMatrix() {
		this.position.x = this.viewMatrix.e;
		this.position.y = this.viewMatrix.f;
		//this.fov = this.viewMatrix.a * 90;
		this.setFov(this.viewMatrix.a * 90);

		this.targetPosition.x = this.position.x;
		this.targetPosition.y = this.position.y;
		this.targetFov = this.fov;
	}


}




function findIndex(array, element) {
	for (var i = 0; i < array.length; ++i)
		if (array[i] == element)
			return i;
	return -1;
}

const LF_LOCKED = 0x1;
const LF_VISIBLE = 0x2;

class CLayer {


	constructor(scene, name = "", options = {}) {
		this.scene = scene;
		this.shapes = [];
		this.annotations = [];
		this.name = name;
		this.flags = LF_VISIBLE;
		this.owner = null;
		this.debugMode = options.debugMode;
		this.options = options;
	}

	getIndex() {
		return this.scene.layers.indexOf(this);
	}

	isLocked() {
		return (this.flags & LF_LOCKED) != 0;
	}

	isVisible() {
		return (this.flags & LF_VISIBLE) != 0;
	}

	lock() { this.flags |= LF_LOCKED; this.notifyLayerUpdate(); }
	unLock() { this.flags &= ~LF_LOCKED; this.notifyLayerUpdate(); }
	show() { this.flags |= LF_VISIBLE; this.notifyLayerUpdate(); }
	hide() { this.flags &= ~LF_VISIBLE; this.notifyLayerUpdate(); }
	toggleLock() { this.flags ^= LF_LOCKED; this.notifyLayerUpdate(); }
	toggleVisibility() { this.flags ^= LF_VISIBLE; this.notifyLayerUpdate(); }

	onInsertion(scene) {
		this.owner = scene;
	}

	notifyLayerUpdate() {
		this.owner.broadcastLayerChange(this, "flag change");
	}

	render() {
		var ctx = this.scene.ctx;

		ctx.resetTransform();
		this.scene.camera.setContextMatrix(ctx);

		///ctx.moveTo(0, 0);
		//ctx.lineTo(200, 100);        
		//ctx.stroke();
		ctx.font = "12px Georgia";
		ctx.strokeStyle = "#000000";

		var shapes = this.shapes;
		for (var i = 0; i < shapes.length; ++i) {
			var shape = shapes[i];
			if (this.scene.isVisible(shape))
				shape.render(ctx);
		}

		for (var i = 0; i < this.annotations.length; ++i) {
			var annotation = this.annotations[i];
			annotation.render(ctx);
		}
	}

	findShapesOfClass(className) {
		var res = [];
		for (var i = 0; i < this.shapes.length; ++i) {
			var shape = this.shapes[i];
			if (shape.constructor.name == className)
				res.push(shape);
		}
		return res;
	}
};

export class CScene {
	constructor(options = {}) {
		this.ctx = null;
		this.canvasName = "#graph_canvas";
		this.background = "#FEFFFD";

		this.lineHeight = 18;
		this.div = null;

		this.camera = new CCamera(this);

		var name = options['name'];
		if (name)
			this.canvasName = name;
		this.div = null;
		this.setupView();
		this.options = options;

		gBaseScenes.push(this);


		this.animating = true;
		this.frameDelay = 5;
		this.needsRedraw = false;
		this.mFrameCounter = 0;
		this.mSelection = [];
		this.mSelectionRectangle = new CRect(0, 0, 1, 1);
		this.updatePageURLCallback = null;
		this.onLayerChangeListeners = [];
		this.updateObjectList = [];

		document.addEventListener('keydown', function (e) {
			gActiveScene.keyDown(e);
		});

		document.addEventListener('keypress', function (e) {
			gActiveScene.keyPress(e);
		});

		document.addEventListener('keyup', function (e) {
			gActiveScene.keyUp(e);
		});



		this.mouseOverObject = null;
		//n.b. this doesn't work yet
		var parentWindow = $(this.div).parent();
		//if this is the first scene, set this handler up for *all* scenes
		if (gBaseScenes.length == 1) {
			parentWindow.resize(function (e) {
				for (var i in gBaseScenes)
					gBaseScenes[i].invalidateDimensions();
			});

			window.addEventListener("resize", function (e) {
				for (var i in gBaseScenes)
					gBaseScenes[i].invalidateDimensions();
			});
		}
		//-----------------
		this.ensureDimensions();
		this.needsResize = true;
		this.lastMouse = new CVector2(0, 0);
		this.mouseDelta = new CVector2(0, 0);
		this.cameraStartPos = this.camera.position.copy();
		this.dragInProgress = false;
		this.jsonData = null;
		this.layers = [];
		this.currentLayer = null;
		this.worldBounds = new CRect(0, 0, 1, 1);
		gActiveScene = this;
		this.update();

		//initKeyCodes();
	}

	setupView() {
		var canvas = $(this.canvasName);
		if (canvas.length > 0) {
			var c = canvas[0];
			this.div = c;
			c.sceneObject = this;
			
			c.onmousedown = c.ontouchdown =  function (e) {
				e.target.sceneObject.mouseDown(e);
				setActiveScene(e.target.sceneObject);
				e.stopPropagation();
				if (e.pointerId)
					this.releasePointerCapture(e.pointerId);
				
			};

			c.onmousemove = c.ontouchmove = function (e) {
				setActiveScene(e.target.sceneObject);
				e.target.sceneObject.mouseMove(e);
				e.stopPropagation();
			};

			c.onmouseup = c.onpointerup = c.ontouchend= function (e) {
				e.target.sceneObject.mouseUp(e);
				e.stopPropagation();
				if (e.pointerId)
					this.setPointerCapture(e.pointerId);                
			};
			c.onmousewheel = function (e) {
				e.target.sceneObject.mouseWheel(e);				
			}

			c.addEventListener("mouseout", function (e) {
				e.target.sceneObject.mouseLeave(e);
			});
			c.addEventListener("mouseover", function (e) {
				e.target.sceneObject.mouseEnter(e);
			});

			this.ctx = c.getContext("2d");

			this.ctx.lineHeight = this.lineHeight;
			this.ensureDimensions();
		}
	}

	addLayerListChangeListener(callback) {
		this.onLayerChangeListeners.push(callback);
	}

	findShapesOfClass(className) {
		var combres = [];
		for (var i = 0; i < this.layers.length; ++i) {
			var res = this.layers[i].findShapesOfClass(className);
			combres = combres.concat(res);
		}
		return combres;
	}

	//URL handling interface
	parseStateParams(commands) {
		var cpos = commands.searchParams.get("cpos");
		var czoom = commands.searchParams.get("czoom");
		if (cpos) {
			var coords = cpos.split(",");
			this.targetPosition = new CVector2(coords[0], coords[1]);
		}
		if (czoom)
			this.targetFov = parseFloat(czoom);
	}

	getCurrentStateParams() {
		return "cpos=" + vectorToString(this.camera.targetPosition) + "&czoom=" + this.camera.targetFov.toFixed(2).toString();
	}

	//search interface
	searchForTerm(searchTerm, limits) {
		return [];
	}
	//////////////////////////////////////


	localMousePos(e) {
		var bounds = e.target.getBoundingClientRect();
		var mlp = new CVector2(e.clientX - bounds.left, e.clientY - bounds.top);
		e.scene = this;
		e.camera = this.camera;
		e.localMousePos = mlp;
		e.worldSpaceMousePos = this.camera.viewSpaceToWorld(mlp);
		return mlp;
	}


	addSelection(obj) {
		var idx = 0;
		for (var i = 0; i < this.layers.length; ++i) {
			var layer = this.layers[i];
			if (typeof (obj) == "number")
				idx = obj;
			else {
				idx = findIndex(layer.shapes, obj);
			}

			if (idx >= 0) {
				this.mSelection.push(idx);
				if (obj.hasOwnProperty('selectionBounds'))
					this.mSelectionRectangle.merge(obj.selectionBounds);
				else
					this.mSelectionRectangle.merge(obj.getBounds());
			}
		}
		this.invalidate();
	}


	selectBySearch(searchString, textFields) {
		this.mSelectionRectangle.resetForMerge();
		this.mSelection = [];
		if (searchString != "") {
			if (searchString.startsWith("edge(")) {
				var number = searchString.slice(6);
				var inum = parseInt(number);

				this.forEachObject(function (obj) {
					if (typeof obj.selectElementsByEdgeIndex == 'function') {
						if (obj.selectElementsByEdgeIndex(inum))
							gActiveScene.addSelection(obj);
					}
				});

			}
			else if (searchString.startsWith("vertex(")) {
				var number = searchString.slice(7);
				var inum = parseInt(number);
				this.forEachObject(function (obj) {
					if (typeof obj.selectElementsByVertexIndex == 'function') {
						if (obj.selectElementsByVertexIndex(inum))
							gActiveScene.addSelection(obj);
					}
				});
			}
			else {
				var rx = new RegExp(searchString, 'g');
				var splitid = searchString.split('-');//shape ids are often split by '-'
				var searchid = searchString;
				if (splitid.length == 2)
					searchid = splitid[1];
				if (typeof searchid == 'string')
					searchid = parseInt(searchid);
				this.forEachObject(function (obj) {
					if (obj.hasOwnProperty('id'))
						if (obj.id == searchid)
							gActiveScene.addSelection(obj);
						else {
							for (var i = 0; i < textFields.length; ++i) {
								if (obj.hasOwnProperty(textFields[i])) {
									var testString = obj[textFields[i]];
									if (rx.exec(testString)) {
										gActiveScene.addSelection(obj);
									}
								}
							}
						}
				});
			}
		}

		this.invalidate();

		if (this.mSelection.length > 0) {
			var zp = this.mSelectionRectangle.getCentre();
			this.zoomCameraTo(zp);
		}
	}

	resetCamera() {
		this.camera.resetAll();
	}

	fitCameraToBounds(bounds, margin) {
		var scale = this.camera.getZoomScale();
		this.dragInProgress = false;

		this.camera.fitToBounds(bounds, margin);
		this.updatePageUrl();
	};


	zoomCameraTo(pt) {
		var scale = this.camera.getZoomScale();
		this.dragInProgress = false;

		this.camera.setTargetPosition(new CVector2(-pt.x * scale.x, -pt.y * scale.y));
		this.updatePageUrl();
	}

	setCursorByID(cursorStyle) {
		if (this.div.style)
			this.div.style.cursor = cursorStyle;
	}

	ensureDimensions() {
		if (this.div) {
			var w = $(this.div).parent().width();
			var h = $(this.div).parent().height();
			this.ctx.canvas.width = w;
			this.ctx.canvas.height = h;
			this.camera.setViewport(new CRect(0, 0, w, h));
			this.needsResize = false;
		}
	}

	setJSONdata(jsonData) {
		this.preParse();
		this.ensureDimensions();
		this.jsonData = jsonData;
		this.postParse();
	}

	postParse() {
		var scene = this;
		scene.worldBounds.resetForMerge();
		this.forEachSceneObject(function (obj) {
			scene.worldBounds.merge(obj.getBounds());
		});
		this.camera.resetAll();
	}


	forEachObject(func) {
		for (var l = 0; l < this.layers.length; ++l) {
			for (var i = 0; i < this.layers[l].shapes.length; ++i)
				func(this.layers[l].shapes[i]);

			for (var i = 0; i < this.layers[l].annotations.length; ++i)
				func(this.layers[l].annotations[i]);
		}
	}


	forEachSceneObject(func) {
		for (var l = 0; l < this.layers.length; ++l) {
			for (var i = 0; i < this.layers[l].shapes.length; ++i)
				func(this.layers[l].shapes[i]);
		}
	}


	forEachObjectReturn(func) {
		for (var l = 0; l < this.layers.length; ++l) {
			for (var i = 0; i < this.layers[l].shapes.length; ++i) {
				var ret = func(this.layers[l].shapes[i]);
				if (ret)
					return ret;
			}

			for (var i = 0; i < this.layers[l].annotations.length; ++i) {
				var ret = func(this.layers[l].annotations[i]);
				if (ret)
					return ret;
			}
		}
		return undefined;
	}

	/**
		 * Set current matrix to new absolute matrix.
		 * @param {number} a - scale x
		 * @param {number} b - shear y
		 * @param {number} c - shear x
		 * @param {number} d - scale y
		 * @param {number} e - translate x
		 * @param {number} f - translate y
		 */

	zoomAt(amount, offset) {
		//1.0 -
		var divisor = -amount / 500;//(amount / 10.0);//this.camera.fov;
		divisor += 1.0;
		//console.log(divisor);
		//	divisor = Math.pow(divisor, this.camera.fov);
		var inv = 2.5;//this.camera.viewMatrix.a;
		//divisor = Math.pow(divisor, inv);
		var vcentre = this.camera.getViewCentre();

		offset = offset.subtract(vcentre);

		var offsetpos = this.camera.viewSpaceToWorld(offset);

		//subtractFrom

		var czoom = this.camera.fov;
		offset.divideBy(5 * this.camera.matrix.a);
		//console.log(offset);


		this.camera.setTargetFov(czoom - amount * 0.05);
		this.camera.setTargetPosition(this.camera.position.subtract(offset));
		this.updatePageUrl();
		//this.camera.matrix.setTransform(divisor, 0, 0, divisor, divisor * newPos.x, divisor * newPos.y);		

		//this.camera.viewMatrix.translate(newPos.x, newPos.y);
		//this.camera.viewMatrix.scale(divisor, divisor);
		//this.camera.viewMatrix.translate(-newPos.x, -newPos.y);

		//this.camera.updateFromMatrix();
		//this.camera.buildMatrix();
		//console.log(this.camera.matrix.a);
		this.invalidate();
	}

	keyDown(e) {

	}

	keyPress(e) {

	}


	keyUp(e) {

	}

	allowMoveDrag(e)
	{
		return (!this.options.noViewDrag);
		if (e.shiftKey) {/*shift is down*/ }
		if (e.altKey) {/*alt is down*/ }
		if (e.ctrlKey) {/*ctrl is down*/ }
		if (e.metaKey) {/*cmd is down*/ }
	}
	
	mouseDown(e) {
		if (this.allowMoveDrag(e))
		{
			this.dragInProgress = true;
			this.mouseStartPos = this.localMousePos(e);
			this.cameraStartPos = this.camera.position.copy();
		}

		if (this.mouseOverObject) {
			try {
				this.mouseOverObject.mouseDown(e);
			}
			catch (err) {
				console.log(err);
			}
		}

		console.log("New mouse start pos");
		//this.div.setCapture();
	}


	findObjectIntersecting(pt) {
		return this.forEachObjectReturn(function (shape) {
			//if (shape.__proto__.hasOwnProperty('pointInside'))        	
			if (shape.pointInside(pt)) {
				return shape;
			}
		});
		return null;
	}

	mouseEnter(e) {

	}

	mouseLeave(e) {
		this.dragInProgress = false;
	}

	setCurrentLayer(layer) {
		var tof = typeof layer;
		if (tof == 'number')
			this.currentLayer = this.layers[layer];
		else if (tof == 'CLayer') {
			this.currentLayer = layer;
		}
	}

	onNewMouseOver(mo, evt) {

	}

	mouseMove(e) {
		var mousePos = this.localMousePos(e);
		if (this.dragInProgress) {

			var mouseDiff = mousePos.subtract(this.mouseStartPos);
			var sf = 1.0 / this.camera.getScaleFactor();
			if (e.shiftKey) 
			{
				this.zoomAt(mouseDiff.y, new CVector2(0, 0));
				e.stopPropagation();
				e.preventDefault();
				this.invalidate();
			}
			else
				this.camera.setTargetPosition(this.cameraStartPos.add(mouseDiff.multiply(sf)));

			this.invalidate();
		}
		this.mouseDelta = mousePos.subtract(this.lastMouse);
		this.lastMouse = new CVector2(mousePos.x, mousePos.y);
		var newMouseOver = this.findObjectIntersecting(e.worldSpaceMousePos);
		if (newMouseOver != this.mouseOverObject) {

			if (newMouseOver)
				newMouseOver.mouseEnter(e);
			if (this.mouseOverObject)
				this.mouseOverObject.mouseLeave(e);
			this.onNewMouseOver(newMouseOver, e);
			this.mouseOverObject = newMouseOver;
		}

		this.forEachObject(function (shape) {
			if (shape.__proto__.hasOwnProperty('mouseMove'))
				shape.mouseMove(e);
		});
	}

	mouseWheel(e) {
		if (!this.options.noWheelZoom)
		{		
			var mousePos = this.localMousePos(e);
			var centreP = this.camera.position.copy();
			this.zoomAt(e.deltaY, new CVector2(mousePos.x, mousePos.y));
			e.stopPropagation();
			e.preventDefault();
			this.invalidate();
		}
		this.forEachObject(function (shape) {
			if (shape.__proto__.hasOwnProperty('mouseWheel'))
				shape.mouseWheel(e);
		});
	}

	mouseUp(e) {
		if (this.dragInProgress) {
			this.dragInProgress = false;
			this.updatePageUrl();
		}
		this.forEachObject(function (shape) {
			if (shape.__proto__.hasOwnProperty('mouseUp'))
				shape.mouseUp(e);
		});
		//this.div.releaseCapture();
	}

	isVisible(shape) {
		if (shape.alwaysVisible())
			return true;
		var ctx = this.ctx;
		var vspos = this.camera.worldSpaceToView(shape.position);

		var dim = this.camera.worldSpaceToViewVector(shape.dimensions);
		return ((vspos.x + dim.x >= 0) && (vspos.x <= ctx.canvas.width) && (vspos.y + dim.y >= 0) && (vspos.y <= ctx.canvas.height));
	}

	updatePageUrl() {
		if (this.updatePageURLCallback)
			this.updatePageURLCallback(this, false);
	}

	broadcastLayerChange(layer, what) {
		for (var ll in this.onLayerChangeListeners) {
			this.onLayerChangeListeners[ll](this, layer, what);
		}
	}

	addLayer(name) {
		var layer = new CLayer(this, name);
		layer.onInsertion(this);
		layer.layerID = this.layers.length;
		this.layers.push(layer);
		this.currentLayer = layer;
		this.broadcastLayerChange(layer, "add");
	}

	getLayer(layer) {
		var layerIdx = this.getLayerIndex(layer);
		if (layerIdx != -1) {
			return this.layers[layerIdx];
		}
		else
			return null;
	}

	getLayerIndex(layer) {
		var layerIdx = -1;
		if (typeof layer === "number") {
			if (layer < this.layers.length) {
				layerIdx = layer;
			}
		}
		else if (typeof layer === "string") {
			for (var i = 0; i < this.layers.length; ++i) {
				if (this.layers[i].name == layer) {
					layerIdx = i;
					break;
				}
			}
		}
		else if (typeof layer === "object" && layer.constructor.name == "CLayer") {
			for (var i = 0; i < this.layers.length; ++i) {
				if (this.layers[i] == layer) {
					layerIdx = i;
					break;
				}
			}
		}
		return layerIdx;
	}

	toggleLayerVisibility(layer) {
		var layerIdx = getLayerIndex(layer);
		if (layerIdx != -1) {
			this.layers[layerIdx].toggleVisibility();
		}
	}

	toggleLayerLock(layer) {
		var layerIdx = getLayerIndex(layer);
		if (layerIdx != -1) {
			this.layers[layerIdx].toggleLock();
		}
	}

	removeLayer(layer) {
		var layerIdx = this.getLayerIndex(layer);

		if (layerIdx != -1) {
			var layerOb = this.layers[layerIdx];
			this.layers.splice(layerIdx, 1);

			this.broadcastLayerChange(layerOb, "remove");
		}
	}

	addShape(shape) {
		if (this.layers.length == 0)
			this.addLayer("base layer");
		this.currentLayer.shapes.push(shape);
		shape.parentLayer = this.currentLayer;
		shape.onInsertion(this);
		if (typeof shape.update == "function")
			this.updateObjectList.push(shape);

		this.invalidate();
		return shape;
	}

	getShapeLayerIndex(shape) {
		var arr = shape.parentLayer.shapes;
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] === shape) {
				return i;
			}
		}
		return -1;
	}

	deleteShape(shape) {
		var idx = this.getShapeLayerIndex(shape);
		if (idx != -1) {
			shape.parentLayer.shapes.splice(idx, 1);
			this.invalidate();
		}
	}
	//annotations are like shapes but have no visibility testing
	addAnnotation(annotation) {
		if (this.annotations)
			this.annotations.push(annotation);
		this.invalidate();
	}



	preParse() {
		this.mSelection = [];
		this.camera.setTargetPosition(0, 0);
	}

	update() {
		if (gActiveScene.needsResize) {
			gActiveScene.ensureDimensions();
		}
		if (gActiveScene.needsRedraw) {
			gActiveScene.render();
			gActiveScene.needsRedraw = false;
		}
		gActiveScene.camera.update(gActiveScene.frameDelay);


		for (var i = 0; i < gActiveScene.updateObjectList.length; ++i) {
			gActiveScene.updateObjectList[i].update();
		}

		//console.log(gFrameCounter.toString());
		gActiveScene.mFrameCounter += 1;
	}

	run() {
		//do animation
		//if (this.animating)
		//	setTimeout(this.run(), this.framedelay);
		setInterval(this.update, this.frameDelay);
	}

	invalidateDimensions() {
		this.needsResize = true;
		this.needsRedraw = true;
	}


	invalidate() {
		this.needsRedraw = true;
	}

	calcViewBounds()
	{
		if (this.camera)		
		{
			var hw = this.camera.viewPort.w * 0.5;
			var hh = this.camera.viewPort.h * 0.5;
			var cmp = this.camera.position;
			this.viewBounds = new CRect(this.camera.viewPort.x - hw - cmp.x, this.camera.viewPort.y - hh - cmp.y, 
										hw = this.camera.viewPort.w, hw = this.camera.viewPort.h);
		}
		else
			this.viewBounds = new CRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);		
			
		return this.viewBounds;
	}

	render() {
		if (!this.ctx)
			return;
		var ctx = this.ctx;
		var oldLineWidth = ctx.lineWidth;
		ctx.resetTransform();
		ctx.fillStyle = this.background;
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);		

		for (var i = 0; i < this.layers.length; ++i) {
			this.layers[i].render();
		}

		if (this.mSelection.length > 0) {

			var margin = 4.0;
			var widemargin = 8.0;
			var oldLineWidth = ctx.lineWidth;
			ctx.strokeStyle = "#FF0000FF";
			ctx.lineWidth = 5;
			ctx.fillStyle = "#FF000055";
			ctx.beginPath();

			for (var i = 0; i < this.mSelection.length; ++i) {
				var shape = this.layers[0].shapes[this.mSelection[i]];
				if (shape.hasOwnProperty('selectionBounds'))
					this.mSelectionRectangle.merge(shape.selectionBounds.x1 - margin, shape.selectionBounds.x1 - margin,
						shape.selectionBounds.x2 + margin, shape.selectionBounds.y2 + margin);
				else
					ctx.rect(shape.position.x - margin, shape.position.y - margin, shape.dimensions.x + margin * 2, shape.dimensions.y + margin * 2);
			}
			ctx.fill();
			ctx.lineWidth = oldLineWidth;
			ctx.stroke();
			ctx.beginPath();
			ctx.rect(this.mSelectionRectangle.x - widemargin, this.mSelectionRectangle.y - widemargin, this.mSelectionRectangle.w + (widemargin * 2), this.mSelectionRectangle.h + (widemargin * 2));
			ctx.stroke();

		}
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.rect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.w, this.worldBounds.h);
		ctx.strokeStyle = "#00000022";
		ctx.stroke();
		
		ctx.lineWidth = oldLineWidth;
		ctx.strokeStyle = "#000000";
		
	}
}

export function getSceneSingleton() {
	return gBaseScenes;
}

export function getActiveScene() {
	return gActiveScene;
}

export function setActiveScene(scene) {
	if (gActiveScene != scene) {
		gActiveScene = scene;
		scene.invalidateDimensions();
	}
}

export function activateVisibleScenes() {
	var canvases = $("canvas");
	canvases.each(function () {
		var canvas = $(this);
		if (canvas.is(":visible")) {
			if (this.sceneObject) {
				this.sceneObject.invalidateDimensions();
			}
		}
	});
}

var gBaseScenes = [];
var gActiveScene = null;