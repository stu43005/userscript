// ==UserScript==
// @name        PTT 以外的相關網站自動轉址到 ptt.cc
// @version     1.0.0
// @match       *://www.pttweb.cc/bbs/*
// @match       *://pttweb.tw/bbs/*
// @match       *://ptthito.com/*
// @match       *://disp.cc/b/*
// @match       *://moptt.tw/p/*
// @match       *://ptt-politics.com/*
// @run-at      document-start
// @noframes
// ==/UserScript==
// @ts-check
'use strict';

let url = new URL(window.location.href);
switch (window.location.host) {
    case "www.pttweb.cc":
        {
            url.pathname = `${url.pathname}.html`;
            break;
        }
    case "ptthito.com":
        {
            url.pathname = url.pathname.replace(/\/(.+)\/(.+)\//, (str, board, id) => {
                return `/bbs/${board[0].toUpperCase()}${board.substring(1)}/${id.replace(/-/g, ".").toUpperCase()}.html`;
            });
            break;
        }
    case "moptt.tw":
        {
            const path = url.pathname.split('/', 3)[2];
            const board = path.split('.', 1)[0];
            const file = path.slice(board.length + 1) + '.html';
            url.pathname = `/bbs/${board}/${file}`;
            break;
        }
    case "pttweb.tw":
    case "disp.cc":
    case "ptt-politics.com":
        {
            const links = document.querySelectorAll("a[href^='https://www.ptt.cc/bbs/']");
            for (const a of links) {
                if (a.parentElement?.textContent?.includes("※ 文章網址:")) {
                    const link = a.getAttribute("href");
                    if (link) {
                        url = new URL(link);
                    }
                }
            }
            break;
        }
}
url.protocol = "https:";
url.host = "www.ptt.cc";
window.location.href = url.toString();
