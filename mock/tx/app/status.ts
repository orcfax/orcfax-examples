#!/usr/bin/env -S deno run -A

import { Command, } from "npm:commander";
import { core, lucid } from "../deps.ts";
import * as mod from "../mod.ts";
import { FsRationalStatement } from "../src/blueprint.ts";
import { Rational } from "../src/validators/fs.ts";

function cli() {
  const cmd = new Command();
  cmd
    .name("status")
    .description(
      [
        "Get the status of the dapp",
        "Note that if the fsp-label is supplied, and the fsp has an fs hash,",
        "then it will look for the ref with matching hash.",
      ].join("\n"),
    )
    .version("0.0.1");
  core.cli.addLucid(cmd);
  mod.cli.addRefsAt(cmd);
  mod.cli.addFsLabel(cmd);
  mod.cli.addFspLabel(cmd);
  cmd.action(async (opts, _rest) => {
    const l = await core.cli.parseLucid(opts);
    const refsAt = core.cli.resolveAddress(l.network, opts.refsAt);
    const fspLabel = mod.cli.parseFspLabel(opts.fspLabel);
    const fsLabel = (!opts.fspLabel || opts.fsLabel) ? mod.cli.parseFsLabel(opts.fsLabel) : null 
    status(l, refsAt, fsLabel, fspLabel);
  });
  return cmd;
}

function text2data(t : string) {
  return lucid.Data.to<string>(lucid.fromText(t))
}

function data2text(t : string) {
  return lucid.toText(lucid.Data.from<string>(t))
}

type FspInfo = {
  refUtxo : string,
  label : string,
  hash : string,
  address : string,
  utxo: string,
  fsHash : string | null,
}

type FsInfo = {
  refUtxo : string,
  label: string,
  hash : string,
  address : string,
  statements : StatementInfo[],
}

type StatementInfo = {
  utxo : string,
  feedId: string;
  createdAt: Date;
  body: Rational;
}

function fsHash(u : lucid.UTxO | undefined) {
  return u ? mod.validators.fsp.fromData(u.datum!) : null
} 

function utxo2ref(u : lucid.UTxO | undefined) : string {
  return u ? `${u.txHash}#${u.outputIndex}` : ""
}

async function fspInfo(l : lucid.Lucid, ref : lucid.UTxO) : Promise<FspInfo> {
  const hash = l.utils.validatorToScriptHash(ref.scriptRef!);
  const state = await mod.validators.fsp.getState(l, hash)
  return {
      refUtxo : utxo2ref(ref),
      label : data2text(ref.datum!),
      hash,
      address :  mod.validators.fsp.address(l, hash), 
      utxo : utxo2ref(state),
      fsHash: fsHash(state),
    }
} 

async function fsInfo(l : lucid.Lucid, ref : lucid.UTxO) : Promise<FsInfo> {
  const hash = l.utils.validatorToScriptHash(ref.scriptRef!);
  const statements = await mod.validators.fs.getStates(l, hash)
  return {
      refUtxo : utxo2ref(ref),
      label : data2text(ref.datum!),
      hash,
      address :  mod.validators.fsp.address(l, hash), 
      statements : statements.map(x => ({
        utxo : utxo2ref(x.utxo), 
        feedId: x.feedId,
        createdAt: new Date(Number(x.createdAt)),
        body: x.body,
      }))
    }
} 

function prettyFspInfo(x : FspInfo) {
  console.log("FSP")
  console.log(x)
}

function prettyFsInfo(x : FsInfo) {
  console.log("FS")
  console.log(x)
}

async function status(
  l: lucid.Lucid,
  refsAt: string,
  fsLabel: string | null,
  fspLabel: string,
) {
  const refs = await l.utxosAt(refsAt);
  const fspRef = refs.find((u) => u.datum === text2data(fspLabel));
  const fspI = fspRef ? await fspInfo(l, fspRef) : null
  if (fspI) { 
    prettyFspInfo(fspI)
  } else {
    console.log("no fsp ref found")
  }
  const mFsRef = fspI?.fsHash ? refs.find( u => u.scriptRef && l.utils.validatorToScriptHash(u.scriptRef) == fspI.fsHash ) : undefined
  const fsI0 = mFsRef ? await fsInfo(l, mFsRef) : null 
  if (fsI0) {
    prettyFsInfo(fsI0)
  } else {
    console.log("no fs ref found")
  }
  const fsRef = fsLabel ? refs.find((u) => u.datum === text2data(fsLabel)) : undefined ;
  if (fsRef != undefined) {
    if (fsI0 && fsI0.refUtxo == utxo2ref(fsRef)) {
      return 
    } else {
      prettyFsInfo(await fsInfo(l, fsRef))
    }
  } else {
    console.log("no fs ref found")
  }
}



function main() {
  cli().parse();
}

if (import.meta.main) main();
