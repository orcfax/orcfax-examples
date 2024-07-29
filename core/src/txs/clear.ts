import { Command, Option } from "npm:commander";
import { lucid } from "../../deps.ts";
import { parseLucidWithWallet } from "../cli.ts";
import { withChangeAddress } from "../txFinish.ts";
import { wallets } from "../wallets.ts";

export function tx(l: lucid.Lucid): Promise<lucid.Tx> {
  return l.wallet.getUtxos().then(us => l.newTx().collectFrom(us))
}

export function cli(program : Command) {
  const x = program.command("clear");
  x
    .addOption(
      new Option(
        "--to <wallet>",
        "Recipient(s) of funds",
      ),
    );
  x.action(async (opts, rest) => {
    const l = await parseLucidWithWallet(rest.parent.opts());
    const ws = wallets(l.network);
    const nameOrAddress = opts.to
    const address = ws[nameOrAddress] ? ws[nameOrAddress].address : nameOrAddress
    tx(l).then(t => withChangeAddress(l, t, address))
  });
  return program
}
