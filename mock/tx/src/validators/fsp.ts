import { lucid } from "../../deps.ts";
import * as bp from "../blueprint.ts";
import * as tokens from "../aik/tokens.ts";

export type Params = ConstructorParameters<bp.FspTwo>;

export type Red2 = bp.FspTwo["red"];
export const Red2 = bp.FspTwo["red"];
export type Red3 = bp.FspThree["red"];
export const Red3 = bp.FspThree["red"];
export type Dat = bp.FspThree["_dat"];
export const Dat = bp.FspThree["_dat"];

export function toData2(x: Red2): string {
  return lucid.Data.to<Red2>(x, Red2);
}

export function fromData2(x: string): Red2 {
  return lucid.Data.from<Red2>(x, Red2);
}

export function toData3(x: Red3): string {
  return lucid.Data.to<Red3>(x, Red3);
}

export function fromData3(x: string): Red3 {
  return lucid.Data.from<Red3>(x, Red3);
}

export function toData(x: Dat): string {
  return lucid.Data.to<Dat>(x, Dat);
}

export function fromData(x: string): Dat {
  return lucid.Data.from<Dat>(x, Dat);
}

export function mkParams(seed: string): Params {
  return [lucid.fromText(seed)];
}

export function mkScript(seed: string) {
  const script = new bp.FspTwo(mkParams(seed)[0]);
  if ((script === undefined) || (script == null)) throw "no script at ref";
  return script;
}

export function authUnit(validatorHash: string) {
  return `${validatorHash}${tokens.fspAuth()}`;
}

export function authAsset(validatorHash: string): lucid.Assets {
  return Object.fromEntries([[authUnit(validatorHash), 1n]]);
}

export function valiUnit(validatorHash: string) {
  return `${validatorHash}${tokens.fspVali()}`;
}

export function valiAsset(validatorHash: string): lucid.Assets {
  return Object.fromEntries([[valiUnit(validatorHash), 1n]]);
}

// ADDRESS

export function address(l: lucid.Lucid, validatorHash: string): string {
  return l.utils.credentialToAddress(
    l.utils.scriptHashToCredential(validatorHash),
  );
}

// CHAIN QUERIES

export async function getState(
  l: lucid.Lucid,
  validatorHash: string,
): Promise<lucid.UTxO> {
  const u = await l.utxoByUnit(valiUnit(validatorHash));
  if (typeof u !== "object") throw "Bad utxo";
  return u;
}

export async function getAuth(
  l: lucid.Lucid,
  validatorHash: string,
): Promise<lucid.UTxO> {
  const u = await l.utxoByUnit(authUnit(validatorHash));
  if (typeof u !== "object") throw "Bad utxo";
  return u;
}
