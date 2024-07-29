import { load } from "jsr:@std/dotenv";

export const walletLabel = "ORCFAX_EXAMPLES_WALLET_";

export const env = await load().then((res) =>
  Object.fromEntries(
    Object.keys(res).map((k) => [k, Deno.env.get(k) || res[k]]),
  )
);
