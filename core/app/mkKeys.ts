#!/usr/bin/env -S deno run -A 

import { lucid } from "../deps.ts";
import { walletLabel } from "../src/env.ts";

export const l = await lucid.Lucid.new(undefined, undefined);

if (import.meta.main) {
  console.log(
    `${walletLabel}${
      (Deno.args[0] || "user").toUpperCase()
    }=${l.utils.generatePrivateKey()}`,
  );
}
