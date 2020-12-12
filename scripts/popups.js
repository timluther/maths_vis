
const POPMODE_NONE = 0;
const POPMODE_CLICK = 1;
const POPMODE_HOVER = 2;


function togglePopupVisibility(event)
{
	$(event.target).parent().addClass("hidden");
}


function getTableObjectFromChildElement(elem)
{
	var table = $(elem).closest('table');
	if (table.length > 0)
	{
		return table[0]['table'];
	}
	return null;
}

function tableFilterChanged(event)
{
	var target = event.target;
	var value = target.value;
	var name = target.name;
	var name_elems = name.split("_");
	var table = getTableObjectFromChildElement(target);
	table.setFilter(name_elems[1], value);
	console.log(event);
}

function extractContent(html)
{
    return (new DOMParser).parseFromString(html, "text/html").documentElement.textContent;
}


var globalMousePos = {x:0,y:0};

function onMouseUpdate(e) 
{
	globalMousePos.x = e.pageX - window.pageXOffset;
	globalMousePos.y = e.pageY - window.pageYOffset; 

	document.documentElement.style.setProperty('--mouse-x', globalMousePos.x);
    document.documentElement.style.setProperty('--mouse-y', globalMousePos.y);
	//console.log(globalMousePos.x, globalMousePos.y);
}



function expand(bounds, margin)
{
	return {left: bounds.left - margin, right: bounds.right + margin, top: bounds.top - margin, bottom: bounds.bottom + margin};
}

function inside(pt, bounds)
{
	return (pt.x >= bounds.left) && (pt.y >= bounds.top) && (pt.x <= bounds.right) && (pt.y <= bounds.bottom);
}

function isPointWithinAnyPopupHitbox(pt, margin, startIndex)
{
	var popups = $(".popup");

	for (var i = startIndex; i < popups.length; ++i)
	{
		var popup = $(popups[i]);
		if (!popup.hasClass('hidden'))
		{
			if ((inside(pt, expand(popups[i].getBoundingClientRect(), margin))))
				return true;
		}
	}
	return false;
}

function onMouseDown(e) 
{
	document.documentElement.style.setProperty('--last-click-mouse-x', globalMousePos.x);
    document.documentElement.style.setProperty('--last-click-mouse-y', globalMousePos.y);
	//globalMousePos.x = e.pageX;
	//globalMousePos.y = e.pageY;
	var popups = $(".popup");
	var insideFlags = 0;
	for (var i = 0; i < popups.length; ++i)
	{
		var elemBounds = popups[i].getBoundingClientRect();
		if (inside(globalMousePos, elemBounds))
		{
			insideFlags |= 1 << i;
		}
		else
		{
			$(popups[i]).addClass("hidden");
			lastPoppedUpSource = null;
		}
	}
}

function initPopupInfrastructure()
{
	document.addEventListener('mousemove', onMouseUpdate, false);
	document.addEventListener('mouseenter', onMouseUpdate, false);
	document.addEventListener('mousedown', onMouseDown, false);
}

function delayedPopup(event, timeout, timeoutIfPopup, text, popupIndex)
{
	var target = $(event.target);
	var popupName = popupIndexToName(popupIndex);	
	var popupElem = $(popupName);
	if (!popupElem.hasClass('hidden'))
		timeout = timeoutIfPopup;

	if (isPointWithinAnyPopupHitbox({x : event.pageX, y:event.pageY}, 15, popupIndex))
	{
		return;
	}
	if (lastPoppedUpSource != target[0])
	{
		lastPoppedUpSource = target[0];
		setTimeout(function()
		{
			
	
			var bounds = target[0].getBoundingClientRect();

			if (inside(globalMousePos, bounds))
			{	
				setPopupContents(text, target, popupIndex);
	
				var popupElem = $(popupName);
				var pbounds = popupElem[0].getBoundingClientRect();
	
				root.style.setProperty('--popup-local-mouse-x', (globalMousePos.x - pbounds.left - 10).toString() + "px");
	    		root.style.setProperty('--popup-local-mouse-y', (globalMousePos.y - pbounds.bottom).toString() + "px");
	
			}
		}, timeout);
	}	
}



function arrangeAround(popup, arrangeAroundElem)
{
	var arrangeAroundOffset = arrangeAroundElem.offset();
  	var height = popup.height();
 	 var width = popup.width();

	var arrangeAroundWidth = arrangeAroundElem.width();
	var arrangeAroundHeight = arrangeAroundElem.height();
	var rightPos = (arrangeAroundOffset.left + width);
	if (rightPos > window.innerWidth)
	{
		popup.css('left', window.innerWidth - width - 40);  
	}
	else
		popup.css('left', arrangeAroundOffset.left);  
	var minusAmount = (height + arrangeAroundHeight);
	if (minusAmount < arrangeAroundOffset.top)
	{
		popup.css('top', arrangeAroundOffset.top - minusAmount);
	}
	else
	{
		popup.css('top', arrangeAroundOffset.top + arrangeAroundHeight);
	}	
}

function popupIndexToName(popupIndex)
{
	return "#popup" + (popupIndex > 0 ? (popupIndex + 1).toString() : "");
}

function setPopupContents(htmlContents, arrangeAroundElem, popupIndex)
{
  var popup = $(popupIndexToName(popupIndex));
  var popupContents = popup.find("#popup_inner");
  popup.removeClass("hidden");
  popupContents.html(htmlContents);
  arrangeAround(popup, arrangeAroundElem);
}

function setHoverPopupContentsFromDiv(event, timeout = 300, popupIndex = 0)
{
	var element = $(event.target);
	var parentTable = element.closest('table');
	var tableManager = parentTable[0]['table'];
	var row = element.closest('tr');
	var j = element.index();
	var rowOffset = tableManager.getRowOffset();
	var i = row.index() - rowOffset;
	var idx = tableManager.rowOffsetToItemIndex(i);
	var hoverPopupContents = tableManager.list.getHoverPopup(j, idx);
	if (hoverPopupContents != "")
		delayedPopup(event, timeout, timeout - 10, hoverPopupContents, popupIndex); 
}

function setPopupContentsFromDiv(event, popupIndex=0)
{
	var element = $(event.target);
	var parentTable = element.closest('table');
	var tableManager = parentTable[0]['table'];
	var row = element.closest('tr');
	var j = element.index();
	var rowOffset = tableManager.getRowOffset();
	var i = row.index() - rowOffset;
	var idx = tableManager.rowOffsetToItemIndex(i);
	var hoverPopupContents = tableManager.list.getHoverPopup(j, idx);

	setPopupContents(hoverPopupContents, element, popupIndex); 
}
