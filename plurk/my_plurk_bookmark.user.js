// ==UserScript==
// @name       My Plurk Bookmark.
// @version    1.0
// @match      http://www.plurk.com/*
// @match      https://www.plurk.com/*
// @require    https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// ==/UserScript==

function popUp(URL, w, h) {
	window.open(URL, "_pu" + (Math.random() + "").replace(/0\./, ""), "toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=" + w + ",height=" + h + ",left=" + ((screen.width - w) / 2) + ",top=" + ((screen.height - h) / 2));
	return false;
}

function main(e) {
	if ($(".manager .action.bookmark", this).length > 0) return false;

	var pid = $(this).data("pid").toString(36);
	$(".manager", this).prepend($("<a/>", {
		"class": "action bookmark",
		href: "#",
		text: "書籤",
		click: function() {
			return popUp("http://140.116.249.88/oauth/plurk/plurkBookmark.php?func=add&pid=" + pid, 1110, 400);
		}
	}));
}

$("#timeline_holder").on("mouseover", ".plurk", main);
