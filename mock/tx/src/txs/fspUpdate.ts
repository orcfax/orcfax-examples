import { Command } from "npm:commander";
import { core, lucid } from "../../deps.ts";

import * as fsp from "../validators/fsp.ts";
import * as mod from "../mod.ts";

export function cli(cmd: Command) {
  const sub = cmd.command("fsp-update");
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
  dat: fsp.Dat,
): Promise<lucid.Tx> {
  const script = ref.scriptRef!;
  const ownHash = l.utils.validatorToScriptHash(script);
  const ownAddress = l.utils.validatorToAddress(script);

  const u = await fsp.getState(l, ownHash);
  const red = fsp.toData3({ wrapper: "FspUpdate" });
  const auth = await fsp.getAuth(l, ownHash);
  const t = l
    .newTx()
    .readFrom([ref])
    .collectFrom(
      [auth],
    )
    .collectFrom(
      [u],
      red,
    )
    .payToAddressWithData(
      ownAddress,
      { inline: fsp.toData(dat) },
      fsp.valiAsset(ownHash),
    );
  return t;
}
