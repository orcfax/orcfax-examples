import { Command, Option } from "npm:commander";
import { core, lucid } from "../../deps.ts";

import * as fsp from "../validators/fsp.ts";
import * as mod from "../mod.ts";

export function cli(cmd: Command) {
  const sub = cmd.command("fsp-end");
  mod.cli.addRefsAt(sub);
  mod.cli.addFspLabel(sub);
  sub.action(async (opts, rest) => {
    const l = await core.cli.parseLucidWithWallet(rest.parent.opts());
    const refsAt = core.cli.resolveAddress(l.network, opts.refsAt);
    const label = mod.cli.parseFspLabel(opts.fspLabel);
    tx(l, refsAt, label).then((res) => core.txFinish.simple(l, res));
  });
  return cmd;
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
