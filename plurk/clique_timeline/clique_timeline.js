jQuery(function($) {
	if (!$("body").hasClass("timeline")) return;
	if (typeof TimeLine == "undefined") return;

	var loadingMessageTmpl = Handlebars.compile("<div>已讀取{{done}}，共{{count}}人</div>");

	var lastTimes = [];
	var cachedPlurks = [];

	var CliqueTimeLineCache = {
		cache: {},
		inCache: function(a) {
			return this.cache[this.cacheKey(a)] !== undefined;
		},
		get: function(a) {
			return this.cache[this.cacheKey(a)];
		},
		set: function(c, b) {
			var a = this.cacheKey(c);
			this.cache[a] = b;
		},
		cacheKey: function(b) {
			var a = [];
			a.push(b.user_id);
			if (b.offset) {
				a.push(b.offset);
			}
			return a.join("-");
		}
	};

	function setLastTime(id, time) {
		var index = lastTimes.findIndex(function(t) {
			return t.id == id;
		});
		if (index > -1) {
			lastTimes[index].time = time;
		} else {
			lastTimes.push({
				id: id,
				time: time
			});
		}
	}

	function getFristTime() {
		if (lastTimes.length < 1) return null;
		return lastTimes.reduce(function(previousValue, currentValue, currentIndex, array) {
			return previousValue.time.getTime() > currentValue.time.getTime() ? previousValue : currentValue;
		}, lastTimes[0]);
	}

	function _sortPlurks(d, c) {
		var f = d.posted.getTime();
		var e = c.posted.getTime();
		if (f < e) {
			return 1
		} else {
			if (f == e) {
				return 0
			} else {
				return -1
			}
		}
	}

	function cachePlurkIfNeed(plurks) {
		var cache = cachedPlurks.concat(plurks).sort(_sortPlurks);
		var t = getFristTime();
		if (t === null) {
			cachedPlurks = [];
			return cache;
		}
		var index = cache.findIndex(function(p) {
			return p.posted.getTime() < t.time.getTime();
		});
		cachedPlurks = cache.slice(index, -1);
		return cache.slice(0, index);
	}

	function _getPlurks(d) {
		return fetch("//www.plurk.com/TimeLine/getPlurks", {
			credentials: 'same-origin',
			method: 'POST',
			body: (function() {
				var params = new URLSearchParams();
				for (let k in d) {
					if (d.hasOwnProperty(k)) {
						params.set(k, d[k]);
					}
				}
				return params;
			})()
		}).then(function(response) {
			var contentType = response.headers.get("content-type");
			if (contentType && contentType.indexOf("application/json") !== -1) {
				return response.json();
			}
			return JSON.parse(response.text().replace(/new\sDate\(([^\(\)]+)\)/ig, "$1"));
		}).then(function(json) {
			var plurks = json;
			if (!(json instanceof Array) && json.plurks) {
				plurks = json.plurks;
				if (json.replurkers) {
					Users.addUsers(json.replurkers);
				}
			}
			if (json.error) {
				throw json.error;
			}
			return plurks;
		}).then(function(plurks) {
			return plurks.map(plurk => PlurksManager.getPlurk(plurk));
		});
	}

	function getPlurks(id, offset) {
		var d = {
			user_id: id,
			user_ids: JSON.stringify([id])
		};
		if (offset) {
			d.offset = offset.toISOString();
		}
		return new Promise(function(resolve, reject) {
			if (CliqueTimeLineCache.inCache(d)) {
				resolve(CliqueTimeLineCache.get(d));
			} else {
				_getPlurks(d).then(function(plurks) {
					CliqueTimeLineCache.set(d, plurks);
					resolve(plurks);
				}).catch(function(e) {
					reject(e);
				});
			}
		}).then(function(plurks) {
			var last = AJS.getLast(plurks);
			if (last) {
				setLastTime(id, last.posted);
			}
			return plurks;
		});
	}

	function loadCliqueTimeline(clique) {
		var ids = PlurkAdder._getCliqueFriends(PlurkAdder._getCliqueByName(clique));
		lastTimes = [];
		cachedPlurks = [];
		loadingPlurks = false;
		PlurkTimeline._instance.clear();
		PlurkTimeline._instance.timelineHolder.setLoading(true);
		var cnt = {
			done: 0,
			count: ids.length
		};
		var mes = $(loadingMessageTmpl(cnt)).appendTo("#timeline_holder #div_loading .cnt");
		Promise.all(ids.map(function(id) {
			return getPlurks(id).then(function(plurks) {
				cnt.done++;
				mes.remove();
				mes = $(loadingMessageTmpl(cnt)).appendTo("#timeline_holder #div_loading .cnt");
				return plurks;
			});
		})).then(function(values) {
			return [].concat.apply([], values);
		}).then(function(c) {
			return cachePlurkIfNeed(c);
		}).then(function(c) {
			PlurkTimeline._instance.addPlurks(c);
			PlurkTimeline._instance.timelineHolder.setLoading(false);
		}).catch(function(e) {
			console.error("load clique timeline error:", e);
			alert("好像有點怪怪的:(");
			PlurkTimeline._instance.timelineHolder.setLoading(false);
		});
	}

	var loadingPlurks = false;
	document.addEventListener("CliqueOnScrollEnd", function(e) {
		if (isTabActive()) {
			// 切換到小圈圈時，禁用原本的功能
			e.preventDefault();
		}
		if (isTabActive() && !loadingPlurks && /* arg0 */ e.detail[0] == 2) {
			var t = getFristTime();
			if (t !== null) {
				loadingPlurks = true;
				PlurkTimeline._instance.timelineHolder.setLoading(true);
				getPlurks(t.id, t.time).then(function(plurks) {
					return cachePlurkIfNeed(plurks);
				}).then(function(plurks) {
					if (isTabActive()) {
						PlurkTimeline._instance.addPlurks(plurks);
					}
					loadingPlurks = false;
					PlurkTimeline._instance.timelineHolder.setLoading(false);
				});
			}
		}
	});

	function onCliqueChange(c) {
		if (selected != c) {
			selected = c;
			tab.find("i:first").removeClass(CLIQUES_DEFAULT_ICON.join(" ")).addClass(selected.icon);
			tab.find("span").text(selected.name);
		}
		menu.hide();
		$("#filter_tab .filter_selected").addClass("off_tab").removeClass("filter_selected bottom_line_bg");
		tab.removeClass("off_tab").addClass("filter_selected bottom_line_bg");
		loadCliqueTimeline(selected.name);
		return false;
	}

	function isTabActive() {
		if (tab === null) return false;
		return tab.hasClass("filter_selected");
	}

	var tab = null;
	var selected = null;
	var menu = null;

	var CLIQUES_DEFAULT_ICON = ["pif-colleague-circle", "pif-classmates-circle", "pif-like-circle", "pif-clique"];

	// include plurkTimelineReady
	(function(i,s,o,g,r,a,m){i[r]=i[r]||function(f){
	(i[r].q=i[r].q||[]).push(f)};a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;
	m.parentNode.insertBefore(a,m)})(window,document,
	'script','//rawgit.com/stu43005/8cc372297129b03a'+
	'60d4b436de71d798/raw/getPlurkTimelineInstance.js',
	'plurkTimelineReady');

	window.plurkTimelineReady(function() {
		fetch("//www.plurk.com/Cliques/get", {
			credentials: 'same-origin'
		}).then(r => r.json()).then(function(CLIQUES) {
			top.CLIQUES = CLIQUES;
			var menuView = $("<ul/>").append(CLIQUES.map(function(c) {
				var b = c.name;
				var ic = "pif-clique";
				var a = CLIQUES_DEFAULT.indexOf(b);
				if (a > -1) {
					b = CLIQUES_DEFAULT_TRANS[a];
					ic = CLIQUES_DEFAULT_ICON[a];
				}
				return {
					name: b,
					count: PlurkAdder._getCliqueFriends(c).length,
					icon: ic
				};
			}).filter(function(c) {
				return c.count > 0;
			}).map(function(c) {
				return $("<li/>", {
					html: $("<a/>", {
						"class": c.icon,
						href: "#",
						text: c.name + " (" + c.count + "人)"
					}).bind("click", onCliqueChange.bind(null, c))
				});
			}));
			menu = new PopView({
				content: menuView,
				ex_class: "popMenu clique_menu"
			});

			$("#filter_tab").append($("<li/>").html(tab = $("<a/>", {
				href: "#",
				title: "瀏覽在小圈圈內好友的訊息",
				id: "clique_plurks_tab_btn",
				"class": "off_tab",
				html: "<i class=\"pif-clique\"></i><span>小圈圈</span><i class=\"pif-dropdown\"></i>",
				click: function(e) {
					e.preventDefault();
					if (selected === null || e.target.nodeName.toLowerCase() == "i") {
						menu.showFrom(tab);
					} else {
						onCliqueChange(selected);
					}
				}
			})));
		});

		PlurkTimeline._instance.timelineHolder.onScrollEnd = after(PlurkTimeline._instance.timelineHolder.onScrollEnd, "CliqueOnScrollEnd");
	});

	$("head").append($("<style type=\"text/css\"/>").text("#clique_plurks_tab_btn span { margin-right: 4px; }"));

	function trigger(name, data) {
		var event = new CustomEvent(name, {
			"detail": data,
			"cancelable": true
		});
		return document.dispatchEvent(event);
	}

	function after(target, name) {
		return new Proxy(target, {
			apply: function(target, thisArg, argumentsList) {
				if (!trigger(name, argumentsList)) {
					return;
				}
				var result = target.apply(thisArg, argumentsList);
				return result;
			}
		});
	}
});