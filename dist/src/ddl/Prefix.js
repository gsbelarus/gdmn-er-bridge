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
Prefix.TABLE = "TABLE";
Prefix.UNIQUE = "UQ";
Prefix.INDEX = "I";
Prefix.PRIMARY_KEY = "PK";
Prefix.FOREIGN_KEY = "FK";
Prefix.TRIGGER_BI = "BI";
exports.Prefix = Prefix;
//# sourceMappingURL=Prefix.js.map