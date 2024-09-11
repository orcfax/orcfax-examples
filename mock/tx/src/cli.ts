import { assert } from "jsr:@std/assert";
import { Command, Option } from "npm:commander";
import { lucid } from "../deps.ts";

export function addRefsAt(cmd: Command): Command {
  return cmd
    .addOption(
      new Option(
        "--refs-at <name-or-address>",
        "Where reference scripts have been uploaded and can be found",
      ).default("store"),
    );
}

export function addFsLabel(cmd: Command): Command {
  return cmd
    .addOption(
      new Option(
        "--fs-label <fsLabel>",
        "Used to indentify the fs script reference. Here it is the seed",
      ).default(""),
    );
}

export function parseFsLabel(x: string): string {
  return x ? x : `${Deno.env.get("USER")}-fs`;
}

export function addFspLabel(cmd: Command): Command {
  return cmd
    .addOption(
      new Option(
        "--fsp-label <fspLabel>",
        "Used to indentify the fsp script reference. Here it is the seed",
      ).default(""),
    );
}

export function parseFspLabel(x: string): string {
  return x ? x : `${Deno.env.get("USER")}-fsp`;
}

export function addFsHash(cmd: Command): Command {
  return cmd
    .addOption(
      new Option(
        "--fsp-hash <base16>",
        "Used to indentify the fs script reference. Here it is the seed",
      ).makeOptionMandatory(),
    );
}

export function parseFsHash(x: string): string {
  assert(
    x.length == 56,
    `fsHash must be 28 bytes (56 chars in base16). Founnd ${x.length} chars`,
  );
  return x;
}

export function addCurrency(cmd: Command): Command {
  return cmd
    .addOption(
      new Option(
        "--currency <currency>",
        "The currency as it appears in the orcfax CER feed id. eg `USD` for `CER/ADA-USD/",
      ).makeOptionMandatory(),
    );
}

export function parseCurrency(x: string): string {
  return lucid.fromText(x);
}

export function addAdaIsBase(cmd: Command): Command {
  return cmd
    .addOption(
      new Option(
        "--ada-is-base",
        "Ada is base if it appears first in the feed-id eg `CER/ADA-USD/`, otherwise ada is quote",
      ).default(false),
    )
    .addOption(
      new Option(
        "--ada-is-quote",
        "Ada is quote if it appears second in the feed-id eg `CER/FACT-ADA/`, otherwise ada is base",
      ).default(false),
    );
}

export function parseAdaIsBase(adaIsBase: boolean, adaIsQuote: boolean) {
  if ((adaIsBase && adaIsQuote) || (!adaIsBase && !adaIsQuote)) {
    throw new Error(
      "Exactly one of --ada-is-base and --ada-is-quote is required",
    );
  }
  return adaIsBase;
}

export function addLabel(cmd: Command): Command {
  return cmd.addOption(
    new Option(
      "--label <label>",
      "Used to indentify the script reference",
    ).default("synthetics"),
  );
}

export function parseLabel(x: string): string {
  return lucid.Data.to<string>(lucid.fromText(x));
}

export function addAmount(cmd: Command): Command {
  return cmd
    .addOption(
      new Option(
        "--amount <amt>",
        "The amount of token to mint or burn",
      ).makeOptionMandatory(),
    );
}

export function parseAmount(x: string): bigint {
  return BigInt(x) * 1_000_000n;
}
