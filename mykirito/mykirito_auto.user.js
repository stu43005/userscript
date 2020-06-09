// ==UserScript==
// @name         Kirito Auto
// @namespace    mykirito
// @version      0.2.0
// @description  mykirito.com auto
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

const api = {
	get: async (path) => {
		const token = localStorage.getItem("token");
		const r = await fetch(`https://mykirito.com/api/${path}`, {
			"headers": {
				"accept": "application/json, text/plain, */*",
				"token": token
			},
			"referrer": "https://mykirito.com/",
			"referrerPolicy": "no-referrer-when-downgrade",
			"body": null,
			"method": "GET",
			"mode": "cors",
			"credentials": "omit"
		});
		return await r.json();
	},

	profile: (uid) => api.get(`profile/${uid}`),
	mykirito: () => api.get('my-kirito'),
};

const storage = {
	get: (key, def) => {
		const value = localStorage.getItem(key);
		if (typeof value === 'null' || typeof value === 'undefined') {
			return def;
		}
		try {
			return JSON.parse(value);
		} catch (error) {
			return def;
		}
	},
	set: (key, value) => {
		localStorage.setItem(key, JSON.stringify(value));
	}
};

const title = {
	notification: '',
	page: '',
	notify(value, timeout = 5000) {
		const now = Date.now();
		const timer = setInterval(() => {
			if (Date.now() > now + timeout) {
				title.notification = '';
				title.setTitle();
				clearInterval(timer);
				return;
			}
			if (title.notification === value) {
				title.notification = '';
			} else {
				title.notification = value;
			}
			title.setTitle();
		}, 500);
	},
	setPage(value) {
		title.page = value;
		title.setTitle();
	},
	setTitle() {
		const arr = [title.notification, title.page, '我的桐人'];
		document.title = arr.filter(s => !!s).join(' - ');
	},
	reset() {
		title.setPage('');
	}
};

const actionWorker = {
	enable: storage.get('actionWorkerEnable', false),
	delay: null,
	work: () => {
		if (!actionWorker.enable) { return; }

		const index = storage.get('actionWorker', null);
		if (index !== null) {

			const actionsDiv = actionWorker.getActionDiv();
			if (!actionsDiv) { return; }

			if (actionsDiv.querySelector('iframe')) {
				if (!storage.get('actionWorkerNotify', false)) {
					console.error(`行動需要驗證我是人類！`);
					notify('行動需要驗證我是人類！');
					title.notify('需要驗證');
					storage.set('actionWorkerNotify', true);
				}
				return;
			} else if (storage.get('actionWorkerNotify', false)) {
				storage.set('actionWorkerNotify', false);
			}

			const allActions = actionWorker.getActionBtns();
			const btn = allActions[index];
			if (btn && !btn.disabled) {
				if (actionWorker.delay === null) {
					actionWorker.delay = Math.floor(Math.random() * 5) + 1;
					console.log(`可以行動，延時 ${actionWorker.delay} 秒後執行 ${btn.innerText}`);
				}
				if (actionWorker.delay > 0) {
					actionWorker.delay--;
					return;
				}
				btn.click();
				actionWorker.delay = null;
				console.log(`行動完成`);
			} else {
				actionWorker.delay = null;
			}
		}
	},
	getActionDiv: () => {
		const actionsDiv = [...document.querySelectorAll("div#root > div > div > div")].find(d => d.innerText.startsWith('行動'));
		return actionsDiv;
	},
	getActionBtns: () => {
		const actionsDiv = actionWorker.getActionDiv();
		if (!actionsDiv) {
			return [];
		}
		const allActions = [...actionsDiv.querySelectorAll('button')].filter(btn => !btn.innerText.startsWith('修行'));
		return allActions;
	},
};

const pvpWorker = {
	enable: false,
	delay: null,
	work: () => {
		if (!pvpWorker.enable) { return; }

		const index = storage.get('pvpWorker', null);
		if (index !== null) {

			const pvpDiv = pvpWorker.getPvpDiv();
			if (!pvpDiv) { return; }

			if (pvpDiv.querySelector('iframe')) {
				if (!storage.get('pvpWorkerNotify', false)) {
					console.error(`挑戰需要驗證我是人類！`);
					notify('挑戰需要驗證我是人類！');
					title.notify('需要驗證');
					storage.set('pvpWorkerNotify', true);
				}
				return;
			} else if (storage.get('pvpWorkerNotify', false)) {
				storage.set('pvpWorkerNotify', false);
			}

			const pvpBtns = pvpWorker.getPvpBtns();
			const btn = pvpBtns[index];
			if (btn && !btn.disabled) {
				if (pvpWorker.delay === null) {
					pvpWorker.delay = Math.floor(Math.random() * 5) + 1;
					console.log(`可以挑戰，延時 ${pvpWorker.delay} 秒後執行 ${btn.innerText}`);
				}
				if (pvpWorker.delay > 0) {
					pvpWorker.delay--;
					return;
				}
				btn.click();
				pvpWorker.delay = null;
				console.log(`挑戰完成`);
			} else {
				pvpWorker.delay = null;
			}
		}
	},
	getPvpDiv: () => {
		const pvpDiv = [...document.querySelectorAll("div#root > div > div > div")].find(d => d.innerText.startsWith('挑戰'));
		return pvpDiv;
	},
	getPvpBtns: () => {
		const pvpDiv = pvpWorker.getPvpDiv();
		if (!pvpDiv) {
			return [];
		}
		const allActions = [...pvpDiv.querySelectorAll('button')];
		return allActions;
	},
};

(async function () {
	'use strict';
	setInterval(actionWorker.work, 1000);
	setInterval(pvpWorker.work, 1000);

	let url = "";
	let lastUrl = "";
	setInterval(window.onload = async function () {
		url = location.href;
		if (url === lastUrl) {
			return;
		}
		lastUrl = url;
		if (url.match(/https:\/\/mykirito\.com\/?$/)) {
			// 在首頁
			title.setPage('');

			const actionsDiv = actionWorker.getActionDiv();
			if (actionsDiv) {
				const h3 = actionsDiv.querySelector('h3');
				if (h3) {
					h3.insertAdjacentHTML('beforeend', '&nbsp;<label><input type="checkbox">&nbsp;Auto</label>');
					const checkbox = h3.querySelector('input');
					if (checkbox) {
						checkbox.checked = actionWorker.enable;
						checkbox.addEventListener('change', (e) => {
							actionWorker.enable = checkbox.checked;
							storage.set('actionWorkerEnable', actionWorker.enable);
						});
					}
				}
			}

			const actionBtns = actionWorker.getActionBtns();
			actionBtns.forEach((btn, index) => {
				if (storage.get('actionWorker', null) === index) {
					btn.style.color = "var(--primary-color)";
					btn.style.backgroundColor = "var(--primary-bg-color)";
				}
				btn.addEventListener('click', (e) => {
					if (storage.get('actionWorker', null) !== index) {
						storage.set('actionWorker', index);
						actionWorker.delay = null;

						btn.style.color = "var(--primary-color)";
						btn.style.backgroundColor = "var(--primary-bg-color)";
						actionBtns.forEach(btn2 => {
							if (btn2 !== btn) {
								btn.style.color = "";
								btn.style.backgroundColor = "";
							}
						});

						console.log(`設定自動行動為 ${btn.innerText}`);
					}
				});
			});
		} else if (url.includes("profile")) {
			// 在其他玩家頁面
			title.setPage('玩家資料');

			// 開其他玩家頁面先禁用自動
			pvpWorker.enable = false;

			let playerId = url.match(/\/([0-9a-zA-Z]+?)$/)[1];
			api.profile(playerId).then(t => t.profile).then(profile => {
				if (profile) {
					title.setPage(`${profile.nickname} - 玩家資料`);
				}
			});

			const pvpDiv = pvpWorker.getPvpDiv();
			if (pvpDiv) {
				const h3 = pvpDiv.querySelector('h3');
				if (h3) {
					h3.insertAdjacentHTML('beforeend', '&nbsp;<label><input type="checkbox">&nbsp;Auto</label>');
					const checkbox = h3.querySelector('input');
					if (checkbox) {
						checkbox.addEventListener('change', (e) => {
							pvpWorker.enable = checkbox.checked;
						});
					}
				}
			}

			const pvpBtns = pvpWorker.getPvpBtns();
			pvpBtns.forEach((btn, index) => {
				if (storage.get('pvpWorker', null) === index) {
					btn.style.color = "var(--primary-color)";
					btn.style.backgroundColor = "var(--primary-bg-color)";
				}
				btn.addEventListener('click', (e) => {
					if (storage.get('pvpWorker', null) !== index) {
						storage.set('pvpWorker', index);
						pvpWorker.delay = null;

						btn.style.color = "var(--primary-color)";
						btn.style.backgroundColor = "var(--primary-bg-color)";
						pvpBtns.forEach(btn2 => {
							if (btn2 !== btn) {
								btn.style.color = "";
								btn.style.backgroundColor = "";
							}
						});

						console.log(`設定自動挑戰為 ${btn.innerText}`);
					}
				});
			});

		} else {
			title.setPage('');
		}
	}, 100);
})();

/*
書籤用：
javascript:(function(f){var d=document,s=d.createElement('script');s.type='text/javascript';s.src=f;d.body.appendChild(s)})("https://stu43005.github.io/userscript/mykirito/mykirito_auto.user.js")
*/