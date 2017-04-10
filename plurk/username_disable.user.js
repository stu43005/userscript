// ==UserScript==
// @name       Plurk 避免按到使用者名稱
// @version    1.2.1
// @match      http://www.plurk.com/*
// @match      https://www.plurk.com/*
// @require    https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require    https://rawgit.com/stu43005/localscript/master/index.js
// ==/UserScript==

localScript(function() {
	(function($) {
		window.PlurkElement.generate = new Proxy(window.PlurkElement.generate, {
			apply: function(target, thisArg, argumentsList) {
				var result = target.apply(thisArg, argumentsList);
				$("a.name", result).bind("click", function(e) {
					e.preventDefault();
					return false;
				});
				return result;
			}
		});

		const nameWrap = Handlebars.compile("<a href=\"/{{nick_name}}\" class=\"name\"{{#if name_color}} style=\"color:#{{name_color}}\"{{/if}}></a>");
		const newWindow = Handlebars.compile("<a title=\"在新視窗開啟\" target=\"_blank\" class=\"pif-outlink\" href=\"/{{nick_name}}\"></a>");

		window.InfoOverlay.prototype.updateInfo = new Proxy(window.InfoOverlay.prototype.updateInfo, {
			apply: function(target, thisArg, argumentsList) {
				var result = target.apply(thisArg, argumentsList);
				// $(thisArg.view).find(".display_name").wrapInner(nameWrap({
				// 	nick_name: thisArg.user.nick_name,
				// 	uid: thisArg.user.id,
				// 	name_color: thisArg.user.name_color
				// }));
				$(thisArg.view).find(".display_name").append(newWindow({
					nick_name: thisArg.user.nick_name
				}));
				return result;
			}
		});
	})(jQuery);
});