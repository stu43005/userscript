// ==UserScript==
// @name           Anti dblclick
// @namespace      Plurk
// @include        http://www.plurk.com/*
// ==/UserScript==

if(location.href.match(/^http\:\/\/www\.plurk\.com\//))
	setTimeout('(function(url){ var newRequest = document.createElement("script");newRequest.type = "text/javascript";newRequest.src = url;document.getElementsByTagName("head")[0].appendChild(newRequest); })("http://www.grassboy.tw/plurkTool/anti_dblclick/main.js")', 1000);
