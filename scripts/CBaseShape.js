import {CScene} from  "./CScene.js";
import * as scene_utils from './CScene.js';
import * as goldenthread_script_utils from './goldenthread_script_utils.js';
import * as flow_utils from './flow_utils.js';

const RC_LEFT = 0x1;
const RC_RIGHT = 0x2;
const RC_TOP = 0x4;
const RC_BOTTOM = 0x8;
const RC_MIDDLE_HORIZONTAL = 0x10;
const RC_MIDDLE_VERTICAL = 0x20;
const RC_MIDDLE = 0x30;

export {
	CBaseShape	
}



export default class CBaseShape
{  
    
	constructor(pos, dim)
	{
		this.position = pos;
		this.dimensions = dim;
		if (this.dimensions.x < 0)
			this.dimensions.x = -this.dimensions.x;
		if (this.dimensions.y < 0)
			this.dimensions.y = -this.dimensions.y;
		this.scene = null;
		this.mMouseOverCode = 0;
		this.borderSize = 0;
	}   

	onInsertion(scene)
	{
		this.scene = scene;
	}

	getBounds()
	{
		return new CRect(this.position.x,this.position.y,this.dimensions.x,this.dimensions.y);
	}

	getCentrePosition()
	{
		return new CVector2(this.position.x + this.dimensions.x * 0.5, this.position.y + this.dimensions.y * 0.5);
	}

	pointInside(pt)
	{
		return ((pt.x > this.position.x) && (pt.y > this.position.y) && (pt.x < this.position.x + this.dimensions.x) && (pt.y < this.position.y + this.dimensions.y));
	}

	classifyPoint(pt)
	{
		var edgeCode = 0;
		if (this.pointInside(pt))
		{
			if (pt.x < this.position.x + this.borderSize)
				edgeCode |= RC_LEFT;
			else if (pt.x > this.position.x + this.dimensions.x - this.borderSize)
				edgeCode |= RC_RIGHT;
			else 
				edgeCode |= RC_MIDDLE_HORIZONTAL;
			
			if (pt.y < this.position.y + this.borderSize)
				edgeCode |= RC_TOP;
			else if (pt.y > this.position.y + this.dimensions.y - this.borderSize)
				edgeCode |= RC_BOTTOM;
			else
				edgeCode |= RC_MIDDLE_VERTICAL;
		}
		return edgeCode;
	}

	alwaysVisible()
	{
		return false;
	}

	zoomToFocus()
	{
		var ss = scene_utils.getActiveScene();
		ss.zoomCameraTo(this.getCentrePosition());
	}

	mouseEnter(evt)
	{
	  evt.scene.setCursorByID('pointer');
	}

	mouseLeave(evt)
	{
	  evt.scene.setCursorByID('auto');   
	}

	move(dx, dy)
	{
		this.position.x += dx;
		this.position.y += dy;
		if (typeof this.updateInternals === "function")
			this.updateInternals();
	}

	setPosition(x,y)
	{
		this.position.x = x;
		this.position.y = y;
		if (typeof this.updateInternals === "function")
			this.updateInternals();
	}

	getSnapPoints()
	{
		return [];
	}

	setDimensions(x,y)
	{
		this.dimensions = new CVector2( x > 20 ? x : 20, y > 20 ? y : 20);
		if (typeof this.updateInternals === "function")
			this.updateInternals();
	}

	invalidate()
	{
		if (this.scene)
			this.scene.invalidate();
	}

	onEditDrag(worldSpaceMousePos, dragOffset)
	{
		var newx = worldSpaceMousePos.x + dragOffset.x;
		var newy = worldSpaceMousePos.y + dragOffset.y;
		if ((this.mMouseOverCode & RC_MIDDLE) == RC_MIDDLE)
		{
			this.setPosition(newx, newy);		
		}
		else
		{
			var code = this.mMouseOverCode & ~ RC_MIDDLE;
			var diffx = this.position.x - newx;
			var diffy = this.position.y - newy;
			if (code & RC_LEFT)
			{
				
				this.position.x = newx;
				this.dimensions.x += diffx;								
			}
			else if (code & RC_RIGHT)
			{				
				this.dimensions.x = this.startDimensions.x - diffx;								
			}

			if (code & RC_TOP)
			{				
				this.position.y = newy;
				this.dimensions.y += diffy;	
			}
			else if (code & RC_BOTTOM)
			{				
				this.dimensions.y = this.startDimensions.y - diffy;
			}
		}
	}
}





export class CBaseFlowShape extends CBaseShape
{

	constructor(pos, dim, shape)
	{
		super(pos, dim);
		this.shape = shape;
		this.script = null; //retrieved by getGoldenThreadScriptFromServer(flowShape) on creation of node panel
		this.dynScript = null;
	}

	getShapeThreadWalkerHelperClassName()
	{
		return 'C'+this.scene.jsonData.header.fileno.toString() + "_" + this.shape.id.toString();
	}

	getShapeCodeID()
	{
		return this.scene.jsonData.header.fileno.toString() + "-" + this.shape.id.toString();
	}

	getOriginalShapeCodeID()
	{
		return this.scene.jsonData.header.fileno.toString() + "-" + this.shape.oid.toString();
	}

	getShapeCode()
	{
		return "<div><span class='sidebartitle'>Shape code:</span><span class='sidebarcontent'>" + this.getShapeCodeID() + "(nee " + this.getOriginalShapeCodeID() + ")</span></div>";
	}


	//Helper function to get scripts from server
	getScriptFromServer(onSuccess, onFail)
	{
		getScriptRepo().getGoldenThreadScript(this, onSuccess, onFail);
	}

	getScriptFromRepo()
	{
		this.dynScript = this.getScriptRepo().getScript(this.getShapeThreadWalkerHelperClassName());
	}

	transmitChanges()
	{
		if (this.parentLayer && !this.parentLayer.isLocked())
		{		
			var ss =  scene_utils.getActiveScene();
			//var strData = JSON.parse(JSON.stringify(this));
			var sdata = this.toJSON();
			sendThreadShapeToServer(ss.jsonData.header.fileno,sdata, this.parentLayer.layerID);
		}
	}	

	//creates side panel roll downs according to which shapes are present in this script
	createAppropriateSidePanels()
	{
		this.getScriptRepo().getGoldenThreadScript(this, 
		function(shape)
		{
			if (shape.script)
				flow_utils.addScriptSidePanelRolldown(shape.script);
		},
		function(shape)
		{
			console.log("Failed to retrieve script!");
		}
		);
					
		if (this.note)
			flow_utils.addNoteSidePanelRolldown(this.note);
	}

	getScriptRepo()
	{
		return this.getParentScene().scriptMap;
	}

	getParentScene()
	{
		return this.scene ? this.scene : getActiveScene();
	}

	toJSON()
	{
		//return {pos:this.position.toJSON(), dimensions:this.dimensions.toJSON(), id:this.id, typename:this.constructor.name,label:this.label, mainBodyText:this.mainBodyText, topCodeText : this.topCodeText};
		//this is a catch all most shapes, if you need specific behaviour, override this method		
		return {X:this.position.x, Y:this.position.y, W:this.dimensions.x, H: this.dimensions.y, id:this.id, typename:this.shape.typename,label:this.label, mainBodyText:this.mainBodyText, topCodeText : this.topCodeText, text:this.text};
	}


}
