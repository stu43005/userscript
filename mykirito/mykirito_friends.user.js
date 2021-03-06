// ==UserScript==
// @name         Kirito Friends
// @namespace    mykirito
// @version      0.1.7
// @description  mykirito.com 的好友列表
// @author       Shiaupiau
// @include      https://mykirito.com/*
// @include      https://kirito-1585904519813.appspot.com/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
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
		return JSON.parse(localStorage.getItem(key)) || def;
	},
	set: (key, value) => {
		localStorage.setItem(key, JSON.stringify(value));
	}
};

const friends = {
	getFriends: () => {
		return storage.get('friends', []);
	},
	addFriend: (uid, profile) => {
		if (!friends.getFriend(uid)) {
			const list = friends.getFriends();
			list.push({
				uid,
				profile,
				time: profile ? Date.now() : undefined,
			});
			storage.set('friends', list);
		}
	},
	removeFriend: (uid) => {
		if (friends.getFriend(uid)) {
			const list = friends.getFriends();
			list.splice(list.findIndex(user => user.uid == uid), 1);
			storage.set('friends', list);
		}
	},
	getFriend: (uid) => {
		return friends.getFriends().find(user => user.uid == uid);
	},

	renderTable: (table) => {
		const list = friends.getFriends().sort((a, b) => (b.profile ? b.profile.lv : 0) - (a.profile ? a.profile.lv : 0));
		const mytable = $(table).clone();
		const temprow = mytable.find('tbody > tr:nth-child(2)').clone();
		let el;
		while (el = mytable.get(0).querySelector('tbody > tr:nth-child(2)')) {
			mytable.get(0).querySelector('tbody').removeChild(el);
		}
		for (let i = 0; i < list.length; i++) {
			const uid = list[i].uid;
			const profile = list[i].profile;
			const tr = temprow.clone();
			tr.css({
				color: "red" === profile.color ? "var(--red)" : "grey" === profile.color ? "var(--grey)" : "orange" === profile.color ? "#ff9800" : "inherit",
				background: '',
			});
			tr.find('picture img').attr('src', `https://storage.googleapis.com/kirito-1585904519813.appspot.com/avatars/${profile.avatar}.png`);
			tr.find('picture source').remove();
			tr.find('td:nth-child(2)').text(profile.lv);
			tr.find('td:nth-child(3) > div > div:nth-child(1) > div:nth-child(1)').text(profile.nickname);
			tr.find('td:nth-child(3) > div > div:nth-child(1) > div:nth-child(2)').text(`${profile.character}（${profile.title}）`);
			tr.find('td:nth-child(3) > div > div:nth-child(2)').text(profile.status);
			tr.find('td:nth-child(4)').text(profile.floor);
			tr.click(() => {
				location.href = `https://mykirito.com/profile/${uid}`;
			});
			mytable.find('tbody').append(tr);
		}
		return mytable.get(0);
	},

	friendsWorker: async () => {
		if (storage.get('friendsWorkerNext', 0) > Date.now()) {
			return;
		}

		let list = friends.getFriends();
		if (typeof list[0] === 'string') {
			list = list.map(uid => ({ uid }));
			storage.set('friends', list);
		}
		for (let i = 0; i < list.length; i++) {
			const user = list[i];
			const uid = user.uid;
			if (!user.time || user.time + 600000 < Date.now()) {
				storage.get('friendsWorkerNext', Date.now() + 10000);
				list[i] = {
					uid: uid,
					profile: (await api.profile(uid)).profile,
					time: Date.now(),
				};
				storage.set('friends', list);
				// console.log('[friends]', list[i]);
				return;
			}
		}
	},
};

(async function () {
	'use strict';
	setInterval(friends.friendsWorker, 10000);

	let url = "";
	let lastUrl = "";
	setInterval(window.onload = async function () {
		url = location.href;
		if (url === lastUrl) {
			return;
		}
		lastUrl = url;

		if (url.includes("profile")) {
			// 在其他玩家頁面
			let playerId = url.match(/\/([0-9a-zA-Z]+?)$/)[1];

			const typeBtns = document.querySelectorAll("div#root > div > div > div:nth-child(1) > button");
			const addFriendBtn = document.createElement('button');
			if (friends.getFriend(playerId)) {
				addFriendBtn.innerText = '移除好友';
			} else {
				addFriendBtn.innerText = '加入好友';
			}
			addFriendBtn.className = typeBtns[0].className;
			typeBtns[typeBtns.length - 1].insertAdjacentElement('afterend', addFriendBtn);

			let adding = false;
			let tempProfile;
			addFriendBtn.addEventListener('click', (e) => {
				if (friends.getFriend(playerId)) {
					addFriendBtn.innerText = '加入好友';
					friends.removeFriend(playerId);

				} else if (tempProfile) {
					addFriendBtn.innerText = '移除好友';
					friends.addFriend(playerId, tempProfile);

				} else if (!adding) {
					addFriendBtn.innerText = '請稍等...';
					adding = true;
					api.profile(playerId).then(t => t.profile).then((profile) => {
						tempProfile = profile;
						addFriendBtn.innerText = '移除好友';
						adding = false;
						friends.addFriend(playerId, profile);
					});
				}
			});

		} else if (url.includes("user-list")) {
			// 在玩家列表
			const timeout = setInterval(() => {
				const userlistDiv = [...document.querySelectorAll("div#root > div > div")].find(d => d.innerText.startsWith('玩家列表'));
				if (userlistDiv.innerText.includes('好友列表')) {
					clearInterval(timeout);
					return;
				}
				if (userlistDiv.querySelector("table > tbody > tr:nth-child(2)")) {
					clearInterval(timeout);

					const mytable = friends.renderTable(userlistDiv.querySelector("table"));
					const h3 = $(userlistDiv.querySelector("h3")).clone();
					h3.text('好友列表');
					userlistDiv.insertAdjacentHTML('afterbegin', '<hr>');
					userlistDiv.insertAdjacentElement('afterbegin', mytable);
					userlistDiv.insertAdjacentElement('afterbegin', h3.get(0));
				}
			}, 100);

		} else if (url.match(/https:\/\/mykirito\.com\/?$/)) {
			// 在首頁

		} else if (url.match(/report\/[0-9a-f]+$/)) {
			// 在戰報頁面

		}
	}, 100);
})();
