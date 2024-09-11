import { Command, Option } from "npm:commander";
import { core, lucid } from "../../deps.ts";
import { synthetics } from "../validators/mod.ts";

import * as mod from "../mod.ts";

export function cli(cmd: Command) {
  const sub = cmd.command("upload");
  mod.cli.addRefsAt(sub);
  mod.cli.addParams(sub);
  mod.cli.addLabel(sub);
  sub.action(async (opts, rest) => {
    const l = await core.cli.parseLucidWithWallet(rest.parent.opts());
    const refsAt = core.cli.resolveAddress(l.network, opts.refsAt);
    const { fspHash, currency, adaIsBase } = mod.cli.parseParams(opts);
    const label = mod.cli.parseLabel(opts.label);
    const script = synthetics.mkScript(fspHash, currency, adaIsBase);
    core.txs.upload.tx(
      l,
      script,
      refsAt,
      label,
    ).then((tx) => core.txFinish.simple(l, tx));
  });
  return sub;
}
