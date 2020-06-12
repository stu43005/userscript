// ==UserScript==
// @name         Kirito find Lisbeth
// @namespace    mykirito
// @version      0.1.1
// @description  mykirito.com 尋找莉茲貝特大作戰
// @author       Shiaupiau
// @include      https://mykirito.com/*
// @include      https://kirito-1585904519813.appspot.com/*
// @license      MIT
// ==/UserScript==

function notify(msg) {
	if (!("Notification" in window)) {
		console.log("This browser does not support desktop notification");
	}
	else if (Notification.permission === "granted") {
		new Notification(msg);
	}
	else if (Notification.permission !== "denied") {
		Notification.requestPermission().then(function (permission) {
			if (permission === "granted") {
				new Notification(msg);
			}
		});
	}
}

(async function () {
	'use strict';

	let url = "";
	let lastUrl = "";
	setInterval(window.onload = async function () {
		url = location.href;
		if (url === lastUrl) {
			return;
		}
		lastUrl = url;

		if (url.includes("user-list")) {
			// 在玩家列表
			const btnNextPage = [...document.querySelectorAll("div#root > div > div > button")].find(btn => btn.innerText.startsWith('下一頁'));
			const btnFindLisbeth = btnNextPage.cloneNode(true);
			btnFindLisbeth.innerText = '尋找莉茲貝特';
			btnNextPage.insertAdjacentElement('afterend', btnFindLisbeth);

			let timeout;
			function stop() {
				btnFindLisbeth.innerText = '尋找莉茲貝特';
				if (timeout) {
					clearInterval(timeout);
					timeout = null;
				}
			}

			btnFindLisbeth.addEventListener('click', (e) => {
				if (timeout) {
					stop();
					return;
				}
				btnFindLisbeth.innerText = '停止尋找莉茲貝特'
				timeout = setInterval(() => {
					if (!url.includes("user-list")) {
						stop();
						return;
					}

					const table = [...document.querySelectorAll("div#root > div > div > table")].reverse()[0];
					const trs = [...table.querySelectorAll('tr')];
					for (let i = 0; i < trs.length; i++) {
						const tr = trs[i];
						if (tr.style.color === 'var(--grey)') {
							// is dead
							continue;
						}
						const charNameDiv = tr.querySelector('td:nth-child(3) > div > div:nth-child(1) > div:nth-child(2)');
						if (charNameDiv && charNameDiv.innerText.includes('莉茲貝特')) {
							stop();
							notify('找到莉茲貝特了！');
							tr.click();
							return;
						}
					}
					btnNextPage.click();
				}, 2000);
			});
		}
	}, 100);
})();
