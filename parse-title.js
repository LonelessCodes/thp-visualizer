Array.prototype.last = function () {
    return this[this.length - 1];
};

module.exports = function (track) {
    const tags = {};

    track = track.split(" - ");
    tags["title"] = track.last();
    tags["artist"] = track[0];

    const splitarr = tags["artist"][0].split("[").map(a => { return a.split("]"); });
    tags["artist"] = tags["artist"]
        .replace("[" + splitarr[0][0] + "] ", "")
        .replace("[" + splitarr[0][0] + "]", "");

    let artists = [];
    let tmp = tags["artist"].split(/ & | and |, | feat. | Feat. | ft. | Ft. | featuring | Featuring | vs | vs. | x | X |\//);
    let artstring = tags["artist"];
    tmp.forEach((value, index) => {
        artists.push(value);
        if (index + 1 !== tmp.length) {
            const length = artstring.indexOf(tmp[index + 1]) - 1;
            artists.push(artstring.substring(value.length + 1, length));
            artstring = artstring.substring(length + 1, artstring.length);
        }
    });
    artists = artists.map(value => {
        return (() => {
            if (value === "ft.") return "feat.";
            else if (value === "") return "&";
            else return value;
        })();
    });

    let arr = tags["title"].split("(").map(a => { return a.split(")"); });
    let low = arr.last()[0].toLowerCase();
    if (low.indexOf("remix") > -1 ||
        low.indexOf("mix") > -1 ||
        low.indexOf("edit") > -1 ||
        low.indexOf("bootleg") > -1 ||
        low.indexOf("cover") > -1) {
        tags["mix"] = arr.last()[0];
        tags["title"] = tags["title"]
            .replace(" (" + arr.last()[0] + ")", "")
            .replace("(" + arr.last()[0] + ")", "");
    }

    if (!tags["mix"]) {
        const arr = tags["title"].split("[").map(a => { return a.split("]"); });
        const low = arr.last()[0].toLowerCase();
        if (low.indexOf("remix") > -1 ||
            low.indexOf("mix") > -1 ||
            low.indexOf("edit") > -1 ||
            low.indexOf("bootleg") > -1 ||
            low.indexOf("cover") > -1) {
            tags["mix"] = arr.last()[0];
            tags["title"] = tags["title"]
                .replace(" [" + arr.last()[0] + "]", "")
                .replace("[" + arr.last()[0] + "]", "");
        }
    }

    // What the fuck is this down here. What did I doooo, but it woooooooooooorks
    let titleFeat;
    tags["title"]
        .split("(")
        .map(a => {
            return a.split(")");
        })
        .map(a => {
            return a.map(b => {
                const rtn = b.split(/feat. |ft. |featuring /i);
                if (rtn.length > 1) {
                    titleFeat = rtn.last();
                }
            });
        });
    if (titleFeat && !artists.includes(titleFeat)) {
        const exi = artists.includes("feat.") || artists.includes("featuring");
        if (exi) {
            artists.push("&", titleFeat);
        } else {
            artists.push("feat.", titleFeat);
        }
    }
    tags["artist"] = artists;

    return tags;
};
