import "./chunk-A3RRMELT.mjs";
import {
  EXPECTED_SNAP_FILES,
  SnapFileNameFromKey,
  checkManifest,
  fixManifest,
  getSnapFilePaths,
  getSnapFiles,
  getSnapIcon,
  getSnapSourceCode,
  getWritableManifest,
  validateNpmSnap,
  validateNpmSnapManifest
} from "./chunk-2OJY3BXD.mjs";
import {
  PostProcessWarning,
  postProcessBundle
} from "./chunk-QYPLUMB7.mjs";
import "./chunk-7MTAHOWC.mjs";
import {
  getJsxChildren,
  getJsxElementFromComponent,
  getTextChildren,
  getTotalTextLength,
  hasChildren,
  validateJsxLinks,
  validateTextLinks,
  walkJsx
} from "./chunk-MJGSG5N2.mjs";
import {
  SnapsStructError,
  arrayToGenerator,
  createFromStruct,
  createUnion,
  getError,
  getStructErrorMessage,
  getStructErrorPrefix,
  getStructFailureMessage,
  getStructFromPath,
  getUnionStructNames,
  named,
  validateUnion
} from "./chunk-GTAYOKI4.mjs";
import {
  indent
} from "./chunk-IV3FSWZ7.mjs";
import {
  validateFetchedSnap
} from "./chunk-PBSBESZZ.mjs";
import {
  DEFAULT_REQUESTED_SNAP_VERSION,
  getTargetVersion,
  resolveVersionRange
} from "./chunk-UMZNVWEM.mjs";
import "./chunk-JI5NQ2C3.mjs";
import {
  Bip32EntropyStruct,
  Bip32PathStruct,
  ChainIdsStruct,
  EmptyObjectStruct,
  FORBIDDEN_COIN_TYPES,
  HandlerCaveatsStruct,
  InitialConnectionsStruct,
  LookupMatchersStruct,
  MAXIMUM_REQUEST_TIMEOUT,
  MINIMUM_REQUEST_TIMEOUT,
  MaxRequestTimeStruct,
  PermissionsStruct,
  SemVerRangeStruct,
  SnapAuxilaryFilesStruct,
  SnapGetBip32EntropyPermissionsStruct,
  SnapIdsStruct,
  SnapManifestStruct,
  assertIsSnapManifest,
  bip32entropy,
  createSnapManifest,
  isSnapManifest
} from "./chunk-HTS6HGUU.mjs";
import {
  normalizeRelative
} from "./chunk-UW74NLTC.mjs";
import {
  BaseSnapIdStruct,
  HttpSnapIdStruct,
  LOCALHOST_HOSTNAMES,
  LocalSnapIdStruct,
  NpmSnapIdStruct,
  PROPOSED_NAME_REGEX,
  ProgrammaticallyFixableSnapError,
  SnapIdStruct,
  SnapStatus,
  SnapStatusEvents,
  assertIsValidSnapId,
  getSnapChecksum,
  getSnapPrefix,
  isCaipChainId,
  isSnapPermitted,
  stripSnapPrefix,
  validateSnapShasum,
  verifyRequestedSnapPermissions
} from "./chunk-2M6G46W6.mjs";
import "./chunk-MNCFAD4E.mjs";
import {
  logError,
  logInfo,
  logWarning,
  snapsLogger
} from "./chunk-SRMDDOVO.mjs";
import {
  ACCOUNT_ADDRESS_REGEX,
  ACCOUNT_ID_REGEX,
  AccountAddressStruct,
  AccountIdArrayStruct,
  AccountIdStruct,
  CHAIN_ID_REGEX,
  ChainIdStringStruct,
  ChainIdStruct,
  ChainStruct,
  LimitedString,
  NamespaceIdStruct,
  NamespaceStruct,
  isAccountId,
  isAccountIdArray,
  isChainId,
  isNamespace,
  isNamespaceId,
  parseAccountId,
  parseChainId
} from "./chunk-EXUEHPZ4.mjs";
import {
  NameStruct,
  NpmSnapFileNames,
  NpmSnapPackageJsonStruct,
  SNAP_STREAM_NAMES,
  SnapIdPrefixes,
  SnapValidationFailureReason,
  WALLET_SNAP_PERMISSION_KEY,
  assertIsNpmSnapPackageJson,
  isNpmSnapPackageJson,
  isValidUrl,
  uri
} from "./chunk-T6FWIDA6.mjs";
import {
  AddressResolutionResponseStruct,
  AddressResolutionStruct,
  DomainResolutionResponseStruct,
  DomainResolutionStruct,
  OnHomePageResponseStruct,
  OnHomePageResponseWithContentStruct,
  OnHomePageResponseWithIdStruct,
  OnNameLookupResponseStruct,
  OnSignatureResponseStruct,
  OnTransactionResponseStruct,
  OnTransactionResponseWithContentStruct,
  OnTransactionResponseWithIdStruct,
  OnTransactionSeverityResponseStruct,
  SNAP_EXPORTS
} from "./chunk-L4DKSTK6.mjs";
import {
  createWindow
} from "./chunk-PJMEJVOB.mjs";
import {
  KeyringOriginsStruct,
  RpcOriginsStruct,
  assertIsJsonRpcSuccess,
  assertIsKeyringOrigins,
  assertIsRpcOrigins,
  isOriginAllowed
} from "./chunk-DKDGMZFU.mjs";
import {
  LOCALIZABLE_FIELDS,
  LocalizationFileStruct,
  TRANSLATION_REGEX,
  getLocalizationFile,
  getLocalizedSnapManifest,
  getValidatedLocalizationFiles,
  translate,
  validateSnapManifestLocalizations
} from "./chunk-WZ457PEQ.mjs";
import {
  SNAPS_DERIVATION_PATHS,
  getSlip44ProtocolName,
  getSnapDerivationPathName
} from "./chunk-PBXAWRWW.mjs";
import {
  SIP_6_MAGIC_VALUE,
  STATE_ENCRYPTION_MAGIC_VALUE
} from "./chunk-AS5P6JRP.mjs";
import {
  SNAP_ERROR_WRAPPER_CODE,
  SNAP_ERROR_WRAPPER_MESSAGE,
  WrappedSnapError,
  isSerializedSnapError,
  isSnapError,
  isWrappedSnapError,
  unwrapError
} from "./chunk-VWGXNUMD.mjs";
import {
  ALL_APIS,
  generateMockEndowments,
  isConstructor
} from "./chunk-63OXILAY.mjs";
import {
  DEFAULT_ENDOWMENTS
} from "./chunk-BGSO2GQC.mjs";
import {
  SnapEvalError,
  evalBundle
} from "./chunk-PWLXPALG.mjs";
import {
  getOutfilePath,
  isDirectory,
  isFile,
  readJsonFile,
  useTemporaryFile,
  validateDirPath,
  validateFilePath,
  validateOutfileName
} from "./chunk-LBCPJOAV.mjs";
import "./chunk-RAZ7XG4Z.mjs";
import {
  readVirtualFile,
  writeVirtualFile
} from "./chunk-IGMAXVPP.mjs";
import "./chunk-HYF7Q6VY.mjs";
import {
  getJsonSizeUnsafe,
  parseJson
} from "./chunk-UNNEBOL4.mjs";
import {
  HandlerType,
  SNAP_EXPORT_NAMES
} from "./chunk-5R7UF7KM.mjs";
import {
  isEqual
} from "./chunk-P252LKUT.mjs";
import {
  encodeAuxiliaryFile
} from "./chunk-KMLVVVK3.mjs";
import {
  decodeBase64,
  encodeBase64
} from "./chunk-FOWIC2SO.mjs";
import {
  SnapCaveatType
} from "./chunk-7LG4D4XA.mjs";
import {
  checksum,
  checksumFiles
} from "./chunk-HJRCBSNA.mjs";
import {
  getBytes
} from "./chunk-6YRUDGNL.mjs";
import {
  VirtualFile
} from "./chunk-ZJRWU4AJ.mjs";
import {
  CronExpressionStruct,
  CronjobRpcRequestStruct,
  CronjobSpecificationArrayStruct,
  CronjobSpecificationStruct,
  isCronjobSpecification,
  isCronjobSpecificationArray,
  parseCronExpression
} from "./chunk-EA2FOAEG.mjs";
import {
  deepClone
} from "./chunk-Z2JQNSVL.mjs";
import "./chunk-JMDSN227.mjs";
export {
  ACCOUNT_ADDRESS_REGEX,
  ACCOUNT_ID_REGEX,
  ALL_APIS,
  AccountAddressStruct,
  AccountIdArrayStruct,
  AccountIdStruct,
  AddressResolutionResponseStruct,
  AddressResolutionStruct,
  BaseSnapIdStruct,
  Bip32EntropyStruct,
  Bip32PathStruct,
  CHAIN_ID_REGEX,
  ChainIdStringStruct,
  ChainIdStruct,
  ChainIdsStruct,
  ChainStruct,
  CronExpressionStruct,
  CronjobRpcRequestStruct,
  CronjobSpecificationArrayStruct,
  CronjobSpecificationStruct,
  DEFAULT_ENDOWMENTS,
  DEFAULT_REQUESTED_SNAP_VERSION,
  DomainResolutionResponseStruct,
  DomainResolutionStruct,
  EXPECTED_SNAP_FILES,
  EmptyObjectStruct,
  FORBIDDEN_COIN_TYPES,
  HandlerCaveatsStruct,
  HandlerType,
  HttpSnapIdStruct,
  InitialConnectionsStruct,
  KeyringOriginsStruct,
  LOCALHOST_HOSTNAMES,
  LOCALIZABLE_FIELDS,
  LimitedString,
  LocalSnapIdStruct,
  LocalizationFileStruct,
  LookupMatchersStruct,
  MAXIMUM_REQUEST_TIMEOUT,
  MINIMUM_REQUEST_TIMEOUT,
  MaxRequestTimeStruct,
  NameStruct,
  NamespaceIdStruct,
  NamespaceStruct,
  NpmSnapFileNames,
  NpmSnapIdStruct,
  NpmSnapPackageJsonStruct,
  OnHomePageResponseStruct,
  OnHomePageResponseWithContentStruct,
  OnHomePageResponseWithIdStruct,
  OnNameLookupResponseStruct,
  OnSignatureResponseStruct,
  OnTransactionResponseStruct,
  OnTransactionResponseWithContentStruct,
  OnTransactionResponseWithIdStruct,
  OnTransactionSeverityResponseStruct,
  PROPOSED_NAME_REGEX,
  PermissionsStruct,
  PostProcessWarning,
  ProgrammaticallyFixableSnapError,
  RpcOriginsStruct,
  SIP_6_MAGIC_VALUE,
  SNAPS_DERIVATION_PATHS,
  SNAP_ERROR_WRAPPER_CODE,
  SNAP_ERROR_WRAPPER_MESSAGE,
  SNAP_EXPORTS,
  SNAP_EXPORT_NAMES,
  SNAP_STREAM_NAMES,
  STATE_ENCRYPTION_MAGIC_VALUE,
  SemVerRangeStruct,
  SnapAuxilaryFilesStruct,
  SnapCaveatType,
  SnapEvalError,
  SnapFileNameFromKey,
  SnapGetBip32EntropyPermissionsStruct,
  SnapIdPrefixes,
  SnapIdStruct,
  SnapIdsStruct,
  SnapManifestStruct,
  SnapStatus,
  SnapStatusEvents,
  SnapValidationFailureReason,
  SnapsStructError,
  TRANSLATION_REGEX,
  VirtualFile,
  WALLET_SNAP_PERMISSION_KEY,
  WrappedSnapError,
  arrayToGenerator,
  assertIsJsonRpcSuccess,
  assertIsKeyringOrigins,
  assertIsNpmSnapPackageJson,
  assertIsRpcOrigins,
  assertIsSnapManifest,
  assertIsValidSnapId,
  bip32entropy,
  checkManifest,
  checksum,
  checksumFiles,
  createFromStruct,
  createSnapManifest,
  createUnion,
  createWindow,
  decodeBase64,
  deepClone,
  encodeAuxiliaryFile,
  encodeBase64,
  evalBundle,
  fixManifest,
  generateMockEndowments,
  getBytes,
  getError,
  getJsonSizeUnsafe,
  getJsxChildren,
  getJsxElementFromComponent,
  getLocalizationFile,
  getLocalizedSnapManifest,
  getOutfilePath,
  getSlip44ProtocolName,
  getSnapChecksum,
  getSnapDerivationPathName,
  getSnapFilePaths,
  getSnapFiles,
  getSnapIcon,
  getSnapPrefix,
  getSnapSourceCode,
  getStructErrorMessage,
  getStructErrorPrefix,
  getStructFailureMessage,
  getStructFromPath,
  getTargetVersion,
  getTextChildren,
  getTotalTextLength,
  getUnionStructNames,
  getValidatedLocalizationFiles,
  getWritableManifest,
  hasChildren,
  indent,
  isAccountId,
  isAccountIdArray,
  isCaipChainId,
  isChainId,
  isConstructor,
  isCronjobSpecification,
  isCronjobSpecificationArray,
  isDirectory,
  isEqual,
  isFile,
  isNamespace,
  isNamespaceId,
  isNpmSnapPackageJson,
  isOriginAllowed,
  isSerializedSnapError,
  isSnapError,
  isSnapManifest,
  isSnapPermitted,
  isValidUrl,
  isWrappedSnapError,
  logError,
  logInfo,
  logWarning,
  named,
  normalizeRelative,
  parseAccountId,
  parseChainId,
  parseCronExpression,
  parseJson,
  postProcessBundle,
  readJsonFile,
  readVirtualFile,
  resolveVersionRange,
  snapsLogger,
  stripSnapPrefix,
  translate,
  unwrapError,
  uri,
  useTemporaryFile,
  validateDirPath,
  validateFetchedSnap,
  validateFilePath,
  validateJsxLinks,
  validateNpmSnap,
  validateNpmSnapManifest,
  validateOutfileName,
  validateSnapManifestLocalizations,
  validateSnapShasum,
  validateTextLinks,
  validateUnion,
  verifyRequestedSnapPermissions,
  walkJsx,
  writeVirtualFile
};
//# sourceMappingURL=node.mjs.map