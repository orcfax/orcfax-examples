import { Command, Option } from "npm:commander";
import { lucid } from "../../deps.ts";
import { parseLucidWithWallet, resolveAddress } from "../cli.ts";
import { withChangeAddress } from "../txFinish.ts";

export function tx(l: lucid.Lucid): Promise<lucid.Tx> {
  return l.wallet.getUtxos().then((us) => l.newTx().collectFrom(us));
}

export function cli(program: Command) {
  const x = program.command("clear");
  x
    .addOption(
      new Option(
        "--to <wallet>",
        "Recipient(s) of funds",
      ).default('admin'),
    );
  x.action(async (opts, rest) => {
    const l = await parseLucidWithWallet(rest.parent.opts());
    tx(l).then((t) => withChangeAddress(l, t, resolveAddress(l.network, opts.to)));
  });
  return program;
}
