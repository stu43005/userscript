// ==UserScript==
// @name       Plurk Scroll fix
// @version    0.6
// @match      http://www.plurk.com/*
// @match      https://www.plurk.com/*
// @require    http://ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js
// ==/UserScript==

$.scrollThis = function(selector) {
	$(document).add("#timeline_holder").add("#form_holder").on("mousewheel", selector, function(e){
		var list = $(selector);
		if ( list.length > 0 ) {
			e.preventDefault();
			$("body").scrollTop(0);
			e.originalEvent.wheelDeltaY && list.stop().animate({
				scrollTop: "-=" + e.originalEvent.wheelDeltaY
			}, 20);
		}
	});
}

setTimeout(function() {
	if ($("#colorbox").length > 0 && $("#form_holder").length > 0) {
		$.scrollThis("#form_holder .list");
		$.scrollThis("#colorbox .cbox_left");
		$.scrollThis("#colorbox .cbox_response");
	} else if (document.readyState !== 'complete') {
		setTimeout(arguments.callee, 1000);
	}
}, 1000);
