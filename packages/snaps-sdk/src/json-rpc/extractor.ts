import { assert } from '@metamask/utils';
import { readFile, writeFile } from 'fs/promises';
import { compile } from 'handlebars';
import { resolve } from 'path';
import type {
  VariableStatement,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Node,
  SourceFile,
  CallExpression,
  ObjectLiteralExpression,
  PropertyAssignment,
  Signature,
  JSDocTagInfo,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Symbol,
  Declaration,
} from 'typescript';
import ts, {
  createProgram,
  isCallExpression,
  isIdentifier,
  isObjectLiteralExpression,
  isPropertyAssignment,
  isVariableDeclaration,
  isVariableStatement,
} from 'typescript';

/**
 * Get the `onRpcRequest` handler from a list of nodes.
 *
 * @param nodes - The nodes to search.
 * @param sourceFile - The source file.
 * @returns The `onRpcRequest` handler node.
 * @throws If the `onRpcRequest` handler is not found.
 */
function getOnRpcRequestHandler(
  nodes: Node[],
  sourceFile: SourceFile,
): VariableStatement {
  const onRpcRequestHandler = nodes.find((node) => {
    return (
      isVariableStatement(node) &&
      node.declarationList.declarations.some(
        (declaration) =>
          isVariableDeclaration(declaration) &&
          declaration.name.getText(sourceFile) === 'onRpcRequest',
      )
    );
  }) as VariableStatement | undefined;

  assert(
    onRpcRequestHandler,
    'Could not find `onRpcRequest` handler. Please make sure the handler is exported.',
  );

  return onRpcRequestHandler;
}

/**
 * Get the `getMethodHandler` call from a list of nodes.
 *
 * @param nodes - The nodes to search.
 * @param sourceFile - The source file.
 * @returns The `getMethodHandler` call node.
 */
function getMethodHandler(nodes: Node[], sourceFile: SourceFile) {
  const node = getOnRpcRequestHandler(nodes, sourceFile);
  const methodHandler = node.declarationList.declarations.find(
    (declaration) => {
      return (
        isVariableDeclaration(declaration) &&
        declaration.initializer &&
        isCallExpression(declaration.initializer) &&
        isIdentifier(declaration.initializer.expression) &&
        declaration.initializer.expression.text === 'getMethodHandler' &&
        declaration.initializer.arguments.length === 1
      );
    },
  );

  assert(
    methodHandler,
    'Could not find `getMethodHandler` call. Please make sure the `getMethodHandler` call is used properly.',
  );

  return methodHandler.initializer as CallExpression;
}

/**
 * Get the handler functions from a `getMethodHandler` call.
 *
 * @param methodHandler - The `getMethodHandler` call.
 * @param sourceFile - The source file.
 * @returns The handler functions.
 */
function getHandlerFunctions(
  methodHandler: ObjectLiteralExpression,
  sourceFile: SourceFile,
) {
  const elements = methodHandler.properties.filter((node) => {
    return (
      isPropertyAssignment(node) && isObjectLiteralExpression(node.initializer)
    );
  }) as PropertyAssignment[];

  return elements.map((element) => {
    const object = element.initializer as ObjectLiteralExpression;
    const handler = object.properties.find((node) => {
      return (
        isPropertyAssignment(node) &&
        node.name.getText(sourceFile) === 'handler'
      );
    });

    assert(
      handler,
      'Could not find `handler` property. Please make sure the `handler` property is used properly.',
    );

    return {
      name: element.name.getText(sourceFile),
      handler,
    };
  });
}

/**
 * Get the documentation tag from a node.
 *
 * @param node - The node.
 * @param type - The tag type.
 * @returns The documentation tag.
 */
function getDocumentationTag(
  // ESLint thinks `Symbol` is the native `Symbol` type, but it's actually a
  // type from the TypeScript compiler.
  // eslint-disable-next-line @typescript-eslint/ban-types
  node: Signature | Symbol,
  type: 'returns' | 'param',
) {
  return node.getJsDocTags().find((tag) => {
    return tag.name === type;
  });
}

/**
 * Get the documentation text from a tag.
 *
 * @param tagInfo - The tag info.
 * @returns The documentation text.
 */
function getDocumentationText(tagInfo: JSDocTagInfo | undefined) {
  return tagInfo?.text?.find(({ kind }) => kind === 'text')?.text;
}

/**
 * Extract the methods from a file.
 *
 * @param path - The path to the file.
 * @returns The methods.
 */
function extractMethods(path: string) {
  // TODO: Add support for `tsconfig.json`.
  const program = createProgram({
    options: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      strict: true,
      noEmit: true,
    },
    rootNames: [path],
  });

  const sourceFile = program.getSourceFile(path);
  assert(sourceFile, 'Path not found. Please make sure the path is correct.');

  const nodes = sourceFile.getChildren()[0].getChildren();
  const methodHandler = getMethodHandler(nodes, sourceFile);
  const methodHandlerArgs = methodHandler.arguments[0];

  assert(
    methodHandlerArgs && isObjectLiteralExpression(methodHandlerArgs),
    'Could not find `getMethodHandler` arguments. Please make sure the `getMethodHandler` call is used properly.',
  );

  const checker = program.getTypeChecker();
  const handlerFunctions = getHandlerFunctions(methodHandlerArgs, sourceFile);
  return handlerFunctions.map(({ name, handler }) => {
    const handlerType = checker.getTypeAtLocation(handler);
    const [signature] = handlerType.getCallSignatures();

    return {
      name,
      documentation: signature.getDocumentationComment(checker)?.[0]?.text,
      params: signature.parameters.map((parameter) => {
        return {
          name: parameter.getName(),
          documentation: getDocumentationText(
            getDocumentationTag(parameter, 'param'),
          ),
          type: checker.typeToString(
            checker.getTypeOfSymbolAtLocation(
              parameter,
              parameter.valueDeclaration as Declaration,
            ),
          ),
        };
      }),
      returns: {
        documentation: getDocumentationText(
          getDocumentationTag(signature, 'returns'),
        ),
        type: checker.typeToString(signature.getReturnType()),
      },
    };
  });
}

/**
 * Get the Handlebars template function.
 *
 * @returns A function that can be used to render the template.
 */
async function getTemplate() {
  const template = await readFile(
    resolve(__dirname, './template.hbs'),
    'utf-8',
  );
  return compile(template);
}

getTemplate()
  .then((template) => {
    return template({
      methods: extractMethods(resolve(__dirname, './test/test.ts')),
    });
  })
  .then(async (html) => {
    await writeFile(resolve(__dirname, './test/test.html'), html);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
