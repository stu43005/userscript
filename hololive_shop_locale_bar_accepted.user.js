// ==UserScript==
// @name         Auto set locale for hololive official shop
// @version      1.0.0
// @description  Auto set locale for hololive official shop
// @author       Shiaupiau
// @namespace    https://github.com/stu43005
// @match        https://shop.hololivepro.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hololivepro.com
// @grant        GM_cookie
// ==/UserScript==
// @ts-check
/// <reference types="tampermonkey" />
"use strict";

// document.cookie = "locale_bar_accepted=1; domain=shop.hololivepro.com; max-age=31536000";
GM_cookie.set(
    {
        url: location.href,
        name: "locale_bar_accepted",
        value: "1",
        domain: "shop.hololivepro.com",
        path: "/",
        expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // Expires in 30 days
    },
    function (error) {
        if (error) {
            console.error(error);
        } else {
            console.log("Cookie set successfully.");
        }
    }
);
