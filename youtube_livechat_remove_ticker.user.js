// ==UserScript==
// @name         Youtube Livechat remove ticker
// @namespace    https://github.com/stu43005
// @version      20250126
// @description
// @author       stu43005
// @match        https://www.youtube.com/live_chat*
// @match        https://www.youtube.com/live_chat_replay*
// @run-at       document-start
// @grant        none
// @allFrames    true
// ==/UserScript==

const getLiveChat = "/youtubei/v1/live_chat/get_live_chat";

window.fetch = new Proxy(fetch, {
    apply: function (target, thisArg, args) {
        const arg0 = args[0];
        const url = arg0 && arg0 instanceof Request ? arg0.url : arg0?.toString();
        if (url.includes(getLiveChat)) {
            return target.apply(thisArg, args).then((response) => {
                const contentType = response.headers.get("Content-Type");
                if (contentType && contentType.includes("application/json")) {
                    return response
                        .clone()
                        .json()
                        .then((data) => {
                            const liveChatContinuation =
                                data.continuationContents?.liveChatContinuation;
                            if (liveChatContinuation?.actions) {
                                const originCount = liveChatContinuation.actions.length;
                                liveChatContinuation.actions = liveChatContinuation.actions.filter(
                                    (action) => !("addLiveChatTickerItemAction" in action)
                                );
                                const newCount = liveChatContinuation.actions.length;
                                if (originCount !== newCount) {
                                    console.log(
                                        `actions ${originCount} -> ${newCount} (remove ${
                                            originCount - newCount
                                        })`
                                    );
                                }
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

document.querySelectorAll("#ticker-items > *").forEach((el) => el.remove());
