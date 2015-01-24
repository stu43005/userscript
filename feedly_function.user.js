// ==UserScript==
// @name    Feedly Function
// @version    0.3
// @include    http://feedly.com/*
// @include    https://feedly.com/*
// @grant    GM_registerMenuCommand
// ==/UserScript==

(function() {
	var list = [{
		name: "清除非無損",
		namespace: "_pageid",
		func: function() {
			var k = [];
			for (var j = 0; j < this.entries.length; j++) {
				var title = this.entries[j].getTitle().toLowerCase();
				if (
					(title.indexOf("[eac]") == -1 && title.indexOf("cue") == -1 && title.indexOf("flac") == -1 && title.indexOf("wav") == -1 && title.indexOf("ape") == -1 && title.indexOf("tak") == -1 && title.indexOf("tta") == -1) ||
					title.indexOf("同人音") != -1 ||
					title.indexOf("東方") != -1 ||
					title.match(/\b[Cc]\d{2}\b/) ||
					((title.indexOf("快传") != -1 || title.indexOf("快傳") != -1) && title.indexOf("度娘") == -1 && title.indexOf("百度") == -1 && title.indexOf("度盘") == -1 && title.indexOf("度盤") == -1)
				) k.push(this.entries[j].getId());
			}
			this.reader.askMarkEntriesAsRead(k, function() {}, function(i) {
				console.log("Error:" + i);
			});
		}
	}, {
		name: "只保留'画像','ラブライブ'",
		namespace: "_pageid",
		func: function() {
			var k = [];
			for (var j = 0; j < this.entries.length; j++) {
				var title = this.entries[j].getTitle().toLowerCase();
				if (
					/*title.match(/[［「『【〔].+[］」』】〕]\d+話/) ||*/
					(title.indexOf("画像") == -1 && title.indexOf("ラブライブ") == -1)
				)
					k.push(this.entries[j].getId());
			}
			this.reader.askMarkEntriesAsRead(k, function() {}, function(i) {
				console.log("Error:" + i);
			});
		}
	}, {
		name: "清除熱度較低的一半文章",
		namespace: "_pageid",
		func: function() {
			var k = [];
			for (var j = 0; j < this.entries.length; j++) {
				var engagement = this.entries[j].jsonInfo.engagement || 0;
				k.push(engagement);
			}
			k = k.sort(function(a, b) {
				return a - b;
			});
			var a = k[Math.floor(k.length * 0.5)];
			if (a == 0)
				a = 1;
			var k = [];
			for (var j = 0; j < this.entries.length; j++) {
				var engagement = this.entries[j].jsonInfo.engagement || 0;
				if (engagement < a)
					k.push(this.entries[j].getId());
			}
			this.reader.askMarkEntriesAsRead(k, function() {}, function(i) {
				console.log("Error:" + i);
			});
		}
	}, {
		name: "清除0熱度的文章",
		namespace: "_pageid",
		func: function() {
			var k = [];
			for (var j = 0; j < this.entries.length; j++) {
				var engagement = this.entries[j].jsonInfo.engagement || 0;
				if (engagement < 1)
					k.push(this.entries[j].getId());
			}
			this.reader.askMarkEntriesAsRead(k, function() {}, function(i) {
				console.log("Error:" + i);
			});
		}
	}, {
		name: "移除TAG",
		namespace: "_pageid",
		func: function() {
			var tagname = this.category;
			for (var j = 0; j < this.entries.length; j++) {
				//this.entries[j].untag(tagname);
				this.reader.askUntagEntry(this.entries[j].getId(), tagname);
			}
		}
	}, {
		name: "全部設為未讀",
		namespace: "_pageid",
		func: function() {
			for (var j = 0; j < this.entries.length; j++) {
				this.reader.askKeepEntryAsUnread(this.entries[j].getId(), function() {}, function(i) {
					console.log("Error:" + i);
				});
			}
		}
	}, {
		name: "Debug",
		namespace: "_pageid",
		func: function() {
			console.log(this);
		}
	}];

	var localScript = function(scriptText, args) {
		var args = JSON.stringify(args);
		if (typeof scriptText == 'function')
			scriptText = '(' + scriptText + ')(' + args + ');';

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.appendChild(document.createTextNode(scriptText));
		document.body.appendChild(script);

		setTimeout(function() {
			script.parentNode.removeChild(script);
		}, 1000);
	};

	var runMenu = function(id) {
		localScript(function(args) {
			(eval(args.func)).call(streets.object(document.body.getAttribute(args.namespace)));
		}, {
			namespace: this.namespace,
			func: '(' + this.func + ')'
		});
	};

	if (GM_registerMenuCommand && typeof GM_registerMenuCommand === 'function') {
		for (var i = 0; i < list.length; i++) {
			GM_registerMenuCommand('Feedly Function - ' + list[i].name, runMenu.bind(list[i], i));
		}
	}
})()