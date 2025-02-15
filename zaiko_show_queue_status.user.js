// ==UserScript==
// @name         Zaiko show queue status
// @namespace    https://github.com/stu43005
// @version      20250215
// @description
// @author       stu43005
// @match        https://zaiko.io/billing/order/*
// @match        https://*.zaiko.io/billing/order/*
// @run-at       document-start
// @grant        none
// @allFrames    true
// @require      https://unpkg.com/mor-mini-toast@3.x/umd/bundle.js
// ==/UserScript==

window.fetch = new Proxy(fetch, {
    apply: function (target, thisArg, args) {
        const arg0 = args[0];
        const url = arg0 && arg0 instanceof Request ? arg0.url : arg0?.toString();
        if (url.includes("/graph/queue/status")) {
            return target.apply(thisArg, args).then((response) => {
                const contentType = response.headers.get("Content-Type");
                if (contentType && contentType.includes("application/json")) {
                    return response
                        .clone()
                        .json()
                        .then((data) => {
                            if (data.in_front) {
                                window.miniToast.init(`queue in front: ${data.in_front}`, {}).show();
                            }

                            return new Response(JSON.stringify(data), {
                                status: response.status,
                                statusText: response.statusText,
                                headers: response.headers,
                            });
                        });
                }
                return response;
            });
        }
        return target.apply(thisArg, args);
    },
});
