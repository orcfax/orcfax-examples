import { Command, Option } from "npm:commander";
import { lucid } from "../../deps.ts";

import { simple } from "../txFinish.ts";
import { parseLucidWithWallet } from "../cli.ts";
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

export function cli(program : Command) {
  const x = program.command("distribute");
  x
    .addOption(
      new Option(
        "--to <wallet0:amt0;wallet1:amt1;...>",
        "Recipient(s) of funds. <wallet> can be wallet name or bech32 address.",
      ),
    );
  x.action(async (opts, rest) => {
    const l = await parseLucidWithWallet(rest.parent.opts());
    const ws = wallets(l.network);
    let addressAmts;
    if (opts.to) {
      addressAmts = Object.fromEntries(
        opts.to.split(";").map((x: string) => {
          const [nameOrAddress, amt] = x.split(":");
          const address = ws[nameOrAddress] ? ws[nameOrAddress].address : nameOrAddress
          return [address, BigInt(amt) * 1_000_000n];
        }),
      );
    } else {
      const defaultAmt = 1_000_000_000n;
      addressAmts = Object.fromEntries(
        Object.entries(ws).filter(([k, _]) => k != opts.wallet).map((
          [_, v],
        ) => [v.address, defaultAmt]),
      );
    }
    tx(l, addressAmts).then(t => simple(l, t))
  });
  return program
}

