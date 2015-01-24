// ==UserScript==
// @name       Plurk time_show Fix
// @version    0.1
// @match      http://www.plurk.com/*
// @match      https://www.plurk.com/*
// @require    http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// ==/UserScript==

$(document).on("click", "#updater a", function(){
	$(".morning").remove();
});