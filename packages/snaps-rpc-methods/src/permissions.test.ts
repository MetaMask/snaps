import type { Bip32Entropy } from '@metamask/snaps-sdk';

import {
  buildSnapEndowmentSpecifications,
  buildSnapRestrictedMethodSpecifications,
  filterRemovedPermissions,
  processSnapPermissions,
} from './permissions';

describe('filterRemovedPermissions', () => {
  it('returns true for a permission that is not removed', () => {
    const result = filterRemovedPermissions(['snap_dialog', {}]);
    expect(result).toBe(true);
  });

  it('returns false for a permission that is removed', () => {
    const result = filterRemovedPermissions(['snap_manageAccounts', {}]);
    expect(result).toBe(false);
  });
});

/* eslint-disable @typescript-eslint/naming-convention */
describe('processSnapPermissions', () => {
  it('returns the expected object', () => {
    const permissions = {
      snap_dialog: {},

      snap_manageAccounts: {},
    };
    const result = processSnapPermissions(permissions);
    expect(result).toStrictEqual({
      snap_dialog: {},
    });
  });

  it('returns the expected object when the permission is not a snap permission', () => {
    const permissions = {
      snap_dialog: {},
      snap_manageAccounts: {},
      wallet_foobar: {},
    };
    const result = processSnapPermissions(permissions);
    expect(result).toStrictEqual({
      snap_dialog: {},
      wallet_foobar: {},
    });
  });

  it('returns the expected object when the permission is a snap endowment with a mapper', () => {
    const permissions = {
      snap_dialog: {},
      snap_manageAccounts: {},
      'endowment:rpc': {
        dapps: true,
        snaps: true,
      },
    };
    const result = processSnapPermissions(permissions);
    expect(result).toStrictEqual({
      snap_dialog: {},
      'endowment:rpc': {
        caveats: [
          {
            type: 'rpcOrigin',
            value: {
              dapps: true,
              snaps: true,
            },
          },
        ],
      },
    });
  });

  it('returns the expected object when the permission is a snap permission with a mapper', () => {
    const permissions = {
      snap_dialog: {},
      snap_manageAccounts: {},
      snap_getBip32Entropy: [
        {
          path: ['m', "44'", "3'"],
          curve: 'secp256k1',
        } as Bip32Entropy,
      ],
    };
    const result = processSnapPermissions(permissions);
    expect(result).toStrictEqual({
      snap_dialog: {},
      snap_getBip32Entropy: {
        caveats: [
          {
            type: 'permittedDerivationPaths',
            value: [
              {
                path: ['m', "44'", "3'"],
                curve: 'secp256k1',
              },
            ],
          },
        ],
      },
    });
  });
});
/* eslint-enable @typescript-eslint/naming-convention */

describe('buildSnapEndowmentSpecifications', () => {
  it('returns the expected object', () => {
    const specifications = buildSnapEndowmentSpecifications([]);
    expect(specifications).toMatchInlineSnapshot(`
      {
        "endowment:cronjob": {
          "allowedCaveats": [
            "snapCronjob",
          ],
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:cronjob",
        },
        "endowment:ethereum-provider": {
          "allowedCaveats": null,
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:ethereum-provider",
        },
        "endowment:keyring": {
          "allowedCaveats": [
            "keyringOrigin",
            "maxRequestTime",
          ],
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:keyring",
          "validator": [Function],
        },
        "endowment:lifecycle-hooks": {
          "allowedCaveats": null,
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:lifecycle-hooks",
        },
        "endowment:name-lookup": {
          "allowedCaveats": [
            "chainIds",
            "lookupMatchers",
            "maxRequestTime",
          ],
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:name-lookup",
          "validator": [Function],
        },
        "endowment:network-access": {
          "allowedCaveats": null,
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:network-access",
        },
        "endowment:page-home": {
          "allowedCaveats": null,
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:page-home",
        },
        "endowment:rpc": {
          "allowedCaveats": [
            "rpcOrigin",
            "maxRequestTime",
          ],
          "endowmentGetter": [Function],
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
          ],
          "endowmentGetter": [Function],
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
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:transaction-insight",
          "validator": [Function],
        },
        "endowment:webassembly": {
          "allowedCaveats": null,
          "endowmentGetter": [Function],
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
    const specifications = buildSnapRestrictedMethodSpecifications([], {});
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
});
