if(window.Plurks){
		//{{ Whole ListAll (Start)
		Plurks._renderListAllIcon = function(userlist, title, tips){
			var list_all_icon = A({title:title, s:"cursor:pointer;"},"\u226b");
			AEV(list_all_icon, "click", function(ev){
				AJS.stopPropagation(ev);
				AJS.preventDefault(ev);
				GB_showCenter(title, "about:blank", 200, 300);
				var list_all = function(){
					try {
						var blank_iframe = $("settingFrame").contentWindow.document.getElementById("GB_frame");
						var blank_window = blank_iframe.contentWindow;
					} catch(e){
						setTimeout( list_all, 1000);
						return;
					}

					blank_window.loading_icon = DIV({
						s: "height:130px; margin:auto; text-align: center; font-size:12px; color:gray;"
						},IMG({s:"margin-top: 40px",src:"http://statics.plurk.com/6ad45e7e08754eba760d200a93f1d115.gif"}), BR(), 
						tips
					);

					ACN( blank_window.document.body, (blank_window.loading_icon));
					blank_window.user_div = DIV({});
					var render_user_info = function(userlist){
						PlurkAdder.fetchUsersIfNeeded(userlist, 
							function(){
								blank_window.document.body.removeChild(blank_window.loading_icon);
								blank_window.document.body.appendChild(blank_window.user_div);
								for(var i = 0, user_length = userlist.length; i < user_length; i ++){
									var user = SiteState.getUserById(userlist[i]);
									blank_window.user_div.appendChild(
										DIV({
											s: "margin:2px; background:#DDD; border-bottom:1px solid gray;font-size:12px;"
										},
											IMG({s:"border:3px solid white; margin:2px; float:left;", src:Users.getUserImgSrc(user,"medium")}),
											DIV({s:"margin-left: 50px;"}, 
												A({s:"color:brown; font-weight:bold; text-decoration:none;", href:"/"+user.nick_name, target:"_blank"},
													user.display_name || user.nick_name
												), BR(),
												Users.getGender(user), Users.getLocation(user), BR(),
												"Karma: " + user.karma
											),
											DIV({s:"display:block; clear:both;"})
										)
									);
								}
								blank_iframe.style.height = "1px";
								var yScroll;
								if (blank_window.innerHeight && blank_window.scrollMaxY) {
									yScroll = blank_window.innerHeight + blank_window.scrollMaxY;
								} else if (blank_window.document.body.scrollHeight > blank_window.document.body.offsetHeight) { // all but Explorer Mac
									yScroll = blank_window.document.body.scrollHeight;
								} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
									yScroll = blank_window.document.body.offsetHeight;
								}
								if(yScroll>400) yScroll = 400;
								$("settingFrame").style.height = yScroll + "px"; 
								blank_iframe.style.height = yScroll + "px";
							}, "rfc"
						);
					};
					setTimeout(function(){
						render_user_info(userlist);
					}, 2000);
				};
				setTimeout( list_all, 1000);
			});
			return list_all_icon;
		};
		Responses._renderLimitedTo = function (e, a, c, d) {
			AJS.RCN(e, _("private plurk to"), " ");
			var b = false;
			if (d.length == 2 && d[0] == d[1]) {
				d = [d[0]]
			}
			AJS.map(d, function (o, h) {
				if (o == a.owner_id && d.length != 1) {
					return
				}
				var f = SiteState.getUserById(o);
				var m = SiteState.getSessionUser();
				if (parseInt(o) == m.uid) {
					f = m
				}
				if (f) {
					var l = AJS.A({
						href: f.nick_name,
						c: "name"
					}, f.display_name || f.nick_name);
					var j = AJS.SPAN(l, " ");
					if (b) {
						AJS.hideElement(j)
					}
					AJS.ACN(e, j)
				}
				if (h == 6 && c.length > 7) {
					var g;
					AJS.ACN(e, AJS.SPAN(Responses._moreUsers(c.length - d.length)));
					b = true
				}
			})
			var show_limit_icon = Plurks._renderListAllIcon(c, _("private plurk to"), _("正在取得看得到這則噗的使用者清單"));
			AJS.ACN(e, show_limit_icon);
		};
		Plurks.__renderReplurkStr = function (c, f) {
			var b = f.obj;
			var e = b.replurkers_count;
			var d = format(ngettext(_("one plurker replurked this"), _("%d plurkers replurked this"), e), e);
			AJS.setHTML(c, d);
			var show_replurker_icon = Plurks._renderListAllIcon(b.replurkers, _("Who Replurked this?"), _("正在抓取轉了此噗的 Plurker 資料 ..."));
			if (b.replurkers) {
				var a = function () {
						var g = Plurks._userListStr(b.replurkers_count, b.replurkers, b.replurked, _("%s replurked this"), _("%s and %s replurked this"), _("%s and %d others replurked this"));
						AJS.setHTML(c, g)
					    	c.appendChild(show_replurker_icon);
					};
				setTimeout(function () {
					PlurkAdder.fetchUsersIfNeeded(b.replurkers, a, "rrs")
				}, 10);
			}
			c.appendChild(show_replurker_icon);
		};
		Plurks._renderFavoriteCount = function (b) {
			if (!SiteState.getSessionUser()) {
				return;
			}
			var e = $dp.info_box;
			var d = AJS.$bytc("div", "favorite_count", e, true);
			var c = b.favorite_count;
			var fb_mode = b.fb_uid?true:false;
			if(!fb_mode){
				if ((b.favorers == undefined) || c == 0) {
					AJS.hideElement(d);
					return;
				}
				AJS.showElement(d);
				AJS.setHTML(d, format(ngettext(_("one plurker liked this"), _("%d plurkers liked this"), c), c));
				var show_favorer_icon = Plurks._renderListAllIcon(b.favorers, _("Who liked this plurk?"), _("正在抓取喜歡此 Plurk 的 Plurker 資料 ..."));
				if (b.favorers) {
					var a = function () { 
					    var f = Plurks._userListStr(b.favorite_count, b.favorers, b.favorite, _("%s liked this"), _("%s and %s liked this"), _("%s and %d others liked this"));
					    AJS.setHTML(d, f)
					    d.appendChild(show_favorer_icon);
					};
					setTimeout(function () {
						PlurkAdder.fetchUsersIfNeeded(b.favorers, a, "rfc");
					}, 10);
				}
				d.appendChild(show_favorer_icon);
			} else {
				AJS.hideElement(d);
				var query = FB.Data.query('SELECT user_id FROM like WHERE object_id = "{0}"', b.plurk_id);
				var _renderFavoriteCount_callback = function (rows) {
					if(rows.length > 0){
						c = rows.length;
						AJS.showElement(d);
						AJS.setHTML(d, format(ngettext(_("一名Facebook使用者說讚!"), _("%d名Facebook使用者都說讚!"), c), c));
					}
				};
				query.wait(_renderFavoriteCount_callback, function(){_renderFavoriteCount_callback([]);});
			}
		};
		////}} Whole ListAll (End)
}
