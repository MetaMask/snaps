"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkE27BGHCRjs = require('./chunk-E27BGHCR.js');


var _chunkDLVPMPRZjs = require('./chunk-DLVPMPRZ.js');


var _chunkPS6OEQXLjs = require('./chunk-PS6OEQXL.js');


var _chunkUCWANXBZjs = require('./chunk-UCWANXBZ.js');


var _chunkU6TJQLNVjs = require('./chunk-U6TJQLNV.js');


var _chunkOI33OL7Kjs = require('./chunk-OI33OL7K.js');


var _chunk4LSOS7SMjs = require('./chunk-4LSOS7SM.js');


var _chunk3UAWEHMFjs = require('./chunk-3UAWEHMF.js');


var _chunkEOXTZF5Ujs = require('./chunk-EOXTZF5U.js');


var _chunk7CV677MMjs = require('./chunk-7CV677MM.js');


var _chunkNWT2EXFDjs = require('./chunk-NWT2EXFD.js');

// src/permitted/handlers.ts
var methodHandlers = {
  wallet_getAllSnaps: _chunk4LSOS7SMjs.getAllSnapsHandler,
  wallet_getSnaps: _chunkNWT2EXFDjs.getSnapsHandler,
  wallet_requestSnaps: _chunkPS6OEQXLjs.requestSnapsHandler,
  wallet_invokeSnap: _chunkDLVPMPRZjs.invokeSnapSugarHandler,
  wallet_invokeKeyring: _chunkE27BGHCRjs.invokeKeyringHandler,
  snap_getClientStatus: _chunk3UAWEHMFjs.getClientStatusHandler,
  snap_getFile: _chunkEOXTZF5Ujs.getFileHandler,
  snap_createInterface: _chunkOI33OL7Kjs.createInterfaceHandler,
  snap_updateInterface: _chunkU6TJQLNVjs.updateInterfaceHandler,
  snap_getInterfaceState: _chunk7CV677MMjs.getInterfaceStateHandler,
  snap_resolveInterface: _chunkUCWANXBZjs.resolveInterfaceHandler
};
var handlers = Object.values(methodHandlers);




exports.methodHandlers = methodHandlers; exports.handlers = handlers;
//# sourceMappingURL=chunk-UF3UJTY3.js.map