use aiken/bytearray
use aiken/cbor
use aiken/hash
use aiken/transaction.{OutputReference}

pub fn mk_tag(oref: OutputReference) -> ByteArray {
  let data: Data = oref
  bytearray.take(hash.blake2b_256(cbor.serialise(data)), 20)
}

pub fn mk_feed_id(currency: ByteArray, ada_is_base: Bool) -> ByteArray {
  if ada_is_base {
    "CER/ADA-" |> bytearray.concat(currency) |> bytearray.concat("/")
  } else {
    "CER/" |> bytearray.concat(currency) |> bytearray.concat("-ADA/")
  }
}

pub fn synthetic(currency: ByteArray) -> ByteArray {
  "synth:" |> bytearray.concat(currency) |> bytearray.take(32)
}

test test_synth() {
  synthetic("CER/ADA-USD/") == "synth:CER/ADA-USD/"
}
