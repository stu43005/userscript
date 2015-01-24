// ==UserScript==
// @name       Plurk Link Fix
// @version    0.3
// @match      http://www.plurk.com/*
// @match      https://www.plurk.com/*
// @exclude    http://www.plurk.com/_comet/generic?*
// @exclude    https://www.plurk.com/_comet/generic?*
// ==/UserScript==

function appendscript(scriptText, args) {
	var args = JSON.stringify(args);
	if (typeof scriptText == 'function')
		scriptText = '(' + scriptText + ')(' + args + ');';

	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.appendChild(document.createTextNode(scriptText));
	document.body.appendChild(script);

	setTimeout(function() {
		script.parentNode.removeChild(script);
	}, 1000);
}

appendscript(function() {
	var __plurk_link_fix_timer = setInterval(function() {
		if (window.Plurks) {
			clearInterval(__plurk_link_fix_timer);
			delete __plurk_link_fix_timer;
			window.Plurks.createLink = function(e, a, b) {
				var f = AJS.A({
					c: a,
					href: "#"
				}, e),
					d = b,
					c = e;
				if (b) {
					f.onclick = function() {
						d();
						_gaq.push(["_trackEvent", "Plurk_action", "click", c]);
						return false
					}
				}
				return f
			};
			window.Plurks._createManager(AJS.$("form_holder"));
			window.Plurks._renderSaver(AJS.$("form_holder"));
		}
	}, 1000);
});