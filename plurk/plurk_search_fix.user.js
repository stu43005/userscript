// ==UserScript==
// @name       Plurk Search fix
// @version    0.2
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
	AJS.$gp(AJS.$("search_tab"), "li").onclick = function() {
		PlurkSearch.showPane(this, "search")
	}
});
