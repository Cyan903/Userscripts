// ==UserScript==
// @name         YT Pitch
// @version      0.1
// @description  Pitch control for YouTube!
// @author       Cyan903
// @match        *://*.youtube.com/*
// @exclude      *://music.youtube.com/*
// @exclude      *://*.music.youtube.com/*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

GM_addStyle(`
    .ytp-pitch-button {
        float: left;
        font-weight: bolder;
        color: rgba(255, 255, 255, 0.7);
        text-shadow: 2px 2px 0 #000;
    }

    .ytp-pitch-button:hover {
        color: #fff;
    }
`);

addEventListener("yt-navigate-finish", () => {
    const vid = document.querySelector(".html5-main-video");
    const isPitched = () => {
        if (vid.preservesPitch == undefined) {
            vid.preservesPitch = true;
        }

        return vid.preservesPitch ? "Normal" : "Pitched";
    };

    document
        .querySelectorAll(".ytp-pitch-button")
        .forEach((elm) => elm.remove());

    document.querySelector(".ytp-right-controls").insertAdjacentHTML(
        "beforeend",
        `
            <button class="ytp-button ytp-pitch-button" aria-expanded="false" aria-haspopup="true">
                Normal
            </button>
        `
    );

    document.querySelector(".ytp-pitch-button").onclick = function () {
        vid.preservesPitch = !vid.preservesPitch;
        this.innerText = isPitched();
    };

    document.querySelector(".ytp-pitch-button").innerText = isPitched();
});
