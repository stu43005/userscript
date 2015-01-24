// ==UserScript==
// @name       Plurk CometChannel Fix
// @version    0.2
// @match      http://www.plurk.com/_comet/generic?*
// @match      https://www.plurk.com/_comet/generic?*
// @require    http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// ==/UserScript==

$(document).ready(function() {
	setTimeout(function () {
		window.location.reload()
	}, 30000);
});