// ==UserScript==
// @name       Plurk embed tweets
// @version    1.1
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

	twttr.ready(function(twttr) {
		jQuery("#timeline_holder").on("mouseenter", ".plurk", function(e) {
			if (jQuery(".text_holder .tweet", this).length > 0) return;

			var tweetLinks = jQuery(".text_holder a[href*='twitter.com']", this);
			for (var i = 0; i < tweetLinks.length; i++) {
				var url = tweetLinks.get(i).href;
				var tweetId = url.match(/twitter.com\/\w+\/status\/(\d+)/i);
				if (tweetId) {
					tweetId = tweetId[1];

					var div;
					if (TweetsCache.inCache(tweetId)) {
						div = TweetsCache.get(tweetId);
					} else {
						div = jQuery('<div class="tweet"/>')
						TweetsCache.set(tweetId, div);

						/*
						 * Scripting: Factory Functions (twttr.widgets.createTweet)
						 * https://dev.twitter.com/web/javascript/creating-widgets#tweets
						 */
						twttr.widgets.createTweet(tweetId, div.get(0), {
								conversation: 'none',
								width: 300,
								align: 'left'
							});
					}

					div.appendTo(jQuery(".text_holder", this));
					break;
				}
			}
		});
	});
});
