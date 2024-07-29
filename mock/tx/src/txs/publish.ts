import { Command, Option } from "npm:commander";
import { core, lucid } from "../../deps.ts";

import * as fs from "../validators/fs.ts";

export function cli(program : Command) {
  program.command("publish")
    .addOption(
      new Option(
        "--refs-at <name-or-address>",
        "Where reference scripts have been uploaded and can be found",
      ).makeOptionMandatory(),
    )
    .addOption(
      new Option(
        "--label <label>",
        "Used to indentify the script reference. This is set at upload",
      ).makeOptionMandatory(),
    )
    .addOption(
      new Option(
        "--statements <path-to-json>",
        "Input Json of statements. See documentation on file-format.",
      ).makeOptionMandatory(),
    )
    . action(async (opts, rest) => {
      const l = await core.cli.parseLucidWithWallet(rest.parent.opts());
      const ws = core.wallets.wallets(l.network);
      const refsAt = ws[opts.refsAt] ? ws[opts.refsAt].address : opts.refsAt
      const label = opts.label
      const input : fs.Statment[] = parseStatements(JSON.parse(Deno.readTextFileSync(opts.statements)))
      tx(l, refsAt, label, input).then(res => core.txFinish.simple(l, res))
    })
  return program
}

export async function tx(
  l: lucid.Lucid,
  refsAt: string,
  label: string,
  statements : fs.Statment[],
): Promise<lucid.Tx> {
  const ref =
    (await l.utxosAt(refsAt)).filter((u) =>
      u.datum === lucid.Data.to<string>(lucid.fromText(label))
    )[0];
  if (!ref) throw new Error("No ref found");
  return txInner(l, ref, statements);
}

export async function txInner(
  l: lucid.Lucid,
  fsRef: lucid.UTxO,
  statements: fs.Statment[],
  // metadata: null | any = {},
): Promise<lucid.Tx> {
  const fsScript = fsRef.scriptRef!;
  const fsHash = l.utils.validatorToScriptHash(fsScript);
  const fsAddress = l.utils.validatorToAddress(fsScript);
  const mintAssets = fs.fsAsset(fsHash, BigInt(statements.length));

  const t = l
    .newTx()
    .readFrom([fsRef])
    .mintAssets(mintAssets, fs.toData2("FsMint"))
    // .attachMetadata(1226, metadata);
  statements.forEach((s) => {
    const dat: fs.Dat = {
      statement: s,
      context: "",
    };
    t.payToAddressWithData(
      fsAddress,
      { inline: fs.toData(dat) },
      fs.fsAsset(fsHash),
    );
  });
  return t;
}


function parseStatement(x: any ): fs.Statment {
  const feedId = lucid.fromText(x.feedId)
  const createdAt = BigInt(Date.parse(x.createdAt))
  const num = BigInt(x.body.num)
  const denom = BigInt(x.body.denom)
  return { feedId, createdAt, body : {num, denom} }
}

function parseStatements(statements: any): fs.Statment[] {
  if ('feedId' in statements) return [parseStatement(statements)]
  return statements.map(parseStatement)
}

