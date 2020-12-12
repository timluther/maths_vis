
<script language="javascript" src="scripts/form_alert.js"></script>
<div id='confirmation_popup' class='confirmDialog popupMessage animatedVerticalPopup green_bg offScreenTop wobble_transition hidden_div'>
	<div class="topright">
	<div class="closeButton" onClick="togglePopupBox($(this).parent().parent());" style="position:relative">X</div>
	</div>

	<h1>Confirmation</h1>	
	<p id="confirmation_text"> contents </p>	
	<div class="bottomBar">
		<button id="yes_button" class="button" >Yes</button>
		<button id="no_button" class="button" onClick="togglePopupBox($(this).parents('.animatedVerticalPopup'));">No</button>
	</div>
</div>
<!--onClick="togglePopupBox($(this).parents('.animatedVerticalPopup'));"-->


<div id='alert_popup' class='animatedVerticalPopup popupMessage offScreenTop wobble_transition hidden_div red_bg'>
	<div class="topright">
		<div class="closeButton" onClick="togglePopupBox($(this).parent().parent());" style="position:relative">X</div>
	</div>

	<h1>ALERT</h1>	
	<p id="alert_text"> contents </p>	
</div>


<div id='message_box' class='animatedVerticalPopup popupMessage dark_blue_bg offScreenTop wobble_transition hidden_div'>
	<div class="topright">
	<div class="closeButton" onClick="togglePopupBox($(this).parent().parent());" style="position:relative">X</div>
	</div>

	<h1>Message</h1>
	<div class="fillspace">
	<p id="message_text"> contents </p>
	</div>
	<div>
		<button class="button" onClick="togglePopupBox($(this).parents('.animatedVerticalPopup'));">OK</button>
	</div>
</div>