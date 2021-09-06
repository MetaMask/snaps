import { promises as fs } from 'fs';
import pathUtils from 'path';
import dequal from 'fast-deep-equal';
import isUrl from 'is-url';
import rfdc from 'rfdc';
import { isFile, permRequestKeys } from '../../utils';
import { YargsArgs } from '../../types/yargs';
import {
  NodePackageManifest,
  ManifestWalletProperty,
} from '../../types/package';

const deepClone = rfdc({ proto: false, circles: false });

const LOCALHOST_START = 'http://localhost';

/**
 * Validates a Snap package.json file.
 * Exits with success message or gathers all errors before throwing at the end.
 */
export async function manifest(argv: YargsArgs): Promise<void> {
  let isInvalid = false;
  let hasWarnings = false;
  let didUpdate = false;

  const { dist, port, outfileName } = argv;
  if (!dist) {
    throw new Error(`Invalid params: must provide 'dist'`);
  }

  // read the package.json file
  let pkg: NodePackageManifest;
  try {
    pkg = JSON.parse(await fs.readFile('package.json', 'utf-8'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(
        `Manifest error: Could not find package.json. Please ensure that ` +
          `you are running the command in the project root directory.`,
      );
    }
    throw new Error(`Could not parse package.json`);
  }

  if (!pkg || typeof pkg !== 'object') {
    throw new Error(`Invalid parsed package.json: ${pkg}`);
  }

  // attempt to set missing/erroneous properties if commanded
  if (argv.populate) {
    const old = pkg.web3Wallet ? deepClone(pkg.web3Wallet) : {};

    if (!pkg.web3Wallet) {
      pkg.web3Wallet = {};
    }

    const bundle = pkg.web3Wallet.bundle || {};
    if (!pkg.web3Wallet.bundle) {
      pkg.web3Wallet.bundle = bundle;
    }

    if (!pkg.web3Wallet.initialPermissions) {
      pkg.web3Wallet.initialPermissions = {};
    }

    const { web3Wallet } = pkg;

    const bundlePath = pathUtils.join(
      dist,
      (outfileName as string) || 'bundle.js',
    );
    if (bundle.local !== bundlePath) {
      bundle.local = bundlePath;
    }

    if (
      port &&
      (typeof bundle.url !== 'string' || bundle.url.startsWith(LOCALHOST_START))
    ) {
      bundle.url = `${LOCALHOST_START}:${port}/${bundlePath}`;
    }

    // sort web3Wallet object keys
    Object.keys(web3Wallet)
      .sort()
      .forEach((_key) => {
        const key = _key as keyof ManifestWalletProperty;
        const property = web3Wallet[key];

        if (
          property &&
          typeof property === 'object' &&
          !Array.isArray(property)
        ) {
          web3Wallet[key] = Object.keys(property)
            .sort()
            .reduce((sortedProperty, _innerKey) => {
              const innerKey = _innerKey as keyof ManifestWalletProperty[typeof key];
              sortedProperty[innerKey] = property[innerKey];

              return sortedProperty;
            }, {} as Record<string, unknown>);
        }
      });

    if (!dequal(old, web3Wallet)) {
      didUpdate = true;
    }
  }

  // check presence of required and recommended keys
  const existing = Object.keys(pkg);
  const required = ['name', 'version', 'description', 'main', 'web3Wallet'];
  const recommended = ['repository'];

  let missing = required.filter((key) => !existing.includes(key));
  if (missing.length > 0) {
    logManifestWarning(
      `Missing required package.json properties:\n${missing.reduce(
        (acc, curr) => {
          return `${acc}\t${curr}\n`;
        },
        '',
      )}`,
    );
  }

  missing = recommended.filter((key) => !existing.includes(key));
  if (missing.length > 0) {
    logManifestWarning(
      `Missing recommended package.json properties:\n${missing.reduce(
        (acc, curr) => {
          return `${acc}\t${curr}\n`;
        },
        '',
      )}`,
    );
  }

  // check web3Wallet properties
  if (pkg.web3Wallet !== undefined) {
    const { bundle, initialPermissions } = pkg.web3Wallet || {};
    if (bundle?.local) {
      if (!(await isFile(bundle.local))) {
        logManifestError(`'bundle.local' does not resolve to a file.`);
      }
    } else {
      logManifestError(
        `Missing required 'web3Wallet' property 'bundle.local'.`,
      );
    }

    if (bundle !== undefined) {
      if (!bundle.url) {
        logManifestError(`Missing required 'bundle.url' property.`);
      } else if (!isUrl(bundle.url)) {
        logManifestError(`'bundle.url' does not resolve to a URL.`);
      }
    }

    if (
      Object.prototype.hasOwnProperty.call(pkg.web3Wallet, 'initialPermissions')
    ) {
      if (
        typeof initialPermissions !== 'object' ||
        Array.isArray(initialPermissions)
      ) {
        logManifestError(
          `'web3Wallet' property 'initialPermissions' must be an object if present.`,
        );
      } else if (Object.keys(initialPermissions).length > 0) {
        Object.entries(initialPermissions).forEach(([permission, value]) => {
          if (typeof value !== 'object' || Array.isArray(value)) {
            logManifestError(
              `initial permission '${permission}' must be an object`,
            );
          } else if (value !== null) {
            Object.keys(value).forEach((permissionKey) => {
              if (!permRequestKeys.includes(permissionKey)) {
                logManifestError(
                  `initial permission '${permission}' has unrecognized key '${permissionKey}'`,
                );
              }

              if (
                permissionKey === 'parentCapability' &&
                permission !== permissionKey
              ) {
                logManifestError(
                  `initial permission '${permission}' has mismatched 'parentCapability' field '${
                    (value as Record<string, unknown>)[permissionKey]
                  }'`,
                );
              }
            });
          }
        });
      }
    }
  }

  // validation complete, finish work and notify user

  if (argv.populate) {
    try {
      await fs.writeFile('package.json', `${JSON.stringify(pkg, null, 2)}\n`);
      if (didUpdate) {
        console.log(`Manifest: Updated '${pkg.name}' package.json!`);
      }
    } catch (err) {
      throw new Error(`Could not write package.json`);
    }
  }

  if (isInvalid) {
    throw new Error(
      `Manifest Error: package.json validation failed, please see above errors.`,
    );
  } else if (hasWarnings) {
    console.log(
      `Manifest Warning: Validation of '${pkg.name}' package.json completed with warnings. See above.`,
    );
  } else {
    console.log(`Manifest Success: Validated '${pkg.name}' package.json!`);
  }

  function logManifestError(message: string) {
    isInvalid = true;
    console.error(`Manifest Error: ${message}`);
  }

  function logManifestWarning(message: string) {
    if (!global.snaps.suppressWarnings) {
      hasWarnings = true;
      console.warn(`Manifest Warning: ${message}`);
    }
  }
}
