// ==UserScript==
// @name         TheWikiGame Cheat
// @version      0.1
// @description  Run cheat() during a game to start the cheat.
// @author       Cyan903
// @match        https://www.thewikigame.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

// Run cheat() to start the cheat.
// Disable autoplay if you want to limit the redirect amount.
// Also change NOCORS to a self hosted cors anywhere app.
window.autoPlay = true;
window.NOCORS = "https://cors-anywhere.herokuapp.com/";

window.sendTo = (link) => {
    console.log("sending to " + link);
    document.querySelector(".mw-parser-output").innerHTML += `
    	<div id="cheatlink" style="display: none;"></div>
    `;

    const html = `
    	<a id="linkToClick" href="/wiki/${link}"></a>
    `;

    document.querySelector("#cheatlink").innerHTML = html;
    document.getElementById("linkToClick").click();
};

window.switchItUp = (i, max, main) => {
    if (i == max) {
        setTimeout(() => {
            sendTo(main);
        }, 1000);

        if (autoPlay) setTimeout(cheat, 2000);
        return;
    }

    setTimeout(() => {
        fetch(NOCORS+"https://en.wikipedia.org/w/api.php?action=query&list=random&format=json&rnnamespace=0&rnlimit=1")
            .then((o) => o.json())
            .then((obj) => {
                const rand = obj.query.random[0].title.split(" ").join("_");
                sendTo(rand);
                switchItUp(++i, max, main);
            });
    }, 1000);
};

window.cheat = () => {
    const site = document
        .querySelectorAll(".link")[1]
        .innerHTML.split(" ")
        .join("_");
    let count;

    if (!autoPlay) count = prompt("Enter redirect count", 1);
    else count = 2;
    if (parseInt(count) == NaN || parseInt(count) === 0) {
        sendTo(site);
        return;
    }

    switchItUp(0, count, site);
};
