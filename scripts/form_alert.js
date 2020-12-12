var gAlertText = null;

var gMessageBoxText = null;


/*
<div id='confirmation_popup' class='animatedVerticalPopup offScreenTop wobble_transition'>
	<div class="closeButton" onClick="togglePopupBox($(this).parent());" style="position:relative"> </div>

	<h1>Confirmation</h1>	
	<p id="confirmation_text"> contents </p>	
	<div>
		<button id="yes_button" class="button" onClick="togglePopupBox($(this).parents('.animatedVerticalPopup'));">Yes</button>
		<button id="no_button" class="button" onClick="togglePopupBox($(this).parents('.animatedVerticalPopup'));">No</button>
	</div>
*/

function openConfirmDialog(textMessage, yes_func, no_func, yes_text, no_text)
{
	var confirmation_popup = $("#confirmation_popup");
	if (confirmation_popup.length > 0)
	{
		openPopupBox(confirmation_popup);	
		var textDiv = confirmation_popup.find("#confirmation_text");
		textDiv.html(textMessage);
		var yes_button = confirmation_popup.find("#yes_button");
		var no_button = confirmation_popup.find("#no_button");
		if (yes_text)
			yes_button.html(yes_text);
		if (no_text)
			no_button.html(no_text);

		if (yes_func)
		{
			yes_button.off('click');
			yes_button.on('click',function(event)	
			{
				togglePopupBox($(this).parents('.animatedVerticalPopup'));
				yes_func(event);
			});
		}
		if (no_func)
		{
			no_button.off('click');
			no_button.on('click', function(event)	
			{
				togglePopupBox($(this).parents('.animatedVerticalPopup'));
				no_func(event);
			});
		}
		

	}
}

function messageBox(text)
{
	if (!gMessageBoxText || gMessageBoxText.length == 0)
	{
		gMessageBoxText = $('#message_text');	
	}

	if (gMessageBoxText.length != 0)
	{
		var parent = gMessageBoxText.parents(".animatedVerticalPopup");
		openPopupBox(parent);				
		gMessageBoxText.html(text);
	}
}	

function setAlertText(text)
{
	if (!gAlertText || gAlertText.length == 0)
	{
		gAlertText = $('#alert_text');		
	}

	if (gAlertText.length != 0)
	{
		var parent = gAlertText.parent();
		openPopupBox(parent);				
		gAlertText.html(text);
	}
}