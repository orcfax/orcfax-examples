use aiken/dict
use aiken/list
use aiken/transaction.{
  InlineDatum, Input, Mint, Output, ScriptContext, Spend, Transaction,
}
use aiken/transaction/credential.{ScriptCredential}
use aiken/transaction/value
use orcfax/feed_id.{starts_with}
use orcfax/validity_range.{get_bounds}
use orcfax/tokens as orcfax_tokens
use orcfax/types as orcfax_t
use orcfax/rational.{ Rational, RationalFsDat }

use synthetics/tokens
use synthetics/constants

type Params {
  fsp_hash: ByteArray,
  feed_id: ByteArray,
}

validator(params: Params) {
  fn two(_red: Data, ctx: ScriptContext) {
    let Params { fsp_hash, feed_id, } = params
    let ScriptContext {
      transaction: Transaction {
        reference_inputs,
        validity_range,
        mint,
        outputs,
        inputs,
        ..
      },
      purpose,
    } = ctx

    // START: Find Fsp, and extract FsHash
    expect Some(Input { output: Output { datum: InlineDatum(fs_idat), .. }, .. }) =
      reference_inputs
        |> list.find(
            fn(i) {
              ( i.output.value |> value.quantity_of(fsp_hash, orcfax_tokens.fsp()) ) == 1
            },
          )
    expect fs_hash: ByteArray = fs_idat
    // END: Find Fsp, and extract FsHash


    // START: Find Fs, and verify Statement
    // Note: Here we are assuming there will be only one in the tx.
    expect Some(Input { output: Output { datum: InlineDatum(fs_idat), .. }, .. }) =
      reference_inputs
        |> list.find(
            fn(i) {
              ( i.output.value |> value.quantity_of(fs_hash, orcfax_tokens.fs()) ) == 1
            },
          )
    expect fs_dat: RationalFsDat = fs_idat
    let orcfax_t.FsDat {
      statement: orcfax_t.Statement {
        feed_id: feed_id_,
        created_at,
        body: Rational { num, denom },
      },
      ..
    } = fs_dat

    // We only want recent statements. 
    // Recent is determined by `params.max_ttl`
    let (lb, ub) = get_bounds(validity_range)
    expect and {
        ub - lb < constants.max_ttl(),
        lb < created_at,
        created_at < ub,
      }

    // We want only the expected price feed 
    expect feed_id_ |> starts_with(feed_id)
    // End: Find Fs, and verify Statement


    // START: Rest of the logic is dapp specific
    expect Mint(own_hash) = purpose
    expect [Pair(name, qty)] =
      mint
        |> value.from_minted_value
        |> value.tokens(own_hash)
        |> dict.to_pairs()
    expect
      name == tokens.synthetic(feed_id)

    if qty > 0 {
      // Deposit case
      let ada_if_own = ada_if_own_output(own_hash)
      let deposit = outputs |> list.foldl(0, fn(o, tot) { ada_if_own(o) + tot })
      // The value of the deposit must be greater than the value of tokens minted
      deposit * num > qty * denom
    } else {
      // Claim case 
      let ada_if_own = ada_if_own_input(own_hash)
      let deposit = inputs |> list.foldl(0, fn(o, tot) { ada_if_own(o) + tot })
      // The value of the deposit must be less than the value of tokens burned
      deposit * num < -qty * denom
    }
    // END: Rest of the logic is dapp specific
  }

  fn three(_dat: Data, _red: Data, ctx: ScriptContext) {
    // Defer all logic to `two`
    let ScriptContext { transaction: Transaction { inputs, mint, .. }, purpose } =
      ctx
    expect Spend(own_oref) = purpose
    expect Some(own_input) =
      inputs |> list.find(fn(i) { i.output_reference == own_oref })
    expect ScriptCredential(own_hash) =
      own_input.output.address.payment_credential
    expect [Pair(_, qty)] =
      mint
        |> value.from_minted_value
        |> value.tokens(own_hash)
        |> dict.to_pairs()
    qty < 0
  }
}

fn ada_if_own_input(hash: ByteArray) -> fn(Input) -> Int {
  let own_cred = ScriptCredential(hash)
  fn(i: Input) {
    let Output { address, value, .. } = i.output
    if address.payment_credential == own_cred {
      expect [(_, _, qty)] = value |> value.flatten()
      qty
    } else {
      0
    }
  }
}

fn ada_if_own_output(hash: ByteArray) -> fn(Output) -> Int {
  let own_cred = ScriptCredential(hash)
  fn(o) {
    let Output { address, value, datum, reference_script } = o
    if address.payment_credential == own_cred {
      expect and {
          datum == empty_inline(),
          reference_script == None,
        }
      expect [(_, _, qty)] = value |> value.flatten()
      qty
    } else {
      0
    }
  }
}

fn empty_inline() {
  InlineDatum(Void)
}
