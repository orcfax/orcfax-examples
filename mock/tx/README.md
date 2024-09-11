# Mock

> Generate Orcfax-like statements on-chain.

Useful for testing integrations

## Context

For an explanation of the components of Orcfax-publish and how they relate see
the [docs](https://docs.orcfax.io/consume).

We have three wallets: `admin`, `publisher`, and `store`.

## Setup

See the general setup guidelines in the main
[README.md#setup](../../README.md#).

Ensure the keys to each wallet exist in the `.env`, and that `admin` is
sufficiently funded.

If you're using kupmios, ensure the addresses are being followed _etc_.

## Usage

See the general setup guidelines in the main [README.md#usage](../../README.md).

1. Setup alias `tx`. For example, if you are using Blockfrost on preview, then
   this would look like

```sh
alias tx="./app/tx.ts --network preview --provider blockfrost --wallet "
alias status="./app/status.ts --network preview --provider blockfrost --refs-at store "
```
2. To prevent clashes between deployments of the same mock publishers, 
the script is _seeded_.
By default the system variable `$USER` is used. 
This can be overridden with the appropriate label flags (use `--help` on the commands to see more).

3. Upload the scripts

```sh
tx admin upload-fs
tx admin upload-fsp
```

4. Init the fsp

```sh
stats # copy the fs-hash
tx admin fsp-init --fs-hash <fs-hash> 
```

5. Get the current dapp status

```sh
status
```

If you are using kupmios, add the script addresses to the patterns.

If you're testing another dapp that integrates with orcfax, then use the FSP
script hash from here.

6. If necessary, distribute funds to publisher. For example, send 100 ada to the publisher:

```sh
tx admin distribute --to "publisher:100"
```

7. Publish statements from file:

```sh
tx publisher publish --from-file ./examples.json
```

Repeat this if desired. You can now use these statements in other dapps.
Extrapolate the file format from the example given. 

There's a shortcut for publishing a single CER feed-type statement.

```sh
tx publisher publish --new-cer BASE,QUOTE,NUM,DENOM
```

This will publish a single statement with created at field set to `now`

8. Collect statements

```sh
tx publisher collect
```

This will collect as many as it can fit in a single tx.

Repeat this, or the previous step as desired.

9. Once all statements have been collected (or otherwise), return funds to admin (or use the `--to` option)

```sh
tx publisher clear
tx admin fsp-end
tx store clear
```

The final line removes the reference scripts from the store.
