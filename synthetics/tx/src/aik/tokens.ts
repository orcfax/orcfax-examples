import { lucid } from "../../deps.ts"

export function synthetic(feedId : string) {
  return lucid.fromText ( "synth:".concat(feedId) ).slice(0, 2* 32) 
}
