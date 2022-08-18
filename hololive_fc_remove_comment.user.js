// ==UserScript==
// @name        Hololive FC remove comment
// @description remove comment on Hololive FC
// @version     1.0.0
// @include     https://hololive-fc.com/live/*
// @include     https://hololive-fc.com/video/*
// @run-at      document-end
// ==/UserScript==
'use strict';

const timer = setInterval(() => {
    for (const element of document.querySelectorAll("h6.MuiTypography-subtitle2")) {
        if (element.innerText.includes("コメント")) {
            let node = element;
            for (;;) {
                if (!node.parentNode.getElementsByTagName("video").length) {
                    node = node.parentNode;
                } else {
                    break;
                }
            }
            node.parentNode.removeChild(node);
            clearInterval(timer);
        }
    }
}, 1000);
