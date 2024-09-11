import { lucid } from "../deps.ts";
import * as bp from "./blueprint.ts";

export type RationalFsDat = bp.XRationalFsDat["_"];
export const RationalFsDat = bp.XRationalFsDat["_"];

export function toData(x: RationalFsDat): string {
  return lucid.Data.to<RationalFsDat>(x, RationalFsDat);
}

export function fromData(x: string): RationalFsDat {
  return lucid.Data.from<RationalFsDat>(x, RationalFsDat);
}

export const example: RationalFsDat = {
  statement: {
    feedId: lucid.fromText("rat/a-to-b/v1"),
    createdAt: 1714074620000n,
    body: {
      num: 19n,
      denom: 20n,
    },
  },
  context: {
    collectAfter: 1715774620000n,
    collector: "f5f75d2d010de90a8075285139542d99de12f51af319891d75d995b5",
  },
};

if (import.meta.main) {
  // @ts-ignore: Cannot handle this
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
  console.log(JSON.stringify(example, null, 2));
}
