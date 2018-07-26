"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Prefix {
    static join(name, ...prefixes) {
        if (!prefixes.length)
            return name;
        return `${prefixes.join("_")}_${name}`;
    }
}
Prefix.GDMN = "GD";
Prefix.GENERATOR = "G";
Prefix.DOMAIN = "DOMAIN";
Prefix.PK = "PK";
exports.Prefix = Prefix;
//# sourceMappingURL=Prefix.js.map