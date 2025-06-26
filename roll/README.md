# Roll

> This dapp is for demonstration purposes only

## Overview

This dapp "rolls" with the latest statement of a feed on-chain.
That is, it displays the latest statement that the dapp has been informed of in the form an update tx.

There are two ways this can be achieved on top of the current design of Orcfax:

- Use an existing FSdatum as a reference input
- Verify the signed FS directly

Here we do the first of these.

## Operations

There are three key steps in an instance lifecycle:

- Init
- Update
- End

On the init, a user mints a token that is locked at the script address.
The token name is a hash of some input, and is essentially unique.
The UTXO is has a datum that looks very similar to a FS datum.

```
pub type Datum<t> {
  statement: Statement<t>,
  context: Context,
}

/// The statement is for consumers
pub type Statement<t> {
  feed_id: ByteArray,
  created_at: Int,
  body: t,
}

pub type Context = VerificationKeyHash
```

The only difference is that context is used to include a verification key hash.
This is used on an end: the instance may only be ended when the tx is signed by the verification key hash.
If the user wishes the instance lasts forever, they should set the value to be spurious.

Between a mint and end, anyone can perform an update.
In an update, there must exist a reference input of a FS with matching feed id (ignoring version), and later `created_at`
compared to own input.
The continuing output has the statement of referenced input, and the context of own input.
