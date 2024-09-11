import { lucid } from "../../deps.ts";
import * as bp from "../blueprint.ts";
import * as tokens from "../aik/tokens.ts";

export type Params = ConstructorParameters<bp.SyntheticsTwo>;

export type Red2 = bp.SyntheticsTwo["_red"];
export const Red2 = bp.SyntheticsTwo["_red"];
export type Red3 = bp.SyntheticsThree["_red"];
export const Red3 = bp.SyntheticsThree["_red"];
export type Dat = bp.SyntheticsThree["_dat"];
export const Dat = bp.SyntheticsThree["_dat"];

export function toData3(x: Red3): string {
  return lucid.Data.to<Red3>(x, Red3);
}

export function mkParams(
  fspHash: string,
  currency: string,
  adaIsBase: boolean,
): Params {
  return [{ fspHash, currency, adaIsBase }];
}

export function mkScript(
  fspHash: string,
  currency: string,
  adaIsBase: boolean,
) {
  const script = new bp.SyntheticsTwo(
    mkParams(fspHash, currency, adaIsBase)[0],
  );
  if ((script === undefined) || (script == null)) throw "no script at ref";
  return script;
}

export function unit(validatorHash: string, currency: string) {
  return `${validatorHash}${tokens.synthetic(currency)}`;
}

export function asset(
  validatorHash: string,
  currency: string,
  amt: bigint,
): lucid.Assets {
  return Object.fromEntries([[unit(validatorHash, currency), amt]]);
}

// ADDRESS

export function address(l: lucid.Lucid, validatorHash: string): string {
  return l.utils.credentialToAddress(
    l.utils.scriptHashToCredential(validatorHash),
  );
}

// CHAIN QUERIES

export async function getStates(
  l: lucid.Lucid,
  validatorHash: string,
): Promise<lucid.UTxO[]> {
  const u = await l.utxosAt(address(l, validatorHash));
  if (typeof u !== "object") throw "Bad utxo";
  return u;
}
