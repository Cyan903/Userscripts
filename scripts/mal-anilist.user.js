// ==UserScript==
// @name         MyAnimeList to AniList Button
// @version      0.1
// @description  Insert link to AL from MAL.
// @author       Cyan903
// @match        https://myanimelist.net/anime/*
// @match        https://myanimelist.net/manga/*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

GM_addStyle(`
    #anilist-button:hover { opacity: 0.8; }
    #anilist-button:active { background-color: #0a1625; }

    #anilist-button {
        display: block;
        height: 30px;
        background-color: #2b2d42;
        overflow: hidden;
        margin-top: 5px;
        border-radius: 4px;
    }

    #anilist-logo {
        background-image: url("https://anilist.co/img/icons/icon.svg");
        background-size: cover;
        background-repeat: no-repeat;
        height: 100%;
        width: 30px;
        margin: auto;
    }
`);

(async () => {
    const endpoints = {
        graph: "https://graphql.anilist.co",
        redirect: "https://anilist.co",
    };

    async function fetchURL(id) {
        const query = `
            query($id: Int) {
                Media(idMal: $id) { id, type }
            }
        `;

        return await fetch(endpoints.graph, {
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

    function insertURL(id, type) {
        if (!id || !type) {
            console.warn(`[mal-anilist] missing id or type -> ${id}, ${type}`);
            return;
        }

        const elm = document.querySelector(".leftside > div:nth-child(1)");

        if (!elm) {
            console.warn(`[mal-anilist] insert location not found!`);
            return;
        }

        // prettier-ignore
        elm.insertAdjacentHTML("afterend", `
            <a href="${endpoints.redirect}/${type.toLowerCase()}/${id}" id="anilist-button">
                <div id="anilist-logo"></div>
            </a>
        `);
    }

    // Get ID and insert
    const mid = location.href.split("/")[4];
    const aid = await fetchURL(mid);

    if (aid?.errors) {
        console.warn(
            `[mal-anilist] error ${aid.errors[0].status} -> ${aid.errors[0].message}`,
        );

        return;
    }

    insertURL(aid?.data?.Media?.id, aid?.data?.Media?.type);
})();
