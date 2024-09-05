import { Command, Option } from "npm:commander";
import { core, lucid } from "../../deps.ts";

import * as fs from "../validators/fs.ts";
import * as mod from "../mod.ts";

export function cli(program: Command) {
  const sub = program.command("collect");
  mod.cli.addRefsAt(sub);
  mod.cli.addFsLabel(sub);
  sub.action(async (opts, rest) => {
    const l = await core.cli.parseLucidWithWallet(rest.parent.opts());
    const refsAt = core.cli.resolveAddress(l.network, opts.refsAt);
    const label = mod.cli.parseFsLabel(opts.fsLabel);
    tx(l, refsAt, label).then((res) => core.txFinish.simple(l, res));
  });
  return program;
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
  const fsScript = ref.scriptRef!;
  const fsHash = l.utils.validatorToScriptHash(fsScript);
  const expired = (await fs.getStates(l, fsHash)).slice(0, 50);
  return txInner(l, ref, expired);
}

export async function txInner(
  l: lucid.Lucid,
  fsRef: lucid.UTxO,
  expired: fs.State[],
): Promise<lucid.Tx> {
  const fsScript = fsRef.scriptRef!;
  const fsHash = l.utils.validatorToScriptHash(fsScript);
  const mintAssets = fs.fsAsset(fsHash, -BigInt(expired.length));

  const t = l
    .newTx()
    .readFrom([fsRef])
    .collectFrom(
      expired.map((u) => u.utxo),
      fs.toData3({ wrapper: lucid.Data.void() }),
    )
    .addSigner(await l.wallet.address());
  if (expired.length > 0) {
    t.mintAssets(mintAssets, fs.toData2("FsBurn"));
  }
  return t;
}
