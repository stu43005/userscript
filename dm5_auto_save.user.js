// ==UserScript==
// @name         DM5 Auto Bookmark
// @version      0.2
// @author       Shiaupiau (https://github.com/stu43005)
// @include       http://*.dm5.com/*
// @include       https://*.dm5.com/*
// @grant        none
// ==/UserScript==

(function init(func) {
	setTimeout(function () {
		if (typeof jQuery === 'undefined') {
			console.log('[DM5 Auto Bookmark] No jQuery, try again later');
			init(func);
			return;
		}
		const script = document.createElement('script');
		script.textContent = '(' + func.toString() + ')(window)';
		document.body.appendChild(script);
	}, 500);
})(function () {
	'use strict';

	const data = {
		cid: DM5_CID,
		mid: DM5_MID,
		page: DM5_PAGE,
		uid: DM5_USERID,
		language: 1,
	};
	console.log(data);

	const formData = new FormData();
	Object.keys(data).forEach(k => {
		formData.append(k, data[k]);
	});

	function sendBookmark() {
		navigator.sendBeacon('bookmarker.ashx?d=' + new Date().getTime(), formData);
	}

	jQuery(document).on('click', '#last-win .view-btn-back', sendBookmark);
	jQuery(window).on('unload', sendBookmark);
});
