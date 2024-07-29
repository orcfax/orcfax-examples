import { lucid } from "../../deps.ts";
import * as bp from "../blueprint.ts";
import * as tokens from "../aik/tokens.ts"

export type Params = ConstructorParameters<bp.SyntheticsTwo>

export function mkParams( fspHash : string, feedId : string) : Params {
  return [{ fspHash, feedId : lucid.fromText(feedId), }]
}

export function mkScript(fspHash : string, feedId : string) {
  const script = new bp.SyntheticsTwo(mkParams(fspHash, feedId, )[0]);
  if ((script === undefined) || (script == null)) throw "no script at ref";
  return script;
}

export function address(l: lucid.Lucid, fspHash : string, feedId : string) {
  return l.utils.validatorToAddress(mkScript(fspHash, feedId));
}

export function syntheticUnit(validatorHash: string, feedId : string) {
  return `${validatorHash}${tokens.synthetic(feedId)}`;
}

export function syntheticAsset(validatorHash: string, feedId :string, amt : bigint) : lucid.Assets {
  return Object.fromEntries([[syntheticUnit(validatorHash, feedId,), amt]])
}

// STATE

export type State = {
  utxo : lucid.UTxO;
  ada : bigint,
}

export function toState(utxo : lucid.UTxO) : State {
  const ada = utxo.assets['lovelace']
  return { utxo, ada }
}

// CHAIN QUERIES 

export async function getStates(l : lucid.Lucid, fspHash: string, feedId : string) : Promise<State[]> {
  const u = await l.utxosAt( address(l, fspHash, feedId))
  if (typeof u !== "object") throw "Bad utxo"
  return u.map(toState)
}
