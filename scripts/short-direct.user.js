// ==UserScript==
// @name         Short Direct
// @version      0.1
// @description  I HATE YOUTUBE SHORTS!!!
// @author       Cyan903
// @match        *://*.youtube.com/*
// @exclude      *://music.youtube.com/*
// @exclude      *://*.music.youtube.com/*
// @run-at       document-end
// ==/UserScript==

addEventListener("yt-navigate-finish", () => {
    if (location.pathname.includes("/shorts/")) {
        location.href = location.href.replace("/shorts/", "/v/");
    }
});
