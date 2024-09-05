import { lucid } from "../deps.ts";

function explorerSubdomain(n: lucid.Network) {
  if (n === "Preview") return "preview.";
  if (n === "Preprod") return "preprod.";
  return "";
}

function explorerLink(l: lucid.Lucid, txId: string) {
  if ("log" in l.provider) return `emulator:${txId}`;
  return `https://${explorerSubdomain(l.network)}cexplorer.io/tx/${txId}`;
}

export async function simple(l: lucid.Lucid, tx: lucid.Tx) {
  const txId = await tx.complete()
    .then((res) => res.sign())
    .then((res) => res.complete())
    .then((res) => res.submit());
  console.log(explorerLink(l, txId));
  await l.awaitTx(txId);
}

export async function withChangeAddress(
  l: lucid.Lucid,
  tx: lucid.Tx,
  address: string,
) {
  const txId = await tx.complete({ change: { address } })
    .then((res) => res.sign())
    .then((res) => res.complete())
    .then((res) => res.submit());
  console.log(explorerLink(l, txId));
  await l.awaitTx(txId);
}
