const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const { resolve } = require("path");
const fs = require("fs");
const parseTitle = require("./parse-title.js");

Array.prototype.prelast = function () {
    return this[this.length - 2];
};

/**
 * Using socket.io for this, because... I don't quite know. Could use raw WebSockets
 */
io.on("connection", function (socket) {
    console.log("a user connected");
    socket.on("disconnect", function () {
        console.log("user disconnected");
    });
    socket.emit("song", tags);
});

/**
 * This will all be overworked. Currently only have VirtualDJ that outputs a tracklist
 * to the drive for me to grab it. As I'm working on my own DJ app I will change this to
 * fit it's ways to
 */
const log = resolve("C:/Users/Derpy/Documents/VirtualDJ/History/tracklist.txt");

let last = "";
let songNumber = 0;
let tags;
fs.watchFile(log, () => {
    fs.readFile(log, "utf8", (err, data) => {
        if (err) return console.log(err);
        const history = data.split("\r\n").prelast();
        const current = history.substring(8, history.length);
        if (current !== last) {
            last = current;
            songNumber++;

            tags = parseTitle(current);
            tags.songNumber = songNumber;

            io.emit("song", tags);

            console.log(tags.title, tags.mix, tags.artist.join(" "));
        }
    });
});

app.use(express.static("public"));

http.listen(8080);
