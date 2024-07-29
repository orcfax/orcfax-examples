import { lucid } from "../../deps.ts";
import * as bp from "../blueprint.ts";
import * as tokens from "../aik/tokens.ts";

export type Params = ConstructorParameters<bp.FsTwo>;

export type Red2 = bp.FsTwo["red"];
export const Red2 = bp.FsTwo["red"];
export type Red3 = bp.FsThree["_red"];
export const Red3 = bp.FsThree["_red"];

// FIXME : CANNOT HANDLE GENERICS ANYWAY.
// AS RATIONAL THE ONLY PAYLOAD THIS ISNT AN ISSUE YET
export type Dat = bp.FsRationalFsDat["_"];
export const Dat = bp.FsRationalFsDat["_"];

export type Statment = bp.FsRationalStatement["_"];
export const Statment = bp.FsRationalStatement["_"];

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
  const script = new bp.FsTwo(mkParams(seed)[0]);
  if ((script === undefined) || (script == null)) throw "no script at ref";
  return script;
}

export function fsUnit(validatorHash: string) {
  return `${validatorHash}${tokens.fs()}`;
}

export function fsAsset(validatorHash: string, amt = 1n): lucid.Assets {
  return Object.fromEntries([[fsUnit(validatorHash), amt]]);
}

// ADDRESS

export function address(l: lucid.Lucid, validatorHash: string): string {
  return l.utils.credentialToAddress(
    l.utils.scriptHashToCredential(validatorHash),
  );
}

// CHAIN QUERIES

export type Rational = { num: bigint; denom: bigint };

export type State = {
  feedId: string;
  createdAt: bigint;
  body: Rational;
  dat: Dat;
  utxo: lucid.UTxO;
};

export async function getStates(
  l: lucid.Lucid,
  validatorHash: string,
): Promise<State[]> {
  const us = await l.utxosAtWithUnit(
    address(l, validatorHash),
    fsUnit(validatorHash),
  );
  return us.map((utxo) => {
    const dat = fromData(utxo.datum!);
    if (typeof dat != "object") throw Error("Bad dat");
    const feedId = lucid.toText(dat.statement.feedId);
    const createdAt = dat.statement.createdAt;
    const body = dat.statement.body;
    return { feedId, createdAt, body, utxo, dat };
  });
}
