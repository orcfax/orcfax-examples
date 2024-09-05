import { Command, Option } from "npm:commander";
import { core, lucid } from "../../deps.ts";
import { fs } from "../validators/mod.ts";

import * as mod from "../mod.ts";

export function cli(cmd: Command) {
  const sub = cmd.command("upload-fs");
  mod.cli.addRefsAt(sub);
  mod.cli.addFsLabel(sub);
  sub.action(async (opts, rest) => {
    const l = await core.cli.parseLucidWithWallet(rest.parent.opts());
    const refsAt = core.cli.resolveAddress(l.network, opts.refsAt);
    const label = mod.cli.parseFsLabel(opts.fsLabel);
    const script = fs.mkScript(label);
    core.txs.upload.tx(
      l,
      script,
      refsAt,
      lucid.Data.to<string>(lucid.fromText(label)),
    ).then((tx) => core.txFinish.simple(l, tx));
  });
  return sub;
}
