const { Packager } = require('@parcel/plugin');
const { loadCanonicalNameMap, getPackageNameForModulePath } = require('@lavamoat/aa');
const browserResolve = require('browser-resolve')
const { promises: fs } = require('fs');
const { inspectBundle, readPolicy, writePolicy } = require('./policy');
const path = require('path');

// TODO: Configurable
const GEN_POLICY = true;
const policyOverridePath = path.resolve(
  __dirname,
  `../lavamoat/parcel/policy-override.json`,
);


module.exports.default = new Packager({
  async package({ bundle, bundleGraph }) {

    // TODO: Is this right?
    const rootDir = process.cwd();

    const canonicalNameMap = await loadCanonicalNameMap({
      rootDir,
      includeDevDeps: true,
      resolve: browserResolve,
    })

    let promises = [];

    function wrapModuleInInitializer(file, code) {
      return `function(){
        with (this.scopeTerminator) {
        with (this.globalThis) {
          return function() {
            'use strict';
            // source: ${file}
            return function (require, module, exports) {
              ${code}
            };
          };
        }
        }
      }`;
    }

    async function packAsset(asset) {
      const packageName = getPackageNameForModulePath(canonicalNameMap, asset.filePath);
      const rawCode = await asset.getCode();

      // Remove all instances of re-assigned global, cannot find a way to turn this off right now
      const fixedCode = rawCode.replaceAll('var global = arguments[3];', ''); 

      const moduleInitializer = wrapModuleInInitializer(asset.filePath, fixedCode);
      const usedDependencies = bundleGraph.getDependencies(asset).filter(dep => !bundleGraph.isDependencySkipped(dep));
      const dependencies = usedDependencies.reduce((acc, dep) => {
        // Relative imports use dep.meta.placeholder
        const specifier = dep.meta.placeholder ?? dep.specifier;
        const resolved = bundleGraph.getResolvedAsset(dep, bundle);
        if (resolved) {
          acc[specifier] =
            bundleGraph.getAssetPublicId(resolved);
        } else {
          // An external module - map placeholder to original specifier.
          acc[specifier] = dep.specifier;
        }
        return acc;
      }, {});
      const importMap = usedDependencies.reduce((acc, dep) => {
        // Relative imports use dep.meta.placeholder
        const specifier = dep.meta.placeholder ?? dep.specifier;
        const resolved = bundleGraph.getResolvedAsset(dep, bundle);
        if (resolved) {
          acc[specifier] = resolved.id;
        } else {
          // An external module - map placeholder to original specifier.
          acc[specifier] = dep.specifier;
        }
        return acc;
      }, {});
      const metadata = { package: packageName }
      const wrappedSource = `[${JSON.stringify(bundleGraph.getAssetPublicId(asset))},${JSON.stringify(dependencies)},${moduleInitializer}, ${JSON.stringify(metadata)}]`;
      return { asset, packageName, wrappedSource, dependencies, importMap, source: fixedCode }
    }

    bundle.traverseAssets((asset) => {
      // Doesn't seem to skip anything yet though, maybe with ESM input?
      const shouldSkip = !bundle.getEntryAssets().includes(asset) && !asset.sideEffects && bundleGraph.getUsedSymbols(asset).size == 0 && !bundleGraph.isAssetReferenced(bundle, asset)
      if (!shouldSkip) {
        promises.push(packAsset(asset));
      }
    });

    const policyPath = path.resolve(
      __dirname,
      `../lavamoat/parcel/${bundle.target.name}/policy.json`,
    );

    let policy = await readPolicy(policyPath);

    const modules = await Promise.all(promises);

    if (GEN_POLICY) {
      policy = await inspectBundle(modules, { policyOverridePath, policyPath });
      await writePolicy(policyPath, policy);
      // Trying to still build here
    }

    const lavaMoatRuntimeString = await fs.readFile(
      require.resolve('@lavamoat/lavapack/src/runtime.js'),
      'utf-8',
    );

    const lavamoatSecurityOptions = {}

    // TODO: Runtime toggle
    const includeRuntime = false;

    const lavaMoatRuntimeBrowser = includeRuntime ? lavaMoatRuntimeString.replace(
      '__lavamoatSecurityOptions__',
      JSON.stringify(lavamoatSecurityOptions),
    ) : '';

    const entryFiles = bundle.getEntryAssets().map(asset => bundleGraph.getAssetPublicId(asset));

    const fullBundle = modules.map(module => module.wrappedSource).join(',\n');
    const contents = `${lavaMoatRuntimeBrowser}\nLavaPack.loadBundle([\n${fullBundle}],${JSON.stringify(entryFiles)},${JSON.stringify(policy)})`;
    return {
      contents,
    };
  },
});
