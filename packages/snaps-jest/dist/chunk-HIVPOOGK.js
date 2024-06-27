"use strict";Object.defineProperty(exports, "__esModule", {value: true});


var _chunkXKJHFUHEjs = require('./chunk-XKJHFUHE.js');

// src/internals/simulation/options.ts








var _superstruct = require('@metamask/superstruct');
var _utils = require('@metamask/utils');
var SimulationOptionsStruct = _superstruct.object.call(void 0, {
  secretRecoveryPhrase: _superstruct.defaulted.call(void 0, _superstruct.optional.call(void 0, _superstruct.string.call(void 0, )), _chunkXKJHFUHEjs.DEFAULT_SRP),
  locale: _superstruct.defaulted.call(void 0, _superstruct.optional.call(void 0, _superstruct.string.call(void 0, )), _chunkXKJHFUHEjs.DEFAULT_LOCALE),
  state: _superstruct.defaulted.call(void 0, _superstruct.optional.call(void 0, _superstruct.nullable.call(void 0, _superstruct.record.call(void 0, _superstruct.string.call(void 0, ), _utils.JsonStruct))), null),
  unencryptedState: _superstruct.defaulted.call(void 0, 
    _superstruct.optional.call(void 0, _superstruct.nullable.call(void 0, _superstruct.record.call(void 0, _superstruct.string.call(void 0, ), _utils.JsonStruct))),
    null
  )
});
function getOptions(options) {
  return _superstruct.create.call(void 0, 
    options,
    SimulationOptionsStruct
  );
}



exports.getOptions = getOptions;
//# sourceMappingURL=chunk-HIVPOOGK.js.map