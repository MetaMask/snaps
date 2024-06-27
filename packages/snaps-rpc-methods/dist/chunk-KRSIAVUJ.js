"use strict";Object.defineProperty(exports, "__esModule", {value: true});



var _chunkT56DKVFSjs = require('./chunk-T56DKVFS.js');


var _chunkGE5XFDUEjs = require('./chunk-GE5XFDUE.js');




var _chunkPXU6PORAjs = require('./chunk-PXU6PORA.js');


var _chunkYOHE52XBjs = require('./chunk-YOHE52XB.js');




var _chunkYT2Q3W5Cjs = require('./chunk-YT2Q3W5C.js');




var _chunkYZMFLB67js = require('./chunk-YZMFLB67.js');




var _chunk3WKIKYUHjs = require('./chunk-3WKIKYUH.js');




var _chunkFCVWU5XHjs = require('./chunk-FCVWU5XH.js');


var _chunkQ27K2I6Zjs = require('./chunk-Q27K2I6Z.js');




var _chunk7HVABE5Rjs = require('./chunk-7HVABE5R.js');


var _chunkB3NIHNXWjs = require('./chunk-B3NIHNXW.js');


var _chunk2SFH57UVjs = require('./chunk-2SFH57UV.js');

// src/endowments/index.ts
var _snapsutils = require('@metamask/snaps-utils');
var endowmentPermissionBuilders = {
  [_chunkYOHE52XBjs.networkAccessEndowmentBuilder.targetName]: _chunkYOHE52XBjs.networkAccessEndowmentBuilder,
  [_chunk3WKIKYUHjs.transactionInsightEndowmentBuilder.targetName]: _chunk3WKIKYUHjs.transactionInsightEndowmentBuilder,
  [_chunk7HVABE5Rjs.cronjobEndowmentBuilder.targetName]: _chunk7HVABE5Rjs.cronjobEndowmentBuilder,
  [_chunkB3NIHNXWjs.ethereumProviderEndowmentBuilder.targetName]: _chunkB3NIHNXWjs.ethereumProviderEndowmentBuilder,
  [_chunkYT2Q3W5Cjs.rpcEndowmentBuilder.targetName]: _chunkYT2Q3W5Cjs.rpcEndowmentBuilder,
  [_chunkQ27K2I6Zjs.webAssemblyEndowmentBuilder.targetName]: _chunkQ27K2I6Zjs.webAssemblyEndowmentBuilder,
  [_chunkPXU6PORAjs.nameLookupEndowmentBuilder.targetName]: _chunkPXU6PORAjs.nameLookupEndowmentBuilder,
  [_chunkGE5XFDUEjs.lifecycleHooksEndowmentBuilder.targetName]: _chunkGE5XFDUEjs.lifecycleHooksEndowmentBuilder,
  [_chunkT56DKVFSjs.keyringEndowmentBuilder.targetName]: _chunkT56DKVFSjs.keyringEndowmentBuilder,
  [_chunk2SFH57UVjs.homePageEndowmentBuilder.targetName]: _chunk2SFH57UVjs.homePageEndowmentBuilder,
  [_chunkYZMFLB67js.signatureInsightEndowmentBuilder.targetName]: _chunkYZMFLB67js.signatureInsightEndowmentBuilder
};
var endowmentCaveatSpecifications = {
  ..._chunk7HVABE5Rjs.cronjobCaveatSpecifications,
  ..._chunk3WKIKYUHjs.transactionInsightCaveatSpecifications,
  ..._chunkYT2Q3W5Cjs.rpcCaveatSpecifications,
  ..._chunkPXU6PORAjs.nameLookupCaveatSpecifications,
  ..._chunkT56DKVFSjs.keyringCaveatSpecifications,
  ..._chunkYZMFLB67js.signatureInsightCaveatSpecifications,
  ..._chunkFCVWU5XHjs.maxRequestTimeCaveatSpecifications
};
var endowmentCaveatMappers = {
  [_chunk7HVABE5Rjs.cronjobEndowmentBuilder.targetName]: _chunkFCVWU5XHjs.createMaxRequestTimeMapper.call(void 0, 
    _chunk7HVABE5Rjs.getCronjobCaveatMapper
  ),
  [_chunk3WKIKYUHjs.transactionInsightEndowmentBuilder.targetName]: _chunkFCVWU5XHjs.createMaxRequestTimeMapper.call(void 0, 
    _chunk3WKIKYUHjs.getTransactionInsightCaveatMapper
  ),
  [_chunkYT2Q3W5Cjs.rpcEndowmentBuilder.targetName]: _chunkFCVWU5XHjs.createMaxRequestTimeMapper.call(void 0, _chunkYT2Q3W5Cjs.getRpcCaveatMapper),
  [_chunkPXU6PORAjs.nameLookupEndowmentBuilder.targetName]: _chunkFCVWU5XHjs.createMaxRequestTimeMapper.call(void 0, 
    _chunkPXU6PORAjs.getNameLookupCaveatMapper
  ),
  [_chunkT56DKVFSjs.keyringEndowmentBuilder.targetName]: _chunkFCVWU5XHjs.createMaxRequestTimeMapper.call(void 0, 
    _chunkT56DKVFSjs.getKeyringCaveatMapper
  ),
  [_chunkYZMFLB67js.signatureInsightEndowmentBuilder.targetName]: _chunkFCVWU5XHjs.createMaxRequestTimeMapper.call(void 0, 
    _chunkYZMFLB67js.getSignatureInsightCaveatMapper
  ),
  [_chunkGE5XFDUEjs.lifecycleHooksEndowmentBuilder.targetName]: _chunkFCVWU5XHjs.getMaxRequestTimeCaveatMapper,
  [_chunk2SFH57UVjs.homePageEndowmentBuilder.targetName]: _chunkFCVWU5XHjs.getMaxRequestTimeCaveatMapper
};
var handlerEndowments = {
  [_snapsutils.HandlerType.OnRpcRequest]: _chunkYT2Q3W5Cjs.rpcEndowmentBuilder.targetName,
  [_snapsutils.HandlerType.OnTransaction]: _chunk3WKIKYUHjs.transactionInsightEndowmentBuilder.targetName,
  [_snapsutils.HandlerType.OnCronjob]: _chunk7HVABE5Rjs.cronjobEndowmentBuilder.targetName,
  [_snapsutils.HandlerType.OnNameLookup]: _chunkPXU6PORAjs.nameLookupEndowmentBuilder.targetName,
  [_snapsutils.HandlerType.OnInstall]: _chunkGE5XFDUEjs.lifecycleHooksEndowmentBuilder.targetName,
  [_snapsutils.HandlerType.OnUpdate]: _chunkGE5XFDUEjs.lifecycleHooksEndowmentBuilder.targetName,
  [_snapsutils.HandlerType.OnKeyringRequest]: _chunkT56DKVFSjs.keyringEndowmentBuilder.targetName,
  [_snapsutils.HandlerType.OnHomePage]: _chunk2SFH57UVjs.homePageEndowmentBuilder.targetName,
  [_snapsutils.HandlerType.OnSignature]: _chunkYZMFLB67js.signatureInsightEndowmentBuilder.targetName,
  [_snapsutils.HandlerType.OnUserInput]: null
};






exports.endowmentPermissionBuilders = endowmentPermissionBuilders; exports.endowmentCaveatSpecifications = endowmentCaveatSpecifications; exports.endowmentCaveatMappers = endowmentCaveatMappers; exports.handlerEndowments = handlerEndowments;
//# sourceMappingURL=chunk-KRSIAVUJ.js.map