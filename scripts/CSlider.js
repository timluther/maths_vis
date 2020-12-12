import {pauseEvent} from "/scripts/util_functions.js"

function validateNumeric(evt)
{    
    var target = evt.target;    
    var theEvent = evt || window.event;

    // Handle paste
    if (theEvent.type === 'paste') {
          key = event.clipboardData.getData('text/plain');
    } else {
    // Handle key press
          var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
    }
    var regex = /[0-9]|\./;
    if( !regex.test(key) ) 
    {
        theEvent.returnValue = false;
        if(theEvent.preventDefault) theEvent.preventDefault();
   }
   
   if (target.slider)
   {   	    
       target.slider.setSliderPositionFromText();
   }
}

const EUF_LISTENERS = 0x1;
const EUF_SLIDER = 0x2;
const EUF_TEXT = 0x4;

export class CSlider
{

    constructor(divName, value = 0, min = 0, max = 100)
    {        
        this.UIroot = $(divName);
            
        this.value = value;
        this.min = min;
        this.max = max;

        this.listeners = [];
        //todo: add these elements if they don't already exist
		this.UIContainer = this.UIroot.find("#slider_container");
		if (this.UIContainer.length == 0)
		{
			this.UIroot.append(`<div id="slider_container">
			<div id="slider_bg"></div>
			<div id="slider_btn"></div>
			</div>
			<input type="text" id="slider_text"></input>
			<div id="slider_mintext"></div>
			<div id="slider_maxtext"></div>`);
			this.UIContainer = this.UIroot.find("#slider_container");
		}
        this.UIbg = this.UIroot.find("#slider_bg");
        this.UIButton = this.UIroot.find("#slider_btn");
        this.UIText = this.UIroot.find("#slider_text");
        this.UIText[0].slider = this;
		this.UIContainer[0].slider = this;
        this.UIText.keypress(function(e){validateNumeric(e);});
        this.UImintext = this.UIroot.find("#slider_mintext");
        this.UImaxtext = this.UIroot.find("#slider_maxtext");
        this.offsetPosition = 11;//this.slider.UIButton.width();//leftVal - this.startPosition;
        this.UIroot[0].slider = this;

        this.UIContainer.on('pointerdown ',function(event)
        {                                      
            var widthMax = this.slider.UIbg.width();
            var mpx = event.pageX - this.slider.UIbg.offset().left;
            event.stopPropagation();
            if (mpx < widthMax)
            {
                //should perhaps offset here from centre position if hits slider button                
            	this.startPosition = mpx;
                this.dragging = true;
                
                this.slider.setSliderPosition(this.startPosition);
                this.slider.UIText.css("pointer-events","none");
                this.slider.UIText.css("user-select", "none");
                
            	if (event.pointerId)
                    this.setPointerCapture(event.pointerId);
                //pauseEvent(event);
                
			}
        });
        //mousedown touchstart
        //touchmove
        this.UIContainer.on('mousemove touchmove', function(event)
           {
               if (this.dragging)
               {
               	   var mpx = event.pageX - this.slider.UIbg.offset().left;
                   event.stopPropagation();
                   this.slider.setSliderPosition(mpx);                                                       
                   
               }
           });
           //
        this.UIContainer.on('pointerup mouseup',function(event)
        {
            this.dragging = false;
            this.slider.UIText.css("pointer-events","all");
            this.slider.UIText.css("user-select", "all");
            if (event.pointerId)
                this.releasePointerCapture(event.pointerId);
        });

        this.updateText();
        if (this.UIButton.length > 0)
        {
            this.UIButton[0].slider = this;
            this.UIText.val(value);
            
        }
        else
        {
            console.log("Trying to create a slider but no divs found");
        }
    }

    addListener(func)
    {
    	this.listeners.push(func);
    }

    setSliderPositionFromText()
    {
    	var tval = this.UIText.val();
        var value = parseFloat(tval);
        
        this.setValue(value, EUF_LISTENERS | EUF_SLIDER);
    }

	setValues(value, min, max, updateFlags = 0xFFFF)
	{
		this.min = min;
		this.max = max;
		this.setValue(value,updateFlags);
	}

    setValue(value, updateFlags = 0xFFFF)
    {
    	if (value != undefined && !isNaN(value))
        {
			if (value < this.min)
       		    value = this.min;
       		if (value > this.max)
           		value = this.max;

            if (this.value != value)
            {
				var widthMax = this.UIbg.width();
                var nval = (value - this.min) / (this.max - this.min);
                var posval = (nval * widthMax) + this.offsetPosition;
	
                this.value = value;
				if ((updateFlags & EUF_LISTENERS) != 0)
            		for (var i in this.listeners)
						this.listeners[i](this.value, this);
				if ((updateFlags & EUF_SLIDER) != 0)
                	this.setSliderPosition(posval, 0);//don't update other things, just slider position
				if ((updateFlags & EUF_TEXT) != 0)
                	this.updateText();
            }
        }
    }

    setSliderPosition(newPos,flags = EUF_LISTENERS | EUF_TEXT)
    {
    	newPos -= this.offsetPosition;
        var widthMax = this.UIbg.width();
        if (newPos < 0)
            newPos = 0;
        if (newPos > widthMax)
            newPos = widthMax;
        this.UIButton.css("left",newPos);
		this.onSliderPositionChanged(flags);
    }

    onSliderPositionChanged(flags = EUF_LISTENERS | EUF_TEXT)
    {
        var widthMax = this.UIbg.width();
        var pos = this.UIButton.position().left;
        var v = ((pos / widthMax) * (this.max- this.min)) + this.min;
        this.setValue(v, flags &~ EUF_SLIDER);        
        //var value = 
    }

    updateText()
    {
        this.UImintext.html(this.min);
        this.UImaxtext.html(this.max);
        this.UIText.val(this.value);
    }

    setA(val)
	{
		this.a = val;
		this.invalidate();
	}
	setB(val)
	{
		this.b = val;
		this.invalidate();
	}
	setC(val)
	{
		this.c = val;
		this.invalidate();
	}

    
};

export function initSliders()
{
    var sliders = $(".slider");
	var sliderlist = [];
	sliders.each(function()
	{			
		sliderlist.push(new CSlider(this));			
	});
}