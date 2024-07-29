#!/usr/bin/env -S deno run -A 

import { Command } from "npm:commander";

import { core, lucid } from "../deps.ts";
import { fspInit } from "../src/txs/fspInit.ts";

const { addNetworkOpts, addProviderOpts, parseNetwork, parseProvider } =
  core.cli;

export function program() {
  const program = new Command();
  program
    .name("oe-mock")
    .description("Orcfax-examples mock cli")
    .version("0.0.1");
  addNetworkOpts(program);
  addProviderOpts(program);
  program.command("upload-fsp")
    .option("--seed <seed>", "a unique reference")
    .option("--host <host>", "the host address of the reference scripts");
  program.command("fsp-init");
  program.parse();
  return program;
}

async function main() {
  const opts = program().opts();
  const network = parseNetwork(opts.network);
  const provider = parseProvider(network, opts.provider, opts.providerOpts);
  const l = await lucid.Lucid.new(provider, network);

  console.log(l.utxosAt);
}

if (import.meta.main) await main();
