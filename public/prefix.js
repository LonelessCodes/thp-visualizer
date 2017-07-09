Array.prototype.max = function () {
    return Math.max.apply(null, this);
};
Array.prototype.min = function () {
    return Math.min.apply(null, this);
};
Array.prototype.average = function (subobject) {
    let average = 0;
    let length = 0;
    if (subobject === void 0)
        for (let item of this) {
            if (item) {
                average += item;
                length++;
            }
        }
    else
        for (let item of this) {
            if (item) {
                average += item[subobject];
                length++;
            }
        }
    if (length === 0)
        return average = 0;
    return average / length;
};

Uint8Array.prototype.max = function () {
    return Math.max.apply(null, this);
};
Uint8Array.prototype.min = function () {
    return Math.min.apply(null, this);
};
Uint8Array.prototype.average = function (subobject) {
    let average = 0;
    let length = 0;
    if (subobject === void 0)
        for (let item of this) {
            if (item) {
                average += item;
                length++;
            }
        }
    else
        for (let item of this) {
            if (item) {
                average += item[subobject];
                length++;
            }
        }
    if (length === 0)
        return average = 0;
    return average / length;
};