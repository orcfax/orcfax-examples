import { lucid, orcfax } from "../../deps.ts";

import * as v from "../validators/synthetics.ts";

export async function mint(
  l: lucid.Lucid,
  ref: lucid.UTxO,
  params: v.Params,
  amt: bigint,
): Promise<lucid.Tx> {
  const script = ref.scriptRef!;
  const ownHash = l.utils.validatorToScriptHash(script);
  const ownAddress = l.utils.validatorToAddress(script);

  const { fspHash, feedId} = params[0]

  const fspUtxo = await l.utxoByUnit(orcfax.validators.fsp.valiUnit(fspHash))
  if (fspUtxo == undefined) throw new Error("No fsp found")
  const fsHash = lucid.Data.from<string>(fspUtxo.datum!) 
  if (fsHash == undefined) throw new Error("fsHash is undefined")
  const states = await orcfax.validators.fs.getStates(l, fsHash)
  const statement = states.filter(s => s.feedId.startsWith(feedId)).sort((r,l) => r.createdAt < l.createdAt ? -1 : 1)[0]

  const synthAmt = amt * statement.body.num / statement.body.denom 

  const mintAssets = v.syntheticAsset(ownHash, params[0].feedId, synthAmt) 
  const red = lucid.Data.void()
  const tx = l
    .newTx()
    .readFrom([ref, fspUtxo, statement.utxo])
    .mintAssets(mintAssets, red)
    .payToAddressWithData(
      ownAddress,
      { inline: lucid.Data.void() },
      { lovelace : amt }
    );
  return tx;
}
