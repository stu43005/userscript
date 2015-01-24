// ==UserScript==
// @name          Manga Loader (edited)
// @description   Load all manga in current page, only available on dm5.com
// @author        Chris (http://chrisyip.im)
// @include       http://*.dm5.com/*
// @version       1.4
// ==/UserScript==

(function() {
	var style, script, init, resize;

	/*resize = function(){
		document.body.style.width = getComputedStyle(document.querySelector('html')).width;
	}*/

	init = function() {
		var load_dm5, selector, callback;

		load_dm5 = function() {
			var image_div = document.querySelector(selector);
			if (!image_div) return;

			$(image_div).find("#imgloading").remove();

			var pid = DM5_CID,
				current_page = DM5_PAGE,
				last_page = DM5_IMAGE_COUNT,
				key = $("#dm5_key").val(),
				url = 'chapterimagefun.ashx',
				img = document.createElement('img'),
				origin_img = image_div.querySelector('img'),
				page_index = DM5_PAGE + 1,
				nopushurl = false,
				next_chapter_url = null,
				new_img, jump_to_page, _showNext, _showPre, _setURL, _showEnd, load_image, load_pre_image, next_chapter_box, set_bookmark;

			jump_to_page = function(e) {
				var page = parseInt(this.getAttribute('data-index'), 10);
				if (e.button == 0 || e.button == 1) {
					_showNext(page);
				} else if (e.button == 2) {
					_showPre(page);
				}
			}

			_setURL = function(page) {
				var _url = "http://tel.dm5.com" + DM5_CURL.substring(0, DM5_CURL.length - 1),
					next_url, next_title;
				if (page < 1) {
					next_url = false;
				} else {
					next_url = _url + "-p" + page;
					next_title = document.title.replace(/第\d+页/, "第"+page+"页");
				}
				if (!!next_url && !nopushurl) {
					//location.href = next_url;
					console.log(page, next_title, next_url);
					document.title = next_title;
					window.history.pushState({
						url: next_url,
						title: next_title,
						index: page
					}, next_title, next_url);
				}
			}

			_showPre = function(page) {
				if (page > 1) {
					_setURL(page - 1);
					nopushurl = true;
					$("body").stop().animate({
						scrollTop: $(".manga_image[data-index='"+(page - 1)+"']").offset().top
					}, 200, function(){
						nopushurl = false;
					});
					//getimage();
					//SetFace();
					SetReadHistory(DM5_CID, DM5_MID, page - 1, DM5_USERID);
					if ('block' === next_chapter_box.style.display) {
						next_chapter_box.style.display = 'none';
					}
				} else {
					alert("当前已经是第一页");
				}
			}

			_showNext = function(page) {
				if (page < last_page) {
					_setURL(page + 1);
					nopushurl = true;
					$("body").stop().animate({
						scrollTop: $(".manga_image[data-index='"+(page + 1)+"']").offset().top
					}, 200, function(){
						nopushurl = false;
					});
					//getimage();
					//SetFace();
					SetReadHistory(DM5_CID, DM5_MID, page, DM5_USERID);
				} else {
					_showEnd();
				}
			}

			_showEnd = function() {
				if (!next_chapter_box.hasAttribute('data-show')) {
					next_chapter_box.setAttribute('data-show', true);
					next_chapter_box.style.display = 'block';
					var rect = next_chapter_box.getBoundingClientRect();
					next_chapter_box.style.marginTop = '-' + (rect.height / 2) + 'px';
					next_chapter_box.style.marginLeft = '-' + (rect.width / 2) + 'px';
					$.ajax({
						url: DM5_CURL_END,
						dataType: 'html',
						success: function(data) {
							var div = $(data).find('#index_mian a[href="javascript:addfavorite();"]').get(0).parentNode,
								link = div.querySelector('a[href*=m]'),
								s, rect;
							s = link ? '继续观看：' + link.outerHTML : '这已经是最新章节。';
							next_chapter_url = link ? link.href : null;
							next_chapter_box.innerHTML += s;
							next_chapter_box.style.marginTop = '-' + (rect.height / 2) + 'px';
							next_chapter_box.style.marginLeft = '-' + (rect.width / 2) + 'px';
						},
						error: function() {
							location.href = DM5_CURL_END;
						}
					});
				} else if ('none' === next_chapter_box.style.display) {
					next_chapter_box.style.display = 'block';
				} else if (next_chapter_url !== null) {
					location.href = next_chapter_url;
				}
			}

			set_bookmark = function(e) {
				var imgs = document.querySelectorAll('.manga_image');

				if (!imgs.length) return;

				var body_index = parseInt(document.body.getAttribute('data-index'), 10) || parseInt(imgs[0].getAttribute('data-index'), 10),
					next_index = body_index,
					first_index = parseInt(imgs[0].getAttribute('data-index'), 10),
					innerHeight = window.innerHeight,
					middle_loc = parseInt((innerHeight / 2), 10);

				for (var i = 0, len = imgs.length, rect; i < len; i++) {
					if (body_index - 1 == i) continue;
					rect = imgs[i].getBoundingClientRect();
					if ((middle_loc <= rect.bottom && innerHeight >= rect.bottom) ||
						(0 <= rect.top && middle_loc >= rect.top)) {
						next_index = parseInt(imgs[i].getAttribute('data-index'), 10);
						break;
					}
				}
				if (next_index !== body_index) {
					SetReadHistory(DM5_CID, DM5_MID, next_index, DM5_USERID);
					document.body.setAttribute('data-index', next_index);
					console.log(e, nopushurl);
					_setURL(next_index);
					if (current_page - 2 <= next_index && current_page < last_page) {
						load_image(current_page);
					}
				}
				if (next_index == first_index && (first_index - 1) > 0) {
					load_pre_image(first_index);
				}
			}

			img.className = 'manga_image';
			// replace origin image
			console.log(image_div, origin_img);
			new_img = img.cloneNode();
			new_img.src = origin_img.src;
			new_img.setAttribute('data-index', current_page);
			new_img.setAttribute('oncontextmenu', "return false;");
			new_img.addEventListener('mouseup', jump_to_page, false);
			image_div.replaceChild(new_img, origin_img);
			document.body.setAttribute('data-index', current_page);

			next_chapter_box = document.createElement('div');
			next_chapter_box.id = 'next_chapter_box';
			next_chapter_box.style.display = 'none';
			next_chapter_box.innerHTML = '<a class="close">X</a><p>已经是最后一页。<a class="add-bookmark">加入书签</a>。</p>';
			next_chapter_box.addEventListener('click', function(e) {
				if (-1 < e.target.className.indexOf('add-bookmark')) {
					this.style.display = 'none';
					SetBookmarker(DM5_CID, DM5_MID, DM5_IMAGE_COUNT, DM5_USERID);
				}
				if (-1 < e.target.className.indexOf('close')) {
					this.style.display = 'none';
				}
			}, false);
			document.body.appendChild(next_chapter_box);

			load_image = function(page) {
				$.ajax({
					url: url,
					data: {
						cid: pid,
						page: page + 1,
						language: 1,
						key: key
					},
					success: function(data) {
						eval(data);
						if (!d || false === d instanceof Array) return;
						for (var i = 0, len = d.length, url, index, filename; i < len; i++) {
							url = d[i].trim();
							index = url.match(/\/(\d+)_/);
							filename = url.match(/\/([^\/]+)\?/);
							if ('' === url || (index && !!image_div.querySelector('img[data-index="' + index[1] + '"]')) || (filename && !!image_div.querySelector('img[src*="' + filename[1] + '"]'))) break;
							current_page++;
							var el = img.cloneNode();
							el.src = d[i];
							el.setAttribute('data-index', page_index++);
							el.setAttribute('oncontextmenu', "return false;");
							el.addEventListener('mouseup', jump_to_page, false);
							image_div.appendChild(el);
							if (current_page >= last_page) break;
						}

						if (current_page < last_page) {
							setTimeout(function(){
								load_image(current_page);
							}, 2500);
						}
					}
				});
			}

			load_pre_image = function(page) {
				$.ajax({
					url: url,
					data: {
						cid: pid,
						page: page - 1,
						language: 1,
						key: key
					},
					success: function(data) {
						eval(data);
						if (!d || false === d instanceof Array) return;
						var first = $(".manga_image:first"), offset = first.offset().top;
						nopushurl = true;
						for (var i = d.length-1, url, index, filename; i >= 0; i--) {
							url = d[i].trim();
							index = url.match(/\/(\d+)_/);
							filename = url.match(/\/([^\/]+)\?/);
							if ('' === url || (index && !!image_div.querySelector('img[data-index="' + index[1] + '"]')) || (filename && !!image_div.querySelector('img[src*="' + filename[1] + '"]'))) continue;
							var el = img.cloneNode();
							el.src = d[i];
							el.setAttribute('data-index', --page);
							el.setAttribute('oncontextmenu', "return false;");
							el.addEventListener('mouseup', jump_to_page, false);
							image_div.insertBefore(el, image_div.firstChild);
						}
						setTimeout(function(){
							$("body").animate({
								scrollTop: "+=" + (first.offset().top - offset)
							}, 0, function(){
								nopushurl = false;
							});
						}, 20);
					}
				});
			}

			load_image(current_page);

			window.addEventListener('scroll', set_bookmark, false);
			window.addEventListener('popstate', function(e){
				if (history.state){
					var state = e.state;
					//do something(state.url, state.title);
					console.log(state);
					document.title = state.title;
					nopushurl = true;
					$("body").stop().animate({
						scrollTop: $(".manga_image[data-index='"+state.index+"']").offset().top
					}, 200, function(){
						nopushurl = false;
					});
				}
			}, false);
			$(document).unbind("keypress").keypress(function(e){
				var e_key = (e.keyCode == 0 ? e.which : e.keyCode),
					index = parseInt(document.body.getAttribute('data-index'), 10),
					this_img = $(".manga_image[data-index='"+index+"']"),
					body = $("body");

				if (this_img.height() > $(window).height()) {
					function func1(a, b) {
						return (a > b && Math.abs(a - b) > 10);
					}
					if (e_key == 119) {	//w
						if (index > 1 || body.scrollTop() > this_img.offset().top) {
							var first_img = $(".manga_image:first"),
								pre_img = $(".manga_image[data-index='"+(index-1)+"']");
							if ((body.scrollTop() - this_img.outerHeight(true) / 2) <= first_img.offset().top) {
								body.stop().animate({
									scrollTop: first_img.offset().top
								}, 200);
							} else if (func1(body.scrollTop(), this_img.offset().top)) {
								body.stop().animate({
									scrollTop: this_img.offset().top
								}, 200);
							} else if (pre_img.length > 0 && Math.abs(pre_img.offset().top - (body.scrollTop() - this_img.outerHeight(true) / 2)) < 10) {
								body.stop().animate({
									scrollTop: pre_img.offset().top
								}, 200);
							} else {
								body.stop().animate({
									scrollTop: "-=" + (this_img.outerHeight(true) / 2)
								}, 200);
							}
							if ('block' === next_chapter_box.style.display) {
								next_chapter_box.style.display = 'none';
							}
						} else {
							alert("当前已经是第一页");
						}
					}
					if (e_key == 115) {	//s
						if (index < last_page || (body.scrollTop() + $(window).height()) < (this_img.offset().top + this_img.height()) ) {
							var next_img = $(".manga_image[data-index='"+(index+1)+"']");
							if (func1(this_img.offset().top, body.scrollTop())) {
								body.stop().animate({
									scrollTop: this_img.offset().top
								}, 200);
							} else if (next_img.length > 0 && Math.abs(next_img.offset().top - (body.scrollTop() + this_img.outerHeight(true) / 2)) < 10) {
								body.stop().animate({
									scrollTop: next_img.offset().top
								}, 200);
							} else {
								body.stop().animate({
									scrollTop: "+=" + (this_img.outerHeight(true) / 2)
								}, 200);
							}
						} else {
							_showEnd();
						}
					}

					if (e_key == 97) {	//a
						if (body.scrollTop() < this_img.offset().top || Math.abs(body.scrollTop() - this_img.offset().top) < 10) {
							var pre_img = $(".manga_image[data-index='"+(index-1)+"']");
							if (pre_img.length > 0) {
								body.stop().animate({
									scrollTop: pre_img.offset().top + pre_img.outerHeight(true) - $(window).height()
								}, 200);
							} else {
								_showPre(index);
							}
						} else if (func1(body.scrollTop() + $(window).height(), this_img.offset().top + this_img.outerHeight(true))) {
							body.stop().animate({
								scrollTop: this_img.offset().top + this_img.outerHeight(true) - $(window).height()
							}, 200);
						} else if (func1(body.scrollTop(), this_img.offset().top)) {
							body.stop().animate({
								scrollTop: this_img.offset().top
							}, 200);
						} else {
							_showPre(index);
						}
						if ('block' === next_chapter_box.style.display) {
							next_chapter_box.style.display = 'none';
						}
					}
					if (e_key == 100) {	//d
						if (func1(this_img.offset().top, body.scrollTop())) {
							body.stop().animate({
								scrollTop: this_img.offset().top
							}, 200);
						} else if ((body.scrollTop() + $(window).height()) < (this_img.offset().top + this_img.height())) {
							body.stop().animate({
								scrollTop: this_img.offset().top + this_img.outerHeight(true) - $(window).height()
							}, 200);
						} else {
							_showNext(index);
						}
					}
				} else {
					if (e_key == 119) {	//w
						_showPre(index);
					}
					if (e_key == 115) {	//s
						_showNext(index);
					}

					if (e_key == 97) {	//a
						_showPre(index);
					}
					if (e_key == 100) {	//d
						_showNext(index);
					}
				}

				if (e_key == 122) {	//z
					_showPre(index);
				}
				if (e_key == 120) {	//x
					_showNext(index);
				}
			});
		}
		// end load_dm5

		selector = '#cp_img';
		callback = load_dm5;

		(function() {
			var div;
			if ((div = document.querySelector(selector)) && div.querySelector("img")) {
				$("#cp_fun_ct .cp_fx5 > div")
					.find('.clear').remove().end()
					.append($("<a/>", {
						href: "javascript:void(0)",
						"class": "cp_fun_jsdc",
						css: {
							"margin-top": "4px"
						},
						text: "連續模式",
						click: function() {
							$(this).addClass('cked');
							callback.call();
						}
					}), $("<div/>", {
						"class": "clear"
					}));

				callback.call();
				return;
			}

			if (document.readyState !== 'complete' || div) {
				setTimeout(arguments.callee, 1000);
			}
		})();
	} // end init()

	/*document.body.style.minHeight = (screen.availHeight + 100) + 'px';
	resize();
	window.addEventListener('resize', resize, false);
	document.body.style.minWidth = '980px';*/

	style = document.createElement('style');
	style.innerHTML = '.inner_img img, .manga_image{box-sizing:border-box;padding:1px!important;border:2px solid gray!important;margin:0 auto 10px!important;display:block!important;max-width:99%!important;width:auto!important;height:auto!important;cursor:pointer;}#next_chapter_box{background:#333;position:fixed;top:50%;left:50%;margin:0;z-index:999999;padding:20px;color:#fff;font-size:16px;box-shadow:0 0 15px #000;border-radius:5px;}#next_chapter_box a{color:#FF4E00;cursor:pointer;}.close{position:absolute;top:5px;right:5px;font-size:12px;}';
	document.head.appendChild(style);

	script = document.createElement('script');
	script.textContent = '(' + init.toString() + ')( window )';
	document.head.appendChild(script);
})();