// ==UserScript==
// @name         Quora Login Bypass
// @version      0.1
// @description  Pitch control for YouTube!
// @author       Cyan903
// @match        *://*.quora.com/*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

GM_addStyle(`
    #closeWall {
        position: fixed;
        top: calc(100% - 10px);
        left: calc(100% - 10px);
        transform: translate(-100%, -100%);
        z-index: 1000;
        padding: 1em;
        width: 100px;
        text-align: center;
        background-color: rgba(255, 255, 255, 0.8);
        border-radius: 5px;
        font-weight: bolder;
        color: #444;
        box-shadow: 0 2px 2px #000;
        outline: none;
        border: none;
    }

    #closeWall:hover {
        background-color: #fff;
    }

    #closeWall:active {
        position: fixed;
        top: calc(100% - 10px + 2px);
        box-shadow: none;
    }

    #closeWall.chidden {
        display: none !important;
    }
`);

(() => {
    const remove = () => {
        const p = new URLSearchParams(window.location.search);

        p.set("share", "1");
        window.location.search = p;
    };

    const show = () => {
        const wall = document.querySelector(".qu-zIndex--blocking_wall");
        const btn = document.querySelector("#closeWall");

        if (btn) btn.onclick = remove;
        if (wall) {
            document.querySelector("#closeWall").classList.remove("chidden");
            return;
        }

        document.querySelector("#closeWall").classList.add("chidden");
    };

    document.body.insertAdjacentHTML(
        "beforeend",
        `<button id="closeWall" class="chidden">Close</Button>`
    );

    setInterval(show, 200);
})();
