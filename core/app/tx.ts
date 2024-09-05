#!/usr/bin/env -S deno run -A

import * as core from "../mod.ts";

import { Command } from "npm:commander";

function cli() {
  const program = new Command();
  program
    .name("tx")
    .description(
      "do a tx",
    )
    .version("0.0.1");
  core.cli.addLucidWithWallet(program);
  core.txs.distribute.cli(program);
  core.txs.clear.cli(program);
  return program;
}

function main() {
  cli().parse();
}

if (import.meta.main) main();
