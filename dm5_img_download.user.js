// ==UserScript==
// @name          DM5 image download
// @author        Shiaupiau (https://github.com/stu43005)
// @include       http://*.dm5.com/*
// @version       1.0
// ==/UserScript==

(function (func) {
	const script = document.createElement('script');
	script.textContent = '(' + func.toString() + ')(window)';
	document.body.appendChild(script);
})(function () {
	if (!$(".view-main").length) return;

	$(".rightToolBar").prepend(`<a href="javascript:void(0);" title="下載圖片" id="img-download-button" class="logo_1" style="display: block !important;transform: rotate(-90deg);" target="_blank"><div class="tip">下載圖片</div></a>`);

	const btn = $("#img-download-button");

	$(document).on("mousemove touchmove", ".view-main img", function (e) {
		const img = e.target;
		btn.attr("href", img.src);
	});
});
