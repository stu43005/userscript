// ==UserScript==
// @name       Plurk Images Proxy
// @version    0.1
// @match      http://www.plurk.com/*
// @match      https://www.plurk.com/*
// @require    http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// ==/UserScript==

// https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?url=http%3A%2F%2Fi.imgur.com%2Fm7tbD1e.jpg&container=focus2222
var urls = ["i.imgur.com"];

function urlencode(href) {
	return href.replace(/\:/gi, "%3A").replace(/\//gi, "%2F");
}

function main(e) {
	var img = $(this);
	var src = img.attr("src") + "";
	var  match = false;

	for (var i = 0; i < urls.length; i++) {
		if (src.indexOf(urls[i])) {
			match = true;
			break;
		}
	}

	if (match) {
		var newSrc = "https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?url=" + urlencode(src) + "&container=focus2222";
		img.attr('src', newSrc);
		console.log("[Plurk Images Proxy]", img, src, newSrc);
	}
}

$(document).add("#timeline_holder").add("#form_holder").on("mouseover", "img", main);