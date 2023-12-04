// ==UserScript==
// @name         Anilist Themes
// @version      0.1
// @description  Adds opening & ending data to anilist. (alt + o)
// @author       Cyan903
// @match        https://anilist.co/*
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.deleteValue
// ==/UserScript==

const style = `
    #theme_popup_outer {
        position: fixed;
        z-index: 1000;
        margin: auto 0;
        top: 0;
        left: 0;
        right: 0;
        text-align: center;
    }

    #theme_overlay {
        width: 100vw;
        height: 100vh;
        position: absolute;
        background-color: rgba(0, 0, 0, 0.8);
    }

    #theme_inner {
        display: block;
        position: absolute;
        z-index: 1001;
        background-color: #2b2d42;
        width: 30%;
        padding: 2em;
        left: calc(50% - ((30% + 2em) / 2));
        top: 10vh;
        border-radius: 5px;
        text-align: left;
    }

    #theme_close {
        position: absolute;
        top: 0;
        width: 25px;
        height: 25px;
        left: calc(100% - 25px - 10px);
        top: 10px;
        background-color: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        transition: width 2s;
        text-decoration: none !important;
    }

    #theme_inner button:nth-last-child(1) {
        position: absolute;
        font-size: 0.8em;
        color: #fff;
        background: transparent;
        border: none;
        width: 150px;
        left: calc(100% - 150px);
        color: rgba(255, 255, 255, 0.8);
        transition: 0.3s;
    }

    #theme_inner button:hover {
        text-decoration: underline;
        color: rgba(255, 255, 255, 1);
    }

    #theme_popup li {
        color: #fff;
        list-style-type: "- ";
    }

    .theme-search-icon img {
        width: 25px;
        height: 25px;
        vertical-align: middle;
        margin: 0 5px;
    }

    #nothing_found_themes {
        text-align: center;
        line-height: 4em;
    }

    #nothing_found_themes img {
        border-radius: 5px;
        height: 300px;
    }
`;

const injectPath = ".theme-selector > h2";
const endpoints = {
    info: "https://graphql.anilist.co",
    cors_bypass: "https://cors.cyan903.ca",
    music: "https://api.myanimelist.net/v2",
};

const searchURLs = [
    {
        name: "YouTube",
        url: "https://www.youtube.com/results?search_query=",
        icon: "https://raw.githubusercontent.com/Cyan903/Static-github/main/Userscripts/anilist-theme/youtube.svg",
    },

    {
        name: "Soundcloud",
        url: "https://soundcloud.com/search?q=",
        icon: "https://raw.githubusercontent.com/Cyan903/Static-github/main/Userscripts/anilist-theme/soundcloud-social-media.svg",
    },

    {
        name: "Spotify",
        url: "https://open.spotify.com/search/",
        icon: "https://raw.githubusercontent.com/Cyan903/Static-github/main/Userscripts/anilist-theme/spotify.svg",
    },
];

const testClientID = (field) => {
    return !field || /^\s*$/.test(field);
};

const fmtUrl = (name, href) => {
    return (
        href + encodeURIComponent(name.split("(eps")[0].replace(/#\d: /, ""))
    );
};

// Requests
async function getID(id) {
    const query = `
        query($id: Int) {
            Media(id: $id, type: ANIME) { idMal }
        }
    `;

    return await fetch(endpoints.info, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },

        body: JSON.stringify({
            query,
            variables: { id },
        }),
    }).then((res) => res.json());
}

function getMusic(id, key) {
    // prettier-ignore
    return fetch(`${endpoints.cors_bypass}/${endpoints.music}/anime/${id}?fields=ending_themes,opening_themes`, {
        headers: { "X-MAL-CLIENT-ID": key }
    }).then(res => res.json());
}

// DOM
function saveClientID() {
    const id = prompt("Enter MAL client id:");

    if (testClientID(id)) {
        alert("Invalid client ID.");
        window.location.reload();

        return;
    }

    GM.setValue("mal_id", id);
    window.location.reload();
}

async function loadMusic(mid, mal_key) {
    const malID = await getID(mid);
    const id = malID?.data?.Media?.idMal;

    if (!id) {
        console.warn("[anilist-themes] MAL ID was not found.");
        return;
    }

    const themes = await getMusic(id, mal_key);

    if (!themes?.opening_themes && !themes?.ending_themes) {
        console.warn("[anilist-themes] no themes found.");
        return;
    }

    return themes;
}

async function showPopup() {
    document.body.style.overflow = "hidden";
    document.querySelector(injectPath).innerHTML += `
        <div id="theme_popup_outer">
            <div id="theme_overlay"></div>
            <div id="theme_inner">
                <div id="theme_popup">
                    <span slot="spinner">
                        <div class="emoji-spinner">（○□○）</div>
                    </span>
                </div>

                <button id="theme_close" onclick="removePopup()">x</button>
                <button onclick="changeID()">Change API Key</button>
            </div>

            <style>${style}</style>
        </div>
    `;

    const id = await GM.getValue("mal_id");
    const animeID = location.pathname.split("/")[2];

    if (!animeID) {
        console.log("[anilist-themes] anime ID not found.");
        return;
    }

    if (!id) {
        saveClientID();
        return;
    }

    const music = await loadMusic(animeID, id);

    if (!music) {
        document.getElementById("theme_popup").innerHTML = `
            <div id="nothing_found_themes">
                <img src="https://raw.githubusercontent.com/Cyan903/Static-github/main/Userscripts/anilist-theme/not-found.jpg" />
                <h1>No themes found :(</h1>
            </div>
        `;

        return;
    }

    const fmt = (u) => {
        const html = [];

        for (const search of searchURLs) {
            console.log(u);
            html.push(`
                <a href="${fmtUrl(u, search.url)}" class="theme-search-icon" target="_blank">
                    <img src="${search.icon}" alt="${search.name}" />
                </a>
            `);
        }

        return html.join("");
    };

    // prettier-ignore
    const [openings, endings] = [`
        <h3>Openings:</h3>
        <ul>
            ${(music.opening_themes || []).map((n) => `<li>${n.text}${fmt(n.text)}</li>`).join("")}
        </ul>
    `, `
        <h3>Endings:</h3>
        <ul>
            ${(music.ending_themes || []).map((n) => `<li>${n.text}${fmt(n.text)}</li>`).join("")}
        </ul>
    `,
    ];

    document.getElementById("theme_popup").innerHTML = `
        ${!!music.opening_themes ? openings : ""}
        ${!!music.ending_themes ? endings : ""}
    `;
}

function init(e) {
    if (e.altKey && e.key === "o") {
        if (!document.getElementById("theme_popup")) {
            showPopup();
        }
    }
}

unsafeWindow.changeID = saveClientID;
unsafeWindow.removePopup = () => {
    document.body.style.overflow = "visible";

    if (document.getElementById("theme_popup_outer")) {
        document.getElementById("theme_popup_outer").remove();
    }
};

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

window.addEventListener("locationchange", removePopup);
window.addEventListener("load", removePopup);
document.addEventListener("keyup", init);
