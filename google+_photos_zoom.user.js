// ==UserScript==
// @name       Google+ photos zoom
// @version    0.5
// @match      http://lh*.googleusercontent.com/*
// @match      https://lh*.googleusercontent.com/*
// @match      http://lh*.ggpht.com/*
// @match      https://lh*.ggpht.com/*
// @require    http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// ==/UserScript==

var raw = location.href;
if (raw.indexOf("/s0/") == -1) {
	if(raw.match(/.*\.com\/.*\/(\-?w\d+|\-?h\d+|\-p|\-o|s\d+(-[ch])?)+\/.*/)) {
		raw = raw.replace(/\/(\-?w\d+|\-?h\d+|\-p|\-o|s\d+(-[ch])?)+\//, '/s0/');
	}
	location.href = raw;
}