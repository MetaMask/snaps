import type { JsonBIP44Node, JsonSLIP10Node } from '@metamask/key-tree';
import type {
  Hex,
  Json,
  JsonRpcError,
  JsonRpcParams,
  JsonRpcRequest,
} from '@metamask/utils';

import type {
  Bip32Entropy,
  Bip44Entropy,
  EmptyObject,
  ManageState,
  Notify,
  Snap,
  SnapId,
} from '..';
import type { EnumToUnion } from '../../internals';
import type { Dialog } from './dialog';
import type { AuxiliaryFileEncoding } from './get-file';

type Method<
  MethodName extends string,
  Params extends JsonRpcParams,
> = Partial<JsonRpcRequest> & Params extends never
  ? {
      method: MethodName;
    }
  : {
      method: MethodName;
      params: Params;
    };

/**
 * The request parameters for the `snap_dialog` method.
 *
 * @property type - The type of dialog to display.
 * @property content - The content to display in the dialog.
 * @property placeholder - The placeholder text to display in the dialog. Only
 * applicable for the `prompt` dialog.
 */
export type DialogParams = Dialog;

/**
 * The result returned by the `snap_dialog` method.
 *
 * - If the dialog is an `alert`, the result is `null`.
 * - If the dialog is a `confirmation`, the result is a boolean indicating
 * whether the user confirmed the dialog.
 * - If the dialog is a `prompt`, the result is the value entered by
 * the user.
 */
export type DialogResult = null | boolean | string;

/**
 * The request parameters for the `snap_getBip32Entropy` method.
 *
 * @property path - The BIP-32 path to derive the entropy from.
 * @property curve - The curve to use when deriving the entropy.
 */
export type GetBip32EntropyParams = Bip32Entropy;

/**
 * The result returned by the `snap_getBip32Entropy` method.
 *
 * @see https://github.com/MetaMask/key-tree#usage
 */
export type GetBip32EntropyResult = JsonSLIP10Node;

/**
 * The request parameters for the `snap_getBip32PublicKey` method.
 *
 * @property path - The BIP-32 path to derive the public key from.
 * @property curve - The curve to use when deriving the public key.
 * @property compressed - Whether to return the compressed public key. Defaults
 * to `false`.
 */
export type GetBip32PublicKeyParams = Bip32Entropy & {
  compressed?: boolean;
};

/**
 * The result returned by the `snap_getBip32PublicKey` method.
 *
 * It is the public key in hexadecimal format, in either compressed or
 * uncompressed format, depending on the `compressed` parameter.
 */
export type GetBip32PublicKeyResult = string;

/**
 * The request parameters for the `snap_getBip44Entropy` method.
 *
 * @property coinType - The BIP-44 coin type to derive the entropy from.
 */
export type GetBip44EntropyParams = Bip44Entropy;

/**
 * The result returned by the `snap_getBip44Entropy` method.
 *
 * @see https://github.com/MetaMask/key-tree#usage
 */
export type GetBip44EntropyResult = JsonBIP44Node;

/**
 * The request parameters for the `snap_getEntropy` method.
 *
 * @property version - The version of the entropy to retrieve. This is used for
 * backwards compatibility. As of now, only version 1 is supported.
 * @property salt - The optional salt to use when deriving the entropy.
 */
export type GetEntropyParams = {
  version: 1;
  salt?: string;
};

/**
 * The result returned by the `snap_getEntropy` method.
 */
export type GetEntropyResult = Hex;

/**
 * The request parameters for the `snap_getLocale` method.
 *
 * This method does not accept any parameters.
 */
export type GetLocaleParams = never;

/**
 * The result returned by the `snap_getLocale` method.
 *
 * It is the locale of the user's MetaMask extension.
 */
export type GetLocaleResult = string;

/**
 * The request parameters for the `snap_getFile` method.
 *
 * @property path - The path to the file to retrieve.
 * @property encoding - The encoding to use when retrieving the file.
 */
export type GetFileParams = {
  path: string;
  encoding?: EnumToUnion<AuxiliaryFileEncoding>;
};

/**
 * The result returned by the `snap_getFile` method.
 */
export type GetFileResult = string;

/**
 * The request parameters for the `wallet_getSnaps` method.
 *
 * This method does not accept any parameters.
 */
export type GetSnapsParams = never;

/**
 * The result returned by the `wallet_getSnaps` method.
 *
 * It consists of a map of Snap IDs to either the Snap object or an error.
 */
export type GetSnapsResult = Record<SnapId, { error: JsonRpcError } | Snap>;

/**
 * The request parameters for the `wallet_invokeKeyring` method.
 *
 * @property snapId - The ID of the snap to invoke.
 * @property request - The JSON-RPC request to send to the snap.
 */
export type InvokeKeyringParams = InvokeSnapParams;

/**
 * The result returned by the `wallet_invokeKeyring` method, which is the result
 * returned by the Snap.
 */
export type InvokeKeyringResult = Json;

/**
 * The request parameters for the `wallet_invokeSnap` method.
 *
 * @property snapId - The ID of the Snap to invoke.
 * @property request - The JSON-RPC request to send to the Snap.
 */
export type InvokeSnapParams = {
  snapId: string;
  request: Record<string, Json>;
};

/**
 * The result returned by the `wallet_invokeSnap` method, which is the result
 * returned by the Snap.
 */
export type InvokeSnapResult = Json;

/**
 * The request parameters for the `snap_manageAccounts` method.
 *
 * @property method - The method to call on the Snap.
 * @property params - The optional parameters to pass to the Snap method.
 */
export type ManageAccountsParams =
  | {
      method: string;
    }
  | {
      method: string;
      params: Json[] | Record<string, Json>;
    };

/**
 * The result returned by the `snap_manageAccounts` method, which is the result
 * returned by the Snap.
 */
export type ManageAccountsResult = Json;

/**
 * The request parameters for the `snap_manageState` method.
 *
 * @property operation - The operation to perform on the state.
 * @property encrypted - Whether to use the separate encrypted state, or the
 * unencrypted state. Defaults to the encrypted state.
 * @property newState - The new state to set. Only applicable for the `set`
 * operation.
 */
export type ManageStateParams = ManageState;

/**
 * The result returned by the `snap_manageState` method.
 *
 * If the operation is `get`, the result is the state. Otherwise, the result is
 * `null`.
 */
export type ManageStateResult = Record<string, Json> | null;

/**
 * The request parameters for the `snap_notify` method.
 *
 * @property type - The type of notification to display.
 * @property message - The message to display in the notification.
 */
export type NotifyParams = Notify;

/**
 * The result returned by the `snap_notify` method.
 *
 * This method does not return anything.
 */
export type NotifyResult = null;

/**
 * The request parameters for the `wallet_requestSnaps` method.
 *
 * It consists of a map of Snap IDs to optional version strings to request.
 */
export type RequestSnapsParams = EmptyObject;

/**
 * The result returned by the `wallet_requestSnaps` method.
 *
 * It consists of a map of Snap IDs to either the Snap object or an error.
 */
export type RequestSnapsResult = Record<string, { error: JsonRpcError } | Snap>;

/**
 * The methods that are available to the Snap. Each method is a tuple of the
 * request parameters and the result returned by the method.
 */
export type SnapMethods = {
  /* eslint-disable @typescript-eslint/naming-convention */
  snap_dialog: [DialogParams, DialogResult];
  snap_getBip32Entropy: [GetBip32EntropyParams, GetBip32EntropyResult];
  snap_getBip32PublicKey: [GetBip32PublicKeyParams, GetBip32PublicKeyResult];
  snap_getBip44Entropy: [GetBip44EntropyParams, GetBip44EntropyResult];
  snap_getEntropy: [GetEntropyParams, GetEntropyResult];
  snap_getFile: [GetFileParams, GetFileResult];
  snap_getLocale: [GetLocaleParams, GetLocaleResult];
  snap_manageAccounts: [ManageAccountsParams, ManageAccountsResult];
  snap_manageState: [ManageStateParams, ManageStateResult];
  snap_notify: [NotifyParams, NotifyResult];
  wallet_getSnaps: [GetSnapsParams, GetSnapsResult];
  wallet_invokeKeyring: [InvokeKeyringParams, InvokeKeyringResult];
  wallet_invokeSnap: [InvokeSnapParams, InvokeSnapResult];
  wallet_snap: [InvokeSnapParams, InvokeSnapResult];
  wallet_requestSnaps: [RequestSnapsParams, RequestSnapsResult];
  /* eslint-enable @typescript-eslint/naming-convention */
};

export type RequestFunction = <MethodName extends keyof SnapMethods>(
  request: Method<MethodName, SnapMethods[MethodName][0]>,
) => Promise<SnapMethods[MethodName][1]>;
