"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/options.ts








var _superstruct = require('@metamask/superstruct');
var SnapsEnvironmentOptionsStruct = _superstruct.type.call(void 0, {
  server: _superstruct.defaulted.call(void 0, 
    _superstruct.object.call(void 0, {
      enabled: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), true),
      port: _superstruct.defaulted.call(void 0, _superstruct.number.call(void 0, ), 0),
      root: _superstruct.defaulted.call(void 0, _superstruct.string.call(void 0, ), process.cwd())
    }),
    {}
  )
});
function getOptions(testEnvironmentOptions) {
  return _superstruct.create.call(void 0, testEnvironmentOptions, SnapsEnvironmentOptionsStruct);
}



exports.getOptions = getOptions;
//# sourceMappingURL=chunk-2RJYSYUB.js.map