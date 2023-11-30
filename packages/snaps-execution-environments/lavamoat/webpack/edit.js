const fs = require('fs');
const p = require('./policy.json');
const path = require('path');
const {
  loadCanonicalNameMap,
  getPackageNameForModulePath,
} = require('@lavamoat/aa');

async function run() {
  const cmap = await loadCanonicalNameMap({
    rootDir: path.resolve(__dirname, '../..'),
  });
  const cindex = new Set(cmap.values());
  const cinverseNameLookup = {};
  cindex.forEach((a) => {
    const k = a.split('>').reverse()[0];
    if (cinverseNameLookup[k]) {
      if (cinverseNameLookup[k].length < a.length) return;
    }

    cinverseNameLookup[k] = a;
  });

  // console.log(cindex, cindex.has('@swc/cli>semver'));

  function filterOutItems(obj, selfName) {
    if (!obj) return {};
    return Object.fromEntries(
      Object.entries(obj)
        .map(([k, v]) => {
          if (k.startsWith('external:../snaps-')) {
            const snapPkg = `@metamask/${k.split('/')[1]}`;
            if (snapPkg === selfName) return;
            return [snapPkg, v];
          }
          return [k, v];
        })
        .filter((a) => a)
        .map(([k, v]) => {
          if (!cindex.has(k)) {
            const newk = cinverseNameLookup[k.split('>').reverse()[0]];
            console.log('translating', k, newk);
            return [newk, v];
          }
          return [k, v];
        }),
    );
  }
  function merge(a, b, selfName) {
    a = a || { packages: {}, globals: {} };
    Object.assign(a.packages, filterOutItems(b.packages, selfName));
    Object.assign(a.globals, b.globals);
    return a;
  }

  const discoveredResources = {};
  const entries = Object.entries(p.resources)
    .map(([k, v]) => {
      if (v.packages) {
        v.packages = filterOutItems(v.packages, null);
      }
      if (k.startsWith('external:../snaps-')) {
        const snapPkg = `@metamask/${k.split('/')[1]}`;
        discoveredResources[snapPkg] = merge(
          discoveredResources[snapPkg],
          v,
          snapPkg,
        );
        return;
      }
      if (!cindex.has(k)) {
        const newk = cinverseNameLookup[k.split('>').reverse()[0]];
        console.log('translating', k, newk);
        return [newk, v];
      }

      return [k, v];
    })
    .filter((a) => a);

  p.resources = Object.fromEntries([
    ...entries,
    ...Object.entries(discoveredResources),
  ]);
  p['//'] = 'This file was modified by edit.js';

  fs.writeFileSync(
    path.resolve(__dirname, './policy2.json'),
    JSON.stringify(p, null, 2),
  );
}

run();
