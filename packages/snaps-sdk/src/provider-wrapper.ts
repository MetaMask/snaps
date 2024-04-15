import {
  AuxiliaryFileEncoding,
  ClearStateOperation,
  CreateInterfaceParams,
  GetBip32EntropyParams,
  GetBip32PublicKeyParams,
  GetBip44EntropyParams,
  GetEntropyParams,
  GetFileParams,
  GetStateOperation,
  ManageStateOperation,
  NotifyParams,
  UpdateInterfaceParams,
  UpdateStateOperation,
} from './types';

export async function getBip32Entropy(
  curve: GetBip32EntropyParams['curve'],
  path: GetBip32EntropyParams['path'],
) {
  return snap.request({
    method: 'snap_getBip32Entropy',
    params: { curve, path },
  });
}

export async function getBip32PublicKey(
  curve: GetBip32PublicKeyParams['curve'],
  path: GetBip32PublicKeyParams['path'],
  compressed: GetBip32PublicKeyParams['compressed'] = false,
) {
  return snap.request({
    method: 'snap_getBip32PublicKey',
    params: { curve, path, compressed },
  });
}

export async function getBip44Entropy(
  coinType: GetBip44EntropyParams['coinType'],
) {
  return snap.request({
    method: 'snap_getBip44Entropy',
    params: { coinType },
  });
}

export async function getClientStatus() {
  return snap.request({
    method: 'snap_getClientStatus',
  });
}

export async function getEntropy(
  version: GetEntropyParams['version'] = 1,
  salt?: GetEntropyParams['salt'],
) {
  return snap.request({
    method: 'snap_getEntropy',
    params: { version, salt },
  });
}

export async function getFile(
  path: GetFileParams['path'],
  encoding: GetFileParams['encoding'] = AuxiliaryFileEncoding.Base64,
) {
  return snap.request({
    method: 'snap_getFile',
    params: { path, encoding },
  });
}

export async function getLocale() {
  return snap.request({ method: 'snap_getLocale' });
}

export async function setState(
  newState: UpdateStateOperation['newState'],
  encrypted: UpdateStateOperation['encrypted'] = true,
) {
  return snap.request({
    method: 'snap_manageState',
    params: {
      operation: ManageStateOperation.UpdateState,
      newState,
      encrypted,
    },
  });
}

export async function getState(
  encrypted: GetStateOperation['encrypted'] = true,
) {
  return snap.request({
    method: 'snap_manageState',
    params: { operation: ManageStateOperation.GetState, encrypted },
  });
}

export async function clearState(
  encrypted: ClearStateOperation['encrypted'] = true,
) {
  return snap.request({
    method: 'snap_manageState',
    params: { operation: ManageStateOperation.ClearState, encrypted },
  });
}

export async function notify(
  type: NotifyParams['type'],
  message: NotifyParams['message'],
) {
  return snap.request({ method: 'snap_notify', params: { type, message } });
}

export async function createInterface(ui: CreateInterfaceParams['ui']) {
  return snap.request({ method: 'snap_createInterface', params: { ui } });
}

export async function updateInterface(
  id: UpdateInterfaceParams['id'],
  ui: UpdateInterfaceParams['ui'],
) {
  return snap.request({ method: 'snap_updateInterface', params: { id, ui } });
}

// TODO: Manage account APIs
// TODO: Dialog
