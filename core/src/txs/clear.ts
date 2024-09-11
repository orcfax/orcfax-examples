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
      ).default("admin"),
    )
    .addOption(
      new Option(
        "--oref <txid#idx>",
        "Specify only one oref to spend",
      ),
    );
  x.action(async (opts, rest) => {
    const l = await parseLucidWithWallet(rest.parent.opts());
    const a = resolveAddress(l.network, opts.to);
    if (opts.oref) {
      const [orefHash, orefIdxStr] = opts.oref.split("#");
      const utxos = await l.utxosByOutRef([{
        txHash: orefHash,
        outputIndex: parseInt(orefIdxStr),
      }]);
      await withChangeAddress(l, l.newTx().collectFrom(utxos), a);
    } else {
      tx(l).then((t) => withChangeAddress(l, t, a));
    }
  });
  return program;
}
