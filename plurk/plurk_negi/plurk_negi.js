// images from http://anohito.tw/sandbox/negi/

jQuery(document).ready(function(b) {
	if (!b("body").hasClass("timeline") || !isCanvasSupported()) {
		return
	}

	canvas_snow.snow = function() {
		var j = canvas_snow;
		var q = j.ctx;
		var e = j.cv;
		var negi = jQuery('<img/>');
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
			//q.fillStyle = "rgba(255,255,255," + f.opacity + ")";
			f.y += f.velY;
			f.x += f.velX;
			if (f.y >= e.height || f.y <= 0) {
				j.resetFlake(f)
			}
			if (f.x >= e.width || f.x <= 0) {
				j.resetFlake(f)
			}
			//q.beginPath();
			//q.arc(f.x, f.y, f.size, 0, Math.PI * 2);
			//q.fill();
			if (!f.type) {
				f.type = Math.ceil(Math.random() * 6);
			}
			negi.attr('src', "http://anohito.tw/sandbox/negi/negi" + f.type + ".png");
			q.drawImage(negi.get(0), f.x, f.y);
		}
		j.aniID = requestAnimationFrame(j.snow)
	};

	jQuery(".snowflake").html('<img src="http://anohito.tw/sandbox/negi/negi' + (Math.ceil(Math.random() * 6)) + '.png"/>');
});