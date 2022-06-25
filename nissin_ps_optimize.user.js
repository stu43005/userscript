// ==UserScript==
// @name        Nissin Power Station [REBOOT] optimization
// @description Optimize chat room performance
// @version     1.0.0
// @include     https://nissin-ps.com/live/*
// @run-at      document-start
// @noframes
// ==/UserScript==
'use strict';

const observer = new MutationObserver(function (mutationList) {
    for (const mutation of mutationList) {
        if (mutation.type === "childList" && mutation.target.classList.contains("ultracheer-block")) {
            if (mutation.target.childNodes.length > 50) {
                let i = 0;
                for (const child of mutation.target.childNodes.values()) {
                    i++;
                    if (i > 50) {
                        mutation.target.removeChild(child);
                    }
                }
            }
        }
    }
});
observer.observe(document, {
    childList: true,
    subtree: true,
});
