// images from http://anohito.tw/sandbox/negi/

jQuery(document).ready(function($) {
	if (!$("body").hasClass("timeline") || !isCanvasSupported()) {
		return
	}

	var restoreDefultImages = function restoreDefultImages() {
		saveImages($.map([1,2,3,4,5,6], function(e) {
			return "http://anohito.tw/sandbox/negi/negi" + e + ".png"
		}));
	};

	var updateImagesDOM = function updateImagesDOM() {
		canvas_snow.imagesDOM = $.map(canvas_snow.images, function(e) {
			return $("<img/>").attr('src', e).get(0);
		});
	};

	var saveImages = function saveImages(imgs) {
		canvas_snow.images = imgs;

		// save image setting to cookie
		var c = new Date(Date.now() + (86400 * 1000 * 30));
		document.cookie = "negii=" + encodeURIComponent(JSON.stringify(canvas_snow.images)) + "; path=/; expires=" + c.toUTCString();

		updateImagesDOM();
		restartSnow();
	};

	var restartSnow = function restartSnow() {
		window.cancelAnimationFrame(canvas_snow.aniID);
		window.clearTimeout(canvas_snow.aniID);
		canvas_snow.init(true);
	};

	var showIcon = function showIcon() {
		if (window.negi_origin) {
			$(".snowflake").text("❄");
		} else {
			$(".snowflake").html('<img src="http://anohito.tw/sandbox/negi/negi' + (Math.ceil(Math.random() * 6)) + '.png"/>');
		}
	}

	var parseOrientationValue = function parseOrientationValue(s) {
		if (s === "true") {
			// old checkbox setting
			return 2;
		}
		var i = parseInt(s);
		if (i === NaN) {
			return 0;
		}
		return i;
	};

	// this function code from https://github.com/carhartl/jquery-cookie
	var parseCookieValue = function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(/\+/g, ' '));
			return JSON.parse(s);
		} catch(e) {}
	};

	window.negi_orientation = parseOrientationValue(document.cookie.replace(/(?:(?:^|.*;\s*)negio\s*\=\s*([^;]*).*$)|^.*$/, "$1"));

	if (document.cookie.replace(/(?:(?:^|.*;\s*)negip\s*\=\s*([^;]*).*$)|^.*$/, "$1") !== "true") {
		window.negi_origin = false;
	} else {
		window.negi_origin = true;
	}
	showIcon();

	canvas_snow.images = parseCookieValue(document.cookie.replace(/(?:(?:^|.*;\s*)negii\s*\=\s*([^;]*).*$)|^.*$/, "$1"));
	if (!canvas_snow.images) {
		restoreDefultImages();
	}

	updateImagesDOM();

	canvas_snow.snow = function() {
		var j = canvas_snow;
		var q = j.ctx;
		var e = j.cv;
		q.clearRect(0, 0, e.width, e.height);
		for (var d = 0; d < j.flakeCount; d++) {
			var f = j.flakes[d],
				n = j.mX,
				m = j.mY,
				o = 100,
				b = f.x,
				l = f.y;
			var h = Math.sqrt((b - n) * (b - n) + (l - m) * (l - m)),
				s = b - n,
				p = l - m;
			if (h < o) {
				var c = o / (h * h),
					a = (n - b) / h,
					r = (m - l) / h,
					g = c / 2;
				f.velX -= g * a;
				f.velY -= g * r
			} else {
				f.velX *= 0.98;
				if (f.velY <= f.speed) {
					f.velY = f.speed
				}
				f.velX += Math.cos(f.step += 0.05) * f.stepSize
			}
			switch (window.negi_orientation) {
				case 0:
					f.y += f.velY;
					f.x += f.velX;
					break;
				case 1:
					f.y -= f.velY;
					f.x += f.velX;
					break;
				case 2:
					f.y += f.velX;
					f.x += f.velY;
					break;
				case 3:
					f.y += f.velX;
					f.x -= f.velY;
					break;
			}
			if (f.y >= e.height || f.y <= 0) {
				j.resetFlake(f)
			}
			if (f.x >= e.width || f.x <= 0) {
				j.resetFlake(f)
			}
			if (window.negi_origin) {
				q.fillStyle = "rgba(255,255,255," + f.opacity + ")";
				q.beginPath();
				q.arc(f.x, f.y, f.size, 0, Math.PI * 2);
				q.fill();
			} else {
				if (!f.type) {
					f.type = Math.floor(Math.random() * j.images.length);
				}
				q.drawImage(j.imagesDOM[f.type], f.x, f.y);
			}
		}
		j.aniID = requestAnimationFrame(j.snow)
	};

	canvas_snow.resetFlake = function(a) {
		switch (window.negi_orientation) {
			case 0:
				a.x = Math.floor(Math.random() * canvas_snow.cv.width);
				a.y = 0;
				break;
			case 1:
				a.x = Math.floor(Math.random() * canvas_snow.cv.width);
				a.y = canvas_snow.cv.height;
				break;
			case 2:
				a.x = 0;
				a.y = Math.floor(Math.random() * canvas_snow.cv.height);
				break;
			case 3:
				a.x = canvas_snow.cv.width;
				a.y = Math.floor(Math.random() * canvas_snow.cv.height);
				break;
		}
		a.size = (Math.random() * 2.5) + 2;
		a.speed = (Math.random() * 0.6) + 0.2;
		a.velY = a.speed;
		a.velX = 0;
		a.opacity = (Math.random() * 0.5) + 0.3;
		a.type = undefined;
	};

	$(".snowflake").bind("contextmenu", function(e) {
		e.preventDefault();
		showSettingPanel();
	});

	$("#top_bar .bar-block.right .pulldown .menu ul a[href*='/Settings/show?page=theme']").parent().after($("<li/>", {
		"class": "sep"
	}), $("<li/>", {
		"class": "nohover",
		html: $("<div/>", {
			html: $("<i/>", {
				css: {
					color: "#aaa"
				},
				text: "Plurk Negi"
			})
		})
	}), $("<li/>", {
		html: $("<a/>", {
			text: "變更圖片及方向",
			click: function() {
				showSettingPanel();
			}
		})
	}));

	var removeSettingPanel = function removeSettingPanel() {
		$("#plurk_negi_setting_overlay, #plurk_negi_setting").remove();
	}

	var showSettingPanel = function showSettingPanel() {
		removeSettingPanel();

		$("<div/>", {
			id: "plurk_negi_setting_overlay",
			css: {
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				background: "rgba(51, 51, 51, 0.9)",
				"z-index": 10003
			},
			click: function() {
				removeSettingPanel();
			}
		}).appendTo("body");

		var imageInput = function imageInput(url, index) {
			return $("<div/>", {
				html: $("<input/>", {
					type: "text",
					val: url,
					css: {
						width: "75%"
					}
				})
			});
		};

		$("<div/>", {
			id: "plurk_negi_setting",
			css: {
				position: "fixed",
				top: "25%",
				left: "25%",
				width: "50%",
				height: "50%",
				background: "white",
				color: "black",
				padding: 8,
				"box-shadow": "0 0 10px #333",
				"border-radius": 8,
				"z-index": 10004
			},
			html: $("<div/>", {
				css: {
					height: "100%",
					"overflow-y": "auto"
				},
				html: [
					$("<span/>", {
						text: "Plurk Negi　　"
					}),
					$("<input/>", {
						id: "plurk_negi_setting_origin",
						type: "checkbox",
						change: function() {
							var c = new Date(Date.now() + (86400 * 1000 * 30));
							if ($(this).prop("checked")) {
								window.negi_origin = true;
								document.cookie = "negip=true; path=/; expires=" + c.toUTCString();
							} else {
								window.negi_origin = false;
								document.cookie = "negip=false; path=/; expires=" + c.toUTCString();
							}
							showIcon();
							restartSnow();
						}
					}).prop("checked", window.negi_origin ? "checked" : undefined),
					$("<label/>", {
						"for": "plurk_negi_setting_origin",
						text: "停用換圖功能 (變回原始下雪樣式)"
					}),
					$("<div/>", {
						id: "plurk_negi_setting_images",
						html: [
							$("<input/>", {
								type: "button",
								value: "增加圖片",
								click: function() {
									$(this).parent().append(imageInput(""));
								}
							}), $("<input/>", {
								type: "button",
								value: "儲存設定",
								click: function() {
									saveImages($.map($("#plurk_negi_setting_images input:text"), function(e) {
										return $(e).val().trim();
									}).filter(function(e) {
										return e != "";
									}));
								}
							}), $("<input/>", {
								type: "button",
								value: "還原成蔥花",
								click: function() {
									if (confirm("確定要將所有圖片還原成蔥花嗎? (此動作無法復原)")) {
										restoreDefultImages();
										showSettingPanel();
									}
								}
							})
						].concat($.map(canvas_snow.images, imageInput))
					}),
					$("<div/>", {
						html: [
							$("<span/>", {
								text: "動畫方向："
							})
						].concat($.map(["上>下", "下>上", "左>右", "右>左"], function(e, index) {
							return $("<div/>", {
								html: [
									$("<input/>", {
										id: "plurk_negi_setting_orientation_" + index,
										name: "plurk_negi_setting_orientation",
										type: "radio",
										change: function() {
											if ($(this).prop("checked")) {
												var c = new Date(Date.now() + (86400 * 1000 * 30));
												window.negi_orientation = index;
												document.cookie = "negio=" + index + "; path=/; expires=" + c.toUTCString();
												restartSnow();
											}
										}
									}).prop("checked", window.negi_orientation === index ? "checked" : undefined),
									$("<label/>", {
										"for": "plurk_negi_setting_orientation_" + index,
										text: e
									})
								]
							})
						}))
					})
				]
			})
		}).appendTo("body");
	};
});
