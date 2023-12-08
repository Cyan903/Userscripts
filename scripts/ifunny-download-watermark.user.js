// ==UserScript==
// @name         iFunny Image Downloader
// @version      0.1
// @description  Idea from my friend because he never removes watermarks.
// @author       Cyan903
// @match        https://img.ifunny.co/images/*
// @grant        none
// ==/UserScript==

const watermarkHeight = 21;
const paths = {
    inject: "body",
    img: "img",
};

function getOptions() {
    // ?a=0&type=jpeg&filename=alright
    // type: Save type (either jpeg or png)
    // filename: File name (fallback to "iFunny isn't funny")

    const params = new URLSearchParams(window.location.href);
    return {
        type: params.get("type") == "jpeg" ? "jpeg" : "png",
        filename: params.get("filename") || "iFunny isn't funny",
    };
}

function createAndDownload(url) {
    const options = getOptions();

    document.querySelector(paths.inject).innerHTML += `
		<style>
			#memeImg, #memeCanvas {
				display: none;
			}
		</style>

		<img id="memeImg" src="${url}" />
		<canvas id="memeCanvas"></canvas>
	`;

    document.querySelector(paths.img).onload = () => {
        const img = document.querySelector("#memeImg");
        const canvas = document.querySelector("#memeCanvas");
        const c = canvas.getContext("2d");
        const link = document.createElement("a");
        const str = `image/${options.type}`;

        [canvas.width, canvas.height] = [
            img.width,
            img.height - watermarkHeight,
        ];
        c.drawImage(img, 0, 0);

        link.download = `${options.filename}.${options.type}`;
        link.href = canvas.toDataURL(str).replace(str, "image/octet-stream");
        link.click();
    };

    console.log(options);
}

createAndDownload(document.querySelector(paths.img).src);
