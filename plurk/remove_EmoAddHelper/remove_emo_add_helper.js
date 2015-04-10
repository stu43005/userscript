EmoAddHelper.attachAddOverlayTimeline = function() {};

Plurks._attachEmotionClickEvent = function() {
	jQuery("#timeline_holder").on("mouseover mouseout click", "div.plurk", function(d) {
		if (jQuery(d.target).hasClass("emoticon_my")) {
			switch (d.type) {
				case "mouseover":
					Plurks._plurkMouseOver(this);
					break;
				case "mouseout":
					Plurks._plurkMouseOut(this);
					break;
				case "click":
					Plurks.expand(this);
					break;
			}
		}
	});
	jQuery("#form_holder").on("mouseover mouseout", "div.plurk", function(c) {
		if (jQuery(c.target).hasClass("emoticon_my")) {
			switch (c.type) {
				case "mouseover":
					Responses.responseMouseOver(this);
					break;
				case "mouseout":
					Responses.responseMouseOut(this);
					break;
			}
		}
	});
};
jQuery(document).ready(function(a) {
	if (a("body").hasClass("timeline")) {
		Plurks._attachEmotionClickEvent()
	}
});
