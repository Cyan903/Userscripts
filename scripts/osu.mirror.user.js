// ==UserScript==
// @name         osu! mirror download
// @version      0.1
// @description  Download beatmaps without logging in (mirror only).
// @author       Cyan903
// @match        https://osu.ppy.sh/*
// ==/UserScript==

const outerPath = ".beatmapset-header__buttons";
window.setID = "";

// prettier-ignore
const sources = [
    { name: "Beatconnect", mirror: "https://beatconnect.io/b/" },
    { name: "Chimu", mirror: "https://chimu.moe/en/d/" },
    { name: "Sayobot (cn)", mirror: "https://txy1.sayobot.cn/beatmaps/download/full/" }
];

function addButtons() {
    sources.forEach((source) => {
        document.querySelector(".alt-sources").innerHTML += `
            <a class="btn-osu-big btn-osu-big--beatmapset-header" href="${
                source.mirror + window.setID
            }">
                <span class="btn-osu-big__content">
                    <span class="btn-osu-big__left"><span class="btn-osu-big__text-top">${
                        source.name
                    }</span></span>
                    <span class="btn-osu-big__icon">
                        <span class="fa fa-fw"><span class="fas fa-download"></span></span>
                    </span>
                </span>
            </a>
        `;
    });
}

function ensureButtons() {
    if (document.querySelector(".alt-sources") === null) {
        document.querySelector(outerPath).outerHTML += `
            <div class="${outerPath} alt-sources"></div>
        `;

        return;
    }

    document.querySelector(".alt-sources").innerHTML = "";
}

function init() {
    // would love to rely on @match but osu.ppy.sh has converted into a spa :(
    const url = window.location;

    if (url.pathname.slice(0, 13) != "/beatmapsets/") {
        clearInterval(window.injectInterval);
        console.log("not hjere");
        return;
    }

    window.setID = url.pathname.split("/")[2] || "";

    window.injectInterval = setInterval(() => {
        if (document.querySelector(outerPath) !== null) {
            ensureButtons();
            addButtons();

            clearInterval(window.injectInterval);
        }
    }, 10);
}

// prettier-ignore
history.pushState = (f => function pushState() {
    const ret = f.apply(this, arguments);

    window.dispatchEvent(new Event("pushstate"));
    window.dispatchEvent(new Event("locationchange"));
    
    return ret;
})(history.pushState);

// prettier-ignore
history.replaceState = (f => function replaceState() {
    const ret = f.apply(this, arguments);

    window.dispatchEvent(new Event("replacestate"));
    window.dispatchEvent(new Event("locationchange"));

    return ret;
})(history.replaceState);

window.addEventListener("popstate", () => {
    // https://stackoverflow.com/a/52809105
    window.dispatchEvent(new Event("locationchange"));
});

window.addEventListener("locationchange", init);
window.addEventListener("load", init);
