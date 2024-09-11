# Synthetics txs

## Setup 

### CER feed

We're using a `CER` type feed to create a collateralised synthetic asset. 

To be able to use a `CER` type feed, either:

- Use an Orcfax deployment. (Details on deployments can be found [here][deployments])
- Setup a mock deployment. Details found in [mock][./../../mock/tx/README.md]

[deployments]: todo

Find the FSP hash, and choose the `CER` feed ID. 
The feed ID will be of the form 

```sh
CER/{{BASE}}-{{QUOTE}}/{{version-info}}
```

We require ada to be either the base or the quote currency of the feed.

### Setup aliases 

For example:

```sh
alias tx="./app/tx.ts --network preview --provider blockfrost --wallet "
alias status="./app/status.ts --network preview --provider blockfrost "
export params="export params=" --fsp-hash <fsp-hash> --currency USD --ada-is-base "
```

### Upload 

```sh
tx admin upload $params
```

### Distribute 

```sh
tx admin distribute --to "user:200"
```

### Get statements

If you're using the mock publisher, make some new statements of the relevant feeds.

## Use

### Mint 

```sh
tx user mint $params --amount 100
```

### Burn

```sh
tx user burn $params
```

By default it will burn all the token it can. 
