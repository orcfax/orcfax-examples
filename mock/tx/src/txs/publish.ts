import { Command, Option } from "npm:commander";
import { core, lucid } from "../../deps.ts";

import * as fs from "../validators/fs.ts";
import * as mod from "../mod.ts";

export function cli(cmd: Command) {
  const sub = cmd.command("publish");
  mod.cli.addRefsAt(sub);
  mod.cli.addFsLabel(sub);
  sub
    .addOption(
      new Option(
        "--new-cer <base,quote,num,denom> ",
        "Convenient way to make a new CER statement, the arguments are comma sep list",
      ),
    )
    .addOption(
      new Option(
        "--from-file <path-to-json>",
        "Input Json of statements. See documentation on file-format.",
      ),
    )
    .action(async (opts, rest) => {
      const l = await core.cli.parseLucidWithWallet(rest.parent.opts());
      const refsAt = core.cli.resolveAddress(l.network, opts.refsAt);
      const label = mod.cli.parseFsLabel(opts.fsLabel);

      let input: fs.Statment[] | null = null;

      if (opts.newCer) {
        const [base, quote, num, denom] = opts.newCer.split(",");
        const now = new Date();
        input = [parseStatement({
          feedId: `CER/${base}-${quote}/v0`,
          createdAt: now,
          body: { num, denom },
        })];
      } else if (opts.fromFile) {
        parseStatements(
          JSON.parse(Deno.readTextFileSync(opts.fromFile)),
        );
      }

      if (input == null) throw new Error("No statements provided");
      tx(l, refsAt, label, input).then((res) => core.txFinish.simple(l, res));
    });
  return cmd;
}

export async function tx(
  l: lucid.Lucid,
  refsAt: string,
  label: string,
  statements: fs.Statment[],
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
    .mintAssets(mintAssets, fs.toData2("FsMint"));
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

function parseStatement(x: any): fs.Statment {
  console.log(x);
  const feedId = lucid.fromText(x.feedId);
  const createdAt = BigInt(Date.parse(x.createdAt));
  const num = BigInt(x.body.num);
  const denom = BigInt(x.body.denom);
  return { feedId, createdAt, body: { num, denom } };
}

function parseStatements(statements: any): fs.Statment[] {
  if ("feedId" in statements) return [parseStatement(statements)];
  return statements.map(parseStatement);
}
