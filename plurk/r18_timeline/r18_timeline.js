jQuery(function($) {
	if (!$("body").hasClass("timeline")) return;
	if (typeof TimeLine == "undefined") return;

	// R18功能推出時間
	// 參照: https://www.plurk.com/p/mj6hvw
	var r18FeatureStartDate = new Date("2017-12-01T00:00:00.000Z");
	var r18FeaturePids = [1363395226, 1362482218, 1362471692];

	var r18 = {
		plurks: {},
		offset: null,
		end: false,
		button: null,
	};

	function addPlurk(plurk) {
		var plurk_id = plurk.plurk_id;
		if (r18.offset && plurk.posted >= r18.offset) {
			if (plurk.porn) {
				r18.plurks[plurk_id] = plurk;
			}
		}
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
			return plurks.map(function(plurk) {
				return PlurksManager.getPlurk(plurk);
			});
		});
	}

	function getPoll() {
		if (window.Poll) {
			if (Poll.newPlurksPoll.getCount()) {
				var newPlurks = Poll.newPlurksPoll.getNewPlurks();
				newPlurks.forEach(function(plurk) {
					addPlurk(plurk);
				});
			}
		}
	}

	function getPlurks() {
		if (r18.end) {
			return;
		}
		var d = {
			user_id: SiteState.getPageUser().uid
		};
		if (r18.offset) {
			d.offset = r18.offset.toISOString();
		}
		PlurkTimeline._instance.timelineHolder.setLoading(true);
		return _getPlurks(d).then(function(plurks) {
			if (plurks.length) {
				r18.offset = new Date(plurks[plurks.length - 1].posted);
				if (r18.offset <= r18FeatureStartDate) {
					r18.end = true;
				}
				plurks.forEach(function(plurk) {
					addPlurk(plurk);
				});
			} else {
				r18.end = true;
			}
			return plurks.filter(function(plurk) {
				return plurk.porn || r18FeaturePids.indexOf(plurk.plurk_id) > -1;
			});
		}).then(function(plurks) {
			if (isTabActive()) {
				jQuery.when(PlurkTimeline._instance.addPlurks(plurks)).done(function () {
					PlurkTimeline._instance.timelineHolder.setLoading(false);
					
					var pp = jQuery.map(r18.plurks, V => V);
					if (pp.length < 10) {
						setTimeout(function () {
							getPlurks();
						}, 5);
					}
				});
			}
		}).catch(function(e) {
			console.error("load r18 timeline error:", e);
			alert("好像有點怪怪的:(");
			PlurkTimeline._instance.timelineHolder.setLoading(false);
		});
	}

	function loadR18Timeline() {
		PlurkTimeline._instance.clear();
		PlurkTimeline._instance.timelineHolder.setLoading(true);
		getPoll();
		var plurks = jQuery.map(r18.plurks, V => V);
		if (plurks.length) {
			setTimeout(function () {
				jQuery.when(PlurkTimeline._instance.addPlurks(plurks)).done(function() {
					PlurkTimeline._instance.timelineHolder.setLoading(false);
				});
			}, 5);
		} else {
			getPlurks();
		}
	}

	document.addEventListener("R18OnScrollEnd", function(e) {
		if (isTabActive()) {
			// 切換到小圈圈時，禁用原本的功能
			e.preventDefault();
		}
		if (isTabActive() && /* arg0 */ e.detail[0] == 2) {
			getPlurks();
		}
	});

	BroadcastStation.listen("poll", "new_plurks", getPoll);

	function switchTab() {
		$("#filter_tab .filter_selected").addClass("off_tab").removeClass("filter_selected bottom_line_bg");
		r18.button.removeClass("off_tab").addClass("filter_selected bottom_line_bg");
		loadR18Timeline();
	}

	function isTabActive() {
		if (r18.button === null) return false;
		return r18.button.hasClass("filter_selected");
	}

	// include plurkTimelineReady
	(function(i,s,o,g,r,a,m){if(!i[r]){i[r]=function(f){
	(i[r].q=i[r].q||[]).push(f)};a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;
	m.parentNode.insertBefore(a,m)}})(window,document,
	'script','//rawgit.com/stu43005/8cc372297129b03a'+
	'60d4b436de71d798/raw/getPlurkTimelineInstance.js',
	'plurkTimelineReady');

	window.plurkTimelineReady(function() {
		$("#filter_tab").append($("<li/>").html(r18.button = $("<a/>", {
			href: "#",
			title: "瀏覽R18訊息",
			id: "r18_plurks_tab_btn",
			"class": "off_tab",
			html: "<i class=\"pif-porn\"></i><span>R18訊息</span>",
			click: function(e) {
				e.preventDefault();
				switchTab();
			}
		})));

		PlurkTimeline._instance.timelineHolder.onScrollEnd = after(PlurkTimeline._instance.timelineHolder.onScrollEnd, "R18OnScrollEnd");
	});

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