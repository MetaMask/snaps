"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/utils/legacy.ts
function processDependencies(config) {
  const { depsToTranspile, transpilationMode } = config;
  if (transpilationMode === "localAndDeps" /* LocalAndDeps */) {
    const regex = getDependencyRegExp(depsToTranspile);
    if (regex !== null) {
      return [regex];
    }
  }
  return [];
}
function getDependencyRegExp(dependencies) {
  if (!dependencies || dependencies.includes(".") || !dependencies.length) {
    return null;
  }
  const paths = sanitizeDependencyPaths(dependencies);
  return RegExp(`/node_modules/(?!${paths.join("|")})`, "u");
}
function sanitizeDependencyPaths(dependencies) {
  return dependencies.map((dependency) => {
    return dependency.replace(/^[/\\]+/u, "").replace(/[/\\]+$/u, "");
  });
}





exports.processDependencies = processDependencies; exports.getDependencyRegExp = getDependencyRegExp; exports.sanitizeDependencyPaths = sanitizeDependencyPaths;
//# sourceMappingURL=chunk-PDYQXXLP.js.map