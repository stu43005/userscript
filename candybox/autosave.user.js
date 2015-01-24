// ==UserScript==
// @name           Candy box ! AutoSave
// @namespace      Candy box !
// @version        2.0
// @include        http://candies.aniwey.net/index.php?pass=*
// @include        http://aniwey.net/candies-hardmode/index.php?pass=*
// ==/UserScript==

if(location.href.match(/^http\:\/\/candies\.aniwey\.net\/index\.php\?pass\=/) || location.href.match(/^http\:\/\/aniwey\.net\/candies\-hardmode\/index\.php\?pass\=/))
	setTimeout('(function(url){ var newRequest = document.createElement("script");newRequest.type = "text/javascript";newRequest.src = url;document.getElementsByTagName("head")[0].appendChild(newRequest); })("https://dl.dropboxusercontent.com/u/4211700/chrome/userscript/candybox/autosave.js")', 3000);
