import { lucid } from "../deps.ts";
const { applyParamsToScript } = lucid;
type Data = lucid.Data;
type Validator = lucid.Validator;

export interface XContext {
  new (): Validator;
  _: { collectAfter: bigint; collector: string };
}

export const XContext = Object.assign(
  function () {
    return {
      type: "PlutusV2",
      script:
        "5852010000323232323232232253330044a229309b2b299980119b8748000c00cdd5000899191919299980498058010a4c2c6eb8c024004c024008dd6980380098021baa001165734aae7555cf2ab9f5742ae881",
    };
  },
  {
    _: {
      "title": "Context",
      "description": "For orcfax publisher only",
      "anyOf": [{
        "title": "Context",
        "dataType": "constructor",
        "index": 0,
        "fields": [{ "dataType": "integer", "title": "collectAfter" }, {
          "dataType": "bytes",
          "title": "collector",
        }],
      }],
    },
  },
) as unknown as XContext;

export interface XDataFsDat {
  new (): Validator;
  _: {
    statement: { feedId: string; createdAt: bigint; body: Data };
    context: { collectAfter: bigint; collector: string };
  };
}

export const XDataFsDat = Object.assign(
  function () {
    return {
      type: "PlutusV2",
      script:
        "58b7010000323232323232232253330044a229309b2b299919801980098021baa002132323232533300a300c002132324994ccc020c018c024dd5001099191919299980798088010a4c2c6eb8c03c004c03c008dd6980680098051baa0021653330073005300837540062646464646464a66602060240042930b180800098080011bad300e001300e002375c601800260126ea800c5858c028004c028008c020004c014dd50011b8748000595cd2ab9d5573caae7d5d0aba21",
    };
  },
  {
    _: {
      "title": "FsDat",
      "description": "The FsDat is the datum containing orcfax statements",
      "anyOf": [{
        "title": "FsDat",
        "dataType": "constructor",
        "index": 0,
        "fields": [{
          "title": "statement",
          "description": "For consumers",
          "anyOf": [{
            "title": "Statement",
            "dataType": "constructor",
            "index": 0,
            "fields": [{ "dataType": "bytes", "title": "feedId" }, {
              "dataType": "integer",
              "title": "createdAt",
            }, { "title": "body", "description": "Any Plutus data." }],
          }],
        }, {
          "title": "context",
          "description": "For orcfax publisher only",
          "anyOf": [{
            "title": "Context",
            "dataType": "constructor",
            "index": 0,
            "fields": [{ "dataType": "integer", "title": "collectAfter" }, {
              "dataType": "bytes",
              "title": "collector",
            }],
          }],
        }],
      }],
    },
  },
) as unknown as XDataFsDat;

export interface XDataStatement {
  new (): Validator;
  _: { feedId: string; createdAt: bigint; body: Data };
}

export const XDataStatement = Object.assign(
  function () {
    return {
      type: "PlutusV2",
      script:
        "585b010000323232323232232253330044a229309b2b299980119b8748000c00cdd50008991919191919299980598068010a4c2c601600260160046eb4c024004c024008dd7180380098021baa001165734aae7555cf2ab9f5742ae881",
    };
  },
  {
    _: {
      "title": "Statement",
      "description": "For consumers",
      "anyOf": [{
        "title": "Statement",
        "dataType": "constructor",
        "index": 0,
        "fields": [{ "dataType": "bytes", "title": "feedId" }, {
          "dataType": "integer",
          "title": "createdAt",
        }, { "title": "body", "description": "Any Plutus data." }],
      }],
    },
  },
) as unknown as XDataStatement;

export interface XRational {
  new (): Validator;
  _: { num: bigint; denom: bigint };
}

export const XRational = Object.assign(
  function () {
    return {
      type: "PlutusV2",
      script:
        "5852010000323232323232232253330044a229309b2b299980119b8748000c00cdd5000899191919299980498058010a4c2c6eb4c024004c024008dd6980380098021baa001165734aae7555cf2ab9f5742ae881",
    };
  },
  {
    _: {
      "title": "Rational",
      "description": "Body for rational statements, including prices",
      "anyOf": [{
        "title": "Rational",
        "dataType": "constructor",
        "index": 0,
        "fields": [{ "dataType": "integer", "title": "num" }, {
          "dataType": "integer",
          "title": "denom",
        }],
      }],
    },
  },
) as unknown as XRational;

export interface XRationalFsDat {
  new (): Validator;
  _: {
    statement: {
      feedId: string;
      createdAt: bigint;
      body: { num: bigint; denom: bigint };
    };
    context: { collectAfter: bigint; collector: string };
  };
}

export const XRationalFsDat = Object.assign(
  function () {
    return {
      type: "PlutusV2",
      script:
        "58e6010000323232323232232253330044a229309b2b299919801980098021baa002132323232533300a300c002132324994ccc020c018c024dd5001099191919299980798088010a4c2c6eb8c03c004c03c008dd6980680098051baa0021653330073005300837540062646464646464a6660206024004264932999806980598071baa00113232323253330143016002149858dd6980a000980a0011bad3012001300f37540022c2c602000260200046eb4c038004c038008dd7180600098049baa0031616300a001300a0023008001300537540046e1d2000165734aae7555cf2ab9f5742ae881",
    };
  },
  {
    _: {
      "title": "FsDat",
      "description": "The FsDat is the datum containing orcfax statements",
      "anyOf": [{
        "title": "FsDat",
        "dataType": "constructor",
        "index": 0,
        "fields": [{
          "title": "statement",
          "description": "For consumers",
          "anyOf": [{
            "title": "Statement",
            "dataType": "constructor",
            "index": 0,
            "fields": [{ "dataType": "bytes", "title": "feedId" }, {
              "dataType": "integer",
              "title": "createdAt",
            }, {
              "title": "body",
              "description": "Body for rational statements, including prices",
              "anyOf": [{
                "title": "Rational",
                "dataType": "constructor",
                "index": 0,
                "fields": [{ "dataType": "integer", "title": "num" }, {
                  "dataType": "integer",
                  "title": "denom",
                }],
              }],
            }],
          }],
        }, {
          "title": "context",
          "description": "For orcfax publisher only",
          "anyOf": [{
            "title": "Context",
            "dataType": "constructor",
            "index": 0,
            "fields": [{ "dataType": "integer", "title": "collectAfter" }, {
              "dataType": "bytes",
              "title": "collector",
            }],
          }],
        }],
      }],
    },
  },
) as unknown as XRationalFsDat;

export interface XRationalStatement {
  new (): Validator;
  _: {
    feedId: string;
    createdAt: bigint;
    body: { num: bigint; denom: bigint };
  };
}

export const XRationalStatement = Object.assign(
  function () {
    return {
      type: "PlutusV2",
      script:
        "588c010000323232323232232253330044a229309b2b299980119b8748000c00cdd500089919191919192999805980680109924ca66601066e1d200030093754002264646464a66601e60220042930b1bad300f001300f002375a601a00260146ea80045858c02c004c02c008dd6980480098048011bae3007001300437540022cae6955ceaab9e5573eae855d11",
    };
  },
  {
    _: {
      "title": "Statement",
      "description": "For consumers",
      "anyOf": [{
        "title": "Statement",
        "dataType": "constructor",
        "index": 0,
        "fields": [{ "dataType": "bytes", "title": "feedId" }, {
          "dataType": "integer",
          "title": "createdAt",
        }, {
          "title": "body",
          "description": "Body for rational statements, including prices",
          "anyOf": [{
            "title": "Rational",
            "dataType": "constructor",
            "index": 0,
            "fields": [{ "dataType": "integer", "title": "num" }, {
              "dataType": "integer",
              "title": "denom",
            }],
          }],
        }],
      }],
    },
  },
) as unknown as XRationalStatement;
