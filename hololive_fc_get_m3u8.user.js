// ==UserScript==
// @name        Hololive FC get m3u8 url
// @description get m3u8 url on Hololive FC
// @version     1.0.0
// @include     https://hololive-fc.com/live/*
// @include     https://hololive-fc.com/video/*
// @run-at      document-start
// ==/UserScript==
'use strict';

const xml_http_request = 'xml_http_request';
const xml_http_response = 'xml_http_response';

function trigger(name, data) {
    var event = new CustomEvent(name, {
        'detail': data
    });
    return document.dispatchEvent(event);
}

function initXMLHttpRequest() {
    const open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (...args) {
        const send = this.send;
        const _this = this;
        let post_data = [];
        this.send = function (...data) {
            post_data = data;
            return send.apply(_this, data);
        }
        trigger(xml_http_request, args);

        this.addEventListener('readystatechange', function () {
            if (this.readyState === 4) {
                const config = {
                    url: args[1],
                    status: this.status,
                    method: args[0],
                    data: post_data
                };
                trigger(xml_http_response, { config, response: this.response });
            }
        }, false);
        return open.apply(this, args);
    }
}
initXMLHttpRequest();

document.addEventListener(xml_http_request, (event) => {
    const [method, url] = event.detail;
    if (url.includes(".m3u8")) {
        console.log(xml_http_request, event.detail);
        const div = document.createElement("div");
        div.innerHTML = url;
        document.getElementById("player").insertAdjacentElement('afterend', div);
    }
});
