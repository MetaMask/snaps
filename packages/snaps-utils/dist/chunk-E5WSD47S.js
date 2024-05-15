"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkHVTYDKBOjs = require('./chunk-HVTYDKBO.js');


var _chunk6LOYTBS3js = require('./chunk-6LOYTBS3.js');



var _chunkCMOSYNZRjs = require('./chunk-CMOSYNZR.js');



var _chunkCQRPSEH3js = require('./chunk-CQRPSEH3.js');



var _chunkZT3KKTS2js = require('./chunk-ZT3KKTS2.js');


var _chunkT3YY4JIJjs = require('./chunk-T3YY4JIJ.js');


var _chunk2LBN5T56js = require('./chunk-2LBN5T56.js');

// src/manifest/validation.ts
var _keytree = require('@metamask/key-tree');







var _utils = require('@metamask/utils');


















var _superstruct = require('superstruct');
var FORBIDDEN_PURPOSES = [
  _chunkZT3KKTS2js.SIP_6_MAGIC_VALUE,
  _chunkZT3KKTS2js.STATE_ENCRYPTION_MAGIC_VALUE
];
var FORBIDDEN_COIN_TYPES = [60];
var FORBIDDEN_PATHS = FORBIDDEN_COIN_TYPES.map((coinType) => [
  "m",
  "44'",
  `${coinType}'`
]);
var Bip32PathStruct = _superstruct.refine.call(void 0, 
  _superstruct.array.call(void 0, _superstruct.string.call(void 0, )),
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
    if (path.slice(1).some((part) => !_keytree.isValidBIP32PathSegment.call(void 0, part))) {
      return "Path must be a valid BIP-32 derivation path array.";
    }
    if (FORBIDDEN_PURPOSES.includes(path[1])) {
      return `The purpose "${path[1]}" is not allowed for entropy derivation.`;
    }
    if (FORBIDDEN_PATHS.some(
      (forbiddenPath) => _chunkT3YY4JIJjs.isEqual.call(void 0, path.slice(0, forbiddenPath.length), forbiddenPath)
    )) {
      return `The path "${path.join(
        "/"
      )}" is not allowed for entropy derivation.`;
    }
    return true;
  }
);
var bip32entropy = (struct) => _superstruct.refine.call(void 0, struct, "BIP-32 entropy", (value) => {
  if (value.curve === "ed25519" && value.path.slice(1).some((part) => !part.endsWith("'"))) {
    return "Ed25519 does not support unhardened paths.";
  }
  return true;
});
var Bip32EntropyStruct = bip32entropy(
  _superstruct.type.call(void 0, {
    path: Bip32PathStruct,
    curve: _superstruct.enums.call(void 0, ["ed25519", "secp256k1"])
  })
);
var SnapGetBip32EntropyPermissionsStruct = _superstruct.size.call(void 0, 
  _superstruct.array.call(void 0, Bip32EntropyStruct),
  1,
  Infinity
);
var SemVerRangeStruct = _superstruct.refine.call(void 0, _superstruct.string.call(void 0, ), "SemVer range", (value) => {
  if (_utils.isValidSemVerRange.call(void 0, value)) {
    return true;
  }
  return "Expected a valid SemVer range.";
});
var SnapIdsStruct = _superstruct.refine.call(void 0, 
  _superstruct.record.call(void 0, _chunkHVTYDKBOjs.SnapIdStruct, _superstruct.object.call(void 0, { version: _superstruct.optional.call(void 0, SemVerRangeStruct) })),
  "SnapIds",
  (value) => {
    if (Object.keys(value).length === 0) {
      return false;
    }
    return true;
  }
);
var ChainIdsStruct = _superstruct.size.call(void 0, _superstruct.array.call(void 0, _chunk6LOYTBS3js.ChainIdStruct), 1, Infinity);
var LookupMatchersStruct = _superstruct.union.call(void 0, [
  _superstruct.object.call(void 0, {
    tlds: _superstruct.size.call(void 0, _superstruct.array.call(void 0, _superstruct.string.call(void 0, )), 1, Infinity)
  }),
  _superstruct.object.call(void 0, {
    schemes: _superstruct.size.call(void 0, _superstruct.array.call(void 0, _superstruct.string.call(void 0, )), 1, Infinity)
  }),
  _superstruct.object.call(void 0, {
    tlds: _superstruct.size.call(void 0, _superstruct.array.call(void 0, _superstruct.string.call(void 0, )), 1, Infinity),
    schemes: _superstruct.size.call(void 0, _superstruct.array.call(void 0, _superstruct.string.call(void 0, )), 1, Infinity)
  })
]);
var MINIMUM_REQUEST_TIMEOUT = _utils.inMilliseconds.call(void 0, 5, _utils.Duration.Second);
var MAXIMUM_REQUEST_TIMEOUT = _utils.inMilliseconds.call(void 0, 3, _utils.Duration.Minute);
var MaxRequestTimeStruct = _superstruct.size.call(void 0, 
  _superstruct.integer.call(void 0, ),
  MINIMUM_REQUEST_TIMEOUT,
  MAXIMUM_REQUEST_TIMEOUT
);
var HandlerCaveatsStruct = _superstruct.object.call(void 0, {
  maxRequestTime: _superstruct.optional.call(void 0, MaxRequestTimeStruct)
});
var EmptyObjectStruct = _superstruct.object.call(void 0, {});
var PermissionsStruct = _superstruct.type.call(void 0, {
  "endowment:cronjob": _superstruct.optional.call(void 0, 
    _superstruct.assign.call(void 0, 
      HandlerCaveatsStruct,
      _superstruct.object.call(void 0, { jobs: _chunk2LBN5T56js.CronjobSpecificationArrayStruct })
    )
  ),
  "endowment:ethereum-provider": _superstruct.optional.call(void 0, EmptyObjectStruct),
  "endowment:keyring": _superstruct.optional.call(void 0, 
    _superstruct.assign.call(void 0, HandlerCaveatsStruct, _chunkCQRPSEH3js.KeyringOriginsStruct)
  ),
  "endowment:lifecycle-hooks": _superstruct.optional.call(void 0, HandlerCaveatsStruct),
  "endowment:name-lookup": _superstruct.optional.call(void 0, 
    _superstruct.assign.call(void 0, 
      HandlerCaveatsStruct,
      _superstruct.object.call(void 0, {
        chains: _superstruct.optional.call(void 0, ChainIdsStruct),
        matchers: _superstruct.optional.call(void 0, LookupMatchersStruct)
      })
    )
  ),
  "endowment:network-access": _superstruct.optional.call(void 0, EmptyObjectStruct),
  "endowment:page-home": _superstruct.optional.call(void 0, HandlerCaveatsStruct),
  "endowment:rpc": _superstruct.optional.call(void 0, _superstruct.assign.call(void 0, HandlerCaveatsStruct, _chunkCQRPSEH3js.RpcOriginsStruct)),
  "endowment:signature-insight": _superstruct.optional.call(void 0, 
    _superstruct.assign.call(void 0, 
      HandlerCaveatsStruct,
      _superstruct.object.call(void 0, {
        allowSignatureOrigin: _superstruct.optional.call(void 0, _superstruct.boolean.call(void 0, ))
      })
    )
  ),
  "endowment:transaction-insight": _superstruct.optional.call(void 0, 
    _superstruct.assign.call(void 0, 
      HandlerCaveatsStruct,
      _superstruct.object.call(void 0, {
        allowTransactionOrigin: _superstruct.optional.call(void 0, _superstruct.boolean.call(void 0, ))
      })
    )
  ),
  "endowment:webassembly": _superstruct.optional.call(void 0, EmptyObjectStruct),
  snap_dialog: _superstruct.optional.call(void 0, EmptyObjectStruct),
  snap_manageState: _superstruct.optional.call(void 0, EmptyObjectStruct),
  snap_manageAccounts: _superstruct.optional.call(void 0, EmptyObjectStruct),
  snap_notify: _superstruct.optional.call(void 0, EmptyObjectStruct),
  snap_getBip32Entropy: _superstruct.optional.call(void 0, SnapGetBip32EntropyPermissionsStruct),
  snap_getBip32PublicKey: _superstruct.optional.call(void 0, SnapGetBip32EntropyPermissionsStruct),
  snap_getBip44Entropy: _superstruct.optional.call(void 0, 
    _superstruct.size.call(void 0, 
      _superstruct.array.call(void 0, _superstruct.object.call(void 0, { coinType: _superstruct.size.call(void 0, _superstruct.integer.call(void 0, ), 0, 2 ** 32 - 1) })),
      1,
      Infinity
    )
  ),
  snap_getEntropy: _superstruct.optional.call(void 0, EmptyObjectStruct),
  snap_getLocale: _superstruct.optional.call(void 0, EmptyObjectStruct),
  wallet_snap: _superstruct.optional.call(void 0, SnapIdsStruct)
});
var SnapAuxilaryFilesStruct = _superstruct.array.call(void 0, _superstruct.string.call(void 0, ));
var InitialConnectionsStruct = _superstruct.record.call(void 0, 
  _superstruct.intersection.call(void 0, [_superstruct.string.call(void 0, ), _chunkCMOSYNZRjs.uri.call(void 0, )]),
  _superstruct.object.call(void 0, {})
);
var SnapManifestStruct = _superstruct.object.call(void 0, {
  version: _utils.VersionStruct,
  description: _superstruct.size.call(void 0, _superstruct.string.call(void 0, ), 1, 280),
  proposedName: _superstruct.size.call(void 0, _superstruct.string.call(void 0, ), 1, 214),
  repository: _superstruct.optional.call(void 0, 
    _superstruct.object.call(void 0, {
      type: _superstruct.size.call(void 0, _superstruct.string.call(void 0, ), 1, Infinity),
      url: _superstruct.size.call(void 0, _superstruct.string.call(void 0, ), 1, Infinity)
    })
  ),
  source: _superstruct.object.call(void 0, {
    shasum: _utils.ChecksumStruct,
    location: _superstruct.object.call(void 0, {
      npm: _superstruct.object.call(void 0, {
        filePath: _superstruct.size.call(void 0, _superstruct.string.call(void 0, ), 1, Infinity),
        iconPath: _superstruct.optional.call(void 0, _superstruct.size.call(void 0, _superstruct.string.call(void 0, ), 1, Infinity)),
        packageName: _chunkCMOSYNZRjs.NameStruct,
        registry: _superstruct.union.call(void 0, [
          _superstruct.literal.call(void 0, "https://registry.npmjs.org"),
          _superstruct.literal.call(void 0, "https://registry.npmjs.org/")
        ])
      })
    }),
    files: _superstruct.optional.call(void 0, SnapAuxilaryFilesStruct),
    locales: _superstruct.optional.call(void 0, SnapAuxilaryFilesStruct)
  }),
  initialConnections: _superstruct.optional.call(void 0, InitialConnectionsStruct),
  initialPermissions: PermissionsStruct,
  manifestVersion: _superstruct.literal.call(void 0, "0.1"),
  $schema: _superstruct.optional.call(void 0, _superstruct.string.call(void 0, ))
  // enables JSON-Schema linting in VSC and other IDEs
});
function isSnapManifest(value) {
  return _superstruct.is.call(void 0, value, SnapManifestStruct);
}
function assertIsSnapManifest(value) {
  _utils.assertStruct.call(void 0, 
    value,
    SnapManifestStruct,
    `"${"snap.manifest.json" /* Manifest */}" is invalid`
  );
}
function createSnapManifest(value) {
  return _superstruct.create.call(void 0, value, SnapManifestStruct);
}























exports.FORBIDDEN_COIN_TYPES = FORBIDDEN_COIN_TYPES; exports.Bip32PathStruct = Bip32PathStruct; exports.bip32entropy = bip32entropy; exports.Bip32EntropyStruct = Bip32EntropyStruct; exports.SnapGetBip32EntropyPermissionsStruct = SnapGetBip32EntropyPermissionsStruct; exports.SemVerRangeStruct = SemVerRangeStruct; exports.SnapIdsStruct = SnapIdsStruct; exports.ChainIdsStruct = ChainIdsStruct; exports.LookupMatchersStruct = LookupMatchersStruct; exports.MINIMUM_REQUEST_TIMEOUT = MINIMUM_REQUEST_TIMEOUT; exports.MAXIMUM_REQUEST_TIMEOUT = MAXIMUM_REQUEST_TIMEOUT; exports.MaxRequestTimeStruct = MaxRequestTimeStruct; exports.HandlerCaveatsStruct = HandlerCaveatsStruct; exports.EmptyObjectStruct = EmptyObjectStruct; exports.PermissionsStruct = PermissionsStruct; exports.SnapAuxilaryFilesStruct = SnapAuxilaryFilesStruct; exports.InitialConnectionsStruct = InitialConnectionsStruct; exports.SnapManifestStruct = SnapManifestStruct; exports.isSnapManifest = isSnapManifest; exports.assertIsSnapManifest = assertIsSnapManifest; exports.createSnapManifest = createSnapManifest;
//# sourceMappingURL=chunk-E5WSD47S.js.map