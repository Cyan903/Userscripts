// ==UserScript==
// @name         skribbl Draw Hook
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Draw images in skribbl multiplayer lobbies.
// @author       Cyan903
// @match        *://skribbl.io/*
// @grant        none
// @require      https://gist.githubusercontent.com/Cyan903/88f5c2d3b47a8e29016da533f4b48e0c/raw/6b6a80dcb0af056e1db257eddc7af8207abb631c/wshook.js
// @run-at       document-start
// ==/UserScript==

console.log("[s] loaded hook");

// This is required for skribbl-bot to run.
// Capture a websocket request by going into the console and calling inject (optional).
// The normal script calls this automatically.

wsHook.before = (data, url) => {
    console.log(`${url} -> ${data}`);
};

window.initWebsocket = (messageEvent, url, wsObject) => {
    console.log(`${url} : ${messageEvent.data}`);
    window.game_socket = wsObject;
    wsHook.resetHooks();

    return messageEvent;
};

window.inject = () => {
    console.log("fetching socket");
    wsHook.after = initWebsocket;
};
