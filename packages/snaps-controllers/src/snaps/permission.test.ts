import {
  buildSnapEndowmentSpecifications,
  buildSnapRestrictedMethodSpecifications,
} from './permissions';

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
          "targetKey": "endowment:cronjob",
        },
        "endowment:ethereum-provider": {
          "allowedCaveats": null,
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetKey": "endowment:ethereum-provider",
        },
        "endowment:keyring": {
          "allowedCaveats": [
            "snapKeyring",
          ],
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetKey": "endowment:keyring",
          "validator": [Function],
        },
        "endowment:long-running": {
          "allowedCaveats": null,
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetKey": "endowment:long-running",
        },
        "endowment:network-access": {
          "allowedCaveats": null,
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetKey": "endowment:network-access",
        },
        "endowment:rpc": {
          "allowedCaveats": [
            "rpcOrigin",
          ],
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetKey": "endowment:rpc",
          "validator": [Function],
        },
        "endowment:transaction-insight": {
          "allowedCaveats": [
            "transactionOrigin",
          ],
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetKey": "endowment:transaction-insight",
          "validator": [Function],
        },
        "endowment:webassembly": {
          "allowedCaveats": null,
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetKey": "endowment:webassembly",
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
          "targetKey": "snap_dialog",
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
          "targetKey": "snap_getBip32Entropy",
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
          "targetKey": "snap_getBip32PublicKey",
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
          "targetKey": "snap_getBip44Entropy",
          "validator": [Function],
        },
        "snap_getEntropy": {
          "allowedCaveats": null,
          "methodImplementation": [Function],
          "permissionType": "RestrictedMethod",
          "subjectTypes": [
            "snap",
          ],
          "targetKey": "snap_getEntropy",
        },
        "snap_manageState": {
          "allowedCaveats": null,
          "methodImplementation": [Function],
          "permissionType": "RestrictedMethod",
          "subjectTypes": [
            "snap",
          ],
          "targetKey": "snap_manageState",
        },
        "snap_notify": {
          "allowedCaveats": null,
          "methodImplementation": [Function],
          "permissionType": "RestrictedMethod",
          "subjectTypes": [
            "snap",
          ],
          "targetKey": "snap_notify",
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
          "targetKey": "wallet_snap",
          "validator": [Function],
        },
      }
    `);
  });
});
