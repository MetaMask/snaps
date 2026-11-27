import { Messenger } from '@metamask/messenger';

import {
  buildSnapEndowmentSpecifications,
  buildSnapRestrictedMethodSpecifications,
} from './permissions';

describe('buildSnapEndowmentSpecifications', () => {
  it('returns the expected object', () => {
    const specifications = buildSnapEndowmentSpecifications([]);
    expect(specifications).toMatchInlineSnapshot(`
      {
        "endowment:assets": {
          "allowedCaveats": [
            "chainIds",
            "maxRequestTime",
          ],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:assets",
          "validator": [Function],
        },
        "endowment:cronjob": {
          "allowedCaveats": [
            "snapCronjob",
            "maxRequestTime",
          ],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:cronjob",
          "validator": [Function],
        },
        "endowment:ethereum-provider": {
          "allowedCaveats": null,
          "globals": [
            "ethereum",
          ],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:ethereum-provider",
        },
        "endowment:keyring": {
          "allowedCaveats": [
            "keyringOrigin",
            "keyringCapabilities",
            "maxRequestTime",
          ],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:keyring",
          "validator": [Function],
        },
        "endowment:lifecycle-hooks": {
          "allowedCaveats": [
            "maxRequestTime",
          ],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:lifecycle-hooks",
          "validator": [Function],
        },
        "endowment:messenger": {
          "allowedCaveats": [
            "messengerScopes",
          ],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:messenger",
          "validator": [Function],
        },
        "endowment:multichain-provider": {
          "allowedCaveats": null,
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:multichain-provider",
        },
        "endowment:name-lookup": {
          "allowedCaveats": [
            "chainIds",
            "lookupMatchers",
            "maxRequestTime",
          ],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:name-lookup",
          "validator": [Function],
        },
        "endowment:network-access": {
          "allowedCaveats": null,
          "globals": [
            "fetch",
            "Request",
            "Headers",
            "Response",
          ],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:network-access",
        },
        "endowment:page-home": {
          "allowedCaveats": [
            "maxRequestTime",
          ],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:page-home",
          "validator": [Function],
        },
        "endowment:page-settings": {
          "allowedCaveats": [
            "maxRequestTime",
          ],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:page-settings",
          "validator": [Function],
        },
        "endowment:protocol": {
          "allowedCaveats": [
            "protocolSnapScopes",
            "maxRequestTime",
          ],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:protocol",
          "validator": [Function],
        },
        "endowment:rpc": {
          "allowedCaveats": [
            "rpcOrigin",
            "maxRequestTime",
          ],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:rpc",
          "validator": [Function],
        },
        "endowment:signature-insight": {
          "allowedCaveats": [
            "signatureOrigin",
            "maxRequestTime",
          ],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:signature-insight",
          "validator": [Function],
        },
        "endowment:transaction-insight": {
          "allowedCaveats": [
            "transactionOrigin",
            "maxRequestTime",
          ],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:transaction-insight",
          "validator": [Function],
        },
        "endowment:webassembly": {
          "allowedCaveats": null,
          "globals": [
            "WebAssembly",
          ],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:webassembly",
        },
      }
    `);
  });
});

describe('buildSnapRestrictedMethodSpecifications', () => {
  it('returns the expected object', () => {
    const specifications = buildSnapRestrictedMethodSpecifications(
      [],
      {
        getUnlockPromise: jest.fn(),
        isOnPhishingList: jest.fn(),
        maybeUpdatePhishingList: jest.fn(),
        getSnapKeyring: jest.fn(),
        getPreferences: jest.fn(),
      },
      new Messenger({ namespace: 'SnapsRestrictedMethods' }),
    );
    expect(specifications).toMatchInlineSnapshot(`
      {
        "snap_dialog": {
          "allowedCaveats": null,
          "methodImplementation": [Function],
          "permissionType": "RestrictedMethod",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "snap_dialog",
        },
        "snap_getBip32Entropy": {
          "allowedCaveats": [
            "permittedDerivationPaths",
          ],
          "methodImplementation": [Function],
          "permissionType": "RestrictedMethod",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "snap_getBip32Entropy",
          "validator": [Function],
        },
        "snap_getBip32PublicKey": {
          "allowedCaveats": [
            "permittedDerivationPaths",
          ],
          "methodImplementation": [Function],
          "permissionType": "RestrictedMethod",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "snap_getBip32PublicKey",
          "validator": [Function],
        },
        "snap_getBip44Entropy": {
          "allowedCaveats": [
            "permittedCoinTypes",
          ],
          "methodImplementation": [Function],
          "permissionType": "RestrictedMethod",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "snap_getBip44Entropy",
          "validator": [Function],
        },
        "snap_getEntropy": {
          "allowedCaveats": null,
          "methodImplementation": [Function],
          "permissionType": "RestrictedMethod",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "snap_getEntropy",
        },
        "snap_getLocale": {
          "allowedCaveats": null,
          "methodImplementation": [Function],
          "permissionType": "RestrictedMethod",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "snap_getLocale",
        },
        "snap_getPreferences": {
          "allowedCaveats": null,
          "methodImplementation": [Function],
          "permissionType": "RestrictedMethod",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "snap_getPreferences",
        },
        "snap_manageAccounts": {
          "allowedCaveats": null,
          "methodImplementation": [Function],
          "permissionType": "RestrictedMethod",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "snap_manageAccounts",
        },
        "snap_manageState": {
          "allowedCaveats": null,
          "methodImplementation": [Function],
          "permissionType": "RestrictedMethod",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "snap_manageState",
        },
        "snap_notify": {
          "allowedCaveats": null,
          "methodImplementation": [Function],
          "permissionType": "RestrictedMethod",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "snap_notify",
        },
        "wallet_snap": {
          "allowedCaveats": [
            "snapIds",
          ],
          "methodImplementation": [Function],
          "permissionType": "RestrictedMethod",
          "sideEffect": {
            "onPermitted": [Function],
          },
          "targetName": "wallet_snap",
          "validator": [Function],
        },
      }
    `);
  });

  it('excludes the specified permissions', () => {
    const specifications = buildSnapRestrictedMethodSpecifications(
      ['snap_dialog'],
      {
        getUnlockPromise: jest.fn(),
        isOnPhishingList: jest.fn(),
        maybeUpdatePhishingList: jest.fn(),
        getSnapKeyring: jest.fn(),
        getPreferences: jest.fn(),
      },
      new Messenger({ namespace: 'SnapsRestrictedMethods' }),
    );

    expect(specifications.snap_dialog).toBeUndefined();
  });
});
