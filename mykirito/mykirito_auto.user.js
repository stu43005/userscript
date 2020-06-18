// ==UserScript==
// @name         Kirito Auto
// @namespace    mykirito
// @version      0.3.7
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
			if (typeof timeout === 'function') {
				if (!timeout()) {
					title.notification = '';
					title.setTitle();
					clearInterval(timer);
					return;
				}
			} else if (Date.now() > now + timeout) {
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

function getRandomDelay(type) {
	return Math.floor(Math.random() * 20) + 10;
}

const actionWorker = {
	enable: storage.get('actionWorkerEnable', false),
	delay: null,
	notify: false,
	work: () => {
		if (!actionWorker.enable) { return; }

		const index = storage.get('actionWorker', null);
		if (index !== null) {

			const actionsDiv = actionWorker.getActionDiv();
			if (!actionsDiv) { return; }

			const reportDiv = actionWorker.getReportDiv();
			if (actionsDiv.querySelector('iframe') || (reportDiv && reportDiv.innerText.includes('需進行防機器人驗證'))) {
				if (!actionWorker.notify) {
					console.error(`行動需要驗證我是人類！`);
					notify('行動需要驗證我是人類！');
					title.notify('需要驗證', () => {
						const actionsDiv = actionWorker.getActionDiv();
						return actionsDiv && actionsDiv.querySelector('iframe');
					});
					actionWorker.notify = true;
				}
				return;
			} else if (actionWorker.notify) {
				actionWorker.notify = false;
			}

			if (reportDiv && reportDiv.innerText.includes('重新整理')) {
				location.reload();
				return;
			} else if (reportDiv && reportDiv.innerText.includes('錯誤')) {
				const msg = reportDiv.innerText;
				actionWorker.enable = false;
				console.error(`錯誤：${msg}`);
				notify(`錯誤：${msg}`);
				title.notify(`錯誤：${msg}`, () => {
					const reportDiv2 = actionWorker.getReportDiv();
					return reportDiv2 && reportDiv2.innerText.includes('錯誤');
				});
				return;
			}

			const allActions = actionWorker.getActionBtns();
			const btn = allActions[index];
			if (btn && !btn.disabled) {
				if (actionWorker.delay === null) {
					actionWorker.delay = getRandomDelay(1);
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
	getReportDiv: () => {
		const reportDiv = [...document.querySelectorAll("div#root > div > div > div")].find(d => d.innerText.startsWith('行動記錄'));
		const reports = [...reportDiv.children].filter(d => d.nodeName == 'DIV');
		return reports[0];
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
	enableCheckbox: null,
	_enable: false,
	get enable() { return pvpWorker._enable },
	set enable(value) {
		pvpWorker._enable = value;
		if (pvpWorker.enableCheckbox) {
			pvpWorker.enableCheckbox.checked = value;
		}
	},
	delay: null,
	notify: false,
	work: () => {
		if (storage.get('pvpWorkerAutoReload', '') == location.href) {
			pvpWorker.enable = true;
		}
		if (!pvpWorker.enable) { return; }

		const index = storage.get('pvpWorker', null);
		if (index !== null) {

			const pvpDiv = pvpWorker.getPvpDiv();
			if (!pvpDiv) { return; }

			const reportDiv = pvpWorker.getReportDiv();
			if (pvpDiv.querySelector('iframe') || (reportDiv && reportDiv.innerText.includes('需進行防機器人驗證'))) {
				if (!pvpWorker.notify) {
					if (storage.get('pvpWorkerAutoReload', '') != location.href) {
						location.reload();
						storage.set('pvpWorkerAutoReload', location.href);
						return;
					}
					storage.set('pvpWorkerAutoReload', '');

					console.error(`挑戰需要驗證我是人類！`);
					notify('挑戰需要驗證我是人類！');
					title.notify('需要驗證', () => {
						const pvpDiv2 = pvpWorker.getPvpDiv();
						return pvpDiv2 && pvpDiv2.querySelector('iframe');
					});
					pvpWorker.notify = true;
				}
				return;
			} else if (pvpWorker.notify) {
				pvpWorker.notify = false;
			}

			if (reportDiv && reportDiv.innerText.includes('對方已經轉生或升級了')) {
				pvpWorker.enable = false;
				console.error(`對方已經轉生或升級了，需要重新整理。`);
				notify('對方已經轉生或升級了，需要重新整理。');
				title.notify('需要重新整理', () => {
					const reportDiv2 = pvpWorker.getReportDiv();
					return reportDiv2 && reportDiv2.innerText.includes('對方已經轉生或升級了');
				});
				return;
			} else if (reportDiv && reportDiv.innerText.includes('對方已經死亡了')) {
				pvpWorker.enable = false;
				console.error(`對方已經死亡了。`);
				notify('對方已經死亡了。');
				title.notify('對方已經死亡了', () => {
					const reportDiv2 = pvpWorker.getReportDiv();
					return reportDiv2 && reportDiv2.innerText.includes('對方已經死亡了');
				});
				return;
			} else if (reportDiv && reportDiv.innerText.includes('錯誤')) {
				const msg = pvpWorker.getReportFirstLine(reportDiv);
				pvpWorker.enable = false;
				console.error(`錯誤：${msg}`);
				notify(`錯誤：${msg}`);
				title.notify(`錯誤：${msg}`, () => {
					const reportDiv2 = pvpWorker.getReportDiv();
					return reportDiv2 && reportDiv2.innerText.includes('錯誤');
				});
				return;
			}

			const pvpBtns = pvpWorker.getPvpBtns();
			const btn = pvpBtns[index];
			if (btn && !btn.disabled) {
				if (pvpWorker.delay === null) {
					pvpWorker.delay = getRandomDelay(2);
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
	getReportDiv: () => {
		const reportDiv = [...document.querySelectorAll("div#root > div > div > div")].find(d => d.innerText.startsWith('戰鬥報告'));
		const reports = [...reportDiv.children].filter(d => d.nodeName == 'DIV');
		return reports[0];
	},
	getReportFirstLine: (reportDiv) => {
		const text = reportDiv.querySelector('div:nth-child(2)').innerText;
		return text.replace(/^(.*\n|\d+\n?)/, '');
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

const floorWorker = {
	enable: storage.get('floorWorkerEnable', false),
	delay: null,
	notify: false,
	work: () => {
		if (!floorWorker.enable) { return; }

		const floorDiv = floorWorker.getFloorDiv();
		if (!floorDiv) { return; }

		if (floorDiv.querySelector('iframe')) {
			if (!floorWorker.notify) {
				console.error(`樓層獎勵需要驗證我是人類！`);
				notify('樓層獎勵需要驗證我是人類！');
				title.notify('需要驗證', () => {
					const floorDiv2 = floorWorker.getFloorDiv();
					return floorDiv2 && floorDiv2.querySelector('iframe');
				});
				floorWorker.notify = true;
			}
			return;
		} else if (floorWorker.notify) {
			floorWorker.notify = false;
		}

		const btn = floorWorker.getFloorBtn();
		if (btn && !btn.disabled) {
			if (floorWorker.delay === null) {
				floorWorker.delay = getRandomDelay(3);
				console.log(`可以領取獎勵，延時 ${floorWorker.delay} 秒後執行 ${btn.innerText}`);
			}
			if (floorWorker.delay > 0) {
				floorWorker.delay--;
				return;
			}
			btn.click();
			floorWorker.delay = null;
			console.log(`領取獎勵完成`);
		} else {
			floorWorker.delay = null;
		}
	},
	getFloorDiv: () => {
		const floorDiv = [...document.querySelectorAll("div#root > div > div > div")].find(d => d.innerText.startsWith('樓層獎勵'));
		return floorDiv;
	},
	getFloorBtn: () => {
		const floorDiv = floorWorker.getFloorDiv();
		if (!floorDiv) { return; }
		return floorDiv.querySelector('button');
	},
};

(async function () {
	'use strict';
	setInterval(actionWorker.work, 1000);
	setInterval(pvpWorker.work, 1000);
	setInterval(floorWorker.work, 1000);

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

			const floorTimer = setInterval(() => {
				const floorDiv = floorWorker.getFloorDiv();
				if (floorDiv) {
					clearInterval(floorTimer);
					const h3 = floorDiv.querySelector('h3');
					if (h3) {
						h3.insertAdjacentHTML('beforeend', '&nbsp;<label><input type="checkbox">&nbsp;Auto</label>');
						const checkbox = h3.querySelector('input');
						if (checkbox) {
							checkbox.checked = floorWorker.enable;
							checkbox.addEventListener('change', (e) => {
								floorWorker.enable = checkbox.checked;
								storage.set('floorWorkerEnable', floorWorker.enable);
							});
						}
					}
				}
			}, 100);

		} else if (url.includes("profile")) {
			// 在其他玩家頁面
			title.setPage('玩家資料');

			// 開其他玩家頁面先禁用自動
			pvpWorker.enable = false;

			// const playerId = url.match(/\/([0-9a-zA-Z]+?)$/)[1];
			// api.profile(playerId).then(t => t.profile).then(profile => {
			// 	if (profile) {
			// 		title.setPage(`${profile.nickname} - 玩家資料`);
			// 	}
			// });

			const pvpDiv = pvpWorker.getPvpDiv();
			if (pvpDiv) {
				const h3 = pvpDiv.querySelector('h3');
				if (h3) {
					h3.insertAdjacentHTML('beforeend', '&nbsp;<label><input type="checkbox">&nbsp;Auto</label>');
					const checkbox = h3.querySelector('input');
					if (checkbox) {
						pvpWorker.enableCheckbox = checkbox;
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
