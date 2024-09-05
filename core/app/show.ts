#!/usr/bin/env -S deno run -A

import * as core from "../mod.ts";

import { Command } from "npm:commander";

function cli() {
  const program = new Command();
  program
    .name("show")
    .description(
      "show useful info",
    )
    .version("0.0.1");
  const wallets = program.command("wallets");
  core.cli.addNetwork(wallets);
  wallets.action((opts, _) => {
    console.log(core.wallets.wallets(core.cli.parseNetwork(opts.network)));
  });
  const utxos = program.command("utxos");
  core.cli.addLucid(utxos);
  utxos.option("--sum", "Sum utxos and display asset total only");
  utxos.action(async (opts, _) => {
    const l = await core.cli.parseLucid(opts);
    Object.entries(core.wallets.wallets(l.network)).forEach(async ([k, v]) => {
      console.log(
        k,
        await l.utxosAt(v.address).then((res) =>
          opts.sum ? core.lucidExtras.sumUtxos(res) : res
        ),
      );
    });
  });
  return program;
}

export function main() {
  cli().parse();
}

if (import.meta.main) main();
