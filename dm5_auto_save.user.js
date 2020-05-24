// ==UserScript==
// @name         DM5 Auto Bookmark
// @version      0.1
// @author       Shiaupiau (https://github.com/stu43005)
// @include       http://*.dm5.com/*
// @include       https://*.dm5.com/*
// @grant        none
// ==/UserScript==

(function () {
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

	$(document).on('click', '#last-win .view-btn-back', sendBookmark);
	$(window).on('unload', sendBookmark);
})();
