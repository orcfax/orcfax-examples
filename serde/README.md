# Serde

> Handling cbor <-> json for orcfax FS datums 

Currently, this supports only json -> cbor 
This can be useful for testing.

## To use 

For get the help menu for options:
```
deno run -A ./src/main.ts --help
```

Example: 
```
deno run -A -- ./src/main --input examples/rational-fs-example.json
```
This outputs to stdout. `--output` can be used to output to file.

## Updating blueprint

Pointing at the right path to the orcfax-aiken `plutus.json`
```sh
../utils/mkBlueprints.ts \
  --input ../../orcfax-aiken/plutus.json \
  --output ./src/blueprint.ts
```
