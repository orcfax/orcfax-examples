# Orcfax-examples

> 🚧 WIP 🚧

> ⚠️ These dapps are for demonstration purposes only

This repo contains some demo dApps that utilize Orcfax oracle feeds.

## About

This repo uses:

- [aiken](https://aiken-lang.org/) for on-chain code
- [deno](https://deno.com/) for off-chain code

There is a [nix flake](https://nixos.wiki/wiki/Flakes) with a devshell including
these dependencies.

### Organization

```sample
$tree -L 1
.
├── core        # shared code
├── flake.lock  
├── flake.nix
├── mock        # A mock publisher
├── README.md   
└── synthetics  # A toy synthetic assets dApp using Orcfax
```

Other toy dApps will be included as they are created.

## General Setup

### Dotenv

We use the reasonably standard convention of `.env` for secret variables. It is
ignored by git.

The `.env` file needs to be present in the current working directory. Usually
this will mean creating a new `<dapp>/tx/.env` file for each dApp you
interact with.

### Provider setup

DApps need chain data. This data comes from a data provider. There are several
options.

#### Blockfrost

To use Blockfrost you will need an API key, or be
[RYO](https://github.com/blockfrost/blockfrost-backend-ryo). In the former case,
follow the instructions
[here](https://blockfrost.dev/docs/overview/getting-started). In the latter case
still set a Blockfrost key even if it is not used. (Lucid doesn't cope well
if it is absent.)

The Blockfrost key must be in the `.env` file with key of the form

```ini
ORCFAX_EXAMPLES_BLOCKFROST_<network>=
```

where `<network>` is either `PREVIEW`, `PREPROD`, or `MAINNET`.

#### Kupmios

Kupmios is a bit trickier since you must manually update Kupo to follow new
important addresses.

(Untested)

#### Emulator

(Not yet supported)

### Wallets

When we make txs we needs a funded wallet to pay fees and provide collateral.

A wallet is ultimately derived from a signing key. In fact we treat these as a
1-1 relationship. (This is good enough for us. In the real world, it can be more
complicated.)

We make use of `.env` files to handle secrets, including signing keys.

There is a little tool `mkKeys.ts` in `core` to create new secret keys. To
append it an `.env` would look something like.

```sh
./core/app/mkKeys.ts <optional-wallet-name> >> .env
```

Each dapp has its own required wallet names it expects. See `.env.example`
and/or the respective README.md for details.

### Funding wallets

To send funds to a wallet, we need to know the address.

Dapps expose information about the wallets, including their address via the
following

```sh
./app/show.ts wallets
```

For testnets, see the faucet
[here](https://docs.cardano.org/cardano-testnets/tools/faucet/) for details on
how to fund wallets.

To check UTXOs in the wallets use

```sh
./app/show.ts utxos
```

`--sum` will condense the output.

## DApps

### Navigating dApps

Each dApp has its own subdirectory structured as follows:

```
$tree -L 1
.
├── aik         # <-- On-chain code. This is an aiken repo
├── README.md
└── tx          # <-- Off-chain code. This is a deno repo
```

The interactive part is `./tx`. This acts as the working directory for
explanations on interaction with the dApp. Contained in this part is a README
with dApp specific instructions.

### Executables

Executables can be found in the `./app` subdirectory.

### Using Orcfax

You can either use Orcfax via an existing deployment, or setup a mock (see
`./mock`).

### Using aliases

Executables tend to have a lot of options, and these are exposed as cli options.

For example, you'll need a provider, such as Blockfrost of Kupmios. (See
[provider setup](#provider-setup) on how to setup providers.)

Aliases and variables can save your wrists and keep the interactions sane. For
example

```sh
alias tx="./app/tx.ts --network preview --provider blockfrost --wallet "
```
