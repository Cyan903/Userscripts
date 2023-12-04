// ==UserScript==
// @name         Lodestone Redirect
// @version      0.1
// @description  Fix lodestone's incorrect redirect.
// @author       Cyan903
// @match        *://*.finalfantasyxiv.com/lodestone/error/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

// prettier-ignore
(async () => {
    await fetch(`https://${location.hostname}/lodestone/api/bypass_browser/`, {
        credentials: "include",
        headers: {
            Accept: "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
        },
        body: `csrf_token=${csrf_token}`,
        method: "POST",
        mode: "cors",
    }).then(() =>
        (location.href = new URLSearchParams(location.search).get(
            "back_uri"
        ))
    ).catch((e) => {
        console.warn("[lodestone-fix] could not fetch!");
        console.warn("[lodestone-fix]", e);
    });
})();
