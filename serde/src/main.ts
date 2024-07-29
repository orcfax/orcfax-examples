import { Command, Option } from "npm:commander";
import { RationalFsDat, toData } from "./serde.ts";

function cli() {
  const program = new Command();
  program
    .name("serde")
    .description("Create cbor like orcfax publish from a json")
    .version("0.0.1");
  program
    .addOption(
      new Option("--input <input>", "input json file")
        .makeOptionMandatory(),
    )
    .addOption(
      new Option(
        "--output <output>",
        "output file (default to stdout)",
      ),
    )
    .showHelpAfterError();
  return program.parse();
}

function corceBigInt<T>(x: any, path: string[]): any {
  const [next, ...rest] = path;
  if (next === undefined) return BigInt(x);
  x[next] = corceBigInt(x[next], rest);
  return x;
}

async function main() {
  const opts = cli().opts();
  let x: RationalFsDat = JSON.parse(await Deno.readTextFile(opts.input));
  x = corceBigInt(x, "statement.createdAt".split("."));
  x = corceBigInt(x, "statement.body.num".split("."));
  x = corceBigInt(x, "statement.body.denom".split("."));
  x = corceBigInt(x, "context.collectAfter".split("."));
  if (opts.output) {
    Deno.writeTextFile(opts.output, toData(x));
  } else {
    console.log(toData(x));
  }
}
if (import.meta.main) await main();
