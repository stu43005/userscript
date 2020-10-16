// ==UserScript==
// @name       Plurk mute 噗浪自動消音
// @version    1.0.1
// @match      https://www.plurk.com/*
// @require    https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require    https://rawgit.com/stu43005/localscript/master/index.js
// @run-at     document-end
// ==/UserScript==

const Logger = {
	log: (...args) => console.log('[Plurk mute]', ...args),
	debug: (...args) => console.debug('[Plurk mute]', ...args),
	error: (...args) => console.error('[Plurk mute]', ...args),
};

const Options = {
	get: async () => {
		const opts = localStorage.getItem('mute_options');
		try {
			const json = JSON.parse(opts);
			return {
				...json,
				keywords: json.keywords || [],
				exclude_mute_plurk: json.exclude_mute_plurk || [],
			};
		} catch (error) {
			return {
				keywords: [],
				exclude_mute_plurk: [],
			};
		}
	},
	set: async (key, value) => {
		const opts = await Options.get();
		opts[key] = value;
		localStorage.setItem('mute_options', JSON.stringify(opts));
	},
};

(async () => {
	if (window != top) return;

	var user_name = null;
	var keywords = [];
	var exclude_mute_plurk = [];
	var friend_ids = [];

	async function loadKeywords() {
		const options = await Options.get();
		keywords = options.keywords;
		exclude_mute_plurk = options.exclude_mute_plurk;

		Logger.debug('keywords:', keywords, '\nexclude_mute_plurk:', exclude_mute_plurk);
	}

	async function getFriends() {
		try {
			const res = await fetch("/Users/getCompletion", {
				credentials: 'include',
				method: 'POST'
			});
			const json = await res.json();
			friend_ids = [];
			for (var c in json) {
				friend_ids.push(+c);
			}
			Logger.debug("friend_list:", friend_ids);
		} catch (error) {
			friend_ids = [];
			Logger.error("Get friend list failed");
			setTimeout(() => getFriends(), 1000);
		}
		return friend_ids;
	}

	async function getUsername() {
		if (user_name == null) {
			user_name = await getGlobalVariable("GLOBAL.page_user.nick_name");
			Logger.debug('user_name:', user_name);
		}
		return user_name;
	}

	/**
	 * @param {string} pid 
	 * @param {number} isUnread 0: readed, 1: new, 2: mute
	 * @returns {Promise<void>}
	 */
	function setMute(pid, isUnread) {
		return localScript(function ({ pid, isUnread }) {
			var plurk = PlurksManager.getPlurkById(pid);
			if (((isUnread == 0 || isUnread == 1) && plurk.is_unread == 2) ||
				(isUnread == 2 && (plurk.is_unread == 0 || plurk.is_unread == 1))) {
				PlurksManager.switchMute(pid);
			}
		}, {
			pid,
			isUnread
		});
	}

	/**
	 * @param {string} text 
	 * @returns {boolean}
	 */
	function matchKeywords(text) {
		for (i in keywords) {
			var k = keywords[i];
			if (k.match(/^\/.*\/[igm]*$/)) k = eval(k);
			var r = text.match(k);
			if (r != null) {
				return true;
			}
		}
		return false;
	}

	function excludeMute(plurk_id) {
		var i;
		if (!plurk_id) return;

		if ((i = jQuery.inArray(plurk_id, exclude_mute_plurk)) != -1) {
			exclude_mute_plurk.splice(i, 1);
			setMute(plurk_id, 2);
		} else {
			exclude_mute_plurk.push(plurk_id);
			setMute(plurk_id, 0);
		}
		updateManagerOptions(plurk_id);
		filterLoadedPlurks();
		Options.set('exclude_mute_plurk', exclude_mute_plurk);
		Logger.debug('exclude_mute_plurk:', exclude_mute_plurk);
		return false;
	}

	function muteUser(plurk_id) {
		var i, $me = $("#p" + plurk_id);
		if (!plurk_id) return;

		if ($me.find("td.td_qual span.q_replurks").length > 0) var nameid = $me.find('div.text_holder span:first-child a').attr('href').match(/\/(\w+)/)[1];
		else var nameid = $me.find('a.name').attr('href').match(/\/(\w+)/)[1];
		if (!user_name) getUsername();
		if (user_name && user_name == nameid) return;
		i = jQuery.inArray(nameid, keywords);
		if (i == -1) i = jQuery.inArray("@" + nameid, keywords);
		if (i != -1) {
			keywords.splice(i, 1);
			setMute(plurk_id, 0);
		} else {
			keywords.push("@" + nameid);
			setMute(plurk_id, 2);
		}
		updateManagerOptions(plurk_id);
		filterLoadedPlurks();
		Options.set('keywords', keywords);
		Logger.debug('keywords:', keywords);
		return false;
	}

	function getPlurkIdByElement(element) {
		var $me = $(element),
			plurk_id = $me.data("pid");
		if (!plurk_id) {
			plurk_id = $me.attr("id").match(/p(\d+)/);
			if (!plurk_id) return;
			plurk_id = plurk_id[1];
		}
		return plurk_id;
	}

	function getPlurkData(plurk_id) {
		return localScript(async function (plurk_id) {
			let plurk = PlurksManager.getPlurkById(plurk_id);
			function getUserByIdAsync(uid) {
				return new Promise(function (resolve, reject) {
					jQuery.when(Users.fetchUsersIfNeeded([uid], "gp")).always(function () {
						resolve(Users.getUserById(uid));
					});
				});
			}
			let user = await getUserByIdAsync(plurk.owner_id);
			return {
				plurk_id: plurk.plurk_id,
				content: plurk.content,
				content_raw: plurk.content_raw,
				is_unread: plurk.is_unread,
				is_replurk: !!plurk.replurker_id,
				limited_to: plurk.limited_to,
				owner: {
					uid: user.uid,
					display_name: user.display_name,
					nick_name: user.nick_name,
					is_me: SiteState.getSessionUser().id == user.uid,
				}
			}
		}, plurk_id).then(plurk => {
			plurk.owner.is_friend = friend_ids ? (plurk.owner.uid in friend_ids) : false;
			return plurk;
		});
	}

	function checkMutePlurk(plurkData) {
		if (plurkData.owner.is_me || plurkData.limited_to && plurkData.limited_to != "|0|") return false;

		if (plurkData.is_unread != 1) return false; /* 已讀 */

		if (exclude_mute_plurk.indexOf(plurkData.plurk_id) != -1) return false; /* exclude plurk */

		if (plurkData.is_replurk && !plurkData.owner.is_friend) return true;

		if (matchKeywords(plurkData.content_raw) || matchKeywords(plurkData.content) || matchKeywords(plurkData.owner.display_name) || matchKeywords("@" + plurkData.owner.nick_name)) {
			return true;
		}
	}

	async function filterPlurk(plurk_id) {
		if (!plurk_id) return;

		const plurkData = await getPlurkData(plurk_id);
		const mute = checkMutePlurk(plurkData);
		if (mute) {
			setMute(plurk_id, 2);
		}
	}

	async function updateManagerOptions(plurk_id) {
		if (!plurk_id) return;
		await delay(100);

		const ul = $(".pop-menu .pif-copy-link").parents('ul');
		if (ul.length < 1) return;

		if (ul.find('.excludemute').length < 1) {
			$('<li/>').append($('<a/>', {
				"class": "excludemute pif-volume",
				html: "自動消音",
				click: () => excludeMute(plurk_id)
			})).appendTo(ul);
		}
		if (ul.find('.excludeuser').length < 1) {
			$('<li/>').append($('<a/>', {
				"class": "excludeuser pif-volume",
				html: "不消音此人",
				click: () => muteUser(plurk_id)
			})).appendTo(ul);
		}

		const excludemute = ul.find('.excludemute');
		const excludeuser = ul.find('.excludeuser');

		const plurk = await getPlurkData(plurk_id);
		if (plurk.owner.is_me || plurk.limited_to && plurk.limited_to != "|0|") {
			excludemute.hide();
			excludeuser.hide();
			return;
		}

		excludemute.show();
		excludeuser.show();
		if (exclude_mute_plurk.indexOf(plurk.plurk_id) != -1) excludemute.html("自動消音");
		else excludemute.html("不自動消音");
		if (keywords.indexOf(plurk.owner.display_name) != -1 || keywords.indexOf("@" + plurk.owner.nick_name) != -1) excludeuser.html("不消音此人");
		else excludeuser.html("消音此人");
	}

	function setupOptionView() {
		// $(".menu ul li a[href*='/Settings/show?page=theme']").parent().after($("<li/>", {
		// 	"class": "sep"
		// }), $("<li/>", {
		// 	html: $("<a/>", {
		// 		css: {
		// 			color: "#aaa",
		// 			cursor: "default"
		// 		},
		// 		text: "Plurk-Mute_v2"
		// 	})
		// }), $("<li/>", {
		// 	html: $("<a/>", {
		// 		id: "muteoptions",
		// 		href: "#",
		// 		text: "自動消音設置",
		// 		// click: open_options
		// 	})
		// }), $("<li/>", {
		// 	"class": "sep"
		// }));
	}

	function bindEvent() {
		listenBroadcastStation("plurk", "update", pid => {
			filterPlurk(pid);
		});
		listenBroadcastStation("poll", "new_response", pid => {
			filterPlurk(pid);
		});
		listenAddPlurks(pids => {
			pids.forEach(pid => {
				filterPlurk(pid);
			});
		});

		$("#timeline_holder").on("click", ".plurk", function (e) {
			filterPlurk(getPlurkIdByElement(this));
		}).on("click", ".plurk .manager .option", function (e) {
			updateManagerOptions(getPlurkIdByElement($(this).parents('.plurk')));
		});
	}

	function filterLoadedPlurks() {
		$('div.plurk').each(function () {
			filterPlurk(getPlurkIdByElement(this));
		});
	}

	// wait canEdit
	while (true) {
		await delay(500);

		// check not mobile page
		if ($(".plurk-feeds").length > 0) {
			return;
		}

		try {
			const canEdit = await localScript(function () {
				return SiteState.canEdit();
			});
			if (canEdit) {
				break;
			} else {
				return;
			}
		} catch (error) {
		}
	}

	// init
	Logger.debug('do init');
	await loadKeywords();
	await getUsername();
	await getFriends();

	// setup
	Logger.debug('do setup');
	setupOptionView();
	bindEvent();

	// process
	Logger.debug('do process');
	filterLoadedPlurks();

	// worker
	setInterval(() => loadKeywords(), 60000);




	/**
	 * listen Plurk BroadcastStation event
	 * @param {string} a 
	 * @param {string} b 
	 * @param {(pid: number) => void} cb callback function
	 */
	function listenBroadcastStation(a, b, cb) {
		const id = '__BroadcastStation__' + Math.random();
		localScript(function (args) {
			BroadcastStation.listen(args.a, args.b, function (res) {
				document.dispatchEvent(new CustomEvent(args.id, {
					"detail": res ? res.plurk_id : 0
				}));
			});
		}, { a, b, id });
		document.addEventListener(id, function (e) {
			cb(e.detail);
		});
	}

	/**
	 * listen PlurkTimelineHolder.addItems hook
	 * @param {(pids: number[]) => void} cb callback function
	 */
	function listenAddPlurks(cb) {
		const id = '__PlurkTimelineHolder.addItems__' + Math.random();
		localScript(function (id) {
			PlurkTimelineHolder.prototype.addItems = new Proxy(PlurkTimelineHolder.prototype.addItems, {
				apply: function (target, thisArg, argumentsList) {
					var result = target.apply(thisArg, argumentsList);
					var pids = argumentsList[0].map(p => p.plurk.plurk_id);
					document.dispatchEvent(new CustomEvent(id, {
						"detail": pids
					}));
					return result;
				}
			});
		}, id);
		document.addEventListener(id, function (e) {
			cb(e.detail);
		});
	}

	/**
	 * delay time
	 * @param {number} ms 
	 */
	function delay(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}
})();
