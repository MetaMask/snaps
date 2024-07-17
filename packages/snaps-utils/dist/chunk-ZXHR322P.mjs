import {
  SnapIdStruct
} from "./chunk-H35ZUVQT.mjs";
import {
  mergeStructs
} from "./chunk-FLSK6ISS.mjs";
import {
  NameStruct,
  uri
} from "./chunk-AJNKQYKP.mjs";
import {
  ChainIdStruct
} from "./chunk-LHQP7CUJ.mjs";
import {
  KeyringOriginsStruct,
  RpcOriginsStruct
} from "./chunk-ANYNWSCA.mjs";
import {
  SIP_6_MAGIC_VALUE,
  STATE_ENCRYPTION_MAGIC_VALUE
} from "./chunk-AS5P6JRP.mjs";
import {
  isEqual
} from "./chunk-P252LKUT.mjs";
import {
  CronjobSpecificationArrayStruct
} from "./chunk-YJHQZFR4.mjs";

// src/manifest/validation.ts
import { isValidBIP32PathSegment } from "@metamask/key-tree";
import {
  array,
  boolean,
  create,
  enums,
  integer,
  is,
  literal,
  object,
  optional,
  refine,
  record,
  size,
  string,
  type,
  union,
  intersection
} from "@metamask/superstruct";
import {
  assertStruct,
  ChecksumStruct,
  VersionStruct,
  isValidSemVerRange,
  inMilliseconds,
  Duration
} from "@metamask/utils";
var FORBIDDEN_PURPOSES = [
  SIP_6_MAGIC_VALUE,
  STATE_ENCRYPTION_MAGIC_VALUE
];
var FORBIDDEN_COIN_TYPES = [60];
var FORBIDDEN_PATHS = FORBIDDEN_COIN_TYPES.map((coinType) => [
  "m",
  "44'",
  `${coinType}'`
]);
var Bip32PathStruct = refine(
  array(string()),
  "BIP-32 path",
  (path) => {
    if (path.length === 0) {
      return "Path must be a non-empty BIP-32 derivation path array";
    }
    if (path[0] !== "m") {
      return 'Path must start with "m".';
    }
    if (path.length < 3) {
      return "Paths must have a length of at least three.";
    }
    if (path.slice(1).some((part) => !isValidBIP32PathSegment(part))) {
      return "Path must be a valid BIP-32 derivation path array.";
    }
    if (FORBIDDEN_PURPOSES.includes(path[1])) {
      return `The purpose "${path[1]}" is not allowed for entropy derivation.`;
    }
    if (FORBIDDEN_PATHS.some(
      (forbiddenPath) => isEqual(path.slice(0, forbiddenPath.length), forbiddenPath)
    )) {
      return `The path "${path.join(
        "/"
      )}" is not allowed for entropy derivation.`;
    }
    return true;
  }
);
var bip32entropy = (struct) => refine(struct, "BIP-32 entropy", (value) => {
  if (value.curve === "ed25519" && value.path.slice(1).some((part) => !part.endsWith("'"))) {
    return "Ed25519 does not support unhardened paths.";
  }
  return true;
});
var CurveStruct = enums([
  "ed25519",
  "secp256k1",
  "ed25519Bip32"
]);
var Bip32EntropyStruct = bip32entropy(
  type({
    path: Bip32PathStruct,
    curve: CurveStruct
  })
);
var SnapGetBip32EntropyPermissionsStruct = size(
  array(Bip32EntropyStruct),
  1,
  Infinity
);
var SemVerRangeStruct = refine(string(), "SemVer range", (value) => {
  if (isValidSemVerRange(value)) {
    return true;
  }
  return "Expected a valid SemVer range.";
});
var SnapIdsStruct = refine(
  record(SnapIdStruct, object({ version: optional(SemVerRangeStruct) })),
  "SnapIds",
  (value) => {
    if (Object.keys(value).length === 0) {
      return false;
    }
    return true;
  }
);
var ChainIdsStruct = size(array(ChainIdStruct), 1, Infinity);
var LookupMatchersStruct = union([
  object({
    tlds: size(array(string()), 1, Infinity)
  }),
  object({
    schemes: size(array(string()), 1, Infinity)
  }),
  object({
    tlds: size(array(string()), 1, Infinity),
    schemes: size(array(string()), 1, Infinity)
  })
]);
var MINIMUM_REQUEST_TIMEOUT = inMilliseconds(5, Duration.Second);
var MAXIMUM_REQUEST_TIMEOUT = inMilliseconds(3, Duration.Minute);
var MaxRequestTimeStruct = size(
  integer(),
  MINIMUM_REQUEST_TIMEOUT,
  MAXIMUM_REQUEST_TIMEOUT
);
var HandlerCaveatsStruct = object({
  maxRequestTime: optional(MaxRequestTimeStruct)
});
var EmptyObjectStruct = object({});
var PermissionsStruct = type({
  "endowment:cronjob": optional(
    mergeStructs(
      HandlerCaveatsStruct,
      object({ jobs: CronjobSpecificationArrayStruct })
    )
  ),
  "endowment:ethereum-provider": optional(EmptyObjectStruct),
  "endowment:keyring": optional(
    mergeStructs(HandlerCaveatsStruct, KeyringOriginsStruct)
  ),
  "endowment:lifecycle-hooks": optional(HandlerCaveatsStruct),
  "endowment:name-lookup": optional(
    mergeStructs(
      HandlerCaveatsStruct,
      object({
        chains: optional(ChainIdsStruct),
        matchers: optional(LookupMatchersStruct)
      })
    )
  ),
  "endowment:network-access": optional(EmptyObjectStruct),
  "endowment:page-home": optional(HandlerCaveatsStruct),
  "endowment:rpc": optional(
    mergeStructs(HandlerCaveatsStruct, RpcOriginsStruct)
  ),
  "endowment:signature-insight": optional(
    mergeStructs(
      HandlerCaveatsStruct,
      object({
        allowSignatureOrigin: optional(boolean())
      })
    )
  ),
  "endowment:transaction-insight": optional(
    mergeStructs(
      HandlerCaveatsStruct,
      object({
        allowTransactionOrigin: optional(boolean())
      })
    )
  ),
  "endowment:webassembly": optional(EmptyObjectStruct),
  snap_dialog: optional(EmptyObjectStruct),
  snap_manageState: optional(EmptyObjectStruct),
  snap_manageAccounts: optional(EmptyObjectStruct),
  snap_notify: optional(EmptyObjectStruct),
  snap_getBip32Entropy: optional(SnapGetBip32EntropyPermissionsStruct),
  snap_getBip32PublicKey: optional(SnapGetBip32EntropyPermissionsStruct),
  snap_getBip44Entropy: optional(
    size(
      array(object({ coinType: size(integer(), 0, 2 ** 32 - 1) })),
      1,
      Infinity
    )
  ),
  snap_getEntropy: optional(EmptyObjectStruct),
  snap_getLocale: optional(EmptyObjectStruct),
  wallet_snap: optional(SnapIdsStruct)
});
var SnapAuxilaryFilesStruct = array(string());
var InitialConnectionsStruct = record(
  intersection([string(), uri()]),
  object({})
);
var SnapManifestStruct = object({
  version: VersionStruct,
  description: size(string(), 1, 280),
  proposedName: size(string(), 1, 214),
  repository: optional(
    object({
      type: size(string(), 1, Infinity),
      url: size(string(), 1, Infinity)
    })
  ),
  source: object({
    shasum: ChecksumStruct,
    location: object({
      npm: object({
        filePath: size(string(), 1, Infinity),
        iconPath: optional(size(string(), 1, Infinity)),
        packageName: NameStruct,
        registry: union([
          literal("https://registry.npmjs.org"),
          literal("https://registry.npmjs.org/")
        ])
      })
    }),
    files: optional(SnapAuxilaryFilesStruct),
    locales: optional(SnapAuxilaryFilesStruct)
  }),
  initialConnections: optional(InitialConnectionsStruct),
  initialPermissions: PermissionsStruct,
  manifestVersion: literal("0.1"),
  $schema: optional(string())
  // enables JSON-Schema linting in VSC and other IDEs
});
function isSnapManifest(value) {
  return is(value, SnapManifestStruct);
}
function assertIsSnapManifest(value) {
  assertStruct(
    value,
    SnapManifestStruct,
    `"${"snap.manifest.json" /* Manifest */}" is invalid`
  );
}
function createSnapManifest(value) {
  return create(value, SnapManifestStruct);
}

export {
  FORBIDDEN_COIN_TYPES,
  Bip32PathStruct,
  bip32entropy,
  CurveStruct,
  Bip32EntropyStruct,
  SnapGetBip32EntropyPermissionsStruct,
  SemVerRangeStruct,
  SnapIdsStruct,
  ChainIdsStruct,
  LookupMatchersStruct,
  MINIMUM_REQUEST_TIMEOUT,
  MAXIMUM_REQUEST_TIMEOUT,
  MaxRequestTimeStruct,
  HandlerCaveatsStruct,
  EmptyObjectStruct,
  PermissionsStruct,
  SnapAuxilaryFilesStruct,
  InitialConnectionsStruct,
  SnapManifestStruct,
  isSnapManifest,
  assertIsSnapManifest,
  createSnapManifest
};
//# sourceMappingURL=chunk-ZXHR322P.mjs.map