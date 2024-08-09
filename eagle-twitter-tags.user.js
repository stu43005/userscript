// ==UserScript==
// @name                Eagle 自動 Twitter 標籤
// @version             1.0.0
// @description         Eagle 自動 Twitter 標籤
// @author              Shiaupiau
// @namespace           https://github.com/stu43005
// @match               *://twitter.com/*
// @match               *://x.com/*
// @run-at              document-end
// @noframes
// @grant               GM_xmlhttpRequest
// ==/UserScript==
// @ts-check
/// <reference types="tampermonkey" />
"use strict";

class EagleApi {
    // Eagle API URL
    static EAGLE_SERVER_URL = "http://localhost:41595";
    static TAG_LIST_API_URL = `${this.EAGLE_SERVER_URL}/api/tag/list`;

    /** @type {Promise<EagleTagItem[]> | null} */
    static tagListPromise = null;
    /** @type {string[] | null} */
    static tags = null;

    /**
     * @template T
     * @typedef {Object} EagleApiResult<T>
     * @prop {string} status
     * @prop {T} data
     */
    /**
     * @typedef {Object} EagleTagItem
     * @prop {string} name
     * @prop {number} imageCount
     * @prop {string[]} groups
     * @prop {string} pinyin
     */

    /**
     * fetch tag list
     * @returns {Promise<EagleTagItem[]>}
     */
    static fetchTagList() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url: this.TAG_LIST_API_URL,
                method: "GET",
                onload: (response) => {
                    try {
                        /** @type {EagleApiResult<EagleTagItem[]>} */
                        const result = JSON.parse(response.response);
                        if (result.status === "success" && result.data) {
                            console.log(`Eagle tag list:`, result.data);
                            resolve(result.data);
                        } else {
                            reject(result);
                        }
                    } catch (err) {
                        reject(err);
                    }
                },
            });
        });
    }

    static async getTags() {
        try {
            if (!this.tags) {
                this.tagListPromise ??= EagleApi.fetchTagList();
                this.tags = (await this.tagListPromise).map((item) => item.name);
            }
            return this.tags;
        } catch (error) {
            this.tagListPromise = null;
            console.log(`Unable to fetch Eagle tag list`);
            throw error;
        }
    }
}

/**
 * @param {Element} article
 */
async function eagleAttributes(article) {
    try {
        const tweetPhotos = Array.from(
            article.querySelectorAll(`[data-testid="tweetPhoto"] img`)
        ).filter((img) => !img.hasAttribute("eagle-tags"));
        const hashtags = Array.from(article.querySelectorAll(`a[href^="/hashtag/"]`))
            .map((element) => element.textContent?.replace(/^#/, ""))
            .filter((text) => text !== undefined);
        if (tweetPhotos.length > 0 && hashtags.length > 0) {
            const eagleTags = await EagleApi.getTags();
            const addTags = eagleTags.filter((tag) =>
                hashtags.find((hashtag) => tag.toLowerCase() === hashtag.toLowerCase())
            );

            for (const img of tweetPhotos) {
                img.setAttribute("eagle-tags", addTags.join(","));
            }
        }
    } catch (error) {
        console.log(error);
    }
}

const ARTICLE_SELECTOR = `article[data-testid="tweet"]`;

const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
        for (const addedNode of mutation.addedNodes) {
            if (addedNode instanceof Element) {
                if (addedNode.matches(ARTICLE_SELECTOR)) {
                    eagleAttributes(addedNode);
                } else {
                    const closestArticle = addedNode.closest(ARTICLE_SELECTOR);
                    if (closestArticle) {
                        eagleAttributes(closestArticle);
                    } else {
                        const articles = Array.from(addedNode.querySelectorAll(ARTICLE_SELECTOR));
                        for (const article of articles) {
                            eagleAttributes(article);
                        }
                    }
                }
            }
        }
    }
});
observer.observe(document.body, {
    childList: true,
    subtree: true,
});
