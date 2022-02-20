// ==UserScript==
// @name         osu! beatmap download
// @version      0.1
// @description  Download beatmaps without logging in.
// @author       CyanPiano
// @match        https://osu.ppy.sh/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.deleteValue
// ==/UserScript==

const outerPath = ".beatmapset-header__buttons";
window.setID = "";

// prettier-ignore
const sources = [
    { name: "Beatconnect", mirror: "https://beatconnect.io/b/" },
    { name: "Chimu", mirror: "https://chimu.moe/en/d/" },
    { name: "Sayobot (cn)", mirror: "https://txy1.sayobot.cn/beatmaps/download/full/" }
];

const accountExists = async () => {
    return (await GM.getValue("user")) !== undefined;
};

const hasLoggedInSite = () => {
    return Object.keys(unsafeWindow.currentUser).length !== 0;
};

const testLoginFields = (field) => {
    return !field || /^\s*$/.test(field);
};

const isPopulatedDOM = (elm) => {
    return (
        document.querySelector(elm) === null ||
        [undefined, null, ""].includes(document.querySelector(elm)?.innerHTML) 
    );
}

async function addUserButtons() {
    if (hasLoggedInSite()) {
        console.log("user has already logged in through website!");
        return;
    }

    if (!(await accountExists())) {
        document.querySelector(".alt-sources").innerHTML += `
            <a class="btn-osu-big btn-osu-big--beatmapset-header" id="saveAccount" onclick="window.saveAccount()">
                <span class="btn-osu-big__content">
                    <span class="btn-osu-big__left"><span class="btn-osu-big__text-top">
                        Log in
                    </span></span>
                </span>
            </a>
        `;

        unsafeWindow.saveAccount = saveAccount;
    } else {
        const userData = await GM.getValue("user");

        document.querySelector(".alt-sources").innerHTML += `
            <a class="btn-osu-big btn-osu-big--beatmapset-header" id="saveAccount" onclick="window.deleteAccount()">
                <span class="btn-osu-big__content">
                    <span class="btn-osu-big__left"><span class="btn-osu-big__text-top">
                        Log out (${userData.username})
                    </span></span>
                </span>
            </a>

            <a class="btn-osu-big btn-osu-big--beatmapset-header" href="${`https://osu.ppy.sh/d/${window.setID}?u=${userData.username}&h=${userData.password}`}">
                <span class="btn-osu-big__content">
                    <span class="btn-osu-big__left"><span class="btn-osu-big__text-top">Download as ${
                        userData.username
                    }</span></span>
                    <span class="btn-osu-big__icon">
                        <span class="fa fa-fw"><span class="fas fa-download"></span></span>
                    </span>
                </span>
            </a>
        `;

        unsafeWindow.deleteAccount = deleteAccount;
    }
}

async function addButtons() {
    await addUserButtons();

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
        return;
    }

    window.setID = url.pathname.split("/")[2] || "";

    window.injectInterval = setInterval(() => {
        if (isPopulatedDOM(".alt-sources")) {
            ensureButtons();
            addButtons();

            clearInterval(window.injectInterval);
        }
    }, 10);
}

function saveAccount() {
    const [username, password] = [
        prompt("Enter osu!bancho username: "),
        prompt("Enter osu!bancho password: "),
    ];

    if (testLoginFields(username) || testLoginFields(password)) {
        alert("Invalid login.");
        window.location.reload();

        return;
    }

    GM.setValue("user", {
        username,
        password: CryptoJS.MD5(password).toString(),
    });

    window.location.reload();
}

function deleteAccount() {
    if (confirm("Are you sure?")) {
        GM.deleteValue("user");
        window.location.reload();
    }
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
