# Synthetics

> This dapp is for demonstration purposes only

## Overview

This is a simple synth coin dapp. A user can perform two actions:

- Mint synth tokens by depositing ada.
- Burn synth tokens and claim deposited ada.

Performing an action corresponds to a tx. Both tx types require the necessary
exchange rate data to know how much ada either must be deposited, or can be
claimed. In this implementation, we assume no other feed is present in the same
tx.

The dapp params needs to know the hash of the FS SC, together with information
to deduce the feed ID.
