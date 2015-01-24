// ==UserScript==
// @name         Youtube fix
// @include      http://*.youtube.com/*
// @include      http://youtube.com/*
// @include      https://*.youtube.com/*
// @include      https://youtube.com/*
// @grant        none
// @version      1.0
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// ==/UserScript==

var ww = $(window).width();
if (!$("#page").hasClass("watch"))
{
	$("#page").css("width", ww - 90 + "px");
	$("#content, .branded-page-v2-container").css("width", ww - 270 + "px");
}