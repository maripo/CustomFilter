function UUID() { }
UUID.generate = function () {
    var rand = UUID._gri, hex = UUID._ha;
    return hex(rand(32), 8)
        + "-"
        + hex(rand(16), 4)
        + "-"
        + hex(0x4000 | rand(12), 4)
        + "-"
        + hex(0x8000 | rand(14), 4)
        + "-"
        + hex(rand(48), 12);
};
UUID._gri = function (x) {
    if (x < 0)
        return NaN;
    if (x <= 30)
        return (0 | Math.random() * (1 << x));
    if (x <= 53)
        return (0 | Math.random() * (1 << 30))
            + (0 | Math.random() * (1 << x - 30)) * (1 << 30);
    return NaN;
};
UUID._ha = function (num, length) {
    var str = num.toString(16), i = length - str.length, z = "0";
    for (; i > 0; i >>>= 1, z += z) {
        if (i & 1) {
            str = z + str;
        }
    }
    return str;
};
//# sourceMappingURL=uuid.js.map