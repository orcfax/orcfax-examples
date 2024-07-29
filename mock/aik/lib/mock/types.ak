pub type FsParams =
  ByteArray

pub type Fs2 {
  FsMint
  FsBurn
}

// Note: 32 bytes
pub type PubKey =
  ByteArray

pub type FspParams =
  ByteArray

pub type Fsp2 {
  FspMint
  FspBurn
}

pub type Fsp3 {
  FspUpdate
  FspClose
}

pub type FspDat =
  PubKey
