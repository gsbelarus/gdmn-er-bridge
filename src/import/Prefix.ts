export class Prefix {

  public static GDMN = "GD";
  public static GENERATOR = "G";
  public static DOMAIN = "D";
  public static PK = "PK";

  public static join(name: string, ...prefixes: string[]): string {
    if (!prefixes.length) return name;
    return `${prefixes.join("_")}_${name}`;
  }
}
