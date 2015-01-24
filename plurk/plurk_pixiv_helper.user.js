// ==UserScript==
// @name       Plurk Pixiv Helper
// @version    0.8
// @match      http://www.plurk.com/*
// @match      https://www.plurk.com/*
// @require    http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// ==/UserScript==

function main(e) {
	var text_holder = $(".text_holder", this);
	var find = /\b([iI][dD]|ill|illust_id|[pP]ixiv|[pP]ixiv：id)(\=|＝)?(\d+)(.*)/i;

	if (find.test(text_holder.text())) {
		var childs = text_holder.get(0).childNodes;
		$.each(childs, function(index, el) {
			if (el instanceof Text) {
				if (find.test(el.textContent)) {
					var m = el.textContent.match(find);
					el.textContent = el.textContent.replace(find, "$1$2");

					var a = $("<a>", {
						href: "http://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + m[3],
						text: m[3]
					}).get(0);
					//$(el).insertAfter(a);
					el.parentNode.insertBefore(a, el.nextSibling);

					var endtext = document.createTextNode(m[4]);
					el.parentNode.insertBefore(endtext, a.nextSibling);
				}
			}
		});
	}
}

$("#timeline_holder").on("mouseover", ".plurk", main);
$("#form_holder").on("mouseover", ".plurk", main);