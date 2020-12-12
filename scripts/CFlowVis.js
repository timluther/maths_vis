
import {CScene} from './CScene.js';


var breaks = [' ','-','/','=','_'];

function notBreak(ch)
{
    return !breaks.includes(ch);
}



function processTextWrap(ctx, text, lineHeight, bounds, padding, textFunc)
{
    var textMetrics = ctx.measureText(text);
    var posy = bounds.y;
    var bw = bounds.w - padding * 2;
    if (textMetrics.width > bw)
    {
    while (textMetrics.width > bw)
    {
        var diff = textMetrics.width - bw;
        var ratio = diff / textMetrics.width;

        var textCutoff = (Math.floor(text.length * (1.0 - ratio)));
        while (textCutoff > 0 && notBreak(text[textCutoff]))
        {
            textCutoff--;
        }
        var subtext = text.substr(0, textCutoff);
        textFunc(ctx, subtext, bounds.x, posy);
        text = text.substr(textCutoff);
       
        
        posy += lineHeight;
        textMetrics = ctx.measureText(text);
        if (textCutoff == 0)
            break;
    }
    }
    
    if (text.length > 0)
      textFunc(ctx, text, bounds.x, posy);
        
}

function drawTextWrap(ctx, text, lineHeight, bounds, padding = 2)
{
  processTextWrap(ctx, text, lineHeight, bounds, padding, function(ctx, text, x ,y)
  {     
    ctx.fillText(text, x, y);
  });
}

function CPreformattedText(ctx, text, lineHeight, bounds, padding =2)
{
  this.bounds = bounds;
  this.fullText = text;
  this.lines = [];
  this.textBounds = {x:0,y:0,w:1,h:1};
  this.padding = padding;

  this.init = function(ctx, text, lineHeight, bounds, padding)
  {
    var me = this;
    processTextWrap(ctx, text, lineHeight, bounds, padding, 
    function(ctx, text, x, y)
    {
      var textMetrics = ctx.measureText(text);
      if (textMetrics.width > me.textBounds.w)
        me.textBounds.w = textMetrics.width;

      me.lines.push({text : text, position: new CVector2(x,y), width: me.textBounds.w });
    });

    this.textBounds.h = this.lines.length * lineHeight;

  }

  this.draw = function(ctx,x,y)
  {
    for (var i = 0; i < this.lines.length; ++i)
    {
      var line = this.lines[i];
      ctx.fillText(line.text, line.position.x + x, line.position.y + y);
    }
  }

  this.init(ctx,text,lineHeight, bounds, padding);
}

function drawFile(ctx, x,y,width,height, dogEarSize)
{
    ctx.beginPath();
    ctx.moveTo(x, y + dogEarSize);
    ctx.lineTo(x + dogEarSize, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + dogEarSize);
    ctx.lineTo(x + dogEarSize, y + dogEarSize);
    ctx.lineTo(x + dogEarSize, y);
    ctx.closePath();
}

function drawArrow(ctx, x,y,width,height, bodyWidthPC, neckWidthPC)
{
    ctx.beginPath();
    var neckXPos =x + (width * (neckWidthPC / 100));
    var bodyHalfHeight = height * (bodyWidthPC / 200);
    var hh = height / 2;
    var x2 = x + width;
    var y1 = y - height / 2;
    var y2 = y + height / 2;
    var by1 = y - bodyHalfHeight;
    var by2 = y + bodyHalfHeight;
    var neckX = x2 - width * (neckWidthPC / 100);
    ctx.moveTo(x2, y);
    ctx.lineTo(neckX, y1);
    ctx.lineTo(neckX, by1);
    ctx.lineTo(x, by1);
    ctx.lineTo(x, by2);
    ctx.lineTo(neckX, by2);
    ctx.lineTo(neckX, y2);
    ctx.lineTo(x2, y);
    ctx.closePath();
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) 
{
  if (typeof stroke == 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }

}

var gTimeout = -1;
var gAnimObject = null;


function CArrowShape(shape, colour)
{
    this.position = new CVector2(shape.X, shape.Y);
    this.dimensions = new CVector2(shape.W, shape.H);
    this.colour = colour;
    this.shape = shape;    

    this.render = function(ctx)
    {
        ctx.beginPath();
        ctx.fillStyle = this.colour;
        drawArrow(ctx, this.position.x , this.position.y+ this.dimensions.y / 2, this.dimensions.x, this.dimensions.y, 50, 30);
        ctx.fill();
        ctx.stroke();
    

        var tpx = this.position.x + 4;
        var tpy =  this.position.y + 80;
        ctx.fillStyle = "#010101";
        if (this.shape.Id && gDrawIDs)
        {
            drawTextWrap(ctx, this.shape.id, ctx.lineHeight, {x:tpx, y:tpy, w:this.dimensions.x, h:this.dimensions.y});            
            tpy+=this.dimensions.y;
        }
        
        if (this.shape.cwObject)
        {                           
            var maxWidth = 10000;//this.dimensions.x - 8;
            if (this.shape.cwObject.label)
            {                               
                drawTextWrap(ctx, this.shape.cwObject.label, ctx.lineHeight, {x:tpx, y:tpy, w:this.dimensions.x, h:this.dimensions.y});            
                tpy+=this.dimensions.y;               
            }
        }           
    }
}

function CCircleShape(shape, scale, yoffset = 0, colour = "#FFEEEE")
{
    this.position = new CVector2(shape.X, shape.Y);
    this.dimensions = new CVector2(shape.W, shape.H);
    this.colour = colour;
    this.shape = shape;
    this.scale = scale;
    this.drawText = true;
    this.yoffset = yoffset;
    this.pfText = null;

    this.render = function(ctx)
    {
        ctx.font = "10px Georgia";
       ctx.fillStyle = this.colour;
        var shape = this.shape;
        ctx.beginPath();
        var hwidth =  this.dimensions.x / 2;
        var hheight = this.dimensions.y / 2;
        var hwidths = hwidth * this.scale;
        var hheights = hheight * this.scale;

        ctx.ellipse(this.position.x + hwidth, this.position.y + hheight, hwidths, hheights, 0,0,360);

        ctx.fill();
        ctx.stroke();
        ctx.save();
        
   
        ctx.fillStyle = "#010101";
        
        if (this.drawText)
        {
            if (!this.pfText)
            {
              if (this.shape.cwObject)
              {                           
                var maxWidth = 10000;//this.dimensions.x - 8;
                if (this.shape.cwObject.label)
                {               
                    this.pfText = new CPreformattedText(ctx, this.shape.cwObject.label, 14, {x:0, y:0, w:this.dimensions.x, h:this.dimensions.y} );                    
                }
              }
            }
            //tpy+=this.dimensions.y;               
            if (this.pfText)              
            {
               var tpx = this.position.x + hwidth - (this.pfText.textBounds.w / 2)
               var tpy = yoffset + this.position.y + hheight - (this.pfText.textBounds.h / 2);

               
               this.pfText.draw(ctx,tpx,tpy + 10);
            }
        }
        ctx.restore();
    }
}
function CFileShape(shape, colour)
{
    this.position = new CVector2(shape.X, shape.Y);
    this.dimensions = new CVector2(shape.W, shape.H);
    this.colour = colour;
    this.shape = shape;

    this.render = function(ctx)
    {
        
         ctx.fillStyle = this.colour;
        ctx.beginPath();
        drawFile(ctx, this.position.x , this.position.y, this.dimensions.x, this.dimensions.y, 10);
        ctx.fill();
        ctx.stroke();
        

        var tpx = this.position.x + 4;
        var tpy =  this.position.y + 28;
        ctx.fillStyle = "#010101";

        if (this.shape.Id && gDrawIDs)
        {           
            drawTextWrap(ctx, this.shape.id, ctx.lineHeight, {x:tpx, y:tpy, w:this.dimensions.x, h:this.dimensions.y});            
            tpy+=this.dimensions.y;
        }
        
        if (this.shape.cwObject)
        {                           
            var maxWidth = 10000;//this.dimensions.x - 8;
            if (this.shape.cwObject.label)
            {               
                drawTextWrap(ctx, this.shape.cwObject.label, ctx.lineHeight, {x:tpx, y:tpy, w:this.dimensions.x, h:this.dimensions.y});            
                tpy+=this.dimensions.y;               
            }
        }           
    }
}

function CRectFullText(shape, colour)
{
    this.position = new CVector2(shape.X, shape.Y);
    this.dimensions = new CVector2(shape.W, shape.H);
    this.colour = colour;
    this.shape = shape;

    this.render = function(ctx)
    {
        ctx.beginPath();
        ctx.fillStyle = this.colour;
        ctx.rect(this.position.x, this.position.y, this.dimensions.x, this.dimensions.y);
        ctx.fillRect(this.position.x, this.position.y, this.dimensions.x, this.dimensions.y);
        //ctx.stroke();
        ctx.save();
        ctx.clip();

        var tpx = this.position.x + 4;
        var tpy =  this.position.y + ctx.lineHeight;
        ctx.fillStyle = "#010101";     
        
        if (this.shape.cwObject)
        {                           
            var maxWidth = 10000;//this.dimensions.x - 8;
            if (this.shape.cwObject.properties.text)
            {
                drawTextWrap(ctx, this.shape.cwObject.properties.text, ctx.lineHeight, {x:tpx, y:tpy, w:this.dimensions.x, h:this.dimensions.y});
                tpy+=20;
            }
        }
        ctx.restore();
    }

}

function CRectShape(shape,colour, topCode = false)
{
    this.position = new CVector2(shape.X, shape.Y);
    this.dimensions = new CVector2(shape.W, shape.H);
    this.colour = colour;
    this.shape = shape;
    this.topCode = topCode;

    this.render = function(ctx)
    {
        ctx.beginPath();
        ctx.fillStyle = this.colour;
        ctx.rect(this.position.x, this.position.y, this.dimensions.x, this.dimensions.y);
        ctx.fillRect(this.position.x, this.position.y, this.dimensions.x, this.dimensions.y);
        ctx.stroke();
        ctx.save();
        ctx.clip();

        var tpx = this.position.x + 4;
        var tpy =  this.position.y + 14;
        ctx.fillStyle = "#010101";
        if (this.shape.Id && gDrawIDs)
        {
            drawTextWrap(ctx, this.shape.id, ctx.lineHeight, {x:tpx, y:tpy, w:this.dimensions.x, h:this.dimensions.y});            
            tpy+=this.dimensions.y;
        }
        
        if (this.topCode)
        {
            try
            {
            var assoc = this.shape.cwObject.associations;
            if (assoc)
            {
                for (var k in assoc)
                {
                    var memb = assoc[k];
                    if (Array.isArray(memb))
                    {
                        for (var i = 0 ; i < memb.length; ++i)
                        {
                            if (memb[i].hasOwnProperty('name'))
                            {                               
                                drawTextWrap(ctx, memb[i].name, ctx.lineHeight, {x:tpx, y:tpy, w:this.dimensions.x, h:this.dimensions.y});            
                                tpy+=ctx.lineHeight;
                                
                                break;
                            }
                        }
                    }
                }
            }
            }
            catch
            {

            }
        }

        if (this.shape.cwObject)
        {                           
            var maxWidth = 10000;//this.dimensions.x - 8;
            if (this.shape.cwObject.label)
            {               
                drawTextWrap(ctx, this.shape.cwObject.label, ctx.lineHeight, {x:tpx, y:tpy, w:this.dimensions.x, h:this.dimensions.y});            
                tpy+=this.dimensions.y;
            }
        }
        ctx.closePath();
        if (topCode)
        {
            ctx.beginPath();
            ctx.lineTo(this.position.x, this.position.y + ctx.lineHeight);
            ctx.lineTo(this.position.x + this.dimensions.x, this.position.y + ctx.lineHeight);
            ctx.closePath();
            ctx.stroke();
        }

        ctx.restore();
    }
}
function CRoundedRectShape(shape, colour)
{
    this.position = new CVector2(shape.X, shape.Y);
    this.dimensions = new CVector2(shape.W, shape.H);
    this.colour = colour;
    this.shape = shape;

    this.render = function(ctx)
    {
        ctx.beginPath();
        ctx.fillStyle = this.colour;
        roundRect(ctx, this.position.x, this.position.y, this.dimensions.x, this.dimensions.y, 10);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.clip();

        var tpx = this.position.x + 4;
        var tpy =  this.position.y + 18;
        ctx.fillStyle = "#010101";   
                
        if (shape.cwObject)
        {                           
            var maxWidth = 10000;//this.dimensions.x - 8;
            if (this.shape.cwObject.label)
            {               
                drawTextWrap(ctx, this.shape.cwObject.label, ctx.lineHeight, {x:tpx, y:tpy, w:this.dimensions.x, h:this.dimensions.y});
               
            }
        }
        ctx.restore();
    }
}

function CFlowVis(name = "#golden_flow_canvas")
{
    this.ctx = null;
    this.canvasName = "";


    this.annotations = [];
    this.lineHeight = 18;
    this.div = null;

    this.camera = new CCamera();
    this.initialise = function(name)
    {
        var c = $(name)[0];
        this.div = c;
        c.flowVisObject =  this;
        c.onmousedown = function(e)
        {
            e.target.flowVisObject.mouseDown(e);
        }
        c.onmousemove = function(e)
        {
            e.target.flowVisObject.mouseMove(e);
        }
        c.onmouseup = function(e)
        {
            e.target.flowVisObject.mouseUp(e);
        }
        c.onmousewheel = function(e)
        {
            e.target.flowVisObject.mouseWheel(e);
        }
        this.canvasName = name;
        this.ctx = c.getContext("2d");

        this.ensureDimensions();
    }

    this.ensureDimensions = function()
    {
        
        var w = $(this.div).parent().width();
        var h = 700;// $(c).parent().height();
        this.ctx.canvas.width = w;
        this.ctx.canvas.height = h;
    }

    this.setJSONdata = function(jsonData)
    {
        this.ensureDimensions();
        this.jsonData = jsonData;
        this.preparse();       
    }

    this.lastMouse = new CVector2(0,0);
    this.mouseDelta = new CVector2(0,0);
    this.cameraStartPos = this.camera.position.copy();
    this.dragInProgress = false;
    this.jsonData = null;
    this.shapes = [];

    this.addAnnotation = function(pos)
    {
        this.annotations.push({position:pos});
        this.render();
    }

    this.mouseDown = function(e)
    {
        this.dragInProgress = true;
        this.mouseStartPos = new CVector2(e.layerX, e.layerY);
        this.cameraStartPos = this.camera.position.copy();
        var pos = this.camera.viewSpaceToWorld(this.mouseStartPos);
        //this.addAnnotation(pos);
        console.log("New mouse start pos");
    }

    this.mouseMove = function(e)
    {       
        var mousePos = new CVector2(e.layerX, e.layerY);
        if (this.dragInProgress)
        {
            var mouseDiff = mousePos.subtract(this.mouseStartPos);
            this.camera.setPosition(this.cameraStartPos.add(mouseDiff));
            this.render();
        }
        this.mouseDelta = mousePos.subtract(this.lastMouse);
        this.lastMouse = new CVector2(e.layerX, e.layerY);
    }


    this.animInner = function()
    {
        var diff =  gAnimObject.camera.fov -  gAnimObject.zoomTarget;
        if (Math.abs(diff) > 1.0)
        {
            gAnimObject.zoomAt(diff / 2000, gAnimObject.zoomOffset);
            gTimeout = setTimeout(gAnimObject.animInner, 5);
        }
        else
            gTimeout = -1;
    }

    this.animZoom = function(targetZoom , offset)
    {
        gAnimObject = this;
        this.zoomTarget = targetZoom;
        this.zoomOffset = offset;

        this.animInner();
    }

    this.zoomAt = function(amount, offset)
    {
    //1.0 -
        var divisor =  1.0 - amount;//(amount / 10.0);//this.camera.fov;
        
    
        var newPos = this.camera.viewSpaceToWorld(offset);
        
        this.camera.matrix.translate(newPos.x, newPos.y);
        this.camera.matrix.scale(divisor, divisor);
        this.camera.matrix.translate(-newPos.x, -newPos.y);

        this.camera.updateFromMatrix();
        this.render();
        
    }

    this.mouseWheel = function(e)
    {
        if (gTimeout > -1)
            clearTimeout(gTimeout)
        var centreP = this.camera.position.copy();
    //zoomAt
        var targetZoom = this.camera.fov - ((e.deltaY / 1.0) );
            if (targetZoom < 30)
            targetZoom = 30;
        console.log("Target zoom: " + targetZoom.toString());
        //this.animZoom(targetZoom, new CVector2(e.layerX , e.layerY ));
        this.zoomAt((this.camera.fov - targetZoom) / 1000.0, new CVector2(e.layerX , e.layerY ));
        //this.camera.fov += e.deltaY / 10.0;
        e.stopPropagation();
        this.render();
    }

    this.mouseUp = function(e)
    {
        this.dragInProgress = false;
    }

    this.isVisible = function(shape)
    {
        var vspos = this.camera.worldSpaceToView(shape.position);
            
        var dim = this.camera.worldSpaceToViewVector(shape.dimensions);
        return ((vspos.x + dim.x >=0) && (vspos.x <= this.ctx.canvas.width) && (vspos.y + dim.y >=0) && (vspos.y <= this.ctx.canvas.height));
    }


    this.addShape = function(shape)
    {
        this.shapes.push(shape);
    }

    this.preparse = function()
    {       
        this.shapes = [];
       var shapes = this.jsonData.diagram.shapes;
        for (var i = 0; i < shapes.length; ++i)
        {
            var shape = shapes[i];
            
            {
                switch (shape.objectTypeId)
                {
                    case 13211:
                        this.addShape(new CRectFullText(shape, "#FFEEEE"));break;
                        
                    case 13330:
                        this.addShape(new CRoundedRectShape(shape, "#BBBBBB"));break;
                    
                    case 20060:
                        this.addShape(new CCircleShape(shape, 1.5, 50, "#FFDD00"));break;           
                    case 7230:              
                        if (shape.cwObject.properties.type_id == 263)
                        {                           
                            this.addShape(new CArrowShape(shape, "#222222"))
                        }
                        else if (shape.cwObject.properties.type_id == 261)
                        {                                                   
                            this.addShape(new CArrowShape(shape, "#DDDDDD"))
                        }
                        else
                        {
                            this.addShape(new CFileShape(shape, "#EEEEEE"))
                        }
                        break;
                    case 8953: this.addShape(new CRectShape(shape,"#FFEE25", true));break;
                    case 9097: this.addShape(new CCircleShape(shape,1.0,0,"#FFFFFF"));break;
                    case 9225: this.addShape(new CRectShape(shape,"#FFEE25"));break;
                }       
            }
        }
        

    }

    //this.ctx.fillStyle = 


    this.render = function()
    {

        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.camera.setContextMatrix(this.ctx); 
        this.ctx.lineHeight = this.lineHeight;
        

        ///this.ctx.moveTo(0, 0);
        //this.ctx.lineTo(200, 100);        
        //this.ctx.stroke();
        this.ctx.font = "12px Georgia";
        
        var shapes = this.shapes;
        for (var i = 0 ; i< shapes.length; ++i)
        {
            var shape = shapes[i];
            if (this.isVisible(shape))
              shape.render(this.ctx);
        }
        
        for (var i = 0; i < this.annotations.length; ++i)
        {
            this.ctx.beginPath();
            var s = 10;
            this.ctx.ellipse(this.annotations[i].position.x + s / 2, this.annotations[i].position.y + s / 2, s, s, 0,0,360);
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.closePath();
        }
        var joiners = this.jsonData.diagram.joiners;
        
        for (var i = 0; i < joiners.length;++i)
        {
            var join = joiners[i];
            var points = join.points;
            if (points.length > 0)
            {
                this.ctx.beginPath();
                this.ctx.moveTo(points[0].X, points[1].Y);
                for (var ptidx = 1; ptidx < points.length; ++ptidx )
                {
                    this.ctx.lineTo(points[ptidx].X, points[ptidx].Y);

                }
                this.ctx.stroke();
                this.ctx.beginPath();

            }
        }

    }
    this.initialise(name);
    return this;
}
