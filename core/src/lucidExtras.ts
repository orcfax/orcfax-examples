import { lucid } from "../deps.ts";

// FIXME : This must be available from lucid, but I can't find it.
export function mergeAssets(a: lucid.Assets, b: lucid.Assets) {
  const c = a;
  for (const [key, value] of Object.entries(b)) {
    if (Object.keys(c).includes(key)) {
      c[key] = c[key] + value;
    } else {
      c[key] = value;
    }
  }
  return c;
}

export function sumUtxos(utxos: lucid.UTxO[]): lucid.Assets {
  return utxos.map((u) => u.assets).reduce(mergeAssets, { lovelace: 0n });
}
