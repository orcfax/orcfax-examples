use aiken/builtin
use aiken/dict
use aiken/list
use aiken/transaction.{
  InlineDatum, Input, Mint, Output, ScriptContext, Spend, Transaction,
}
use aiken/transaction/credential.{Address, ScriptCredential}
use aiken/transaction/value
use orcfax/tokens as orcfax_tokens
use orcfax/types as orcfax_t
use roll/tokens
use roll/types as t

fn mk_address(own_hash) {
  Address(ScriptCredential(own_hash), None)
}

validator(params: t.Params) {
  fn two(red: t.MintRedeemer, ctx: ScriptContext) {
    let ScriptContext { transaction: tx, purpose } = ctx
    let t.Params { fsp_hash } = params
    expect Mint(own_hash) = purpose
    when red is {
      t.Init(seed) -> {
        let Transaction { inputs, reference_inputs, outputs, mint, .. } = tx
        // Seed is spent
        expect inputs |> list.any(fn(i) { i.output_reference == seed })
        // Mint is single token with valid tag
        expect [Pair(tag, amt)] =
          mint
            |> value.from_minted_value
            |> value.tokens(own_hash)
            |> dict.to_pairs
        expect tag == tokens.mk_tag(seed) && amt == 1
        // Get fs dat
        let statement = get_statement(fsp_hash, reference_inputs)
        // Get continuing
        let own_address = mk_address(own_hash)
        outputs
          |> list.any(
              fn(o) {
                let Output { address, value, datum, reference_script } = o
                if
                address == own_address && (
                  value |> value.quantity_of(own_hash, tag)
                ) == 1{
                
                  expect InlineDatum(datum) = datum
                  expect datum: t.Datum<Data> = datum
                  and {
                    datum.statement == statement,
                    reference_script == None,
                  }
                } else {
                  False
                }
              },
            )
      }
      t.Burn -> {
        let Transaction { mint, .. } = tx
        expect [Pair(_, amt)] =
          mint
            |> value.from_minted_value
            |> value.tokens(own_hash)
            |> dict.to_pairs
        amt == -1
      }
    }
  }

  fn three(dat: t.Datum<Data>, red: t.SpendRedeemer, ctx: ScriptContext) {
    when red is {
      t.Update -> {
        let t.Params { fsp_hash } = params
        let ScriptContext {
          transaction: Transaction { inputs, outputs, reference_inputs, .. },
          purpose,
        } = ctx
        expect Spend(own_oref) = purpose
        expect Some(own_input) =
          inputs
            |> list.find(
                fn(
                  /// Get own input and nft
                  i,
                ) {
                  i.output_reference == own_oref
                },
              )
        expect [_, (own_hash, tag, _)] =
          own_input.output.value |> value.flatten()

        let new_statement = get_statement(fsp_hash, reference_inputs)
        let orcfax_t.Statement {
          feed_id: new_feed_id,
          created_at: new_created_at,
          ..
        } = new_statement
        let t.Datum {
          statement: orcfax_t.Statement { feed_id, created_at, .. },
          context: vkh,
        } = dat
        expect or {
            feed_id == new_feed_id,
            equal_until_slash(feed_id, new_feed_id, 2),
          }
        expect new_created_at > created_at
        outputs
          |> list.any(
              fn(
                /// Get new statement
                /// Correct feed id 
                /// New is newer
                /// Get cont output
                o,
              ) {
                let Output { address, value, datum, reference_script } = o
                if
                address == own_input.output.address && (
                  value |> value.quantity_of(own_hash, tag)
                ) == 1{
                
                  expect InlineDatum(datum) = datum
                  expect datum: t.Datum<Data> = datum
                  let t.Datum { statement: cont_statement, context: cont_vkh } =
                    datum
                  and {
                    cont_statement == new_statement,
                    cont_vkh == vkh,
                    reference_script == None,
                  }
                } else {
                  False
                }
              },
            )
      }
      t.End -> {
        let ScriptContext {
          transaction: Transaction { inputs, mint, extra_signatories, .. },
          purpose,
        } = ctx
        expect extra_signatories |> list.has(dat.context)
        expect Spend(own_oref) = purpose
        expect Some(own_input) =
          inputs |> list.find(fn(i) { i.output_reference == own_oref })
        expect [_, (own_hash, tag, _)] =
          own_input.output.value |> value.flatten()
        let own_tokens =
          mint
            |> value.from_minted_value
            |> value.tokens(own_hash)
            |> dict.to_pairs()
        expect [Pair(tag_, qty)] = own_tokens
        and {
          tag == tag_,
          qty == -1,
        }
      }
    }
  }
}

fn get_statement(fsp_hash: ByteArray, reference_inputs: List<Input>) {
  // Find Fsp, and extract FsHash
  expect Some(Input { output: Output { datum: InlineDatum(fs_idat), .. }, .. }) =
    reference_inputs
      |> list.find(
          fn(i) {
            (
              i.output.value
                |> value.quantity_of(fsp_hash, orcfax_tokens.fsp_vali())
            ) == 1
          },
        )
  expect fs_hash: ByteArray = fs_idat

  // Find Fs, and verify Statement
  // Note: Here we are assuming there will be only one in the tx.
  expect Some(Input { output: Output { datum: InlineDatum(fs_idat), .. }, .. }) =
    reference_inputs
      |> list.find(
          fn(i) {
            ( i.output.value |> value.quantity_of(fs_hash, orcfax_tokens.fs()) ) == 1
          },
        )
  expect fs_dat: orcfax_t.FsDat<Data> = fs_idat
  fs_dat.statement
}

fn equal_until_slash(l: ByteArray, r: ByteArray, cnt: Int) {
  do_equal_until_slash(0, l, r, cnt)
}

fn do_equal_until_slash(cursor: Int, l: ByteArray, r: ByteArray, cnt: Int) {
  if cnt == 0 {
    True
  } else {
    let li = l |> builtin.index_bytearray(cursor)
    let ri = r |> builtin.index_bytearray(cursor)
    expect ri == li
    if li == 47 {
      do_equal_until_slash(cursor + 1, l, r, cnt - 1)
    } else {
      do_equal_until_slash(cursor + 1, l, r, cnt)
    }
  }
}

test test_equal_until() {
  equal_until_slash("CER/ADA-USD/123213", "CER/ADA-USD/123213", 2)
}

test test_equal_until_1() fail {
  equal_until_slash("CER/ADA-USD/123213", "CER/ADA-USX/123213", 2)
}

test test_equal_until_2() {
  equal_until_slash("/CER/ADA-USD/123213", "/CER/ADA-USD/99999", 2)
}

test test_equal_until_3() {
  equal_until_slash("abc/ADA-USD/123213", "abc/ADA-USD/99999", 2)
}
