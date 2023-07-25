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
        "endowment:lifecycle-hooks": {
          "allowedCaveats": null,
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:lifecycle-hooks",
        },
        "endowment:long-running": {
          "allowedCaveats": null,
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:long-running",
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
        "endowment:rpc": {
          "allowedCaveats": [
            "rpcOrigin",
          ],
          "endowmentGetter": [Function],
          "permissionType": "Endowment",
          "subjectTypes": [
            "snap",
          ],
          "targetName": "endowment:rpc",
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
});
