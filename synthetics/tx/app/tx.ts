#!/usr/bin/env -S deno run -A

import { Command, } from "npm:commander";
import { core } from "../deps.ts";
import * as mod from "../mod.ts";

function cli() {
  const cmd = new Command();
  cmd
    .name("tx")
    .description(
      "do a tx",
    )
    .version("0.0.1");
  core.cli.addLucidWithWallet(cmd);
  core.txs.distribute.cli(cmd);
  core.txs.clear.cli(cmd);
  mod.txs.upload.cli(cmd);
  mod.txs.mint.cli(cmd);
  mod.txs.burn.cli(cmd);
  return cmd;
}

function main() {
  cli().parse();
}

if (import.meta.main) main();
