// ==UserScript==
// @name                Eagle 自動標籤
// @version             1.1.0
// @description         Eagle 自動標籤
// @author              Shiaupiau
// @namespace           https://github.com/stu43005
// @match               *://twitter.com/*
// @match               *://x.com/*
// @match               *://*.fanbox.cc/*
// @match               *://fantia.jp/*
// @run-at              document-end
// @noframes
// @grant               GM_xmlhttpRequest
// @require             https://cdn.jsdelivr.net/npm/idb@8/build/umd.js
// ==/UserScript==
/// <reference path="./types/idb-global.d.ts" />
"use strict";
{

class EagleApi {
    // Eagle API URL
    static EAGLE_SERVER_URL = "http://localhost:41595";
    static LIBRARY_INFO_URL = `${this.EAGLE_SERVER_URL}/api/library/info`;
    static TAG_LIST_API_URL = `${this.EAGLE_SERVER_URL}/api/tag/list`;

    /** @type {Promise<EagleLibraryInfo> | null} */
    static libraryInfoPromise = null;
    /** @type {EagleLibraryInfo | null} */
    static libraryInfo = null;
    /** @type {number} */
    static libraryInfoTimestamp = 0;

    /** @type {Promise<EagleTagItem[]> | null} */
    static tagListPromise = null;
    /** @type {string[] | null} */
    static tags = null;
    /** @type {number} */
    static tagsTimestamp = 0;

    /**
     * @template T
     * @typedef {Object} EagleApiResult<T>
     * @prop {string} status
     * @prop {T} data
     */
    /**
     * @typedef {Object} EagleLibraryInfo
     * @prop {any[]} folders
     * @prop {any[]} smartFolders
     * @prop {any[]} quickAccess
     * @prop {any[]} tagsGroups
     * @prop {number} modificationTime
     * @prop {string} applicationVersion
     * @prop {{ path: string; name: string; }} library
     */
    /**
     * @typedef {Object} EagleTagItem
     * @prop {string} name
     * @prop {number} imageCount
     * @prop {string[]} groups
     * @prop {string} pinyin
     */

    /**
     * fetch an api
     * @template T
     * @param {string} url
     * @return {Promise<T>}
     */
    static fetch(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url: url,
                method: "GET",
                onload: (response) => {
                    try {
                        /** @type {EagleApiResult<T>} */
                        const result = JSON.parse(response.response);
                        if (result.status === "success" && result.data) {
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

    /**
     * fetch tag list
     * @returns {Promise<EagleTagItem[]>}
     */
    static async fetchTagList() {
        /** @type {EagleTagItem[]} */
        const tags = await this.fetch(this.TAG_LIST_API_URL);
        console.log(`Eagle tag list:`, tags);
        return tags;
    }

    static async getTags() {
        try {
            if (!this.tags || (Date.now() - this.tagsTimestamp) > 60_000) {
                this.tagListPromise ??= EagleApi.fetchTagList();
                this.tags = (await this.tagListPromise).map((item) => item.name);
                this.tagsTimestamp = Date.now();
                this.tagListPromise = null;
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
 * @typedef {import("idb").DBSchema & {
 *     cache: {
 *         key: string;
 *         value: string;
 *     };
 * }} CacheSchema
 */

class CacheStore {
    /** @type {Promise<import("idb").IDBPDatabase<CacheSchema>> | null} */
	static db = null;
	/** @type {"cache"} */
	static storeName = "cache";

	static async openDb() {
		if (!this.db) {
			this.db = idb.openDB("eagle-helper-store", 1, {
				upgrade: (db) => {
					db.createObjectStore(this.storeName);
				},
			});
		}
		return await this.db;
	}

	/**
	 * @param {string} key
	 * @param {string} val
	 */
	static async setValue(key, val) {
		return (await this.openDb()).put(this.storeName, val, key);
	}

	/**
	 * @param {string} key
	 */
	static async getValue(key) {
		return (await this.openDb()).get(this.storeName, key);
	}
}

/**
 * @param {HTMLElement} article
 * @param {Config} config
 */
async function onArticleChange(article, config) {
    const images = Array.from(article.querySelectorAll(config.imagesSelector ?? "img"))
        .filter((el) => el instanceof HTMLImageElement);
    for (const img of images) {
		try {
            if (img.hasAttribute("data-eagle-tagger")) {
                continue;
            }
			img.setAttribute("data-eagle-tagger", "pending");

            if (config.titleFn) {
                const title = await config.titleFn(article, img);
                if (title) {
                    img.setAttribute("eagle-title", title);
                }
            }
            if (config.srcFn) {
                const src = await config.srcFn(article, img);
                if (src) {
					img.setAttribute("eagle-src", src);
                }
            }
            if (config.annotationFn) {
                const annotation = await config.annotationFn(article, img);
                if (annotation) {
                    img.setAttribute("eagle-annotation", annotation);
                }
            }
            if (config.tagsFn) {
                const eagleTags = await EagleApi.getTags();
                const tags = await config.tagsFn(article, img, eagleTags);
                if (tags.length > 0) {
                    img.setAttribute("eagle-tags", tags.join(","));
                }
            }
            if (config.linkFn) {
                const link = await config.linkFn(article, img);
                if (link) {
                    img.setAttribute("eagle-link", link);
                }
            }

            img.setAttribute("data-eagle-tagger", "true");
		} catch (error) {
			console.error("[Eagle Tagger] Error:", error);
			img.removeAttribute("data-eagle-tagger");
        }
    }
}

/**
 * @typedef {Object} Config
 * @prop {string[]} hostnames
 * @prop {string} [articlesSelector]
 * @prop {string} [imagesSelector]
 * @prop {(article: HTMLElement, image: HTMLImageElement) => string | null} [titleFn]
 * @prop {(article: HTMLElement, image: HTMLImageElement) => string | null | Promise<string | null>} [srcFn]
 * @prop {(article: HTMLElement, image: HTMLImageElement) => string | null} [annotationFn]
 * @prop {(article: HTMLElement, image: HTMLImageElement, eagleTags: string[]) => string[]} [tagsFn]
 * @prop {(article: HTMLElement, image: HTMLImageElement) => string | null} [linkFn]
 */

/** @type {Config[]} */
const configs = [
    {
        hostnames: ["x.com", "twitter.com"],
        articlesSelector: `article[data-testid="tweet"]`,
        imagesSelector: `[data-testid="tweetPhoto"] img`,
        tagsFn: (article, img, eagleTags) =>
            Array.from(article.querySelectorAll(`a[href^="/hashtag/"]`))
            .map((element) => element.textContent?.replace(/^#/, ""))
            .filter((hashtag) => hashtag !== undefined && eagleTags.some(tag => tag.toLowerCase() === hashtag.toLowerCase())),
    },
    {
        hostnames: [".fanbox.cc"],
        srcFn: (article, img) => img.closest("a")?.href ?? null
    },
	{
		hostnames: ["fantia.jp"],
		articlesSelector: `post-show`,
		imagesSelector: `.image-thumbnails img`,
		srcFn: async (article, img) => {
			const postId = article.dataset.postId;
			const imgId = img.src.match(/\/post_content_photo\/file\/(\d+)\//)?.[1];
			if (!postId || !imgId) return null;
			const fullImagePage = `https://fantia.jp/posts/${postId}/post_content_photo/${imgId}`;
			const urlFromCache = await CacheStore.getValue(fullImagePage);
			if (urlFromCache) {
				// already in cache
				return urlFromCache;
			}
			const res = await fetch(fullImagePage);
			const html = await res.text();
			const tempContainer = document.createElement("div");
			tempContainer.innerHTML = html;
			const fullImageUrl = tempContainer.querySelector("img")?.src;
			if (fullImageUrl) {
				await CacheStore.setValue(fullImagePage, fullImageUrl);
			}
			return fullImageUrl ?? null;
		}
	}
];
const enabledConfigs = configs.filter((config) => config.hostnames.some(h => h.startsWith(".") && location.hostname.endsWith(h) || location.hostname === h));

console.log("[Eagle Tagger] ready");
for (const config of enabledConfigs) {
    const articlesSelector = config.articlesSelector ?? "article";
    const articles = Array.from(document.querySelectorAll(articlesSelector))
        .filter((el) => el instanceof HTMLElement);
    for (const article of articles) {
        onArticleChange(article, config);
    }
}

const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
        for (const addedNode of mutation.addedNodes) {
            if (addedNode instanceof HTMLElement) {
                for (const config of enabledConfigs) {
                    const articlesSelector = config.articlesSelector ?? "article";
                    if (addedNode.matches(articlesSelector)) {
                        onArticleChange(addedNode, config);
                    } else {
                        const closestArticle = addedNode.closest(articlesSelector);
                        if (closestArticle instanceof HTMLElement) {
                            onArticleChange(closestArticle, config);
                        } else {
                            const articles = Array.from(addedNode.querySelectorAll(articlesSelector))
                                .filter((el) => el instanceof HTMLElement);
                            for (const article of articles) {
                                onArticleChange(article, config);
                            }
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

}
