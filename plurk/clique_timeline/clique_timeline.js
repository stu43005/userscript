jQuery(function($) {
	if (!$("body").hasClass("timeline")) return;

	function loadCliqueTimeline(clique) {
		var ids = PlurkAdder._getCliqueFriends(PlurkAdder._getCliqueByName(clique));
		TimeLine.reset(true);
		TimeLine.showLoading();
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
			});
		})).then(function(values) {
			return [].concat.apply([], values);
		}).then(function(c) {
			TimeLine.insertPlurks(c);
			TimeLine.hideLoading();
		});
	}

	function onCliqueChange(c) {
		if (selected != c) {
			selected = c;
			tab.find("span").text(c);
		}
		menu.hide();
		$("#filter_tab .filter_selected").addClass("off_tab").removeClass("filter_selected bottom_line_bg");
		tab.removeClass("off_tab").addClass("filter_selected bottom_line_bg");
		loadCliqueTimeline(selected);
	}

	var tab = null;
	var selected = null;

	var menu = new AmiMenu();
	AJS.addClass(menu.menu_holder, "clique_menu");
	CLIQUES.map(function(c) {
		var b = c.name;
		var a = CLIQUES_DEFAULT.indexOf(b);
		if (a > -1) {
			b = CLIQUES_DEFAULT_TRANS[a];
		}
		return {
			name: b,
			count: PlurkAdder._getCliqueFriends(c).length
		};
	}).map(function(c) {
		return createItem(c.name, onCliqueChange.bind(null, c.name), {
			extra_txt: c.count + "人"
		});
	}).forEach(function(c) {
		$(c.view).css("color", "#000");
		menu.addItems(c);
	});

	$("#filter_tab").append($("<li/>").html(tab = $("<a/>", {
		href: "#",
		title: "瀏覽在小圈圈內好友的訊息",
		id: "clique_plurks_tab_btn",
		"class": "off_tab",
		html: "<span>小圈圈</span><img src=\"//s.plurk.com/b5013d83d670a7b88d13308929741d98.png\" class=\"dd_img\" width=\"18\" height=\"13\">",
		click: function(e) {
			e.preventDefault();
			if (selected === null || e.target.nodeName.toLowerCase() == "img") {
				var offset = tab.offset();
				menu.toggle(tab.get(0));
			} else {
				onCliqueChange(selected);
			}
		}
	})));
});
