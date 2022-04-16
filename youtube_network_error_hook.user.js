// ==UserScript==
// @name         Youtube network error hook
// @namespace    https://github.com/stu43005
// @version      0.1
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

    if (!window._yt_player || !window._yt_player.jS) {
        if (retry > 10) return;
        setTimeout(main, 1000);
        retry++;
        return;
    }

    const temp1 = new window._yt_player.jS({ videoData: { isValid() { return false } } });

    const old_onError = temp1.C.__proto__.onError;
    temp1.C.__proto__.onError = function (a) {
        old_onError.call(this, a);
        const videoId = window.ytcfg.get("VIDEO_ID");
        console.log(`[errorHook][${videoId}] yt player error:`, a);
        window.miniToast.init(`yt player error: ${a}`, {}).show();
    };

    console.log(`[errorHook] setup page: ${location.href}`);
    // window.miniToast.init(`[errorHook] setup page`, {}).show();
}
main();
