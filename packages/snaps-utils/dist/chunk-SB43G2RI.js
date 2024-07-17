"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk5I5WPAVDjs = require('./chunk-5I5WPAVD.js');


var _chunkRD6BN2TQjs = require('./chunk-RD6BN2TQ.js');


var _chunkB5GNTDE2js = require('./chunk-B5GNTDE2.js');


var _chunkW7KRIAIXjs = require('./chunk-W7KRIAIX.js');

// src/validation.ts
async function validateFetchedSnap(files) {
  _chunk5I5WPAVDjs.assertIsSnapManifest.call(void 0, files.manifest.result);
  await _chunkRD6BN2TQjs.validateSnapShasum.call(void 0, files);
  _chunkB5GNTDE2js.validateSnapManifestLocalizations.call(void 0, 
    files.manifest.result,
    files.localizationFiles.map((file) => file.result)
  );
  if (files.svgIcon) {
    _chunkW7KRIAIXjs.assertIsSnapIcon.call(void 0, files.svgIcon);
  }
}



exports.validateFetchedSnap = validateFetchedSnap;
//# sourceMappingURL=chunk-SB43G2RI.js.map