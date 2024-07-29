import { Command, Option } from "npm:commander";
import { assert } from "jsr:@std/assert";
import { core, lucid } from "../../deps.ts";

import * as fsp from "../validators/fsp.ts";

const DEFAULT_HASH = "0".repeat(56);

export function cli(program : Command) {
  program.command("fsp-init")
    .addOption(
      new Option(
        "--refs-at <name-or-address>",
        "Where reference scripts have been uploaded and can be found",
      ).makeOptionMandatory(),
    )
    .addOption(
      new Option(
        "--label <label>",
        "Used to indentify the script reference. Here it is the seed",
      ).makeOptionMandatory(),
    )
    .addOption(
      new Option(
        "--fs-hash <base16>",
        "Hash of the fs script. Will be contained in the datum",
      )
    )
    . action(async (opts, rest) => {
      const l = await core.cli.parseLucidWithWallet(rest.parent.opts());
      const ws = core.wallets.wallets(l.network);
      const refsAt = ws[opts.refsAt] ? ws[opts.refsAt].address : opts.refsAt
      const label = opts.label
      const fsHash = opts.fsHash || DEFAULT_HASH
      assert(fsHash.length == 56, `fsHash must be 28 bytes (56 chars in base16). Founnd ${fsHash.length} chars`)
      tx(l, refsAt, label, fsHash).then(res => core.txFinish.simple(l, res))
    })
  return program
}

export async function tx(
  l: lucid.Lucid,
  refsAt: string,
  label: string,
  payload : string,
): Promise<lucid.Tx> {
  const ref =
    (await l.utxosAt(refsAt)).filter((u) =>
      u.datum === lucid.Data.to<string>(lucid.fromText(label))
    )[0];
  if (!ref) throw new Error("No ref found");
  return txInner(l, ref, payload);
}

export async function txInner(
  l: lucid.Lucid,
  ref: lucid.UTxO,
  payload = DEFAULT_HASH,
): Promise<lucid.Tx> {
  const script = ref.scriptRef!;
  const ownHash = l.utils.validatorToScriptHash(script);
  const ownAddress = l.utils.validatorToAddress(script);
  const mintAssets = {
    ...fsp.authAsset(ownHash),
    ...fsp.valiAsset(ownHash),
  };
  const red = fsp.toData2("FspMint");
  const t = l
    .newTx()
    .readFrom([ref])
    .mintAssets(mintAssets, red)
    .payToAddressWithData(
      ownAddress,
      { inline: fsp.toData(payload) },
      fsp.valiAsset(ownHash),
    );
  return t;
}
