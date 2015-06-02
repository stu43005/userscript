// ==UserScript==
// @name       Plurk CometChannel Fix
// @version    0.3
// @match      http://www.plurk.com/_comet/generic?*
// @match      https://www.plurk.com/_comet/generic?*
// ==/UserScript==

document.addEventListener("DOMContentLoaded", function(event) {
	setTimeout(function () {
		window.location.reload()
	}, 30000);
});
