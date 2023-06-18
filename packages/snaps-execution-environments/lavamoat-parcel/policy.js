const { createModuleInspector, LavamoatModuleRecord } = require('lavamoat-core')
const { isBuiltin } = require('module');
const { promises: fs } = require('fs');

module.exports.inspectBundle = async (modules, { policyPath, policyOverridePath }) => {
    const inspector = createModuleInspector({ isBuiltin, includeDebugInfo: false })

    for (mod of modules) {
        inspectModule(mod);
    }

    async function inspectModule(mod) {
        const moduleRecord = new LavamoatModuleRecord({
            specifier: mod.asset.id,
            file: mod.asset.filePath,
            packageName: mod.packageName,
            content: mod.source,
            type: 'js',
            importMap: mod.importMap,
            //ast: await mod.asset.getAST(),
        })
        inspector.inspectModule(moduleRecord)
    }

    const policy = inspector.generatePolicy({ policyOverride: {} });
    return policy;
}

module.exports.readPolicy = async (path) => {
    const str = await fs.readFile(path, 'utf8');
    return JSON.parse(str);
}

module.exports.writePolicy = async (path, policy) => {
    return fs.writeFile(path, JSON.stringify(policy, null, 2));
}