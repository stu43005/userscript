// ==UserScript==
// @name          DM5 manga loader
// @description   Load all manga in current page, only available on dm5.com
// @author        Shiaupiau (https://github.com/stu43005)
// @include       http://*.dm5.com/*
// @version       1.0.4
// ==/UserScript==

(function(func) {
	var script = document.createElement('script');
	script.textContent = '(' + func.toString() + ')(window)';
	document.body.appendChild(script);
})(function() {
	var manga = {
		selector: "#cp_img",
		container: null,
		current_page: DM5_PAGE,
		images: {},
		request_page: {},
		next_chapter_box: null,
		next_chapter_url: null,
		in_animate: false,
		init: function() {
			manga.addStyle(".manga_image{box-sizing:border-box;padding:1px!important;border:2px solid gray!important;margin:0 auto 10px!important;display:block!important;max-width:99%!important;width:auto!important;height:auto!important;cursor:pointer;}#next_chapter_box{background:#333;position:fixed;top:50%;left:50%;margin:0;z-index:999999;padding:20px;color:#fff;font-size:16px;box-shadow:0 0 15px #000;border-radius:5px;}#next_chapter_box a{color:#FF4E00;cursor:pointer;}#next_chapter_box .close{position:absolute;top:5px;right:5px;font-size:12px;}");
			manga.container = $(manga.selector);
			manga.container.find("#imgloading").remove();
			manga.replace_origin_image();

			$(document).scroll(manga.onscroll).unbind("keypress").keypress(manga.onkeypress);
			window.addEventListener('popstate', function(e) {
				if (history.state) {
					console.log(e.state);
					manga.jump_to_image(e.state.index, true);
				}
			}, false);

			manga.load_pre_image(manga.current_page);
			manga.load_next_image(manga.current_page);
			manga.auto_load_image();
		},
		onscroll: function() {
			var middle_loc = window.innerHeight / 2 + $("body").scrollTop(),
				first_index = manga.get_first_image().data("index"),
				next_index = manga.current_page;

			for (var p in manga.images) {
				var img = manga.images[p];
				var offset = img.offset();
				if (offset.top <= middle_loc && offset.top + img.height() >= middle_loc) {
					next_index = img.data("index");
					break;
				}
			}

			if (next_index !== manga.current_page) {
				manga.update_status(next_index);
				if (!manga.check_image(next_index + 1)) manga.load_next_image(next_index);
			}
			if (next_index == first_index && (first_index - 1) > 0) {
				manga.load_pre_image(first_index);
			}
		},
		onkeypress_sub1: function(a, b) {
			return (a > b && Math.abs(a - b) > 10);
		},
		onkeypress: function(e) {
			var e_key = (e.keyCode === 0 ? e.which : e.keyCode),
				first_img = manga.get_first_image(),
				index = manga.current_page,
				pre_img = manga.get_image(index - 1),
				this_img = manga.get_image(index),
				next_img = manga.get_image(index + 1),
				bodyScrollTop = $("body").scrollTop();

			if (this_img.outerHeight(true) > $(window).height()) {
				if (e_key == 119) { // w
					if (index > 1 || bodyScrollTop > this_img.offset().top) {
						if ((bodyScrollTop - this_img.outerHeight(true) / 2) <= first_img.offset().top) {
							manga.bodyAnimate({
								scrollTop: first_img.offset().top
							});
						} else if (manga.onkeypress_sub1(bodyScrollTop, this_img.offset().top)) {
							manga.bodyAnimate({
								scrollTop: this_img.offset().top
							});
						} else if (pre_img && Math.abs(pre_img.offset().top - (bodyScrollTop - this_img.outerHeight(true) / 2)) < 10) {
							manga.bodyAnimate({
								scrollTop: pre_img.offset().top
							});
						} else {
							manga.bodyAnimate({
								scrollTop: "-=" + (this_img.outerHeight(true) / 2)
							});
						}
						manga.hide_next_chapter_box();
					} else {
						alert("当前已经是第一页");
					}
				}
				if (e_key == 115) { // s
					if (index < DM5_IMAGE_COUNT || (bodyScrollTop + $(window).height()) < (this_img.offset().top + this_img.height())) {
						if (manga.onkeypress_sub1(this_img.offset().top, bodyScrollTop)) {
							manga.bodyAnimate({
								scrollTop: this_img.offset().top
							});
						} else if (next_img && Math.abs(next_img.offset().top - (bodyScrollTop + this_img.outerHeight(true) / 2)) < 10) {
							manga.bodyAnimate({
								scrollTop: next_img.offset().top
							});
						} else {
							manga.bodyAnimate({
								scrollTop: "+=" + (this_img.outerHeight(true) / 2)
							});
						}
					} else {
						manga.show_next_chapter_box();
					}
				}

				if (e_key == 97) { // a
					if (bodyScrollTop < this_img.offset().top || Math.abs(bodyScrollTop - this_img.offset().top) < 10) {
						if (pre_img) {
							manga.bodyAnimate({
								scrollTop: pre_img.offset().top + pre_img.outerHeight(true) - $(window).height()
							});
						} else {
							manga.jump_previous(index);
						}
					} else if (manga.onkeypress_sub1(bodyScrollTop + $(window).height(), this_img.offset().top + this_img.outerHeight(true))) {
						manga.bodyAnimate({
							scrollTop: this_img.offset().top + this_img.outerHeight(true) - $(window).height()
						});
					} else if (manga.onkeypress_sub1(bodyScrollTop, this_img.offset().top)) {
						manga.bodyAnimate({
							scrollTop: this_img.offset().top
						});
					} else {
						manga.jump_previous(index);
					}
					manga.hide_next_chapter_box();
				}
				if (e_key == 100) { // d
					if (manga.onkeypress_sub1(this_img.offset().top, bodyScrollTop)) {
						manga.bodyAnimate({
							scrollTop: this_img.offset().top
						});
					} else if ((bodyScrollTop + $(window).height()) < (this_img.offset().top + this_img.height())) {
						manga.bodyAnimate({
							scrollTop: this_img.offset().top + this_img.outerHeight(true) - $(window).height()
						});
					} else {
						manga.jump_next(index);
					}
				}
			} else {
				switch (e_key) {
					case 119: // w
					case 97: // a
						manga.jump_previous(index);
						break;
					case 115: // s
					case 100: // d
						manga.jump_next(index);
						break;
				}
			}

			switch (e_key) {
				case 122: // z
					manga.jump_previous(index);
					break;
				case 120: // x
					manga.jump_next(index);
					break;
			}
		},
		bodyAnimate: function(animate, time) {
			manga.in_animate = true;
			$("body").stop().animate(animate, time || 200, function() {
				manga.in_animate = false;
				manga.onscroll();
			});
		},
		addStyle: function(string) {
			var style = document.createElement('style');
			style.innerHTML = string;
			document.head.appendChild(style);
		},
		replace_origin_image: function() {
			var cp_image = manga.container.find("img#cp_image");
			if (cp_image.length > 0) {
				var img = manga.get_image(DM5_PAGE, cp_image.attr("src"));
				cp_image.remove();
				manga.append_image(DM5_PAGE, img);
			}
		},
		get_image: function(page, src) {
			if (!manga.check_image(page) && src) {
				manga.images["p" + page] = $("<img/>", {
					"class": "manga_image",
					src: src,
					data: {
						index: page
					},
					mouseup: manga.image_click
				});
				manga.images["p" + page].attr("oncontextmenu", "return false;");
			}
			return manga.images["p" + page];
		},
		get_first_image: function() {
			return $("> *:first", manga.container);
		},
		check_image: function(page) {
			return typeof manga.images["p" + page] !== "undefined";
		},
		image_click: function(e) {
			var page = $(this).data("index");
			if (e.button === 0 || e.button === 1) {
				manga.jump_next(page);
			} else if (e.button === 2) {
				manga.jump_previous(page);
			}
		},
		jump_next: function(page) {
			if (page < DM5_IMAGE_COUNT) {
				manga.jump_to_image(page + 1);
			} else {
				manga.show_next_chapter_box();
			}
		},
		jump_previous: function(page) {
			if (page > 1) {
				manga.jump_to_image(page - 1);
				manga.hide_next_chapter_box();
			} else {
				alert("当前已经是第一页");
			}
		},
		jump_to_image: function(page, noPushState) {
			if (!manga.check_image(page)) return;
			manga.update_status(page, noPushState);
			manga.bodyAnimate({
				scrollTop: manga.get_image(page).offset().top
			});
			SetReadHistory(DM5_CID, DM5_MID, page, DM5_USERID);
		},
		update_status: function(page, noPushState) {
			if (!manga.in_animate && page > 0) {
				var url = "http://tel.dm5.com" + DM5_CURL.substring(0, DM5_CURL.length - 1) + "-p" + page + "/";
				var title = document.title.replace(/第\d+页/, "第" + page + "页");
				console.log(page, title, url);
				document.title = title;
				manga.current_page = page;
				if (!noPushState) {
					window.history.pushState({
						url: url,
						title: title,
						index: page
					}, title, url);
				}
			}
		},
		load_image: function(page, callback) {
			manga.request_page[page] = callback;
		},
		auto_load_image: function() {
			manga.replace_origin_image();
			for (var page in manga.request_page) {
				if (!manga.check_image(page)) {
					manga.load_image_ajax(parseInt(page), manga.request_page[page]);
					delete manga.request_page[page];
					return;
				}
				delete manga.request_page[page];
			}
			setTimeout(manga.auto_load_image, 1000);
		},
		load_image_ajax: function(page, callback) {
			var mkey = "";
			if ($("#dm5_key").length > 0) {
				mkey = $("#dm5_key").val();
			}
			$.ajax({
				type: "GET",
				url: "chapterfun.ashx",
				data: {
					cid: DM5_CID,
					page: page,
					key: mkey,
					language: 1,
					gtk: 6
				},
				error: function(msg) {},
				success: function(msg) {
					if (msg !== "") {
						var arr;
						eval(msg); // jshint ignore:line
						arr = d;
						callback.call(manga, page, arr);
					}
					manga.auto_load_image();
				}
			});
		},
		load_next_image: function(page) {
			if (page + 1 > DM5_IMAGE_COUNT) return;
			manga.load_image(page + 1, function(page, arr) {
				for (var i = 0; i < arr.length; i++) {
					manga.load_image_sub(page + i, arr[i]);
				}
				if (page + arr.length <= DM5_IMAGE_COUNT) {
					setTimeout(function() {
						manga.load_next_image(page + arr.length - 1);
					}, 2500);
				}
			});
		},
		load_pre_image: function(page) {
			if (page - 1 < 1) return;
			manga.load_image(page - 1, function(page, arr) {
				var current = manga.get_image(manga.current_page),
					offsetTop = current.offset().top;
				manga.in_animate = true;
				for (var i = arr.length - 1; i >= 0; i--) {
					manga.load_image_sub(page + i, arr[i]);
				}
				setTimeout(function() {
					manga.bodyAnimate({
						scrollTop: "+=" + (current.offset().top - offsetTop)
					}, 0);
				}, 20);
			});
		},
		load_image_sub: function(page, url) {
			var img = manga.get_image(page, url);
			manga.append_image(page, img);
		},
		append_image: function(page, img) {
			if (manga.check_image(page - 1)) {
				manga.get_image(page - 1).after(img);
			} else if (manga.check_image(page + 1)) {
				manga.get_image(page + 1).before(img);
			} else {
				manga.container.append(img);
			}
		},
		show_next_chapter_box: function() {
			var box = manga.next_chapter_box;
			if (box === null || box.length < 1) {
				box = manga.next_chapter_box = $('<div id="next_chapter_box"><a class="close">X</a><p>已经是最后一页。<a class="add-bookmark">加入书签</a>。</p></div>');
				box.find(".close").bind("click", function() {
					box.hide();
				});
				box.find(".add-bookmark").bind("click", function() {
					box.hide();
					if (DM5_USERID === 0) {
						showlogin();
					} else {
						SetBookmarker(DM5_CID, DM5_MID, manga.current_page, DM5_USERID);
					}
				});
				box.appendTo("body");
				box.css({
					"margin-top": box.outerHeight() / -2,
					"margin-left": box.outerWidth() / -2
				});
			}
			if (!box.data("isgeturl")) {
				box.data("isgeturl", true);
				$.ajax({
					url: DM5_CURL_END,
					dataType: 'html',
					success: function(data) {
						var link = $(".end_top", data).find("a").filter(function(i, a) {
							return a.href && a.href.match(/\/m\d+\//g);
						}).get(0);
						manga.next_chapter_url = link ? link.href : null;
						box.append(link ? '继续观看：' + link.outerHTML : '这已经是最新章节。');
						box.css({
							"margin-top": box.outerHeight() / -2,
							"margin-left": box.outerWidth() / -2
						});
					},
					error: function() {
						manga.next_chapter_url = DM5_CURL_END;
					}
				});
			} else if (box.is(":hidden")) {
				box.show();
			} else if (manga.next_chapter_url !== null) {
				location.href = manga.next_chapter_url;
			}
		},
		hide_next_chapter_box: function() {
			if (manga.next_chapter_box !== null) {
				manga.next_chapter_box.hide();
			}
		}
	};

	(function() {
		var div = document.querySelector(manga.selector);
		if (div && div.querySelector("img")) {
			$("#cp_fun_ct .cp_fx5 > div")
				.find('.clear').remove().end()
				.append($("<a/>", {
					href: "#",
					"class": "cp_fun_jsdc",
					css: {
						"margin-top": "4px"
					},
					text: "連續模式",
					click: function(e) {
						e.preventDefault();
						$(this).addClass('cked');
						manga.init.call(manga);
					}
				}), $("<div/>", {
					"class": "clear"
				}));

			manga.init.call(manga);
			return;
		}

		if (document.readyState !== 'complete' || div) {
			setTimeout(arguments.callee, 1000);
		}
	})();
});