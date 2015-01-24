// ==UserScript==
// @name           PlurkListAll
// @namespace      Plurk
// @description    List All Users who Liked/Limited to Read a Plurk
// @include        http://www.plurk.com/*
// ==/UserScript==

if(location.href.match(/^http\:\/\/www\.plurk\.com\//))
	setTimeout('(function(url){ var newRequest = document.createElement("script");newRequest.type = "text/javascript";newRequest.src = url;document.getElementsByTagName("head")[0].appendChild(newRequest); })("http://www.grassboy.tw/plurkTool/list_all/main.js")', 1000);
