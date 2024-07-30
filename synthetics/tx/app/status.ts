#!/usr/bin/env -S deno run -A

import { Command, Option, } from "npm:commander";
import { core, lucid } from "../deps.ts";
import * as mod from "../mod.ts";

function cli() {
  const program = new Command();
  program
    .name("status")
    .description(
      "get dapp status",
    )
    .version("0.0.1");
  core.cli.addLucidOpts(program);
  program
    .addOption(
      new Option(
        "--refs-at <name-or-address>",
        "Where reference scripts have been uploaded and can be found",
      ).makeOptionMandatory(),
    )
    .addOption(
      new Option(
        "--fs-label <fs-label>",
        "Used to indentify the fs script reference. Here it is the seed",
      ).makeOptionMandatory(),
    )
    .addOption(
      new Option(
        "--fsp-label <fsp-label>",
        "Used to indentify the fsp script reference. Here it is the seed",
      ).makeOptionMandatory(),
    )
    . action(async (opts, rest) => {
      const l = await core.cli.parseLucid(opts);
      const ws = core.wallets.wallets(l.network);
      const refsAt = ws[opts.refsAt] ? ws[opts.refsAt].address : opts.refsAt
      const fsLabel = opts.fsLabel
      const fspLabel = opts.fspLabel
      status(l, refsAt, fsLabel, fspLabel)
    })
  return program
}

async function status(
  l : lucid.Lucid,
  refsAt : string,
  fsLabel: string,
  fspLabel: string,
) {
  const refs = await l.utxosAt(refsAt) 
  const fsRef = refs.find(u => u.datum === lucid.Data.to<string>(lucid.fromText(fsLabel)))
  if (!fsRef) throw new Error("No ref found");
  const fspRef = refs.find(u => u.datum === lucid.Data.to<string>(lucid.fromText(fspLabel)))
  if (!fspRef) throw new Error("No ref found");
  if (refs.length > 2) {
    console.log("more utxos at store than expected")
  }
  console.log("fs address:", mod.validators.fs.address(l, l.utils.validatorToScriptHash(fsRef.scriptRef!)) )
  console.log("fsp address:", mod.validators.fsp.address(l, l.utils.validatorToScriptHash(fspRef.scriptRef!)) )
  console.log("fsp hash:", l.utils.validatorToScriptHash(fspRef.scriptRef!))
  console.log("TBC")
}
function main() {
  cli().parse()
}

if (import.meta.main) main()
