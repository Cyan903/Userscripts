// ==UserScript==
// @name         Discord Token Grabber
// @version      0.1
// @description  Get a Discord token from a logged in session.
// @author       CyanPiano
// @match        https://discord.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

// Discord changes this all the time. So I won't even bother injecting a button. Just enable and disable this when you want to use it.
window._localStorage = window.localStorage;
window.interval = setInterval(() => {
    const token = localStorage.getItem("token");
    if (token) {
        window._token = token;
        clearInterval(interval);
    }
}, 0);
