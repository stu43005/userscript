// ==UserScript==
// @name        Streamjp screenshot
// @description Add a button under the video to screenshot the video on Streamjp
// @namespace   ScreenshotTools
// @version     1.0.0
// @include     https://*.stream.ne.jp/*
// @run-at      document-end
// ==/UserScript==
'use strict';

const spacerButton = document.createElement("div");
spacerButton.className = "screenshotButton";
spacerButton.style.fontSize = "20px";
spacerButton.style.cursor = "pointer";
spacerButton.innerHTML = '📷';
spacerButton.onclick = captureScreenshot;

function addSpacerButton() {
    const spacerElem = document.getElementsByClassName("eqp-left-controls")[0];
    if (spacerElem) {
        spacerElem.insertAdjacentElement('beforeend', spacerButton);
    } else {
        setTimeout(() => { addSpacerButton() }, 1000);
    }
}
addSpacerButton();

function captureScreenshot() {
    const players = document.getElementsByTagName("video");
    const player = Array.prototype.filter.call(players, (p) => p.src != "" && p.offsetParent)[0];

    const canvas = document.createElement("canvas");
    canvas.width = player.videoWidth;
    canvas.height = player.videoHeight;
    canvas.getContext('2d').drawImage(player, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async function (blob) {
        const downloadLink = document.createElement("a");
        downloadLink.download = getFileName(player);
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.click();
    }, 'image/png');
}

function getFileName(player) {
    const ext = ".png";
    const time = formatTime(player.currentTime);
    return `Streamjp screenshot ${time}${ext}`;
}

function formatTime(time) {

    var seconds = Math.floor(time);

    if (seconds < 60) {
        return seconds + "s";
    }

    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    if (minutes < 60) {
        return minutes + "m" + paddingTwoZero(seconds) + "s";
    }

    var hours = Math.floor(minutes / 60);
    minutes = minutes % 60;

    if (hours < 24) {
        return hours + "h" + paddingTwoZero(minutes) + "m" + paddingTwoZero(seconds) + "s";
    }

    var days = Math.floor(hours / 24);
    hours = hours % 24;

    return days + "d" + paddingTwoZero(hours) + "h" + paddingTwoZero(minutes) + "m" + paddingTwoZero(seconds) + "s";
}

function paddingTwoZero(num) {
    return ('00' + num).slice(-2);
}
