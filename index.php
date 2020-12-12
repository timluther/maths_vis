<!DOCTYPE html>
<html>
	<head>
		<title></title>
		<link href="https://fonts.googleapis.com/css?family=Fahkwang|Major+Mono+Display|Roboto" rel="stylesheet">
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
		<!-- Latest compiled and minified CSS -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
		<!-- Optional theme -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
		<!-- Latest compiled and minified JavaScript -->
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
		<script language="javascript" type="module" src="scripts/maths_vis.js">
		</script>
		<script language="javascript" src="scripts/vis.min.js">
		</script>
		<script src="https://cdn.rawgit.com/showdownjs/showdown/1.9.0/dist/showdown.min.js"></script>
		<script language="javascript" src="/scripts/CVector2.js"></script>
		<script language="javascript" src="/scripts/CRect.js"></script>
		<script language="javascript" src="/scripts/matrix2x3.js"></script>
		<script language="javascript" type="module" src="scripts/CScene.js"></script>
		<script language="javascript" src="/scripts/popups.js"></script>
		<script language="javascript" type="module" src="scripts/CSortableTable.js"></script>
		<script language="javascript" src="/scripts/utils.js"></script>

	 <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
  	<script id="MathJax-script" async
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js">

		    window.MathJax = {
          	  	loader: { load: ['[tex]/color'] },
	            tex: { packages: { '[+]': ['color'] } }
    	    };
  	</script>
		<link rel="stylesheet" href="css/base_styles.css" >
		<link rel="stylesheet" href="css/navmenu.css" >
		<link rel="stylesheet" href="css/maths_vis.css" >
		<link rel="stylesheet" href="css/popup_styles.css" >

	<script language='javascript' type="module">

			import {CMenuNav} from '/scripts/CMenuNav.js';
			import * as util_functions from '/scripts/util_functions.js';                			
        </script>




		
	</head>
	<body>
		<div class="titlebar">
			<h1> ⨛ Maths Primer</h1>
		</div>

		<div id="menucontainer">
    		<div id="breadcrumbcontainer">
    		    <ul class="list-inline bread_crumbs_container">
			    </ul>
    		</div>
    		<div id="navbuttonscontainer" class="navbuttons block">
        <ul>
        </ul>
    	</div>
	</div>

			
	
		<div class="topcontainer">
			<div id="maincontainer">			
			<div id="welcome">
			<h2>Welcome to the Maths Primer</h2>
			<p>
			The purpose of this website is to help you understand all the mathematics you need for your A-Level maths course, through interactive examples
			and questions.
			</p>
			</div>
			<?php
				$dir = new DirectoryIterator(dirname(__FILE__)."/pages");
				$i = 0;
				foreach ($dir as $fileinfo) {

					 if (!$fileinfo->isDot()) {
						$path = $fileinfo->getFilename();
						$fn = pathinfo($path, PATHINFO_FILENAME);
						print("<div id = ".$fn." class='hidden' />");
						require_once(__DIR__.'/pages/'.$path);
						print("</div>");
						$i++;
					 }
				}

			?>
			
			</div>
		</div>


		<div id="popupoverlay">			
			<?php include 'form_alert.php' ?>
			<div id="popup" class="popup popup_bg hidden">
				<div id="scrollable_inner">
					<div id="popup_inner">
					</div>
				</div>
				<div class="closeButton" onClick="togglePopupVisibility(event)">X</div>
			</div>
			<div id="popup2" class="popup popup_bg hidden">
				<div id="scrollable_inner">
					<div id="popup_inner">
					</div>
				</div>
				<div class="closeButton" onClick="togglePopupVisibility(event)">X</div>
			</div>
			<div id="popup3" class="popup popup_bg hidden">
				<div id="scrollable_inner">
					<div id="popup_inner">
					</div>
				</div>
				<div class="closeButton" onClick="togglePopupVisibility(event)">X</div>
			</div>
			
		</div>
	</body>
</html>