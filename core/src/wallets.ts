import { lucid } from "../deps.ts";
import { env, walletLabel } from "./env.ts";

export interface WalletInfo {
  id: string;
  address: string;
  pkh: string;
  pubkey: string;
}

export type Wallets = Record<string, WalletInfo>;

export const privateKeys = Object.fromEntries(
  Object.keys(env).filter((k) => k.startsWith(walletLabel)).map(
    (k) => [k.slice(walletLabel.length).toLowerCase(), env[k]],
  ),
);

export function walletInfo(
  network: lucid.Network,
  id: string,
  sk: string,
): WalletInfo {
  const networkId = network === "Mainnet" ? 1 : 0;
  const addressPrefix = network === "Mainnet" ? "addr" : "addr_test";
  const pubkey = lucid.C.PrivateKey.from_bech32(sk).to_public();
  const pkh = pubkey.hash();
  const address = lucid.C.EnterpriseAddress.new(
    networkId,
    lucid.C.StakeCredential.from_keyhash(pkh),
  );
  return {
    id,
    address: address.to_address().to_bech32(addressPrefix),
    pubkey: lucid.toHex(pubkey.as_bytes()),
    pkh: pkh.to_hex(),
  };
}

export function setWallet(l: lucid.Lucid, walletName: string) {
  l.selectWalletFromPrivateKey(privateKeys[walletName]);
  return l;
}

export function wallets(network: lucid.Network, sks = privateKeys): Wallets {
  return Object.fromEntries(
    Object.entries(sks).map(([k, v]) => [k, walletInfo(network, k, v)]),
  );
}

if (import.meta.main) {
  console.log(wallets("Mainnet"));
}
