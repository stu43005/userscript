// ==UserScript==
// @name       Dmhy 動漫花園
// @version    0.1.3
// @match      *://share.dmhy.org/*
// @require    http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @grant      none
// ==/UserScript==

// RSS
if (location.href.indexOf("/topics/list") != -1) {
	$(".main .nav_title .fr a img[alt='rss']").parent("a").attr("href", location.href.replace("/topics/list","/topics/rss"));
}

// Search
$("#topic_list a").filter(function(){
	if($(this).attr("href").match(/topics\/list\/(team_id|sort_id|user_id)\/(\d+)/))
		return true;
	else
		return false;
}).each(function(){
	var a = $(this),
		id = a.attr("href").match(/topics\/list\/(team_id|sort_id|user_id)\/(\d+)/);
	a.parent().append("(", $("<a/>").attr({
		"href": "#",
		"title": "加到搜尋"
	}).html("*").click(function(){
		var keyword = $("#keyword");
		keyword.val(keyword.val() + " " + id[1] + ":" + id[2]);
		return false;
	}), ")");
});

$("#topic_list tr th:nth-child(2)").attr("width","6%");