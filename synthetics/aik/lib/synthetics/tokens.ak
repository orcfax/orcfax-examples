use aiken/bytearray

pub fn synthetic(feed_id : ByteArray) -> ByteArray {
  ( "synth:" |> bytearray.concat(feed_id) |> bytearray.take(32) )
}
