use aiken/bytearray

pub fn mk_feed_id(currency : ByteArray, ada_is_base : Bool) -> ByteArray {
  if ada_is_base {
    "CER/ADA-" |> bytearray.concat(currency) |> bytearray.concat("/")
  } else {
    "CER/" |> bytearray.concat(currency) |> bytearray.concat("-ADA/")
  }
}

pub fn synthetic(currency : ByteArray) -> ByteArray {
  ( "synth:" |> bytearray.concat(currency) |> bytearray.take(32) )
}

test test_synth() {
  synthetic("CER/ADA-USD/") == "synth:CER/ADA-USD/"
}

