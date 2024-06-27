"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkVUZR7US3js = require('./chunk-VUZR7US3.js');


var _chunk6VJVURH5js = require('./chunk-6VJVURH5.js');


var _chunk33MTKZ4Hjs = require('./chunk-33MTKZ4H.js');



var _chunkKRSIAVUJjs = require('./chunk-KRSIAVUJ.js');

// src/permissions.ts
var _utils = require('@metamask/utils');
function processSnapPermissions(initialPermissions) {
  return Object.fromEntries(
    Object.entries(initialPermissions).map(([initialPermission, value]) => {
      if (_utils.hasProperty.call(void 0, _chunk6VJVURH5js.caveatMappers, initialPermission)) {
        return [initialPermission, _chunk6VJVURH5js.caveatMappers[initialPermission](value)];
      } else if (_utils.hasProperty.call(void 0, _chunkKRSIAVUJjs.endowmentCaveatMappers, initialPermission)) {
        return [
          initialPermission,
          _chunkKRSIAVUJjs.endowmentCaveatMappers[initialPermission](value)
        ];
      }
      return [
        initialPermission,
        value
      ];
    })
  );
}
var buildSnapEndowmentSpecifications = (excludedEndowments) => Object.values(_chunkKRSIAVUJjs.endowmentPermissionBuilders).reduce((allSpecifications, { targetName, specificationBuilder }) => {
  if (!excludedEndowments.includes(targetName)) {
    allSpecifications[targetName] = specificationBuilder({});
  }
  return allSpecifications;
}, {});
var buildSnapRestrictedMethodSpecifications = (excludedPermissions, hooks) => Object.values(_chunkVUZR7US3js.restrictedMethodPermissionBuilders).reduce((specifications, { targetName, specificationBuilder, methodHooks }) => {
  if (!excludedPermissions.includes(targetName)) {
    specifications[targetName] = specificationBuilder({
      // @ts-expect-error The selectHooks type is wonky
      methodHooks: _chunk33MTKZ4Hjs.selectHooks.call(void 0, 
        hooks,
        methodHooks
      )
    });
  }
  return specifications;
}, {});





exports.processSnapPermissions = processSnapPermissions; exports.buildSnapEndowmentSpecifications = buildSnapEndowmentSpecifications; exports.buildSnapRestrictedMethodSpecifications = buildSnapRestrictedMethodSpecifications;
//# sourceMappingURL=chunk-4EUDIFW2.js.map