#!/usr/bin/env -S deno run -A

import { Command, } from "npm:commander";
import { core } from "../deps.ts";
import * as mod from "../mod.ts";

function cli() {
  const program = new Command();
  program
    .name("tx")
    .description(
      "do a tx",
    )
    .version("0.0.1");
  core.cli.addLucidWithWalletOpts(program);
  core.txs.distribute.cli(program);
  core.txs.clear.cli(program);
  mod.txs.uploadFs.cli(program);
  mod.txs.publish.cli(program);
  mod.txs.collect.cli(program);
  mod.txs.uploadFsp.cli(program);
  mod.txs.fspInit.cli(program);
  mod.txs.fspUpdate.cli(program);
  mod.txs.fspEnd.cli(program);
  return program;
}

function main() {
  cli().parse();
}

if (import.meta.main) main();
