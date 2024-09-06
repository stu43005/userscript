// ==UserScript==
// @name                Holodex & Discord Sync
// @name:zh-TW          Holodex & Discord 同步
// @version             1.2.0
// @description         Using the Holodex multi-view archive sync feature, synchronize of Discord chat.
// @description:zh-TW   使用Holodex多窗存檔同步功能，同步觀看Discord聊天室
// @author              Shiaupiau
// @namespace           https://github.com/stu43005
// @match               https://holodex.net/*
// @match               https://staging.holodex.net/*
// @match               https://discord.com/login
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

function makeIndicator() {
    const indicator = document.createElement("div");
    indicator.style.position = "fixed";
    indicator.style.right = "0";
    indicator.style.bottom = "0";
    indicator.style.width = "auto";
    indicator.style.minWidth = "1em";
    indicator.style.height = "1em";
    indicator.style.zIndex = "99999";
    indicator.style.pointerEvents = "none";
    document.body.append(indicator);
    return indicator;
}

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

        this.indicator = makeIndicator();
        this.updateIndicator();
    }

    updateIndicator() {
        if (!this.multiviewSyncBarComponent) {
            this.indicator.style.backgroundColor = "transparent";
            this.indicator.innerText = ""; // No Holodex sync-bar detected.
        } else if (
            !this.multiviewSyncBarComponent.hasVideosToSync ||
            this.multiviewSyncBarComponent.currentTs <= 0
        ) {
            this.indicator.style.backgroundColor = "gray";
            this.indicator.innerText = "Nothing to sync, please open two overlapping archives.";
        } else if (this.multiviewSyncBarComponent.paused) {
            this.indicator.style.backgroundColor = "indianred";
            this.indicator.innerText = "Player has been paused.";
        } else {
            this.indicator.style.backgroundColor = "green";
            this.indicator.innerText = "";
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
        this.updateIndicator();
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
        this.updateIndicator();
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
        this.updateIndicator();
    }
}

/**
 * @typedef {Object} MessageData
 * @prop {HTMLElement} element
 * @prop {string} messageId
 * @prop {number} timestamp
 */

class DiscordController {
    /**
     * @returns {string | null}
     */
    get currentTab() {
        return this._currentTab;
    }
    /**
     * @param {string | null} value
     */
    set currentTab(value) {
        if (this._currentTab !== value) {
            logger.info(`currentTab changed: from ${this._currentTab} to ${value}`);
        }
        this._currentTab = value;
        this.updateIndicator();
    }

    /**
     * @returns {boolean}
     */
    get paused() {
        return this._paused;
    }
    /**
     * @param {boolean} value
     */
    set paused(value) {
        if (this._paused !== value) {
            logger.info("paused changed", value);
        }
        this._paused = value;
        this.updateIndicator();
    }

    /**
     * @returns {boolean}
     */
    get isSticky() {
        return this._isSticky;
    }
    /**
     * @param {boolean} value
     */
    set isSticky(value) {
        if (this._isSticky !== value) {
            logger.info("isSticky changed", value);
        }
        this._isSticky = value;
        this.updateIndicator();
    }

    constructor() {
        /**
         * @type {string | null}
         */
        this._currentTab = null;
        /**
         * @type {boolean}
         */
        this._isSticky = true;
        /**
         * @type {number}
         */
        this.currentTs = 0;
        /**
         * @type {boolean}
         */
        this._paused = true;
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

        this.indicator = makeIndicator();
        this.updateIndicator();
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
        this.updateIndicator();
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

    updateIndicator() {
        if (!this.getScroller()) {
            this.indicator.style.backgroundColor = "transparent";
            this.indicator.innerText = ""; // No Discord channel detected.
        } else if (this.currentTab === null) {
            this.indicator.style.backgroundColor = "gray";
            this.indicator.innerText = ""; // No Holodex sync-bar detected.
        } else if (this.paused) {
            this.indicator.style.backgroundColor = "indianred";
            this.indicator.innerText = "Holodex player has been paused.";
        } else if (!this.isSticky) {
            this.indicator.style.backgroundColor = "yellow";
            this.indicator.innerText = "You are viewing previous messages.";
        } else {
            this.indicator.style.backgroundColor = "green";
            this.indicator.innerText = "";
        }
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
                    const jumpToPresentBarHeight =
                        document
                            .querySelector(
                                `div[class*="messagesWrapper"] > div[class*="jumpToPresentBar"]`
                            )
                            ?.getBoundingClientRect()?.height ?? 0;
                    const top =
                        box.top +
                        scroller.scrollTop -
                        scroller.clientTop -
                        scrollerBox.top -
                        scrollerBox.height +
                        jumpToPresentBarHeight;
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
            if (scrollTop !== null && scroller.scrollTop >= scrollTop - 32) {
                if (!this.isSticky) {
                    this.isSticky = true;
                }
                this.scroll();
            } else if (this.isSticky && !this.autoScroll && this.scrollTop !== scroller.scrollTop) {
                this.isSticky = false;
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
