// ==UserScript==
// @name       Plurk embed tweets
// @version    1.2
// @match      http://www.plurk.com/*
// @match      https://www.plurk.com/*
// @require    https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require    https://rawgit.com/stu43005/localscript/master/index.js
// ==/UserScript==

localScript(function() {
	/*
	 * Set-up Twitter for Websites
	 * https://dev.twitter.com/web/javascript/loading
	 */
	window.twttr = (function(d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0],
			t = window.twttr || {};
		if (d.getElementById(id)) return t;
		js = d.createElement(s);
		js.id = id;
		js.src = "https://platform.twitter.com/widgets.js";
		fjs.parentNode.insertBefore(js, fjs);

		t._e = [];
		t.ready = function(f) {
			t._e.push(f);
		};

		return t;
	}(document, "script", "twitter-wjs"));

	var TweetsCache = {
		cache: {},
		inCache: function(a) {
			return this.cache[this.cacheKey(a)] !== undefined;
		},
		get: function(a) {
			return this.cache[this.cacheKey(a)];
		},
		set: function(a, b) {
			this.cache[this.cacheKey(a)] = b;
		},
		cacheKey: function(b) {
			return b;
		}
	};

	var isMac = navigator.platform.match(/Mac/i);

	function showTweet(tweetId) {
		var posX = (event.pageX > (jQuery(window).width() / 2)) ? "left" : "right";

		if (jQuery("#tweet-" + posX).data("tweetId") == tweetId)
			return;

		hideTweet();

		var div;
		if (TweetsCache.inCache(tweetId)) {
			div = TweetsCache.get(tweetId);
		} else {
			div = jQuery('<div class="tweet"></div>');
			TweetsCache.set(tweetId, div);

			/*
			 * Scripting: Factory Functions (twttr.widgets.createTweet)
			 * https://dev.twitter.com/web/javascript/creating-widgets#tweets
			 */
			twttr.widgets.createTweet(tweetId, div.get(0), {
				conversation: 'none',
				width: 500,
				align: 'left'
			});
		}

		jQuery("#tweet-" + posX).append(div).data("tweetId", tweetId).show();
	}

	function hideTweet(e) {
		if (e && ((!isMac && e.ctrlKey) || (isMac && e.metaKey)))
			return;

		warp_div.hide().remove(".tweet").data("tweetId", "");
		return true;
	}

	var warp_div = jQuery("<div/>", {
		id: "tweet-left",
		css: {
			'position': "fixed",
			'top': "30px",
			'left': "10px",
			'z-index': 99998,
			'text-align': "center",
			'color': "#999"
		},
		html: "<div>按住ctrl鍵可以固定住Tweet</div>"
	}).hide().bind("mousemove", hideTweet);
	warp_div = warp_div.add(warp_div.clone(true).attr("id", "tweet-right").css({
		'right': "10px",
		'left': ""
	})).appendTo("body");

	twttr.ready(function(twttr) {
		jQuery("#timeline_holder").on("mouseenter", ".plurk", function(e) {
			var tweetLinks = jQuery(".text_holder a[href*='twitter.com']", this);
			for (var i = 0; i < tweetLinks.length; i++) {
				var url = tweetLinks.get(i).href;
				var tweetId = url.match(/twitter.com\/\w+\/status\/(\d+)/i);
				if (tweetId) {
					tweetId = tweetId[1];
					showTweet(tweetId);
					break;
				}
			}
		}).on("mouseleave", ".plurk", hideTweet);
	});
});
