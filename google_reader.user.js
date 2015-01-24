// ==UserScript==
// @name       Google Reader
// @version    0.2.7
// @match      https://www.google.com/reader/*
// @require    http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// ==/UserScript==

function images_zoom() {
	var body = $("#current-entry .entry-body"),
		href = $("#current-entry .entry-title a:first-child").attr("href");
	if ( href && body.length > 0 ) {
		$("img",body).each(function(){
			var src = $(this).attr("src"),
				t = false;
			if ( href.indexOf("plus.google.com") != -1 ) {
				if ( src.indexOf("googleusercontent.com/gadgets/proxy") != -1 && src.indexOf("url=") != -1 ) {
					src = src.slice(src.indexOf("url=")+4,src.length);
					if( src.indexOf("%27") != -1 ) {
						src = src.slice(0,src.indexOf("%27"));
					}
					src = src.replace(/%3A/gi, ":");
					src = src.replace(/%2F/gi, "/");
					$(this).attr("src",src);
				}
				if ( src.indexOf("ytimg.googleusercontent.com/vi/") != -1 ) {
					src = src.replace(/\/(\d|default)\.jpg/, '/0.jpg');
					$(this).attr("src",src);
				}
				if ( src.match(/.*googleusercontent\.com\/.*\/w(\d+)\-h(\d+)(\-p)?\/.*/) ) {
					src = src.replace(/\/w(\d+)\-h(\d+)(\-p)?\//, '/s0/');
					$(this).attr("src",src);
				}
				t = true;
			}
			if ( href.indexOf("engadget.com") != -1 ) {
				if ( src.indexOf("_thumbnail") != -1 ) {
					src = src.replace("_thumbnail", "");
					$(this).attr("src",src);
				}
				t = true;
			}
			if ( t )
				$(this).attr({"height":"","width":""}).css("max-width","100%");
		});
	}
}

/* fullrss 連結修正 */
function fullrss_url() {
	var body = $("#current-entry .entry-body");
	if ( body.length > 0 ) {
		$("a[href*='fullrss.net/r/']",body).each(function(){
			var t = $(this),
				href = t.attr("href"),
				i = href.indexOf("fullrss.net/r/");
			if ( i != -1 )
				t.attr("href", href.slice(i + 14, href.length).replace("http/","http://").replace("https/","https://"));
		});
	}
}

function hideSE($selector,$start_selector,$start_html,$end_selector,$end_html) {
	var start, end,
		has_selector = 0,
		has_html = 0;
	if ( typeof $selector == "undefined" || $selector == "" )
		return;
	if ( typeof $start_selector != "undefined" && $start_selector != "" )
		has_selector |= 1;
	if ( typeof $start_html != "undefined" && $start_html != "" )
		has_html |= 1;
	if ( typeof $end_selector != "undefined" && $end_selector != "" )
		has_selector |= 2;
	if ( typeof $end_html != "undefined" && $end_html != "" )
		has_html |= 2;
	$($selector).each(function(i){
		var t = $(this),
			match = 0;
		if ( has_html&1 ) {
			if ( has_selector&1 ) {
				if ( ($($start_selector,t).html()+"").indexOf($start_html) != -1 )
					start = i;
			} else {
				if ( (t.html()+"").indexOf($start_html) != -1 )
					start = i;
			}
			if ( typeof start != "undefined" && start <= i )
				match |= 1;
		}
		if ( has_html&2 ) {
			if ( has_selector&2 ) {
				if ( ($($end_selector,t).html()+"").indexOf($end_html) != -1 )
					end = i;
			} else {
				if ( (t.html()+"").indexOf($end_html) != -1 )
					end = i;
			}
			if ( typeof end == "undefined" || end >= i )
				match |= 2;
		}
		if ( has_html == match )
			t.hide();
	});
}

function div_hidden() {
	var body = $("#current-entry .entry-body"),
		href = $("#current-entry .entry-title a:first-child").attr("href");
	if ( href && body.length > 0 ) {
		// i ♥ Apps
		if ( href.indexOf("feedproxy.google.com/~r/iloveappshk/") != -1 || href.indexOf("www.iloveapps.hk/") != -1 ) {
			$(".item-body > div > div > div > ul > li > div > div > a > img",body).parent().parent().parent().parent().parent().parent().parent().hide();
			hideSE(".item-body>div>div>*",">div","你或會感興趣的其他相關文章：","","Facebook Comments (如不想用FB留言請用下面的留言系統)");
		}
		// 電萌 DenMoe
		if ( href.indexOf("denmoe.com/") != -1 ) {
			hideSE(".item-body>div>div:first-child>div>*",">div>span","把這篇好文推到書籤網站和大家分享吧",">p","關聯文章:");
			hideSE(".item-body>div>div:first-child>*",">p","也可以用臉書留言哦~","","");
		}
		// aniarc news 動漫新聞
		if ( href.indexOf("feeds.aniarc.com/~r/aniarc_news/") != -1 || href.indexOf("news.aniarc.com/") != -1 ) {
			hideSE(".item-body>div>div:first-child>*",">h3","更多相關文章",">center>a","Wordpress 內建留言系統");
		}
		// demoshop
		if ( href.indexOf("feedproxy.google.com/~r/demotc/") != -1 || href.indexOf("demo.tc/") != -1 ) {
			hideSE(".item-body>div>div:first-child>*","","",">p","站內搜尋載入中...");
			hideSE(".item-body>div>div:first-child>*","","網友回應","","");
		}
		// 夢翼殤★アニメ
		if ( href.indexOf("feedproxy.google.com/~r/blogspot/VYMel/") != -1 || href.indexOf("yumebasa.blogspot.tw/") != -1 ) {
			//$(".item-body>div").html(($(".item-body>div").html()+"").replace(/h\s?t\s?t\s?p:\/\/i\.i\s?m\s?g\s?u\s?r\.com\/(\w+)(\s?)(\w*)\.(\w+)/,"http://i.imgur.com/$1$3.$4"));
		}
		// 硬是要學
		if ( href.indexOf("feedproxy.google.com/~r/soft4funtw/") != -1 || href.indexOf("www.soft4fun.net/") != -1 ) {
			hideSE(".item-body>div>div:first-child>*",">div>h4","相關文章",">div>h4","相關文章");
		}
		// ★ACG(〞︶ 〝*)頹廢站★彡
		if ( href.indexOf("jsoraacg.blog.fc2.com/") != -1 ) {
			hideSE(".item-body>div>*",">h3","COMMENT",">h3","TRACKBACK");
		}
		// Chrome Story
		if ( href.indexOf("feedproxy.google.com/~r/ChromeStory/") != -1 ) {
			hideSE(".item-body>div>*",">div>h3","Read More Like This","","");
		}
		// 香腸炒魷魚
		if ( href.indexOf("feedproxy.google.com/~r/s9011514/") != -1 || href.indexOf("sofree.cc/") != -1 ) {
			hideSE(".item-body>div>div>*","","您或許對以下文章有興趣",">h3","發表迴響");
		}
	}
}

function entry_click() {
	if ( typeof entry_click.count == 'undefined' ) entry_click.count = 0;	//static variables
	if ( $("#current-entry .entry-body").length < 1 ) {
		entry_click.count++;
		if ( entry_click.count < 10 ) setTimeout(function(){entry_click()},100);
		else entry_click.count = 0;
		return;
	}
	entry_click.count = 0;

	if ( $("#stream-view-options-container > div:nth-child(2)").attr("aria-pressed") == "true" ) return;	// 功能只作用在列表顯示模式
	images_zoom();
	fullrss_url();
	div_hidden();
}
$("#entries .entry, #entries-up, #entries-down").live("click",entry_click);

var g_click = false,
	g_click_timer;
$("*:not(input)").live("keyup",function(e){
	if (g_click == true) {
		g_click = false;
		clearTimeout(g_click_timer);
		switch(e.keyCode) {
		case 72:	// h
		case 65:	// a
		case 83:	// s
		case 85:	// u
		case 84:	// t
		case 68:	// d
		case 69:	// e
		case 80:	// p
			return;
		}
	}
	if (e.keyCode == 71) {
		g_click = true;
		g_click_timer = setTimeout(function(){
			g_click = false;
		},1500);
		return;
	}
	switch(e.keyCode) {
	case 13:	// Enter
	case 32:	// Space
	case 79:	// O
	case 74:	// J
	case 75:	// K
	case 78:	// N
	case 80:	// P
	case 189:	// -
	case 109:	// num-
	case 187:	// =
		entry_click();
		break;
	case 84:	// T
		break;
	case 82:	// R
	case 49:	// 1
	case 97:	// num1
	case 50:	// 2
	case 98:	// num2
	case 51:	// 3
	case 99:	// num3
		break;
	case 36:	// Home
		break;
	case 35:	// End
		break;
	case 70:	// F
	case 85:	// U
	default:
		return;
	}
});