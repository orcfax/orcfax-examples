use aiken/transaction.{OutputReference}
use orcfax/types.{Statement}

// use aiken/crypto

pub type Params {
  fsp_hash: ByteArray,
}

pub type Datum<t> {
  statement: Statement<t>,
  context: Context,
}

//pub type Context = VerificationKeyHash
pub type Context =
  ByteArray

pub type MintRedeemer {
  Init(OutputReference)
  Burn
}

pub type SpendRedeemer {
  Update
  End
}
