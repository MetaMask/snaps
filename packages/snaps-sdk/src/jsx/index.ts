/**
 * The JSX entry point for the Snaps SDK, which can be accessed by importing
 * from `@metamask/snaps-sdk/jsx`.
 *
 * To use the JSX features, ensure your project is set up to handle JSX syntax,
 * and configure the JSX import source to point to `@metamask/snaps-sdk/jsx`.
 * For example, in a TypeScript project, you can set the `jsxImportSource`
 * compiler option in your `tsconfig.json`:
 *
 * ```json
 * {
 *   "compilerOptions": {
 *    "jsx": "react-jsx",
 *    "jsxImportSource": "@metamask/snaps-sdk/jsx"
 *   }
 * }
 * ```
 *
 * @module Main/JSX
 * @primaryExport
 * @showCategories
 */

export * from './component';
export * from './components';
export * from './jsx-runtime';
export * from './jsx-dev-runtime';
export {
  JSXElementStruct,
  RootJSXElementStruct,
  isJSXElement,
  isJSXElementUnsafe,
  assertJSXElement,
  BoxChildStruct,
  FormChildStruct,
  FieldChildUnionStruct,
} from './validation';
