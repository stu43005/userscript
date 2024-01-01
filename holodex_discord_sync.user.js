// ==UserScript==
// @name                Holodex & Discord Sync
// @name:zh-TW          Holodex & Discord 同步
// @version             1.0.1
// @description         Using the Holodex multi-view archive sync feature, synchronize of Discord chat.
// @description:zh-TW   使用Holodex多窗存檔同步功能，同步觀看Discord聊天室
// @author              Shiaupiau
// @namespace           https://github.com/stu43005
// @match               https://holodex.net/*
// @match               https://staging.holodex.net/*
// @match               https://discord.com/apps
// @match               https://discord.com/channels/*
// @run-at              document-end
// @noframes
// @grant               GM_getTabs
// @grant               GM_getTab
// @grant               GM_saveTab
// ==/UserScript==
// @ts-check
/// <reference types="tampermonkey" />
"use strict";

const tabUpdateInterval = 1000;

/**
 * @typedef {Element & { __vue__?: any; }} VueElement
 * @typedef {Record<string, any>} GmTab
 */

if (!window.GM_getTabs || !window.GM_getTab || !window.GM_saveTab) {
    throw new Error("Unsupport GM_getTab");
}

const logger = {
    name: "holodex_sync_discord_chat",
    get info() {
        return logger.log;
    },
    log(...msgs) {
        console.log(`[${logger.name}]`, "ℹ️", ...msgs);
    },
    debug(...msgs) {
        console.debug(`[${logger.name}]`, "🐛", ...msgs);
    },
    warn(...msgs) {
        console.warn(`[${logger.name}]`, "⚠️", ...msgs);
    },
    error(...msgs) {
        console.error(`[${logger.name}]`, "❌", ...msgs);
    },
};

class HolodexController {
    constructor() {
        this.observer = new MutationObserver((mutationList) => {
            for (const mutation of mutationList) {
                for (const removedNode of mutation.removedNodes) {
                    if (removedNode instanceof Element && removedNode.matches(`.sync-bar`)) {
                        this.disconnectSyncBar();
                    }
                }
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode instanceof Element && addedNode.matches(`.sync-bar`)) {
                        this.connectSyncBar(/** @type {Element} */ (addedNode));
                    }
                }
            }
        });
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        const syncBar = document.querySelector(".sync-bar");
        if (syncBar) {
            this.connectSyncBar(syncBar);
        }
    }

    /**
     * @param {Element} target
     */
    connectSyncBar(target) {
        logger.log("connectSyncBar");
        /**
         * @typedef {Object} MultiviewSyncBarComponent
         * @prop {boolean} paused
         * @prop {number} currentTs
         * @prop {boolean} hasVideosToSync
         */

        /**
         * @type {MultiviewSyncBarComponent}
         */
        const multiviewSyncBarComponent = this.findSyncBarComponent(
            /** @type {VueElement} */ (target)?.__vue__
        );
        if (multiviewSyncBarComponent) {
            if (this.timer || this.multiviewSyncBarComponent) {
                this.disconnectSyncBar();
            }
            logger.log("multiviewSyncBarComponent:", multiviewSyncBarComponent);
            this.multiviewSyncBarComponent = multiviewSyncBarComponent;
            this.timer = setInterval(() => this.saveComponentProps(), tabUpdateInterval);
        }
    }

    findSyncBarComponent(vue) {
        if (!vue) return;
        if (vue.$vnode?.tag?.endsWith("MultiviewSyncBar")) {
            return vue;
        }
        if (vue.$parent) {
            return this.findSyncBarComponent(vue.$parent);
        }
    }

    saveComponentProps() {
        window.GM_getTab((tab) => {
            tab.paused = this.multiviewSyncBarComponent?.paused;
            tab.currentTs = this.multiviewSyncBarComponent?.currentTs;
            tab.hasVideosToSync = this.multiviewSyncBarComponent?.hasVideosToSync;
            window.GM_saveTab(tab);
        });
    }

    disconnectSyncBar() {
        logger.log("disconnectSyncBar");
        if (this.timer) {
            clearInterval(this.timer);
        }
        if (this.multiviewSyncBarComponent) {
            this.multiviewSyncBarComponent = undefined;
        }
        this.saveComponentProps();
    }
}

/**
 * @typedef {Object} MessageData
 * @prop {HTMLElement} element
 * @prop {string} messageId
 * @prop {number} timestamp
 */

class DiscordController {
    // get scroller() {
    //     return document.querySelector(`div[class*="messagesWrapper"] > div[class*="scroller"]`);
    // }

    constructor() {
        /**
         * @type {string | null}
         */
        this.currentTab = null;
        /**
         * @type {boolean}
         */
        this.isSticky = true;
        /**
         * @type {number}
         */
        this.currentTs = 0;
        /**
         * @type {boolean}
         */
        this.paused = true;
        /**
         * @type {Element | null}
         */
        this._scroller = null;
        /**
         * @type {AbortController | undefined}
         */
        this.scrollListenerSignal = undefined;

        this.holodexTimer = setInterval(() => this.getHolodexData(), tabUpdateInterval);

        this.observer = new MutationObserver((mutationList) => {
            let messageChanged = false;
            for (const mutation of mutationList) {
                for (const removedNode of mutation.removedNodes) {
                    if (
                        removedNode instanceof Element &&
                        removedNode.matches(`li[class*="messageListItem"]`)
                    ) {
                        messageChanged = true;
                        this.autoScroll = true;
                    }
                }
                for (const addedNode of mutation.addedNodes) {
                    if (
                        addedNode instanceof Element &&
                        addedNode.matches(`li[class*="messageListItem"]`)
                    ) {
                        messageChanged = true;
                        this.autoScroll = true;
                    }
                }
            }
            if (messageChanged) {
                this.scroll();
            }
        });
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    /**
     * @param {Element | null} scroller
     */
    setScroller(scroller) {
        if (this.scrollListenerSignal) {
            this.scrollListenerSignal.abort();
        }
        this._scroller = scroller;
        if (scroller) {
            this.scrollListenerSignal = new AbortController();
            scroller.addEventListener("scroll", (event) => this.onScroll(event), {
                signal: this.scrollListenerSignal.signal,
            });
        }
        logger.debug("set scroller", scroller);
    }

    getScroller() {
        const scroller = document.querySelector(
            `div[class*="messagesWrapper"] > div[class*="scroller"]`
        );
        if (this._scroller !== scroller) {
            this.setScroller(scroller);
        }
        return scroller;
    }

    /**
     * @returns {Promise<[string, GmTab]>}
     */
    async getActiveTab() {
        return new Promise((resolve, reject) => {
            window.GM_getTabs((tabs) => {
                if (this.currentTab && this.currentTab in tabs) {
                    const tabId = this.currentTab;
                    const tab = tabs[tabId];
                    if (tab.hasVideosToSync && tab.currentTs > 0) {
                        resolve([tabId, tab]);
                        return;
                    }
                }
                for (const [tabId, tab] of Object.entries(tabs)) {
                    if (tab.hasVideosToSync && tab.currentTs > 0) {
                        resolve([tabId, tab]);
                        return;
                    }
                }
                reject("no active tab");
            });
        });
    }

    async getHolodexData() {
        try {
            const [tabId, tab] = await this.getActiveTab();
            if (this.currentTab !== tabId) {
                logger.log(`tab changed: from ${this.currentTab} to ${tabId}`);
            }
            this.currentTab = tabId;
            this.currentTs = tab.currentTs;
            this.paused = tab.paused;
            this.scroll();
        } catch (error) {
            if (error instanceof Error) {
                logger.error("[getHolodexData]", error);
            }
            if (this.currentTab) {
                logger.log(`tab changed: from ${this.currentTab} to null`);
            }
            this.currentTab = null;
            this.currentTs = 0;
            this.paused = true;
        }
    }

    getMessages() {
        const scroller = this.getScroller();
        if (!scroller) return [];

        /**
         * @type MessageData[]
         */
        const messages = Array.from(
            /** @type {NodeListOf<HTMLLIElement>} */ (
                scroller.querySelectorAll(`li[class*="messageListItem"]`)
            )
        ).map((element) => {
            const messageId = element.id.match(/-(\d+)$/)?.[1] ?? "";
            const timestamp = Number((BigInt(messageId) >> 22n) + 1420070400000n) / 1000;
            // if (timestamp > this.currentTs) {
            //     element.style.opacity = "0.3";
            // } else {
            //     element.style.opacity = "";
            // }
            return {
                element,
                messageId,
                timestamp,
            };
        });
        return messages;
    }

    calcCurrentScrollTop() {
        const scroller = this.getScroller();
        if (!scroller) return null;
        const messages = this.getMessages();
        if (messages.length === 0) return null;

        const firstMessage = messages[0];
        const lastMessage = messages[messages.length - 1];
        logger.log(
            `Messages timestamp: ${firstMessage?.timestamp} ~ ${lastMessage?.timestamp}, Playback: ${this.currentTs}`
        );
        if (firstMessage && firstMessage.timestamp > this.currentTs) {
            this.autoScroll = true;
            return 0;
        } else if (lastMessage && lastMessage.timestamp < this.currentTs) {
            this.autoScroll = true;
            return scroller.scrollHeight;
        } else {
            const scrollerBox = scroller.getBoundingClientRect();
            for (const message of messages) {
                if (message.timestamp > this.currentTs) {
                    const box = message.element.getBoundingClientRect();
                    const top =
                        box.top +
                        scroller.scrollTop -
                        scroller.clientTop -
                        scrollerBox.top -
                        scrollerBox.height +
                        32;
                    return top;
                }
            }
        }
        return null;
    }

    /**
     * @param {Event} event
     */
    onScroll(event) {
        if (this.paused) return;
        const scroller = this.getScroller();
        const scrollTop = this.calcCurrentScrollTop();
        if (scroller) {
            if (scrollTop !== null && scroller.scrollTop >= scrollTop) {
                if (!this.isSticky) {
                    this.isSticky = true;
                    logger.info("isSticky changed", this.isSticky);
                }
                this.scroll();
            }
            else if (this.isSticky && !this.autoScroll && this.scrollTop !== scroller.scrollTop) {
                this.isSticky = false;
                logger.info("isSticky changed", this.isSticky);
            }
        }
        this.autoScroll = false;
    }

    scroll() {
        if (this.paused) return;
        if (this.isSticky) {
            const scroller = this.getScroller();
            const scrollTop = this.calcCurrentScrollTop();
            if (scroller && scrollTop !== null) {
                this.autoScroll = true;
                scroller.scrollTo({
                    left: 0,
                    top: scrollTop,
                    behavior: "instant",
                });
                this.scrollTop = scroller.scrollTop;
            }
        }
    }
}

if (location.hostname.includes("holodex")) {
    // Holodex side
    new HolodexController();
} else if (location.hostname.includes("discord")) {
    // Discord side
    new DiscordController();
}
