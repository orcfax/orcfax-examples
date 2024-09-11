# Mock

From a consumers perspective, this dapp works just like Orcfax-publish. It is
geared to aid testing.

There are two scripts:

1. FS (FactStatement). This script is executed in both spend and mint purpose.
   It governs the lifecycle of authentic statements. When a statement is
   "published", a script token is minted. The statement is output as the part of
   the inline datum of a utxo at the script address. The utxo value is ada and a
   script token.

2. FSP (FactStatementPointer). This script is also executed in both spend and
   mint purpose. It governs the lifecycle of the fact statement pointer. The
   pointer enables the FS script to updated, without effecting integrators.

## Usage

### Setup

1. Ensure the dependencies have been installed. (See generic instructions TODO)

2. Ensure the wallets and provider have been setup. (See generic instructions
   TODO)

3. From the `tx` subdirectory, run the commands `./app/tx.ts`.

## TODOs :

- [ ] Add a `dapp status` command
