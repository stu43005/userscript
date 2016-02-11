jQuery(function($) {
	if (!$("body").hasClass("timeline")) return;

	var loadingMessageTmpl = Handlebars.compile("<div>已讀取{{done}}，共{{count}}人</div>");

	function loadCliqueTimeline(clique) {
		var ids = PlurkAdder._getCliqueFriends(PlurkAdder._getCliqueByName(clique));
		TimeLine.reset(true);
		TimeLine.showLoading();
		var cnt = {
			done: 0,
			count: ids.length
		};
		var mes = $(loadingMessageTmpl(cnt)).appendTo("#timeline_holder #div_loading .cnt");
		Promise.all(ids.map(function(id) {
			var d = {
				user_id: id,
				user_ids: JSON.stringify([id])
			};
			return new Promise(function(resolve, reject) {
				var b = AJS.loadJSON("/TimeLine/getPlurks");
				b.addCallback(function(g) {
					if (!g.error) {
						if (g.constructor == Array) {
							resolve(g);
						} else {
							AJS.update(USERS, g.replurkers);
							resolve(g.plurks);
						}
					} else {
						reject(g.error);
					}
				});
				b.sendReq(d);
			}).then(function(plurks) {
				cnt.done++;
				mes.remove();
				mes = $(loadingMessageTmpl(cnt)).appendTo("#timeline_holder #div_loading .cnt");
				return plurks;
			});
		})).then(function(values) {
			return [].concat.apply([], values);
		}).then(function(c) {
			TimeLine.insertPlurks(c);
			TimeLine.hideLoading();
		}).catch(function(e) {
			console.error("load clique imeline error:", e);
			alert("好像有點怪怪的:(");
			TimeLine.hideLoading();
		});
	}

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

	var tab = null;
	var selected = null;

	var CLIQUES_DEFAULT_ICON = ["pif-colleague-circle", "pif-classmates-circle", "pif-like-circle", "pif-clique"];
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
	var menu = new PopView({
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

	$("head").append($("<style type=\"text/css\"/>").text("#clique_plurks_tab_btn span { margin-right: 4px; }"));
});
