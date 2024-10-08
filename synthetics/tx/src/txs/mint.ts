import { Command } from "npm:commander";
import { core, lucid, orcfax } from "../../deps.ts";

import * as mod from "../mod.ts";

import * as v from "../validators/synthetics.ts";
import { mkFeedId } from "../aik/tokens.ts";

export function cli(cmd: Command) {
  const sub = cmd.command("mint");
  mod.cli.addRefsAt(sub);
  mod.cli.addParams(sub);
  mod.cli.addAmount(sub);
  sub.action(async (opts, rest) => {
    const l = await core.cli.parseLucidWithWallet(rest.parent.opts());
    const refsAt = core.cli.resolveAddress(l.network, opts.refsAt);
    const { fspHash, currency, adaIsBase } = mod.cli.parseParams(opts);
    const amt = mod.cli.parseAmount(opts.amount);
    const script = v.mkScript(fspHash, currency, adaIsBase);
    const ownHash = l.utils.validatorToScriptHash(script);
    const ref = (await l.utxosAt(refsAt)).find((u) =>
      u.scriptRef && l.utils.validatorToScriptHash(u.scriptRef) == ownHash
    );
    if (!ref) throw new Error("No ref found");
    return tx(l, ref, v.mkParams(fspHash, currency, adaIsBase), amt).then((t) =>
      core.txFinish.simple(l, t)
    );
  });
  return sub;
}

export async function tx(
  l: lucid.Lucid,
  ref: lucid.UTxO,
  params: v.Params,
  amt: bigint,
): Promise<lucid.Tx> {
  const script = ref.scriptRef!;
  const ownHash = l.utils.validatorToScriptHash(script);
  const ownAddress = l.utils.validatorToAddress(script);

  const { fspHash, currency, adaIsBase } = params[0];
  const feedId = mkFeedId(currency, adaIsBase);

  const fspUtxo = await l.utxoByUnit(orcfax.validators.fsp.valiUnit(fspHash));
  if (fspUtxo == undefined) throw new Error("No fsp found");
  const fsHash = lucid.Data.from<string>(fspUtxo.datum!);
  if (fsHash == undefined) throw new Error("fsHash is undefined");
  const states = await orcfax.validators.fs.getStates(l, fsHash);

  const now = l.utils.slotToUnixTime(l.currentSlot());
  const lb = now - 10 * 60 * 1000;
  const ub = now + 10 * 60 * 1000;

  const s0 = states.filter(
    (s) => s.feedId.startsWith(lucid.toText(feedId)),
  );
  const s1 = s0.filter((s) =>
    (lb <= Number(s.createdAt)) && (ub >= Number(s.createdAt))
  );
  const statement = s1[0];

  const body = statement.body;
  const [a, b] = adaIsBase ? [body.num, body.denom] : [body.denom, body.num];
  const synthAmt = amt * a / b;

  const mintAssets = v.asset(ownHash, params[0].currency, synthAmt);
  const red = lucid.Data.void();

  const tx = l
    .newTx()
    .readFrom([ref, fspUtxo, statement.utxo])
    .validFrom(lb)
    .validTo(ub)
    .mintAssets(mintAssets, red)
    .payToAddressWithData(
      ownAddress,
      { inline: lucid.Data.void() },
      { lovelace: amt },
    );
  return tx;
}
