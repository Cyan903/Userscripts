// ==UserScript==
// @name         skribbl Draw Bot
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Draw images in skribbl multiplayer lobbies.
// @author       Cyan903
// @match        *://skribbl.io/*
// @run-at       document-idle
// ==/UserScript==

console.log("[s] loaded bot");

/* Init */
const config = {
    inject: ".logoSmallWrapper",
    css: ".logoSmallWrapper",

    globals: {},
    game: {
        canvas: "#canvasGame",
        colors: [
            [255, 255, 255],
            [0, 0, 0],
            [193, 193, 193],
            [76, 76, 76],
            [239, 19, 11],
            [116, 11, 7],
            [255, 113, 0],
            [194, 56, 0],
            [255, 228, 0],
            [232, 162, 0],
            [0, 204, 0],
            [0, 85, 16],
            [0, 178, 255],
            [0, 86, 158],
            [35, 31, 211],
            [14, 8, 101],
            [163, 0, 186],
            [85, 0, 105],
            [211, 124, 170],
            [167, 85, 116],
            [160, 82, 45],
            [99, 48, 13],
        ],
    },
};

const ws = {
    draw(color, size, xs, ys, xe, ye) {
        return `42["drawCommands",[[0, ${color}, ${size}, ${xs}, ${ys}, ${xe}, ${ye}]]]`;
    },

    fill(color) {
        return `42["drawCommands",[[2, ${color}, 484, 452]]]`;
    },
};

const vdocument = ((conf) => {
    document.querySelector(conf.inject).innerHTML += `
        <div id="imagePreview">
            <input type="file" id="imageUpload">
            <button onclick="uploadPreview()">Upload File</button>
            <canvas id="previewCanvas" width="0" height="0"></canvas>

            <div id="preivewData">
                <div id="imageInfo"></div>
                <input type="text" id="imageScale">
                <button onclick="drawCanvas()">Draw</button>
            </div>
        </div>
    `;

    document.querySelector(conf.css).innerHTML += `
        <style>
            #previewCanvas {
                border: 1px solid #000;
            }

            #preivewData {
                display: none;
            }
		</style>
    `;

    // prettier-ignore
    const [dom, elms] = [{},
        [
            "imageUpload", "previewCanvas", 
            "preivewData", "imageInfo",
            "imageScale"
        ]
    ];

    for (const ename of elms) {
        dom[ename] = document.getElementById(ename);
    }

    window.inject();
    return dom;
})(config);

/* Preview */
async function uploadPreview() {
    const data = vdocument.imageUpload.files;
    const dims = await getDims(data[0]);

    config.globals.c = drawPreview(dims);
}

async function getDims(files) {
    const img = new Image();
    img.src = URL.createObjectURL(files);

    await img.decode();
    return img;
}

function drawPreview(img) {
    const canvas = vdocument.previewCanvas;
    const c = canvas.getContext("2d");

    [canvas.width, canvas.height] = [img.width, img.height];

    vdocument.imageInfo.innerText = `Size: ${canvas.width}x${canvas.height}`;
    vdocument.preivewData.style.display = "block";
    vdocument.imageScale.max = Math.min(canvas.width, canvas.height);

    c.drawImage(img, 0, 0);
    return c;
}

/* Drawing */
function drawCanvas() {
    const game = document.querySelector(config.game.canvas);
    const canvas = vdocument.previewCanvas;
    const c = game.getContext("2d");
    const scale = parseInt(vdocument.imageScale.value);
    const colorsSafe = config.game.colors.map(JSON.stringify);

    c.clearRect(0, 0, canvas.width, canvas.height);

    // could probably be faster with webworkers...
    for (let y = 0; y < canvas.height; y += scale) {
        for (let x = 0; x < canvas.width; x += scale) {
            const rgb = config.globals.c.getImageData(x, y, scale, scale).data;
            const rounded = floorColor(Array.from(rgb));
            const properColor = colorsSafe.indexOf(JSON.stringify(rounded));

            c.fillStyle = `rgba(${rounded.join(",")})`;
            c.fillRect(x, y, scale, scale);
            sendWs(ws.draw(properColor, scale, x, y, x, y));
        }
    }
}

function sendWs(msg) {
    if (!window.game_socket) {
        console.warn("socket doesn't exist... attempting to call.");
        window.inject();
        return;
    }

    window.game_socket.send(msg);
}

function floorColor(rgb) {
    let max = Infinity;
    let ret = [];

    for (const c of config.game.colors) {
        const diff = colorDiff(c, rgb);

        if (diff < max) {
            max = diff;
            ret = c;
        }
    }

    return ret;
}

function colorDiff(t1, t2) {
    let total = 0;

    for (let i = 0; i < 3; i++) {
        total += Math.max(t1[i], t2[i]) - Math.min(t1[i], t2[i]);
    }

    return total;
}
