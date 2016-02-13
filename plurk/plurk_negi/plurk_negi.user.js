// ==UserScript==
// @name           Plurk Nagi
// @namespace      Plurk
// @version        0.1
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
})("https://rawgit.com/stu43005/userscript/master/plurk/plurk_negi/plurk_negi.js", true);

/*
網址列(或書籤)用：
javascript:(function(f){var d=document,s=d.createElement('script');s.type='text/javascript';s.src=f;d.body.appendChild(s)})("https://rawgit.com/stu43005/userscript/master/plurk/plurk_negi/plurk_negi.js")
*/
