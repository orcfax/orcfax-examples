import { lucid, utils } from "../../deps.ts";

import * as v from "../validators/synthetics.ts";

export async function mint(
  l: lucid.Lucid,
  ref: lucid.UTxO,
  params: v.Params
  amt: bigint,
): Promise<lucid.Tx> {
  const script = ref.scriptRef!;
  const ownHash = l.utils.validatorToScriptHash(script);
  const ownAddress = l.utils.validatorToAddress(script);

  const mintAssets = v.syntheticAsset(ownHash, params[0].feedId) 
  const red = lucid.Data.void()
  const tx = l
    .newTx()
    .readFrom([ref])
    .collectFrom(
      [seed],
    ).mintAssets(mintAssets, red)
    .payToAddressWithData(
      ownAddress,
      { inline: lucid.Data.void() },
      fsp.valiAsset(ownHash),
    );
  return tx;
}
