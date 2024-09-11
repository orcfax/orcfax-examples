import { Command, Option } from "npm:commander";
import { lucid } from "../../deps.ts";

import { simple } from "../txFinish.ts";
import { parseLucidWithWallet, resolveAddress } from "../cli.ts";
import { wallets } from "../wallets.ts";

export async function tx(
  l: lucid.Lucid,
  addressAmt: Record<string, bigint>,
): Promise<lucid.Tx> {
  const utx = l.newTx();
  Object.entries(addressAmt).forEach((e) =>
    utx.payToAddress(e[0], { lovelace: e[1] })
  );
  return utx;
}

export function cli(program: Command) {
  const x = program.command("distribute");
  x
    .addOption(
      new Option(
        "--to <wallet0:amt0;wallet1:amt1;...>",
        "Recipient(s) of funds. <wallet> can be wallet name or bech32 address. Amount in ada",
      ).makeOptionMandatory(),
    );
  x.action(async (opts, rest) => {
    const l = await parseLucidWithWallet(rest.parent.opts());
    const addressAmts = Object.fromEntries(
      opts.to.split(";").map((x: string) => {
        const [woa, amt] = x.split(":");
        const address = resolveAddress(l.network, woa);
        return [address, BigInt(amt) * 1_000_000n];
      }),
    );
    tx(l, addressAmts).then((t) => simple(l, t));
  });
  return program;
}
