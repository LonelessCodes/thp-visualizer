/* global PIXI, io */
const width = 1280;
const height = 720;
const ratio = width / 1920;

const bg = {};

navigator.getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const analyser = audioCtx.createAnalyser();
analyser.minDecibels = -70;
analyser.maxDecibels = -5;
analyser.smoothingTimeConstant = 0.80;

const canvas = document.getElementById("canvas");
//Create the renderer
const renderer = PIXI.autoDetectRenderer(width, height, {
    view: canvas,
    resolution: 1
});
//Create a container object called the `stage`
const stage = new PIXI.Container();

const init = _opts => {
    window.opts = _opts;
    const opts = window.opts;
    Promise.all([
        new Promise((resolve) => {
            PIXI.loader
                .add("normal", opts.background.normal)
                .add("middle", opts.background.middle)
                .add("full", opts.background.blur)
                .load(() => resolve());
        }),
        new Promise((resolve, reject) => {
            if (opts.audio === void 0 || typeof opts.audio !== "string") {
                //main block for doing the audio recording

                const success = function (stream) {
                    const source = audioCtx.createMediaStreamSource(stream);
                    source.connect(analyser);
                    resolve();
                };

                const error = function (err) {
                    console.log("The following gUM error occured: " + err);
                    reject();
                };

                if (navigator.getUserMedia) {
                    console.log("getUserMedia supported.");
                    navigator.getUserMedia({ audio: true }, success, error);
                } else {
                    console.log("getUserMedia not supported on your browser!");
                    reject();
                }
            } else {
                console.log("audio");

                const audio = new Audio();
                audio.src = opts.audio;
                window.audio = audio;

                const source = audioCtx.createMediaElementSource(audio);
                source.connect(analyser);

                analyser.connect(audioCtx.destination);

                resolve();

                audio.addEventListener("ended", () => {
                    document.body.style.opacity = "0";
                });
            }
        })
    ])
        .then(setup)
        .catch((err) => console.error("good ol error", err));
};
init;

const setup = () => {
    const opts = window.opts;

    analyser.fftSize = 256 * 2;
    const bufferLength = analyser.frequencyBinCount;
    window.dataArray = new Uint8Array(bufferLength);

    document.querySelector(".number").innerHTML = opts.episode.toString();
    document.querySelector(".number").style.color = opts.color || "hsla(278,100%,50%,1)";
    document.querySelector(".number-2").innerHTML = opts.episode.toString();

    if (!opts.live)
        document.querySelector(".live").remove();

    const background = new PIXI.Container();
    stage.addChild(background);
    window.background = background;

    const normal = new PIXI.Sprite(PIXI.loader.resources["normal"].texture);
    normal.alpha = 1;
    normal.position.set(0, 0);
    background.addChild(normal);

    const middle = new PIXI.Sprite(PIXI.loader.resources["middle"].texture);
    middle.alpha = 0;
    middle.position.set(0, 0);
    background.addChild(middle);

    const full = new PIXI.Sprite(PIXI.loader.resources["full"].texture);
    full.alpha = 0;
    full.position.set(0, 0);
    background.addChild(full);

    background.pivot.set(full.width / 2, full.height / 2);
    background.position.set(width / 2, height / 2);

    bg.normal = normal;
    bg.middle = middle;
    bg.full = full;

    setTimeout(() => {
        function _draw() {
            window.drawVisual = requestAnimationFrame(() => _draw());
            draw();
        }
        _draw();

        if (window.audio) window.audio.play();
        document.body.style.opacity = "1";
    }, 0);
};

const draw = () => {
    analyser.getByteFrequencyData(window.dataArray);

    deep(window.dataArray.subarray(0, 11).max() * 0.4 +
        window.dataArray.subarray(0, 11).average() * 0.6);

    //Tell the `renderer` to `render` the `stage`
    renderer.render(stage);
};

function deep(value) {
    const float = Math.max(0, value - 50) / 206 * 1.4;
    const scale = (1.05 + float / 5) * ratio;
    window.background.scale.set(scale, scale);

    if (float < 0.5) {
        bg.normal.visible = true;
        bg.middle.alpha = float * 2;
        bg.full.alpha = 0;
        bg.full.visible = false;
    } else {
        bg.normal.visible = false;
        bg.middle.alpha = 1;
        bg.full.visible = true;
        bg.full.alpha = (float - 0.5) * 2;
    }
}

const socket = io();

socket.on("song", tags => {
    document.querySelector(".song").classList.add("out");
    setTimeout(() => {
        document.querySelector(".song > .title").innerHTML = `${tags.title} <span class="mix">${tags.mix || ""}</span>`;
        document.querySelector(".song > .artist").innerHTML = `${tags.artist.map((artist, i) => (i % 2 ? `<span class="little">${artist}</span>` : `<span class="big">${artist}</span>`)).join(" ")}`;
        document.querySelector(".song").classList.remove("out");
    }, 1000);
});
