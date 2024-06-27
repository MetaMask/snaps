"use strict";Object.defineProperty(exports, "__esModule", {value: true});


var _chunkI3G6S6MJjs = require('./chunk-I3G6S6MJ.js');



var _chunk756OQVOCjs = require('./chunk-756OQVOC.js');



var _chunkH6X3CWWQjs = require('./chunk-H6X3CWWQ.js');


var _chunk4PWFZPJCjs = require('./chunk-4PWFZPJC.js');


var _chunkVUA6ICJOjs = require('./chunk-VUA6ICJO.js');


var _chunkIE6EHYEGjs = require('./chunk-IE6EHYEG.js');


var _chunkFFHVA6PPjs = require('./chunk-FFHVA6PP.js');

// src/restricted/caveats/index.ts
var caveatSpecifications = {
  ..._chunk756OQVOCjs.PermittedDerivationPathsCaveatSpecification,
  ..._chunkI3G6S6MJjs.PermittedCoinTypesCaveatSpecification,
  ..._chunkH6X3CWWQjs.SnapIdsCaveatSpecification
};
var caveatMappers = {
  [_chunkIE6EHYEGjs.getBip32EntropyBuilder.targetName]: _chunk756OQVOCjs.permittedDerivationPathsCaveatMapper,
  [_chunk4PWFZPJCjs.getBip32PublicKeyBuilder.targetName]: _chunk756OQVOCjs.permittedDerivationPathsCaveatMapper,
  [_chunkVUA6ICJOjs.getBip44EntropyBuilder.targetName]: _chunkI3G6S6MJjs.permittedCoinTypesCaveatMapper,
  [_chunkFFHVA6PPjs.invokeSnapBuilder.targetName]: _chunkH6X3CWWQjs.snapIdsCaveatMapper
};




exports.caveatSpecifications = caveatSpecifications; exports.caveatMappers = caveatMappers;
//# sourceMappingURL=chunk-6VJVURH5.js.map