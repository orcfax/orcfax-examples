import { Command, Option } from "npm:commander";
import { core, lucid } from "../../deps.ts";

import * as fsp from "../validators/fsp.ts";
import * as mod from "../mod.ts";

export function cli(cmd: Command) {
  const sub = cmd.command("fsp-init");
  mod.cli.addRefsAt(sub);
  mod.cli.addFspLabel(sub);
  mod.cli.addFsHash(sub);
  sub.action(async (opts, rest) => {
    const l = await core.cli.parseLucidWithWallet(rest.parent.opts());
    const refsAt = core.cli.resolveAddress(l.network, opts.refsAt);
    const label = mod.cli.parseFspLabel(opts.fspLabel);
    const fsHash = mod.cli.parseFsHash(opts.fsHash);
    tx(l, refsAt, label, fsHash).then((res) => core.txFinish.simple(l, res));
  });
  return cmd;
}

export async function tx(
  l: lucid.Lucid,
  refsAt: string,
  label: string,
  payload: string,
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
  payload: string,
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
