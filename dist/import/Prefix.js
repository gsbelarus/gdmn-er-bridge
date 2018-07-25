"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Prefix = /** @class */ (function () {
    function Prefix() {
    }
    Prefix.join = function (name) {
        var prefixes = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            prefixes[_i - 1] = arguments[_i];
        }
        if (!prefixes.length)
            return name;
        return prefixes.join("_") + "_" + name;
    };
    Prefix.GDMN = "GD";
    Prefix.GENERATOR = "G";
    Prefix.DOMAIN = "D";
    Prefix.PK = "PK";
    return Prefix;
}());
exports.Prefix = Prefix;
//# sourceMappingURL=Prefix.js.map