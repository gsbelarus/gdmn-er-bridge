export declare class Prefix {
    static GDMN: string;
    static GENERATOR: string;
    static DOMAIN: string;
    static CROSS: string;
    static UNIQUE: string;
    static PRIMARY_KEY: string;
    static FOREIGN_KEY: string;
    static TRIGGER_BI: string;
    static join(name: string, ...prefixes: string[]): string;
}
