import { lucid } from "../../deps.ts";

export async function tx(
  l: lucid.Lucid,
  script: lucid.Script,
  hostAddress: string,
  tag?: string,
): Promise<lucid.Tx> {
  return l.newTx()
    .payToAddressWithData(hostAddress, { scriptRef: script, inline: tag }, {
      lovelace: 1n,
    });
}
