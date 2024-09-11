import { lucid } from "../../deps.ts";

export function mkFeedId(currency: string, adaIsBase: boolean): string {
  const x = lucid.toText(currency);
  return adaIsBase
    ? lucid.fromText("CER/ADA-".concat(x).concat("/"))
    : lucid.fromText("CER/".concat(x).concat("-ADA/"));
}

export function synthetic(currency: string) {
  return lucid.fromText("synth:".concat(lucid.toText(currency))).slice(
    0,
    2 * 32,
  );
}
