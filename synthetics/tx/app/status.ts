#!/usr/bin/env -S deno run -A

import { Command, Option, } from "npm:commander";
import { core, lucid } from "../deps.ts";
import * as mod from "../mod.ts";

function cli() {
  const cmd = new Command();
  cmd
    .name("status")
    .description(
      "get dapp status",
    )
    .version("0.0.1");
  core.cli.addLucid(cmd);
  mod.cli.addRefsAt(cmd);
  mod.cli.addFspHash(cmd);
  mod.cli.addFeedId(cmd);
  cmd. action(async (opts, rest) => {
      const l = await core.cli.parseLucid(opts);
      const refsAt = core.cli.resolveAddress(l.network, opts.refsAt);
      const fspHash = mod.cli.parseFspHash(opts.fspHash);
      const feedId = mod.cli.parseFeedId(opts.feedId)
      status(l, refsAt, fspHash, feedId)
    })
  return cmd
}

async function status(
  l : lucid.Lucid,
  refsAt : string,
  fspHash: string,
  feedId: string,
) {
  const refs = await l.utxosAt(refsAt) 
  const script = mod.validators.synthetics.mkScript(fspLabel, feedId)
  const scriptHash = l.utils.validatorToScriptHash(script)
  const ref = refs.find(u => u.scriptRef && l.utils.validatorToScriptHash(u.scriptRef) == scriptHash)
  console.log(refs.map(u => u.scriptRef && l.utils.validatorToScriptHash(u.scriptRef)))
  console.log(scriptHash)
  if (!ref) throw new Error("No ref found");
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
