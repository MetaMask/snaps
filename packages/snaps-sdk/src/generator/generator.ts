import { assert } from '@metamask/utils';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { Project, SyntaxKind } from 'ts-morph';
import type { JSDocTagInfo, SourceFile, Type } from 'ts-morph';

import { formatCode } from './formatter';
import { installSnap } from './interface';

export type PackageJson = {
  main?: string;
};

export type Method = {
  name: string;
  documentation: string[];
  params: {
    name: string;
    type: string;
    documentation: {
      name: string;
      description: string;
    }[];
  };
  response: {
    type: string;
    documentation?: string;
  };
};

/**
 * Get the main file from the `package.json` file.
 *
 * This function assumes that the `package.json` file exists and has a `main`
 * field. The field should be the path to the main TypeScript file.
 *
 * @returns The main file path.
 */
export async function getMainFilePath() {
  const rawFile = await readFile('package.json', 'utf8');
  const packageJson = JSON.parse(rawFile) as PackageJson;

  assert(packageJson.main, '`package.json` must have a main field.');
  assert(
    typeof packageJson.main === 'string',
    '`package.json` main field must be a string.',
  );

  return resolve(process.cwd(), packageJson.main);
}

/**
 * Get the `onRpcRequest` handler from the main file.
 *
 * @param file - The main file.
 * @returns The `onRpcRequest` handler node.
 */
export function getRpcRequestHandler(file: SourceFile) {
  const onRpcRequest = file.getExportSymbols().find((symbol) => {
    return symbol.getName() === 'onRpcRequest';
  });

  const declaration = onRpcRequest?.getDeclarations().find((node) => {
    return node.isKind(SyntaxKind.VariableDeclaration);
  });

  const initializer = declaration
    ?.asKind(SyntaxKind.VariableDeclaration)
    ?.getInitializer();

  assert(initializer, 'The Snap must export a `onRpcRequest` handler.');
  return initializer;
}

/**
 * Get a tag from a JSDoc node.
 *
 * @param node - The JSDoc node.
 * @param kind - The tag kind, e.g., `text`.
 * @returns The tag, or `undefined` if the tag does not exist.
 */
function getTag(node: JSDocTagInfo, kind: string) {
  const tag = node.getText().find((text) => text.kind === kind);
  assert(tag, `The JSDoc node must have a ${kind} tag.`);

  return tag.text;
}

/**
 * Get the description from a JSDoc node.
 *
 * This will remove the `- ` prefix from the description, if it exists.
 *
 * @param node - The JSDoc node.
 * @returns The description.
 */
function getDescription(node: JSDocTagInfo) {
  const tag = getTag(node, 'text');
  if (tag.startsWith('- ')) {
    return tag.slice(2);
  }

  return tag;
}

/**
 * Unwrap a Promise type.
 *
 * @param type - The type to unwrap.
 * @returns The unwrapped type as a string.
 */
export function unwrapPromise(type: Type) {
  if (type.getSymbol()?.getName() === 'Promise') {
    return type.getTypeArguments()[0].getText();
  }

  return type.getText();
}

/**
 * Get the methods in the `onRpcRequest` handler. This function assumes that the
 * `onRpcRequest` handler exists, and uses the `getMethodHandler` function to
 * get the methods.
 *
 * @returns An array of methods.
 */
export async function getMethods(): Promise<Method[]> {
  const project = new Project({
    tsConfigFilePath: resolve(process.cwd(), 'tsconfig.json'),
  });

  const path = await getMainFilePath();
  const file = project.getSourceFile(path);
  assert(file, 'Main file must exist.');

  const onRpcRequest = getRpcRequestHandler(file);
  const callExpression = onRpcRequest.asKind(SyntaxKind.CallExpression);
  assert(callExpression?.getExpression().getText() === 'getMethodHandler');

  const options = callExpression
    .getArguments()[0]
    ?.asKind(SyntaxKind.ObjectLiteralExpression);

  assert(options, 'The `getMethodHandler` call must have options.');

  return options.getProperties().map((node) => {
    const property = node.asKind(SyntaxKind.PropertyAssignment);
    assert(property, 'The method must be a property assignment.');

    const object = property.getInitializerIfKind(
      SyntaxKind.ObjectLiteralExpression,
    );

    assert(object, 'The method must have an object literal expression.');

    const handler = object
      .getProperty('handler')
      ?.asKind(SyntaxKind.PropertyAssignment);

    assert(handler, 'The method must have a handler property.');

    const handlerInitializer = handler.getInitializer();
    const fn =
      handlerInitializer?.asKind(SyntaxKind.ArrowFunction) ??
      handlerInitializer?.asKind(SyntaxKind.FunctionExpression);

    assert(fn, 'The method must have a handler function.');

    const signature = fn.getSignature();
    const paramsName = signature.getParameters()[0].getName();

    const paramsTags = signature
      .getJsDocTags()
      .filter((tag) => tag.getName() === 'param')
      .filter((tag) => {
        const parameterName = getTag(tag, 'parameterName');
        return parameterName.startsWith(paramsName);
      })
      .map((tag) => ({
        name: getTag(tag, 'parameterName'),
        description: getDescription(tag),
      }));

    const returnTag = signature
      .getJsDocTags()
      .find((tag) => tag.getName() === 'returns');

    const documentation = signature
      .getDocumentationComments()
      .filter((comment) => comment.getKind() === 'text')
      .map((comment) => comment.getText());

    return {
      name: property.getName(),
      documentation,
      params: {
        name: paramsName,
        type: fn.getParameters()[0].getType().getText(),
        documentation: paramsTags,
      },
      response: {
        type: unwrapPromise(fn.getReturnType()),
        documentation: returnTag ? getDescription(returnTag) : undefined,
      },
    };
  });
}

/**
 * Get the documentation comment for a method.
 *
 * @param method - The method.
 * @returns The documentation comment.
 */
export function getDocumentationComment(method: Method) {
  const comment = ['/**'];

  // General documentation for the method.
  method.documentation.forEach((line) => {
    comment.push(` * ${line}`);
  });

  // Documentation for the parameters.
  comment.push(' *');
  method.params.documentation.forEach((tag) => {
    comment.push(` * @param ${tag.name} - ${tag.description}`);
  });

  // Documentation for the return value.
  if (method.response.documentation) {
    comment.push(` * @returns ${method.response.documentation}`);
  }

  comment.push(' */');
  return comment.join('\n');
}

/**
 * Get the method signature.
 *
 * @param method - The method.
 * @param method.name - The method name.
 * @param method.params - The method parameters.
 * @param method.response - The method response.
 * @returns The method signature as a string.
 */
export function getMethodSignature({ name, params, response }: Method) {
  return `${name}(${params.name}: ${params.type}): Promise<${response.type}>;`;
}

/**
 * Get the declaration file. This file contains the `installSnap` function and
 * the function types for the methods in the `onRpcRequest` handler.
 *
 * @returns The declaration file as a string.
 */
export async function getDeclarationFile() {
  const methods = await getMethods();

  const code = `
    // DO NOT EDIT THIS FILE. This file is generated by the Metamask Snaps SDK.

    /**
    * Install the Snap with the given ID and (optional) version.
    *
    * @param snapId - The ID of the Snap to install.
    * @param version - The version of the Snap to install. If this is not
    * provided, the latest version will be installed.
    * @returns The Snap interface, i.e., an object with the methods that the
    * Snap exports. See {@link SnapInterface}.
    */
    export function installSnap(snapId: string, version?: string): Promise<SnapInterface>;

    /**
    * The Snap interface. This is an object with the methods that the Snap
    * exports. The methods are asynchronous, and return a Promise that resolves
    * to the response to the JSON-RPC request.
    *
    * @example
    * const snap = await installSnap('my-snap');
    *
    * // Call the \`foo\` method, with the object as the request parameters.
    * const response = await snap.foo({ bar: 'baz' });
    */
    export type SnapInterface = {
      ${methods
        .map(
          (method) => `
            ${getDocumentationComment(method)}
            ${getMethodSignature(method)}
          `,
        )
        .join('')}
    }
  `;

  return formatCode(code);
}

/**
 * Get the runtime file. This file is a stringified version of the
 * `installSnap` function.
 *
 * @returns The runtime file as a string.
 */
export function getRuntimeFile() {
  const code = `
    // DO NOT EDIT THIS FILE. This file is generated by the Metamask Snaps SDK.

    ${installSnap.toString()}
  `;

  return formatCode(code);
}

/**
 * Generate the `snap.d.ts` and `snap.js` files.
 */
export async function generateSnapFiles() {
  const declarationFile = await getDeclarationFile();
  const runtimeFile = getRuntimeFile();

  await Promise.all([
    // TODO: Write these to a user-defined path.
    writeFile(resolve(process.cwd(), 'snap.d.ts'), declarationFile),
    writeFile(resolve(process.cwd(), 'snap.js'), runtimeFile),
  ]);
}
