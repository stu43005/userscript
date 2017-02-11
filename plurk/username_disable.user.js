// ==UserScript==
// @name       Plurk 避免按到使用者名稱
// @version    1.1.1
// @match      http://www.plurk.com/*
// @match      https://www.plurk.com/*
// @require    https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// ==/UserScript==

$("#timeline_holder").on("click", ".name", function(e) {
	e.preventDefault();
	return false;
});

$(document).on("mouseenter", ".user_info", function() {
	var name = $(".display_name", this);
	var nick = $(".nick_name", this).text().substr(1);
	if (name.find("a").length < 1) {
		name.wrapInner("<a href=\"/" + nick + "\" target=\"_blank\" class=\"name\"></a>");
	}
});
