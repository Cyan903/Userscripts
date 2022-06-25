// ==UserScript==
// @name         YT Pitch
// @version      0.1
// @description  Pitch control for YouTube!
// @author       Cyan903
// @match        *://*.youtube.com/*
// @exclude      *://music.youtube.com/*
// @exclude      *://*.music.youtube.com/*
// @compatible   chrome
// @compatible   firefox
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

const config = {
    path: {
        css: "head",
        buttons: ".ytp-right-controls",
        video: ".html5-main-video",
    },

    markdown: {
        button: `
            <button class="ytp-button ytp-pitch-button" aria-expanded="false" aria-haspopup="true">
                Normal
            </button>
        `,
    },
};

addEventListener("yt-navigate-finish", () => {
    const vid = document.querySelector(config.path.video);
    const isPitched = () => {
        if (
            vid.preservesPitch == undefined ||
            vid.mozPreservesPitch == undefined
        ) {
            vid.preservesPitch = true;
            vid.mozPreservesPitch = true;
        }

        return vid.preservesPitch || vid.mozPreservesPitch
            ? "Normal"
            : "Pitched";
    };

    document
        .querySelectorAll(".ytp-pitch-button")
        .forEach((elm) => elm.remove());

    document
        .querySelector(config.path.buttons)
        .insertAdjacentHTML("beforeend", config.markdown.button);

    document.querySelector(".ytp-pitch-button").onclick = function () {
        vid.preservesPitch = !vid.preservesPitch;
        vid.mozPreservesPitch = !vid.mozPreservesPitch;

        this.innerText = isPitched();
    };

    document.querySelector(".ytp-pitch-button").innerText = isPitched();
});
