# Mock 

> Generate Orcfax-like statements on-chain for testing purposes. 

## Context 

For an explanation of the components of Orcfax-publish and how they relate see 
the [docs](https://docs.orcfax.io/consume).

We have three wallets: `admin`, `publisher`, and `store`.


## Setup 

See the general setup guidelines in the main [README.md#setup](../../README.md#).

Ensure the keys to each wallet exist in the `.env`, 
and that `admin` is sufficiently funded. 

If you're using kupmios, ensure the addresses are being followed _etc_.

## Usage 

See the general setup guidelines in the main [README.md#usage](../../README.md).
 
1. Setup alias `tx`. For example, if you are using Blockfrost on preview, then this would look like

```sh
alias tx="./app/tx.ts --network preview --provider blockfrost --wallet "
alias status="./app/status.ts --network preview --provider blockfrost --refs-at store "
```

2. Pick some seeds.
The seed is embedded into the scripts. 
This helps create a potentially unique or potentially duplicate script depending on our needs.

For example:
```sh
export fs_label="${USER}'s-fs-script" 
export fsp_label="${USER}'s-fs-script" 
```

3. Upload the scripts

```sh
tx admin upload-fs --to store --seed $fs_label
tx admin upload-fsp --to store --seed $fsp_label
```

4. Get the current dapp status. 

```sh
./app/status.ts  admin upload-fs --to store --seed $fs_label
./tx admin upload-fsp --to store --seed $fsp_label
```

5. Get the current dapp status

```sh
status 
```

If you are using kupmios, add the script addresses to the patterns. 

If you're testing another dapp that integrates with orcfax, then use the FSP script hash from here. 

6. If necessary, distribute funds to publisher:

```sh
tx admin distribute --to publisher:100
```

7. Publish statements from file:

```sh
tx publisher publish --refs-at store --statements ./examples.json
```

Repeat this if desired. 
You can now use these statements in other dapps. 

8. Collect statements

```sh
tx publisher collect --refs-at store
```

This will collect as many as it can fit in a single tx.

Repeat this, or the previous step as desired. 

9. Once all statements have been collected (or otherwise), return funds to admin

```sh
tx store clear --to admin
tx publisher clear --to admin
```

This removes the reference scripts from the store.
