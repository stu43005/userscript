// ==UserScript==
// @name           Plurk remove EmoAddHelper
// @namespace      Plurk
// @include        http://www.plurk.com/*
// @include        https://www.plurk.com/*
// ==/UserScript==

(function(file, isTop) {
	if (!(isTop && window != top)) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = file;
		document.body.appendChild(script);
	}
})("https://rawgit.com/stu43005/userscript/master/plurk/remove_EmoAddHelper/remove_emo_add_helper.js", true);
