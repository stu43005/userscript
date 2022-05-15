// ==UserScript==
// @name         Youtube network error hook
// @namespace    https://github.com/stu43005
// @version      0.2
// @description
// @author       stu43005
// @match        https://www.youtube.com/watch*
// @match        https://www.youtube.com/embed*
// @exclude      https://www.youtube.com/live_chat*
// @run-at       document-end
// @grant        none
// @require      https://unpkg.com/mor-mini-toast@3.x/umd/bundle.js
// ==/UserScript==

let retry = 0;

function main() {
    'use strict';

    if (!window._yt_player) {
        if (retry > 10) return;
        setTimeout(main, 1000);
        retry++;
        return;
    }

    const firstKey = Object.keys(window._yt_player).find(key => {
        return window._yt_player[key]?.toString().includes(".videoData.isValid()");
    });
    if (!firstKey) return;

    const temp1 = new window._yt_player[firstKey]({ videoData: { isValid() { return false } } });

    const secondKey = Object.keys(temp1).find(key => {
        return temp1[key]?.__proto__?.onError;
    });
    if (!secondKey) return;

    const old_onError = temp1[secondKey].__proto__.onError;
    temp1[secondKey].__proto__.onError = function (a) {
        old_onError.call(this, a);
        const videoId = window.ytcfg.get("VIDEO_ID");
        console.log(`[errorHook][${videoId}] yt player error:`, a);
        window.miniToast.init(`yt player error: ${a}`, {}).show();
    };

    console.log(`[errorHook] setup page: ${location.href}`);
    // window.miniToast.init(`[errorHook] setup page`, {}).show();
}
main();
