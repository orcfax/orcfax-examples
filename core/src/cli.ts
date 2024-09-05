import { lucid } from "../deps.ts";
import { Command, Option } from "npm:commander";
import { blockfrostkey, env } from "./env.ts";
import {
  BlockfrostConfig,
  blockfrostDefaultUrl,
  EmulatorConfig,
  KupmiosConfig,
} from "./provider.ts";
import { parse } from "jsr:@std/dotenv@^0.225.0/parse";
import { privateKeys, wallets } from "./wallets.ts";

export function defaultProgam() {
  const program = new Command();
  program
    .name("oe")
    .description("Orcfax-examples cli")
    .version("0.0.1");
  return program;
}

const providerHelp = `
Provider options are a bit involved. 
The valid syntax depends on the provider.
Sane defaults are provided. 
`;

export function addNetwork(program: Command) {
  program
    .addOption(
      new Option("--network <network>", "Cardano network").choices([
        "mainnet",
        "preprod",
        "preview",
        "custom",
      ]).makeOptionMandatory(),
    );
  return program;
}

export function addProvider(program: Command) {
  program
    .addOption(
      new Option("--provider <provider>", "Provider of network services")
        .choices([
          "blockfrost",
          "kupmios",
          "emulator",
        ]).makeOptionMandatory(),
    )
    .addOption(
      new Option(
        "--provider-opts <opts>",
        providerHelp,
      ),
    );
  return program;
}

export function addLucid(program: Command) {
  addNetwork(program);
  addProvider(program);
  return program;
}

export function addWallet(program: Command) {
  program
    .addOption(
      new Option(
        "--wallet <wallet>",
        "Wallet funding the tx",
      ).makeOptionMandatory(),
    );
  return program;
}

export function addLucidWithWallet(program: Command) {
  addNetwork(program);
  addProvider(program);
  addWallet(program);
  return program;
}

export type ProviderInfo = { type: "Blockfrost"; key: string } | {
  type: "Kupmios";
  kupoUrl: string;
  ogmiosUrl: string;
};

type Config = {
  sk: string;
  provider: ProviderInfo;
  network: string;
  adapter: string;
  refAddress: string;
};

function parseBlockfrostOpts(
  network: lucid.Network,
  opts: null | string,
): BlockfrostConfig {
  if (!opts) {
    return {
      type: "BlockfrostConfig",
      url: blockfrostDefaultUrl(network),
      key: env[blockfrostkey(network)],
    };
  } else {
    throw new Error("blockfrost provider options not yet supported");
  }
}

function parseKupmiosOpts(
  opts: null | string,
): KupmiosConfig {
  if (opts === null) {
    // Assume default ports on local host
    return {
      type: "KupmiosConfig",
      kupoUrl: "http://localhost:1442",
      ogmiosUrl: "ws://localhost:1337",
    };
  } else {
    // Assume space sep urls "kupoUrl ogmiosUrl"
    const [kupoUrl, ogmiosUrl] = opts.split(" ");
    return { type: "KupmiosConfig", kupoUrl, ogmiosUrl };
  }
}

function parseEmulatorOpts(
  opts: null | string,
): EmulatorConfig {
  if (opts === null) {
    throw new Error("Not yet implemented");
    // return { type: "EmulatorConfig" };
  } else {
    throw new Error("Not yet implemented");
  }
}

export function parseNetwork(network: string): lucid.Network {
  if (network == "preprod") return "Preprod";
  if (network == "preview") return "Preview";
  if (network == "mainnet") return "Mainnet";
  return "Custom";
}

export function parseProvider(
  network: lucid.Network,
  provider: string,
  opts: string,
): lucid.Provider {
  if (provider === "blockfrost") {
    const config = parseBlockfrostOpts(network, opts);
    return new lucid.Blockfrost(config.url, config.key);
  } else if (provider === "kupmios") {
    const config = parseKupmiosOpts(opts);
    return new lucid.Kupmios(config.kupoUrl, config.ogmiosUrl);
  } else if (provider === "emulator") {
    const config = parseEmulatorOpts(opts);
    return new lucid.Emulator(config.accounts, config.protocol);
  }
  throw new Error("Cannot parse provider");
}

export function parseLucid(
  { network, provider, providerOpts }: {
    network: string;
    provider: string;
    providerOpts: string | undefined;
  },
): Promise<lucid.Lucid> {
  const n = parseNetwork(network);
  const p = parseProvider(n, provider, providerOpts || "");
  return lucid.Lucid.new(p, n);
}

export function parseLucidWithWallet(
  { network, provider, providerOpts, wallet }: {
    network: string;
    provider: string;
    providerOpts: string | undefined;
    wallet: string;
  },
): Promise<lucid.Lucid> {
  const sk = privateKeys[wallet];
  if (!sk) throw new Error(`Wallet unknown : ${wallet}`);
  return parseLucid({ network, provider, providerOpts }).then((res) => {
    res.selectWalletFromPrivateKey(sk);
    return res;
  });
}

export function resolveAddress(network : lucid.Network, woa : string) : string {
  const ws = wallets(network);
  return ws[woa] ? ws[woa].address : woa;
}
