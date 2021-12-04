const { writeFileSync } = require('fs');
const path = require('path');
const { Transpiler } = require('@json-schema-tools/transpiler');
const snapManifestSchema = require('../src/snaps/json-schemas/snap-manifest.schema.json');
const npmSnapPackageJsonSchema = require('../src/snaps/json-schemas/npm-snap-package-json.schema.json');

[
  [snapManifestSchema, 'SnapManifest'],
  [npmSnapPackageJsonSchema, 'NpmSnapPackageJson'],
].forEach(([schema, primaryExportName]) => {
  writeSchema(transpileSchema(schema, primaryExportName), primaryExportName);
});

function transpileSchema(schema, primaryExportName) {
  return (
    new Transpiler(schema)
      .toTypescript()
      // Get rid of all export statements
      .replace(/^export /gmu, '')
      // Convert all interfaces to object types for Json type compatibility
      .replace(/^interface (\w+) \{/gmu, 'type $1 = {')
      // Export the primary schema type only
      .replace(
        new RegExp(`^type ${primaryExportName}`, 'mu'),
        `export type ${primaryExportName}`,
      )
      // Add a newline because we like it better
      .concat('\n')
  );
}

function writeSchema(typeSource, primaryExportName) {
  writeFileSync(
    path.resolve(
      __dirname,
      `../src/snaps/json-schemas/${primaryExportName}.ts`,
    ),
    typeSource,
  );
}
