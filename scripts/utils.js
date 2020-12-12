/**********************************************
General Javascript helper functions
Anything that's not specific to any one project
ought to go in here.

Refactor by category as needed.
***********************************************/


var gVerbosity = 1;

function decode64(input) 
{	
	var keyStr = "ABCDEFGHIJKLMNOP" +
	"QRSTUVWXYZabcdef" +
	"ghijklmnopqrstuv" +
	"wxyz0123456789+/" +
	"="; 
	var output = "";
	var chr1, chr2, chr3 = ""; 
	var enc1, enc2, enc3, enc4 = "";
	var i = 0;
	// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	var base64test = /[^A-Za-z0-9\+\/\=]/g;
	if (base64test.exec(input)) 
	{
		alert("There were invalid base64 characters in the input text.\n" +
		"Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
		"Expect errors in decoding.");
	}
 
	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	do 
	{
		enc1 = keyStr.indexOf(input.charAt(i++));
		enc2 = keyStr.indexOf(input.charAt(i++));
		enc3 = keyStr.indexOf(input.charAt(i++));
		enc4 = keyStr.indexOf(input.charAt(i++));
		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;
		output = output + String.fromCharCode(chr1);
		if (enc3 != 64) {
			output = output + String.fromCharCode(chr2);
		}
		if (enc4 != 64) {
			output = output + String.fromCharCode(chr3);
		}
		chr1 = chr2 = chr3 = "";
		enc1 = enc2 = enc3 = enc4 = "";
	} while (i < input.length);
	return decodeURI(output);
 }


function isInteger(str) 
{
    if (str == null) {
        return false;
    }
    var length = str.length;
    if (length == 0) 
    {
        return false;
    }
    var i = 0;
    if (str[0] == '-') 
    {
        if (length == 1) {
            return false;
        }
        i = 1;
    }
    for (; i < length; i++) 
    {
        var c = str[i];
        if (c < '0' || c > '9')
            return false;        
    }
    return true;
}

function getFilename(fullpath)
{
	var fn = fullpath.replace(/^.*[\\\/]/, '');
	return fn;
}

function getFilenameSansExt(fullpath)
{
	var fn = fullpath.replace(/^.*[\\\/]/, '');
	var pidx = fn.indexOf(".")
	if (pidx != -1)
		return fn.substring(0,pidx);
	else
		return fn;
}



function createUniqueGUID() 
{
	GUID = createNewGUID();
	for (var l of layerDescriptions) 
	{
		for (f of l.localGeoData.features) 
		{
			if (f.properties.GUID == GUID)
				return createUniqueGUID();
		}
	}
	return GUID;
}

function parseLngLat(str) 
{
	//replace( /^\D+/g, '')
	var pidx = str.indexOf('(');
	if (pidx != -1)
		str = str.slice(pidx + 1, str.length);
	var res = str.split(",");
	var floatArray = new Array(res.length);

	for (var i = 0; i < res.length; ++i) 
	{
		floatArray[i] = parseFloat(res[i]);
	}

	lngLat = new mapboxgl.LngLat(floatArray[0], floatArray[1]);
	return lngLat;
}

function stacktrace() 
{ 
  function st2(f) {
	return !f ? [] : 
		st2(f.caller).concat([f.toString().split('(')[0].substring(9) + '(' + f.arguments.join(',') + ')']);
  }
  return st2(arguments.callee.caller);
}

function ensureMember(group, member, initialvalue)
{
	if (!group.hasOwnProperty(member))
		group[member] = initialvalue;
}

function standardErrorFunction(e)
{
	var msg = e.message ? e.message : e.responseText;
	setAlertText(msg);
	console.log("error message from server:" + msg);
}

function isInvisible(elem)
{
	var jqelem = $(elem);
	return ((jqelem.parents('.hidden_div').length > 0) || (jqelem.hasClass('hidden_div')));	
}

function getName(tag)
{
	var name = tag.attr("name");
	if (!name)
		name = tag.attr("id");
	return name;
}

function checkDataForNullKeys(data)
{
	var found= 0;
	var idx = 0;
	for (var i in data)
	{
		if ((i == undefined) || (i == 'undefined'))
		{
			found |= 1 << idx;
			console.log("Found undefined key");
		}
		++idx;
	}
	return found;
}


function isValidGroupCode(id)
{
	if (id && id != "" && (id[0] == "G"))
	{
		return !isNaN(id.substring(1));
	}
	return false;
}

function addItemToGroup(output, name,value)
{
	if (output.hasOwnProperty(name)) {
		if ((output[name]) == value) {
			ensureMember(output, 'matchingDuplicates', {});
			output.matchingDuplicates[name] = value;
		}
		else {
			ensureMember(output, 'conflictingDuplicates', {});
			output.conflictingDuplicates[name] = value;
		}
	}
	output[name] = value;
}

function getOptionFromSelectElem(elem, value)
{
	if (elem.options !== undefined)
	{
		if ( value in elem.options)
		{
			return elem.options[elem.value];
		}
		else
		{
			for (var i in elem.options)
			{
				var entry = elem.options[i];
				if (value == entry.textContent)
					return elem.options[i];
				if (value == entry.value)
					return elem.options[i];
			}
		}
	}
	return undefined;
}

function serialiseFormHeirarchical(form, asMap, specification = null)
{
	var output = asMap?{}:[];
		 
	var elem = form;
	var jqelem = $(elem);
	elem = jqelem[0];
	var inputs = jqelem.children();
	
	
	var id = elem.id;		
	var innerText =elem.innerText;
	var tagName = elem.tagName.toLowerCase();
	if (tagName == 'input')
	{
		console.log("got input");
	}
		
	if ('value' in elem)
	{
		var isSelect = false;
		if (tagName == "select")
		{
			isSelect = true;
			//decide to store by indx or value here
		}
		if ((jqelem.parents('.hidden_div').length > 0) || (jqelem.hasClass('hidden_div')))
		{
			console.log("invisible");
		}
		if ((elem.name != "")  && (!jqelem.hasClass('ignore_in_form')))
		{
			var value = elem.value;
			if (isSelect)
			{
				var option = getOptionFromSelectElem(elem, elem.value);
				if (specification && elem.name in specification.map)
				{				
					itemSpec = specification.map[elem.name];				
					if ( itemSpec)
					{					
						if (itemSpec.selectAsText === true) //if this is set, rather than use the value, it'll use the item's text. If there is no value, the index is used
						{
							try {
								value = option.textContent; 	
							} catch (error) {
								console.log(error);
							}							
						}					
					}
				}
			}
			console.log(elem.name + ": " + value);
			if (asMap)
			{
				if (elem.name == undefined)
					elem.name = "error_name_undefined";
				addItemToGroup(output, elem.name, value);
			}
			else
			{
				output.push(value);
			}			
		}
		
	}
	else
	{
		/*children = serialiseFormHeirarchical($(elem));
		if (children.length > 0) 
		{
			if (id !="")
				output[elem.name] = {"name":id, "children" : children};
			else 
				output.concat(children);
		}*/
	}
	if (tagName != "select")
	{
		for (var i = 0; i < inputs.length; ++i)
		{
			var childOutput = serialiseFormHeirarchical(inputs[i], asMap, specification);
			checkDataForNullKeys(childOutput);
			if (asMap)
			{
                if (Object.keys(childOutput).length > 0)
                {
                	if (isValidGroupCode(id))
                	{
                		if (!output['subgroups'])
                		    output['subgroups']=[];
					    output['subgroups'].push({id: childOutput});
                	}
					else 
					{
						for (var key in childOutput)
						{
							addItemToGroup(output, key, childOutput[key]);
						}
						//output = {...output, ...childOutput};
						
					}
                }

			}
			else //array output, no member names
			{
			    if (childOutput.length > 0) 
			    {
				    if (id !="" && (id[0]=="G"))
					    output.push({"groupcode":id, "children" : childOutput});
				    else 
				    	output = output.concat(childOutput);
			    }
			}				
		}
	}
	
	return output;
}

function serializeForm(form)
{
	var form = $(form);
	var inputs = form.find("input, select, textarea");
	output = {};
	for (var i = 0; i < inputs.length; ++i)
	{
		var elem = inputs[i];
		var jqelem = $(elem);
		if ((jqelem.parents('.hidden_div').length > 0) || (jqelem.hasClass('hidden_div')))
		{
			console.log("invisible");
		}
		if ((elem.name != "")  && (!jqelem.hasClass('ignore_in_form')))
		{
			console.log(elem.name + ": " + elem.value);
			output[elem.name] = elem.value;
		}
	};
	//check to see if we have any quill data in this form
	var quillEditor = form[0]['quillEditor'];
	var quilldiv = $(form).find(".ql-editor");
	if (quilldiv && quillEditor && !isInvisible(quilldiv))
	{

		var data = quillEditor.getContents();
		//var jsondata = JSON.stringify(data);
		//var redata = JSON.parse(jsondata);
		output['quilldata'] = data.ops;//json_encode(data);
	}

	var serializable_tags = $(form).find(".serializable_children");
	for (var i = 0; i < serializable_tags.length; ++i)
	{		
		var tag = $(serializable_tags[i]);
		var name = getName(tag);
		var pelem = output[name];
		if (!pelem)
			pelem = output[name] = [];
		
		var children = tag.children();


		children.each(function () 
		{			
			var jqelem = $(this);
			var grandchildren = jqelem.find(".serialize_field");
			if (!(jqelem.hasClass("ignore_in_form")))
			{
				if (grandchildren.length >= 1)
				{	
					var group = {};
					grandchildren.each(function()
					{
						var grandchild = $(this);
						var name = getName(grandchild);
						var gchild = grandchild[0];
						var value = gchild.innerText.trim();
						group[name] = value;
						console.log("element:" + name);
					});			
					pelem.push(group);
				}
				else 
				{
					var text = this.innerText.trim();
					if (text != "")
    					pelem.push(text);
				}
			}
		});

	}
	


	//quillEditor = editTextDOM['quillEditor'];
	/*layerIdx = editTextDOM['layerIdx'];	
	markerIdx = editTextDOM['markerIdx'];
	if ((quillEditor != null) && (layerIdx != undefined) && (markerIdx != undefined))
	{
		data = quillEditor.getContents();

		
	}*/


	return output;
}



function parseBool(val)
{
	if (val == true || val == false) return val;
	else return (val =="true");
}

function getToggleStatus(thz)
{
	var togstatus = thz.attr('toggled');
	return togstatus == null ? false: parseBool(togstatus);
}

function getEnsureAttr(obj, attr, initialState)
{
	var status = obj.attr(attr);
	if (status == null)
	{
		obj.attr(attr, initialState);
		status = obj.attr(attr);
		return initialState;
	}
	return status;
}

function toggleHideVerticalInner(parent, offset, thz) 
{	
	var hgt= - (parent.height() - offset); //bit of fudge to avoid the annoying 'mapbox(c) overlay'
	var value = hgt.toString() + "px";
	var togstatus = getEnsureAttr(parent, 'toggled', true);
	var arrow = thz ? thz.find(".hider_arrow") : null;
	if ((!togstatus) || (togstatus == false) || (togstatus == "false"))
	{
		parent.attr('toggled',true);
		parent.css("margin-bottom", value);
		
		if (arrow)
			arrow.css("transform","rotateZ(180deg)")
	}
	else
	{
		parent.attr('toggled',false);
		parent.css("margin-bottom", 0);
		if (arrow)
			arrow.css("transform","rotateZ(0deg)")
	}				
}

function toggleHideVertical(thz) 
{	
	toggleHideVertical( thz.parent(), thz.width() - 4, thz);					
}

function toggleHideHorizontalInner(parent, offset, thz= null)
{
	var wdth= - (parent.width() - offset);
	var value = wdth.toString() + "px";
	var togstatus = getEnsureAttr(parent, 'toggled', false);
	var arrow = thz ? thz.find(".hider_arrow") : null;
	if ((!togstatus) || (togstatus == false) || (togstatus == "false"))
	{
		parent.attr('toggled',true);
		parent.css("left", value);
		
		if (arrow)
			arrow.css("transform","rotateZ(180deg)")
	}
	else
	{
		parent.attr('toggled',false);
		parent.css("left", 0);
		if (arrow)
			arrow.css("transform","rotateZ(0deg)")
	}	
}

//'thz' is the button
function toggleHideHorizontal(thz)
{			
	toggleHideHorizontalInner(thz.parent(), thz.width() - 4, thz);
}

function getPopableParent(w)
{
	return $(event.target).parents(".popable");
}

function openPopupBox(box)
{
	if (box.hasClass('offScreenTop'))
	{		
		box.removeClass('offScreenTop');
		

	}
	box.removeClass('hidden_div');

}



function togglePopupBox(box)
{
	//toggleHideVerticalInner(box,0);
	var boxJS = box[0];
	if (box.hasClass('offScreenTop'))
	{

		box.removeClass('offScreenTop');
		box.removeClass('hidden_div');

	
	}
	else
	{
		box.addClass('offScreenTop');
		console.log("Closing popup box" + box.attr('id'));

		box.bind('oanimationend animationend webkitAnimationEnd', function() 
		{ 
   			box.addClass('hidden_div');
   			box.unbind('oanimationend animationend webkitAnimationEnd');
   			console.log("Finished closing popup box" + box.attr('id'));
		});
		
	}




	/*
	if (box && box.length > 0)
	{
		var top = parseFloat(box.position().top);
		
		if (isEpsilon(top,0.01))
		{
			box.css('top','-200vh');	
		}
		else
			box.css('top','0');		
	}*/
}



function deescapeEscapeCodes(str)
{
	if (str != null)
	{
		if (str.constructor === String)
		{
			str =str.replace("\\n", '\n');
			str =str.replace("\\r", '\r');
			return str.replace("\\t", '\t');
		}
		else
			return str;
	}
	else
		return null;
}

function descapeInserts(arr)
{
	if (arr && Array.isArray(arr))
	for (var i = 0; i < arr.length; ++i)
	{
		arr[i].insert = deescapeEscapeCodes(arr[i].insert);
	}
	return arr;
}


function createNewGUID() 
{
	var GUID = Math.floor(Math.random() * 0xFFFFFFFF);
	return GUID;
}

function addClassToElement(elem, classString) 
{
	$(elem).addClass(classString);
	/*
	if ((elem != null) && (!elem.className.includes(classString))) 
	{
		elem.className += " " + classString;
	}*/
}

function removeClassFromElement(elem, classString) 
{
	 
	$(elem).removeClass(classString);
	/*
	if ((elem != null) && (elem.className.includes(classString))) 
	{
		elem.className.replace("/\b" + classString + "\b/g", "");
	}*/
}

function addClassToPopup(classString, checkIfHas= false) 
{
	if (checkIfHas && $(gPopup).hasClass(classString))
		return;
	if ('_content' in gPopup)
	{
		addClassToElement(gPopup._content, classString);
	}
}

function removeClassFromPopup(classString) 
{
	if ('_content' in gPopup) 
	{
		removeClassFromElement(gPopup._content, classString);
	}
}


function JQparentOrGlobal(parentObject, query)
{
	return parentObject ? parentObject.find(query) : $(query);	
}


function nextTabableInput(startView)
{	
	var parent = startView.closest('.tabable');
		
	
	parent = parent.next();
	while ((parent.length > 0) && (!parent.hasClass('tabable')))
    {
    	ntgt = ntgt.next();
    }
	if (parent.length > 0)
	{
		return parent.find(".tabtarget");
	}
	return null;
}

function setupTabBehaviour(group)
{
    /*tabables = group.find(".tabable");

    tabables.on("keyup",function(e)
    {
        if (e.keyCode == 13) 
        {
            var tgt = $(e.target);
            var ntgt = nextTabableInput(tgt);
            
            ntgt.focus();            
        }
    });*/

    var focusables = group.find(":focusable");   
    focusables.keyup(function(e) 
    {
        var maxchar = false;
        if ($(this).attr("maxchar")) 
        {
            if ($(this).val().length >= $(this).attr("maxchar"))
                maxchar = true;
            }
        if ((e.keyCode == 13) || maxchar) 
        {
            var current = focusables.index(this),
                next = focusables.eq(current+1).length ? focusables.eq(current+1) : focusables.eq(0);
            next.focus();
        }
    });
}

function doRollDown(rolldown)
{	
	if (rolldown.length != 0)
	{
		var container = rolldown.find("#rolldowncontents");
		container.toggleClass("zeroHeight");            
	}
		
}

function rolldownFromButton(event)
{
	doRollDown($(event.target).closest(".rolldown"))
}

function initialiseRolldowns(parentObject = null)
{
    var rolldowns = JQparentOrGlobal(parentObject, ".rolldowntitle");
    rolldowns.off('mousedown');
    rolldowns.on('mousedown', function(e)
    {
        doRollDown($(this).parents(".rolldown"));        
    });

	var rolldowns_arrows = JQparentOrGlobal(parentObject, ".rolldowntitlenoclick .rolldown_arrow");
	rolldowns_arrows.on('mousedown', function(e)
    {
    	doRollDown($(this).parents(".rolldown"));        
    });

}

function objectArrayAdd(obj, key, item)
{
	if (obj.hasOwnProperty(key))	
		obj[key].push(item);			
	else
		obj[key] = [item];
}


function mapArrayAdd(map, key, item)
{
	if (map.has(key))	
		map.get(key).push(item);	
	else
		map.set(key, [item]);
}


function preventDefaultOnReturn(e)
{
	var keyCode = e.keyCode || e.which; 
	if (keyCode === 13) {e.preventDefault(); return false;}	
} 

function callOnClose(obj)
	{
		if (obj.hasOwnProperty('length'))
		{
			for (var i = 0 ; i < obj.length; ++i)	
			   callOnClose(obj[i]);
		}
		
		if (typeof obj.onClose === 'function')
		{
			obj.onClose();
		}
				
	}

	function universalClose(target)
	{
		var parents=$(target).parents(".animatedVerticalPopup");
		if (parents.length > 0)
		{

			//if(typeof myObj.prop2 === 'function') 
			parents.addClass('offScreenTop');
			//these don't seem to fire! It could be that css animations from adding classes don't fire events but can't find documentation to confirm or deny this
			parents.bind('oanimationend animationend webkitAnimationEnd', function() 
			{ 
   				parents.addClass('hidden_div');
   				parents.unbind('oanimationend animationend webkitAnimationEnd');
   				console.log("Finished closing popup box" + box.attr('id'));
			});
			
			callOnClose(parents);
		}
		else
		{
			var parents= $(target).parents(".popable");
			parents.addClass("hidden_div");
			callOnClose(parents);
		}
	}


	function setupCloseButtons()
	{
		closeButtons = $(".universal_closeButton");
		closeButtons.on('mousedown', function(e) 
		{
			universalClose(this);
		});
	}

	function setupAddNewButtons()
	{
		addNewButtons = $(".addnew");
		addNewButtons.on('mousedown', function(e)
		{
			var target = $(this.dataset.target);
			target.removeClass("hidden_div");
		});
	}


function addToMapArray(map, key, value)
{
	if (key in map)	
		map[key].push(value);	
	else
	    map[key]=[value];
}



function DumpObjectIndented(obj, indent)
{
  var result = "";
  if (indent == null) indent = "";

  for (var property in obj)
  {
    var value = obj[property];
    if (typeof value == 'string')
      value = "'" + value + "'";	
    else if (typeof value == 'object')
    {
      if (value instanceof Array)
      {
        // Just let JS convert the Array to a string!
        value = "[ " + value + " ]";
      }
      else
      {
        // Recursive dump
        // (replace "  " by "\t" or something else if you prefer)
        var od = DumpObjectIndented(value, indent + "  ");
        // If you like { on the same line as the key
        //value = "{\n" + od + "\n" + indent + "}";
        // If you prefer { and } to be aligned
        //value = "\n" + indent + "{\n" + od + "\n" + indent + "}";
        value = "<br>" + indent + "{<br>" + od + "<br>" + indent + "}";
      }
    }
    result += indent + "'" + property + "' : " + value + ",<br>";
  }
  return result.replace(/,\n$/, "<br>");
}

Number.prototype.clamp = function(min, max) 
{
	return Math.min(Math.max(this, min), max);
};


