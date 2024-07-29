import { Command, Option } from "npm:commander";
import { core, lucid } from "../../deps.ts";

import * as fsp from "../validators/fsp.ts";

export function cli(program : Command) {
  program.command("fsp-end")
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
    . action(async (opts, rest) => {
      const l = await core.cli.parseLucidWithWallet(rest.parent.opts());
      const ws = core.wallets.wallets(l.network);
      const refsAt = ws[opts.refsAt] ? ws[opts.refsAt].address : opts.refsAt
      const label = opts.label
      tx(l, refsAt, label, ).then(res => core.txFinish.simple(l, res))
    })
  return program
}

export async function tx(
  l: lucid.Lucid,
  refsAt: string,
  label: string,
): Promise<lucid.Tx> {
  const ref =
    (await l.utxosAt(refsAt)).filter((u) =>
      u.datum === lucid.Data.to<string>(lucid.fromText(label))
    )[0];
  if (!ref) throw new Error("No ref found");
  return txInner(l, ref);
}

export async function txInner(
  l: lucid.Lucid,
  ref: lucid.UTxO,
): Promise<lucid.Tx> {
  const script = ref.scriptRef!;
  const ownHash = l.utils.validatorToScriptHash(script);
  const mintAssets = Object.fromEntries([
    [fsp.authUnit(ownHash), -1n],
    [fsp.valiUnit(ownHash), -1n],
  ]);
  const red3 = fsp.toData3({ wrapper: "FspClose" });
  const red2 = fsp.toData2("FspBurn");
  const auth = await fsp.getAuth(l, ownHash);
  const u = await fsp.getState(l, ownHash);
  const t = l
    .newTx()
    .readFrom([ref])
    .collectFrom(
      [auth],
    )
    .collectFrom(
      [u],
      red3,
    )
    .mintAssets(mintAssets, red2);
  return t;
}
