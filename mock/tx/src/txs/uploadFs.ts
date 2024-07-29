import { Command, Option } from "npm:commander";
import { core, lucid } from "../../deps.ts";
import { fs } from "../validators/mod.ts";

export function cli(program : Command) {
  program.command("upload-fs")
    .addOption(
      new Option(
        "--to <name-or-address>",
        core.txs.upload.hostAddressHelp,
      ).makeOptionMandatory(),
    )
    .addOption(
      new Option(
        "--seed <seed>",
        "make the script uniquely identifiable. Also used to make the label",
      ).makeOptionMandatory(),
    ).action(async (opts, rest) => {
    const l = await core.cli.parseLucidWithWallet(rest.parent.opts());
    const ws = core.wallets.wallets(l.network);
    const targetAddress = ws[opts.to]
      ? ws[opts.to].address
      : opts.to;
    const script = fs.mkScript(opts.seed);
    core.txs.upload.tx(
      l,
      script,
      targetAddress,
      lucid.Data.to<string>(lucid.fromText(opts.seed)),
    ).then((tx) => core.txFinish.simple(l, tx));
  });
  return program;
}
