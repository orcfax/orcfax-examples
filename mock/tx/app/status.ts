#!/usr/bin/env -S deno run -A

import { Command, Option } from "npm:commander";
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
  mod.cli.addFsLabel(cmd);
  mod.cli.addFspLabel(cmd);
  cmd.action(async (opts, rest) => {
    const l = await core.cli.parseLucid(opts);
    const refsAt = core.cli.resolveAddress(l.network, opts.refsAt);
    const fsLabel = mod.cli.parseFsLabel(opts.fsLabel);
    const fspLabel = mod.cli.parseFspLabel(opts.fspLabel);
    status(l, refsAt, fsLabel, fspLabel);
  });
  return cmd;
}

async function status(
  l: lucid.Lucid,
  refsAt: string,
  fsLabel: string,
  fspLabel: string,
) {
  const refs = await l.utxosAt(refsAt);
  const fsRef = refs.find((u) =>
    u.datum === lucid.Data.to<string>(lucid.fromText(fsLabel))
  );
  if (!fsRef) {
    console.log("No fsRef");
  } else {
    const fsHash = l.utils.validatorToScriptHash(fsRef.scriptRef!);
    console.log("fs hash:", fsHash);
    console.log("fs address:", mod.validators.fs.address(l, fsHash));
  }
  const fspRef = refs.find((u) =>
    u.datum === lucid.Data.to<string>(lucid.fromText(fspLabel))
  );
  if (!fspRef) {
    console.log("No fspRef");
  } else {
    const fspHash = l.utils.validatorToScriptHash(fspRef.scriptRef!);
    console.log("fsp hash:", fspHash);
    console.log("fsp address:", mod.validators.fsp.address(l, fspHash));
  }
  if (refs.length > 2) {
    console.log("more utxos at store than expected");
  }
}
function main() {
  cli().parse();
}

if (import.meta.main) main();
