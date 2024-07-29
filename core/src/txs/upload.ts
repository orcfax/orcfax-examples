import { lucid } from "../../deps.ts";

export const hostAddressHelp = `
Where the reference scripts are uploaded to. Use bech32 or wallet name.
WARNING : do not reuse this wallet for anything other than hosting reference scripts.
Constructing the other txs with this wallet can see the reference script utxos being spent. 
`;

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
