/* eslint-disable no-bitwise, no-console */

import { assert } from '@metamask/utils';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import type { BuiltInParserName } from 'prettier';
import { format } from 'prettier';
import type {
  JSDocTag,
  ObjectLiteralExpression,
  PropertyAssignment,
  Symbol,
  Type,
  TypeNode,
  VariableDeclaration,
} from 'ts-morph';
import { Project, SymbolFlags, SyntaxKind, TypeFormatFlags } from 'ts-morph';

const TS_CONFIG_PATH = resolve(process.cwd(), 'tsconfig.json');
const SCHEMA_OUTPUT_PATH = resolve(process.cwd(), 'schema', 'schema.json');

// Types which should be kept as-is, without trying to expand them or use type
// aliases.
const LITERAL_TYPES = ['Json', 'JsonRpcParams', 'SnapId'];

// Types which should be represented as `null` in the schema.
const NULLABLE_TYPES = ['null', 'undefined', 'void', 'never'];

// A regular expression to remove the leading hyphen and whitespace from
// property descriptions in JSDoc `@property` tags.
const PROPERTY_DESCRIPTION_REGEX = /^\s?-\s/u;

// A regular expression to parse example content from JSDoc comments.
const EXAMPLE_JSDOC_REGEX =
  /^(?:(?<title>.+)\n)?```(?<language>\w+)\n(?<content>[\s\S]+)```$/u;

// Mapping of file extensions to Prettier parsers, used to format example code
// in the JSDoc comments of the handlers.
const PRETTIER_PARSER: Record<string, BuiltInParserName> = {
  json: 'json',
  ts: 'typescript',
  tsx: 'typescript',
  js: 'babel',
  jsx: 'babel',
};

/**
 * The type of subjects that can call a JSON-RPC method.
 */
type SubjectType = 'snap' | 'website';

/**
 * The schema for a JSON-RPC method, including its name, description,
 * parameters, return type, and the types of subjects that are allowed to call
 * it.
 */
type Method = {
  name: string;
  description: string | null;
  parameters: MethodParameter[] | MethodParameter | null;
  result: MethodParameter[] | MethodParameter | null;
  subjectTypes: SubjectType[];
  examples: MethodExample[];
  restricted: boolean;
};

/**
 * The schema for a method parameter, including its name, type, and description.
 */
type MethodParameter = {
  type: string;
  name?: string;
  description?: string | null;
};

/**
 * The schema for a method example, including its title (if any), language, and
 * content.
 */
type MethodExample = {
  title?: string;
  language: string;
  content: string;
};

/**
 * Get the type of a property at the location of the implementation function of
 * a handler. This is needed to extract the type of the properties at the
 * correct location.
 *
 * @param symbol - The symbol of the handler, which is expected to be the symbol
 * of the object literal that defines the handler.
 * @param object - The object literal expression that defines the handler, which
 * is needed to find the correct property to extract the type from.
 * @returns The type of the property at the location of the implementation
 * function of the handler.
 */
function getTypeAtLocation(symbol: Symbol, object: ObjectLiteralExpression) {
  const property =
    object.getProperty('implementation') ??
    object.getProperty('specificationBuilder');

  assert(property, 'Property "implementation" not found.');

  const typeAtLocation = symbol.getTypeAtLocation(property);
  assert(typeAtLocation, 'Type at location not found.');

  return typeAtLocation;
}

/**
 * Unwrap a `Promise` type node to get the underlying type, if the given type
 * node is a `Promise` type. If the given type node is not a `Promise` type, it
 * is returned as-is.
 *
 * @param typeNode - The type node to unwrap.
 * @returns The underlying type node if the given type node is a `Promise` type,
 * or the given type node itself if it is not a `Promise` type.
 */
function unwrapPromiseTypeNode(typeNode: TypeNode) {
  if (typeNode.isKind(SyntaxKind.TypeReference)) {
    const typeReference = typeNode.asKindOrThrow(SyntaxKind.TypeReference);
    if (typeReference.getTypeName().getText() === 'Promise') {
      const typeArguments = typeReference.getTypeArguments();
      if (typeArguments.length === 1) {
        return typeArguments[0];
      }
    }
  }

  return typeNode;
}

/**
 * Get the structural type node for a type, if it is an alias for a structural
 * type. This is needed to get a more accurate string representation of the
 * type, since some types (e.g., `Record`) are represented as an index signature
 * in the compiler API, which does not include the type alias name and can be
 * difficult to read.
 *
 * @param type - The type to get the structural type node for.
 * @returns The structural type node for the type, or `null` if the type is not
 * an alias for a structural type.
 */
function getStructuralTypeNode(type: Type): TypeNode | null {
  const aliasSymbol = type.getAliasSymbol();
  if (!aliasSymbol) {
    return null;
  }

  const declaration = aliasSymbol.getDeclarations()[0];
  if (!declaration?.isKind(SyntaxKind.TypeAliasDeclaration)) {
    return null;
  }

  const typeNode = declaration.getTypeNodeOrThrow();
  if (typeNode.isKind(SyntaxKind.TypeReference)) {
    const typeName = typeNode.getTypeName().getText();
    if (typeName === 'Record') {
      return typeNode;
    }
  }

  return null;
}

/**
 * If a type is a union of the literal types `true` and `false`, replace it with
 * the `boolean` type.
 *
 * @param types - An array of type strings to check and fix.
 * @returns An array of type strings with `true | false` replaced by `boolean`,
 * if applicable.
 */
function mergeBooleanTypes(types: string[]) {
  if (types.includes('true') && types.includes('false')) {
    return types
      .filter((type) => type !== 'true' && type !== 'false')
      .concat('boolean');
  }

  return types;
}

/**
 * Get a type alias for a plain type string, if it matches certain known types
 * that should be represented as a specific alias in the schema.
 *
 * @param plainType - The plain type string to get the alias for.
 * @returns The type alias for the plain type string, or `null` if there is no
 * specific alias for the plain type string.
 */
function getTypeAlias(plainType: string) {
  if (LITERAL_TYPES.includes(plainType)) {
    return plainType;
  }

  if (NULLABLE_TYPES.includes(plainType)) {
    return 'null';
  }

  // Edge cases.
  if (plainType === 'ComponentOrElement') {
    return 'JSXElement';
  }

  // This is a workaround for a specific issue where the type of the
  // `params` property of the JSON-RPC request object is represented as a
  // complex intersection and union of types. It may be possible to simplify
  // this in the future by improving the way we extract the type of the `params`
  // property, but for now we can just check for this specific case and return
  // the expected type alias.
  if (
    plainType ===
      '(((Record<string, Json> | Json[]) & ExactOptionalGuard) & JsonRpcParams) | undefined' ||
    plainType ===
      '(((Json[] | Record<string, Json>) & ExactOptionalGuard) & JsonRpcParams) | undefined'
  ) {
    return 'JsonRpcParams';
  }

  return null;
}

/**
 * Get a clean string representation of a type. This function handles special
 * cases, such as union and intersection types, to provide a more accurate and
 * readable string representation.
 *
 * @param type - The type to get the string representation of.
 * @param seen - A set of type strings that have already been processed, to
 * avoid infinite recursion in case of circular type references.
 * @returns The string representation of the type.
 */
function getCleanTypeString(type: Type, seen = new Set<string>()): string {
  const plainType = type.getText(
    undefined,

    // This flag tells TypeScript to use type aliases when possible.
    TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
  );

  const alias = getTypeAlias(plainType);
  if (alias) {
    return alias;
  }

  if (seen.has(plainType)) {
    return plainType;
  }

  seen.add(plainType);

  // Process union types by getting the string representation of each type in
  // the union and joining them with ` | `.
  if (type.isUnion()) {
    const unionTypes = type.getUnionTypes();
    const unionTypeStrings = unionTypes.map((unionType) =>
      getTypeString(unionType, seen),
    );

    // TypeScript represents `boolean` as a union of `true` and `false`, so we
    // check for this specific case and replace it with `boolean` in the string
    // representation.
    const mergedArray = mergeBooleanTypes(unionTypeStrings);
    const sortedArray = mergedArray.toSorted((a, b) => {
      if (a === 'null' || a === 'undefined') {
        return 1;
      }

      if (b === 'null' || b === 'undefined') {
        return -1;
      }

      return a.localeCompare(b);
    });

    const uniqueTypes = [...new Set(sortedArray)];
    return uniqueTypes.join(' | ');
  }

  // Process intersection types by getting the string representation of each
  // type in the intersection and joining them with ` & `.
  if (type.isIntersection()) {
    const intersectionTypes = type.getIntersectionTypes();
    const intersectionTypeStrings = intersectionTypes.map((intersectionType) =>
      getTypeString(intersectionType, seen),
    );

    return intersectionTypeStrings.join(' & ');
  }

  // For object types that are not arrays and have properties, we want to get a
  // more detailed string representation that includes the properties of the
  // object, with any fixes applied to the property types.
  if (type.isObject() && !type.isArray() && type.getProperties().length > 0) {
    const properties = type.getProperties();
    const propertyStrings = properties.map((property) => {
      const isOptional = property.hasFlags(SymbolFlags.Optional);
      const declaration =
        property.getValueDeclaration() ?? property.getDeclarations()[0];
      const propertyType = property.getTypeAtLocation(declaration);

      return `${property.getName()}${isOptional ? '?' : ''}: ${getTypeString(propertyType, seen)}`;
    });

    return `{ ${propertyStrings.join('; ')} }`;
  }

  seen.delete(plainType);
  return type.getText(
    undefined,
    TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
      TypeFormatFlags.NoTruncation |
      TypeFormatFlags.InTypeAlias,
  );
}

/**
 * Get the string representation of a type, using type aliases where possible
 * and without truncating the type (e.g., to `string` or `object`).
 *
 * @param type - The type to get the string representation of.
 * @param seen - A set of type strings that have already been processed, to
 * avoid infinite recursion in case of circular type references.
 * @returns The string representation of the type.
 */
function getTypeString(type: Type, seen = new Set<string>()): string {
  // Aliased types that are not properly represented with `getText()`, such as
  // `Record`.
  const aliasSymbol = type.getAliasSymbol();
  if (aliasSymbol) {
    const aliasName = aliasSymbol.getName();

    // We want to skip `Omit` so it goes through the normal process of getting
    // the type string, which will give us a more accurate representation of the
    // type.
    if (aliasName !== 'Omit') {
      const typeArguments = type.getAliasTypeArguments();

      // If the type has type arguments (generics), include those in the string
      // representation. For example, `Record<string, Json>` instead of
      // `{ [x: string]: Json; }`.
      if (typeArguments.length > 0) {
        const stringifiedArguments = typeArguments.map((argument) =>
          getTypeString(argument, seen),
        );

        return `${aliasName}<${stringifiedArguments.join(', ')}>`;
      }
    }
  }

  const typeNode = getStructuralTypeNode(type);
  if (typeNode) {
    return typeNode.getText();
  }

  return getCleanTypeString(type, seen);
}

/**
 * Get the type alias declaration for a type, if it has one. This is needed to
 * extract the JSDoc comments from the type alias declaration, which may include
 * a description of the type that we want to include in the schema.
 *
 * @param type - The type to get the type alias declaration for.
 * @returns The type alias declaration for the type, or `null` if the type does
 * not have a type alias declaration.
 */
function getTypeAliasDeclaration(type: Type) {
  const symbol = type.getAliasSymbol() ?? type.getSymbol();
  if (!symbol) {
    return null;
  }

  const declaration = symbol
    .getDeclarations()
    .find((symbolDeclaration) =>
      symbolDeclaration.isKind(SyntaxKind.TypeAliasDeclaration),
    );

  return declaration?.asKind(SyntaxKind.TypeAliasDeclaration) ?? null;
}

/**
 * Get the description of a type node from its JSDoc comments, if it has any.
 *
 * @param typeNode - The type node to get the description for.
 * @returns The description of the type node from its JSDoc comments, or `null`
 * if the type does not have any JSDoc comments.
 */
function getTypeNodeDescription(typeNode: TypeNode) {
  const typeReference = typeNode.asKindOrThrow(SyntaxKind.TypeReference);
  const identifier = typeReference
    .getTypeName()
    .asKindOrThrow(SyntaxKind.Identifier);

  const symbol = identifier.getSymbol()?.getAliasedSymbol();
  if (!symbol) {
    return null;
  }

  const declaration = symbol
    .getDeclarations()
    .find((symbolDeclarations) =>
      symbolDeclarations.isKind(SyntaxKind.TypeAliasDeclaration),
    );

  if (!declaration) {
    return null;
  }

  const jsDocs = declaration
    .asKindOrThrow(SyntaxKind.TypeAliasDeclaration)
    .getJsDocs();

  assert(
    jsDocs.length <= 1,
    'Expected at most one JSDoc comment on type alias declaration.',
  );

  return jsDocs[0]?.getCommentText() ?? null;
}

/**
 * Get the JSDoc `@property` tags for a type, if it has any.
 *
 * @param type - The type to get the JSDoc `@property` tags for.
 * @returns An object mapping property names to their descriptions from the
 * JSDoc `@property` tags, or an empty object if the type does not have any
 * JSDoc `@property` tags.
 */
function getObjectJsDocPropertyTags(type: Type) {
  const declaration = getTypeAliasDeclaration(type);
  if (!declaration) {
    return {};
  }

  const symbol = declaration.getSymbol();
  if (!symbol) {
    return {};
  }

  const tags = symbol.getJsDocTags();
  const propertyTags = tags
    .filter((tag) => tag.getName() === 'property')
    .map((tag) => {
      const text = tag
        .getText()
        .map((part) => part.text)
        .join('\n');

      // The text of a `@property` tag is expected to be in the format
      // `propertyName - propertyDescription`. We split the text on the first
      // space to separate the property name from the description, and then
      // remove any leading hyphen and whitespace from the description.
      const [name, ...descriptionParts] = text.split(' ');
      const description = descriptionParts
        .join(' ')
        .replace(PROPERTY_DESCRIPTION_REGEX, '');

      return [name, description] as const;
    });

  return Object.fromEntries(propertyTags);
}

/**
 * Get the description of an object property from its JSDoc comments, if it has
 * any, or from the JSDoc `@property` tags of the type if it does not have
 * inline JSDoc comments.
 *
 * @param property - The symbol of the property to get the description for.
 * @param propertyTags - An object mapping property names to their descriptions
 * from the JSDoc `@property` tags of the type.
 * @returns The description of the property from its JSDoc comments or the JSDoc
 * `@property` tags of the type, or `null` if the property does not have any
 * JSDoc comments or a corresponding JSDoc `@property` tag.
 */
function getObjectPropertyDescription(
  property: Symbol,
  propertyTags: Record<string, string>,
): string | null {
  const propertyName = property.getName();

  const [declaration] = property.getDeclarations();
  const jsDocs = declaration
    .asKindOrThrow(SyntaxKind.PropertySignature)
    .getJsDocs();

  // If the property has inline JSDoc comments, use those as the description.
  // Otherwise, if there is a `@property` tag for the property, use the
  // description from the tag.
  if (jsDocs.length > 0) {
    return jsDocs.map((jsDoc) => jsDoc.getCommentText()).join(' ');
  }

  return propertyTags[propertyName] ?? null;
}

/**
 * Get the method parameter object from a compiler type.
 *
 * @param typeNode - The type node to get the method parameter from.
 * @returns The method parameter object, or `null` if the type is a nullable
 * type (e.g., `null`, `undefined`, `void`, or `never`).
 */
function getObjectProperty(typeNode: TypeNode): MethodParameter | null {
  const type = typeNode.getType();
  const typeString = getTypeString(type);
  if (typeString === 'null') {
    return null;
  }

  return {
    type: typeString,
    description: getTypeNodeDescription(typeNode),
  };
}

/**
 * Get the properties of an object type, including their names, types, and
 * JSDoc descriptions (if any).
 *
 * @param typeNode - The object type node to extract properties from.
 * @param object - The object literal expression that defines the type, which is
 * needed to find the correct property to extract the type from.
 * @returns An array of properties, where each property includes its name,
 * type, and JSDoc description (if any).
 */
function getObjectProperties(
  typeNode: TypeNode,
  object: ObjectLiteralExpression,
): MethodParameter | MethodParameter[] | null {
  const type = typeNode.getType();
  if (type.isString() || type.isNumber() || type.isBoolean()) {
    return getObjectProperty(typeNode);
  }

  if (type.isArray()) {
    const elementType = type.getArrayElementType();
    assert(elementType, 'Array element type not found.');

    return {
      type: `${getTypeString(elementType)}[]`,
      description: getTypeNodeDescription(typeNode),
    };
  }

  if (type.getProperties().length === 0) {
    return getObjectProperty(typeNode);
  }

  // For each property of the `params` object, extract its name, type, and JSDoc
  // description (if any).
  const objectProperties = type.getProperties();
  const propertySignatures = objectProperties.filter((property) =>
    property.getDeclarations()[0].isKind(SyntaxKind.PropertySignature),
  );

  if (propertySignatures.length === 0) {
    return null;
  }

  // Parse `@property` tags from JSDoc comments on the type alias declaration,
  // if any, to get descriptions for the properties that may not be included in
  // the type itself.
  const propertyTags = getObjectJsDocPropertyTags(type);

  return propertySignatures.map((property) => {
    const propertyType = getTypeAtLocation(property, object);

    return {
      name: property.getName(),
      type: getTypeString(propertyType),
      description: getObjectPropertyDescription(property, propertyTags),
    };
  });
}

/**
 * Parse a method example from a JSDoc `@example` tag.
 *
 * @param tag - The JSDoc tag to parse the example from, which is expected to be
 * an `@example` tag with the example content in the tag's comment text.
 * @returns The method example parsed from the JSDoc tag, or `null` if the tag
 * does not contain a valid example in its comment text.
 */
async function parseJsDocExample(tag: JSDocTag): Promise<MethodExample | null> {
  const text = tag.getCommentText();
  if (!text) {
    return null;
  }

  // The example JSDoc tag is expected to be in this format:
  // ```
  // @example [optional title]
  // ```[language]
  // example content
  // ```
  const match = text.match(EXAMPLE_JSDOC_REGEX);
  if (!match) {
    return null;
  }

  const { title, language, content } = match.groups as {
    title?: string;
    language: string;
    content: string;
  };

  // While examples should be formatted correctly in the JSDoc comments,
  // TypeScript does not preserve the formatting of the example content, so we
  // use Prettier to format the example content based on the specified language.
  const parser = PRETTIER_PARSER[language];
  if (!parser) {
    throw new Error(
      `Unable to format example with language "${language}" because there is no corresponding Prettier parser. Supported languages are: ${Object.keys(PRETTIER_PARSER).join(', ')}. To resolve this, either change the language of the example to a supported language or add a corresponding Prettier parser to the \`PRETTIER_PARSER\` mapping in the script.\n\nThis error occurred while parsing "${tag.getSourceFile().getFilePath()}" at line ${tag.getStartLineNumber()}.`,
    );
  }

  return {
    title: title?.trim(),
    language,
    content: await format(content, { parser }),
  };
}

/**
 * Get the method description from the JSDoc comments. This function expects
 * the handler declaration to include JSDoc comments that describe the method.
 *
 * @param declaration - The variable declaration that defines the handler, which
 * is expected to include JSDoc comments that describe the method.
 * @returns The method description extracted from the JSDoc comments, or `null`
 * if no description is found.
 */
function getMethodDescription(declaration: VariableDeclaration) {
  // Get the variable statement from the declaration, which is needed to access
  // the JSDoc comments.
  const variableStatement = declaration.getVariableStatementOrThrow();
  const jsDocs = variableStatement.getJsDocs();

  if (jsDocs.length === 0) {
    return null;
  }

  return jsDocs.map((jsDoc) => jsDoc.getCommentText()).join(' ');
}

/**
 * Get the method examples from the JSDoc `@example` tags. This function expects
 * the handler declaration to include JSDoc comments with `@example` tags that
 * provide examples of how to call the method, which can be included in the
 * schema to provide additional context and guidance for developers using the
 * method.
 *
 * @param declaration - The variable declaration that defines the handler,
 * which is expected to include JSDoc comments with `@example` tags that provide
 * examples of how to call the method.
 * @returns An array of method examples extracted from the JSDoc `@example`
 * tags, or an empty array if no examples are found.
 */
async function getMethodExamples(
  declaration: VariableDeclaration,
): Promise<MethodExample[]> {
  const variableStatement = declaration.getVariableStatementOrThrow();
  const jsDocs = variableStatement.getJsDocs();

  const examples = jsDocs.flatMap((jsDoc) => jsDoc.getTags());
  const promises = examples
    .filter((tag) => tag.getTagName() === 'example')
    .map(async (example) => parseJsDocExample(example));

  const results = await Promise.all(promises);
  return results.filter(
    (example): example is MethodExample => example !== null,
  );
}

/**
 * Get the method parameters from the `implementation` property of a handler.
 *
 * This function expects properties to include an `implementation` property
 * like the following, where `MethodParameters` is a type that represents the
 * parameters of the JSON-RPC method.
 *
 * ```ts
 * {
 *   implementation: (
 *     request: JsonRpcRequest<MethodParameters>,
 *     // ...
 *   ) => { ... },
 *   // ...
 * }
 * ```
 *
 * @param object - The object literal expression that defines the handler, which
 * is needed to find the correct property to extract the type from.
 * @returns An array of method parameters, where each parameter includes its
 * name, type, and JSDoc description (if any).
 */
function getMethodParameters(
  object: ObjectLiteralExpression,
): MethodParameter | MethodParameter[] | null {
  // Get the call signatures of the implementation function, which is expected
  // to be a middleware function.
  const implementation = object.getPropertyOrThrow('implementation').getType();
  assert(
    implementation?.isObject(),
    'Expected `implementation` to be an object type.',
  );

  const [callSignature] = implementation.getCallSignatures();
  assert(
    callSignature,
    'Expected `implementation` to have at least one call signature.',
  );

  // Get the `request` parameter of the call signature, which is expected to
  // be a JSON-RPC request object.
  const [request] = callSignature.getParameters();

  // Get the declaration of the `request` parameter.
  const requestDeclaration = request
    .getDeclarations()
    .find((declaration) => declaration.isKind(SyntaxKind.Parameter));

  // From the declaration of the `request` parameter, get the type reference of
  // the parameter type (e.g., `JsonRpcRequest<Type>`).
  const requestTypeReference = requestDeclaration
    ?.asKind(SyntaxKind.Parameter)
    ?.getTypeNode()
    ?.asKind(SyntaxKind.TypeReference);

  if (!requestTypeReference) {
    return null;
  }

  // Extract the type of the `params` property of the JSON-RPC request object,
  // which is expected to be the first (and only) type argument of the request
  // type.
  const [requestParameters] = requestTypeReference.getTypeArguments();
  if (!requestParameters) {
    return null;
  }

  return getObjectProperties(requestParameters, object);
}

/**
 * Get the method return type from the `implementation` property of a handler.
 *
 * @param object - The object literal expression that defines the handler, which
 * is needed to find the correct property to extract the type from.
 * @returns The method return type, including its name, type, and JSDoc
 * description (if any).
 */
function getMethodResult(
  object: ObjectLiteralExpression,
): MethodParameter | MethodParameter[] | null {
  // Get the call signatures of the implementation function, which is expected
  // to be a middleware function.
  const implementation = object.getPropertyOrThrow('implementation').getType();
  assert(
    implementation?.isObject(),
    'Expected `implementation` to be an object type.',
  );

  const [callSignature] = implementation.getCallSignatures();
  assert(
    callSignature,
    'Expected `implementation` to have at least one call signature.',
  );

  // Get the `response` parameter of the call signature, which is expected to
  // be a JSON-RPC response object.
  const [, response] = callSignature.getParameters();

  // Get the declaration of the `response` parameter.
  const responseDeclaration = response
    .getDeclarations()
    .find((declaration) => declaration.isKind(SyntaxKind.Parameter));

  // From the declaration of the `response` parameter, get the type reference of
  // the parameter type (e.g., `PendingJsonRpcResponse<Type>`).
  const responseTypeReference = responseDeclaration
    ?.asKind(SyntaxKind.Parameter)
    ?.getTypeNode()
    ?.asKind(SyntaxKind.TypeReference);

  assert(
    responseTypeReference,
    'Expected response parameter declaration not found.',
  );

  // Extract the type of the `result` property of the JSON-RPC response object,
  // which is expected to be the first (and only) type argument of the response
  // type.
  const [responseResult] = responseTypeReference.getTypeArguments();
  if (!responseResult) {
    return null;
  }

  return getObjectProperties(responseResult, object);
}

/**
 * Get the subject types that are allowed to call a method, based on the method
 * name. This is a simple heuristic that assumes that methods whose names start
 * with `snap_` can only be called by Snaps, while methods whose names start
 * with `wallet_` can be called by both Snaps and websites.
 *
 * @param methodName - The name of the method to get the subject types for.
 * @returns An array of subject types that are allowed to call the method.
 */
function getMethodSubjectTypes(methodName: string): SubjectType[] {
  if (methodName.startsWith('snap_')) {
    return ['snap'];
  }

  if (methodName.startsWith('wallet_')) {
    return ['snap', 'website'];
  }

  return [];
}

/**
 * Process a single handler property assignment, extracting the method names,
 *
 * @param property - The property assignment that defines the handler, e.g., the
 * `handler_one` property in the following object literal:
 *
 * ```ts
 * {
 *   handler_one: handlerOne,
 *   // ...
 * }
 * ```
 *
 * @returns The name of the handler.
 */
async function processPermittedHandler(
  property: PropertyAssignment,
): Promise<Method> {
  const name = property.getName();

  // Get the handler identifier (e.g., the right-hand side of the property
  // assignment) from the `handlers` object.
  const initializer = property.getInitializerIfKindOrThrow(
    SyntaxKind.Identifier,
  );

  // Get the definition of the handler, e.g., the actual declaration of the
  // handler object.
  const [definition] = initializer.getDefinitions();
  assert(definition, `Definition for handler "${name}" not found.`);

  // Get the object literal expression that defines the handler.
  const declaration = definition
    .getDeclarationNode()
    ?.asKindOrThrow(SyntaxKind.VariableDeclaration);
  assert(declaration, `Declaration for handler "${name}" not found.`);
  const declarationInitializer = declaration.getInitializerIfKindOrThrow(
    SyntaxKind.SatisfiesExpression,
  );

  const object = declarationInitializer.getExpressionIfKindOrThrow(
    SyntaxKind.ObjectLiteralExpression,
  );

  const description = getMethodDescription(declaration);
  const parameters = getMethodParameters(object);
  const result = getMethodResult(object);
  const subjectTypes = getMethodSubjectTypes(name);
  const examples = await getMethodExamples(declaration);

  return {
    name,
    description,
    parameters,
    result,
    subjectTypes,
    examples,
    restricted: false,
  };
}

/**
 * Process the permitted handlers defined in `src/permitted/handlers.ts`,
 * extracting the method names, descriptions, parameters, return types, and
 * subject types for each handler.
 *
 * @param project - The `ts-morph` project instance to use for processing the
 * handlers file.
 * @returns An array of method schemas extracted from the permitted handlers.
 */
async function processPermittedHandlers(project: Project) {
  const handlersFile = project.getSourceFile('src/permitted/handlers.ts');
  assert(handlersFile, 'Handlers file not found.');

  const permittedHandlers =
    handlersFile.getVariableDeclaration('methodHandlers');
  assert(permittedHandlers, '`methodHandlers` variable not found.');

  const initializer = permittedHandlers.getInitializerIfKindOrThrow(
    SyntaxKind.ObjectLiteralExpression,
  );

  const promises = initializer.getProperties().map(async (property) => {
    const propertyAssignment = property.asKindOrThrow(
      SyntaxKind.PropertyAssignment,
    );

    return processPermittedHandler(propertyAssignment);
  });

  return await Promise.all(promises);
}

/**
 * Get the target name of a restricted method from the `targetName` property of
 * the permission builder. This function expects properties to include a
 * `targetName` property that is a string literal type:
 *
 * ```ts
 * {
 *   targetName: 'method_one',
 *   // ...
 * }
 * ```
 *
 * @param object - The object literal expression that defines the permission
 * builder, which is needed to find the correct property to extract the type
 * from.
 * @returns The target name of the restricted method.
 */
function getMethodTargetName(object: ObjectLiteralExpression) {
  const targetName = object.getPropertyOrThrow('targetName').getType();
  assert(
    targetName?.isStringLiteral(),
    'Expected `targetName` to be a string literal type.',
  );

  const value = targetName.getLiteralValue();
  assert(
    typeof value === 'string',
    'Expected `targetName` literal value to be a string.',
  );

  return value;
}

/**
 * Get the method specification from the `specificationBuilder` property of a
 * permission builder. This function expects the property to include a
 * `specificationBuilder` containing the specification builder function for the
 * restricted method.
 *
 * The specification builder type is quite complicated, so this function uses a
 * series of assertions to navigate through the type and extract the object
 * literal expression that defines the method specification.
 *
 * For reference, the expected structure of the types is as follows:
 * ```
 * ShorthandPropertyAssignment (`specificationBuilder`)
 *  └─ VariableDeclaration (e.g., `const specificationBuilder: PermissionSpecificationBuilder<...> = ...`)
 *      └─ TypeReference (e.g., `PermissionSpecificationBuilder<...>`)
 *          └─ TypeArguments[2] (e.g., `GetBip32EntropySpecification` identifier)
 *              └─ TypeReference (e.g., `GetBip32EntropySpecification`)
 *                  └─ TypeArguments[0] (e.g., `{ ... }` object literal type that defines the method specification)
 * ```
 *
 * @param object - The object literal expression that defines the handler.
 * @returns The object literal expression that defines the method specification.
 */
function getRestrictedMethodSpecification(object: ObjectLiteralExpression) {
  const specificationBuilder = object.getPropertyOrThrow(
    'specificationBuilder',
  );
  assert(specificationBuilder, 'Property `specificationBuilder` not found.');

  const builder = specificationBuilder.asKindOrThrow(
    SyntaxKind.ShorthandPropertyAssignment,
  );

  // Get the identifier of the `specificationBuilder` property, which is a
  // reference to the actual specification builder function defined elsewhere.
  const identifier = builder.getValueSymbolOrThrow();
  assert(identifier, 'Symbol for specification builder not found.');

  // Find the variable declaration for the specification builder function.
  const declaration = identifier
    .getDeclarations()
    .find((identifierDeclaration) =>
      identifierDeclaration.isKind(SyntaxKind.VariableDeclaration),
    );
  assert(declaration, 'Declaration for specification builder not found.');

  // Get the type node of the variable declaration, i.e., the
  // `PermissionSpecificationBuilder<...>` type reference.
  const typeNode = declaration
    .asKindOrThrow(SyntaxKind.VariableDeclaration)
    .getTypeNodeOrThrow()
    .asKindOrThrow(SyntaxKind.TypeReference);

  // Parse the type arguments of the `PermissionSpecificationBuilder` type
  // reference to get the specification type, which is expected to be the third
  // type argument (e.g., `GetBip32EntropySpecification`).
  const typeArguments = typeNode.getTypeArguments();
  assert(
    typeArguments.length === 3,
    'Expected specification builder type to have exactly three type arguments.',
  );

  const [, , specificationType] = typeArguments;
  const specificationSymbol = specificationType
    .asKindOrThrow(SyntaxKind.TypeReference)
    .getTypeName()
    .getSymbolOrThrow();

  // Find the type alias declaration for the specification type, e.g.,
  // ```ts
  // type MethodSpecification = ValidPermissionSpecification<{
  //   // ...
  // }>;
  // ```
  const specificationDeclaration = specificationSymbol
    .getDeclarations()
    .find((specificationSymbolDeclaration) =>
      specificationSymbolDeclaration.isKind(SyntaxKind.TypeAliasDeclaration),
    );
  assert(specificationDeclaration, 'Specification declaration not found.');

  // From the type alias declaration of the specification type, get the type
  // node of the type alias, which is expected to be a type reference to a type
  // that includes the method specification as a type argument
  // (e.g., `ValidPermissionSpecification<{ ... }>`).
  const specificationTypeNode = specificationDeclaration
    .asKindOrThrow(SyntaxKind.TypeAliasDeclaration)
    .getTypeNodeOrThrow()
    .asKindOrThrow(SyntaxKind.TypeReference);

  const specificationTypeArguments = specificationTypeNode.getTypeArguments();
  assert(
    specificationTypeArguments.length === 1,
    'Expected specification type to have exactly one type argument.',
  );

  // Finally, extract the object literal type that defines the method
  // specification.
  const [specificationObjectType] = specificationTypeArguments;
  return specificationObjectType.asKindOrThrow(SyntaxKind.TypeLiteral);
}

/**
 * Get the method parameters from the `methodImplementation` property of a
 * permission builder.
 *
 * This function expects properties to include a `methodImplementation`
 * property like the following:
 *
 * ```ts
 * {
 *   methodImplementation: getMethodImplementation(...),
 *   // ...
 * }
 * ```
 *
 * Where `getMethodImplementation` is a function that returns the actual
 * implementation of the method like this:
 *
 * ```ts
 * function getMethodImplementation() {
 *   return async function methodImplementation(
 *     request: JsonRpcRequest<MethodParameters>,
 *     // ...
 *   ): Promise<MethodResult> {
 *     // ...
 *   };
 * }
 * ```
 *
 * @param object - The object literal expression that defines the handler.
 * @returns An array of method parameters, where each parameter includes its
 * name, type, and JSDoc description (if any).
 */
function getRestrictedMethodParameters(
  object: ObjectLiteralExpression,
): MethodParameter | MethodParameter[] | null {
  // Get the call signatures of the implementation function, which is expected
  // to be a middleware function.
  const specification = getRestrictedMethodSpecification(object);
  const implementation = specification
    .getPropertyOrThrow('methodImplementation')
    .asKindOrThrow(SyntaxKind.PropertySignature);

  const type = implementation.getType();
  const [callSignature] = type.getCallSignatures();

  // Get the `request` parameter of the call signature, which is expected to
  // be a JSON-RPC request object.
  const [request] = callSignature.getParameters();

  // Get the declaration of the `request` parameter.
  const requestDeclaration = request
    .getDeclarations()
    .find((declaration) => declaration.isKind(SyntaxKind.Parameter));

  // From the declaration of the `request` parameter, get the type reference of
  // the parameter type (e.g., `JsonRpcRequest<Type>`).
  const requestTypeReference = requestDeclaration
    ?.asKind(SyntaxKind.Parameter)
    ?.getTypeNode()
    ?.asKind(SyntaxKind.TypeReference);

  if (!requestTypeReference) {
    return null;
  }

  // Extract the type of the `params` property of the JSON-RPC request object,
  // which is expected to be the first (and only) type argument of the request
  // type.
  const [requestParameters] = requestTypeReference.getTypeArguments();
  if (!requestParameters) {
    return null;
  }

  return getObjectProperties(requestParameters, object);
}

/**
 * Get the method return type from the `methodImplementation` property of a
 * restricted permission builder.
 *
 * @param object - The object literal expression that defines the
 * permission builder.
 * @returns The method return type, including its name, type, and JSDoc
 * description (if any).
 */
function getRestrictedMethodResult(
  object: ObjectLiteralExpression,
): MethodParameter | MethodParameter[] | null {
  const specification = getRestrictedMethodSpecification(object);
  const implementation = specification
    .getPropertyOrThrow('methodImplementation')
    .asKindOrThrow(SyntaxKind.PropertySignature);

  const implementationReference = implementation
    .getTypeNodeOrThrow()
    .asKindOrThrow(SyntaxKind.TypeReference);

  const [functionTypeNode] = implementationReference.getTypeArguments();
  const expressionIdentifier = functionTypeNode
    .asKindOrThrow(SyntaxKind.TypeQuery)
    .getExprName();

  // Get the actual function declaration of the permission builder.
  const functionDeclaration = expressionIdentifier
    .getSymbolOrThrow()
    .getDeclarations()
    .find((symbolDeclaration) =>
      symbolDeclaration.isKind(SyntaxKind.FunctionDeclaration),
    )
    ?.asKindOrThrow(SyntaxKind.FunctionDeclaration);

  assert(
    functionDeclaration,
    'Function declaration for permission builder implementation not found.',
  );

  const childFunction = functionDeclaration.getFirstDescendantByKindOrThrow(
    SyntaxKind.FunctionExpression,
  );

  const maybePromise = childFunction
    .getReturnTypeNodeOrThrow()
    .asKindOrThrow(SyntaxKind.TypeReference);
  const unwrappedReturnTypeNode = unwrapPromiseTypeNode(maybePromise);

  return getObjectProperties(unwrappedReturnTypeNode, object);
}

/**
 * Process a single restricted method property assignment, extracting the
 * method names, descriptions, parameters, return types, and subject types for
 * the handler.
 *
 * @param property - The property assignment that defines the permission
 * builder, e.g., the `method_one` property in the following object literal:
 *
 * ```ts
 * {
 *   method_one: permissionBuilderOne,
 *   // ...
 * }
 * ```
 *
 * @returns The method schema extracted from the restricted permission builder.
 */
async function processRestrictedPermissionBuilder(
  property: PropertyAssignment,
): Promise<Method> {
  const name = property.getName();

  // Get the permission builder identifier (e.g., the right-hand side of the
  // property assignment) from the `restrictedMethodPermissionBuilders` object.
  const initializer = property.getInitializerIfKindOrThrow(
    SyntaxKind.Identifier,
  );

  // Get the definition of the permission builder, e.g., the actual declaration
  // of the permission builder object.
  const [definition] = initializer.getDefinitions();
  assert(definition, `Definition for permission builder "${name}" not found.`);

  // Get the object literal expression that defines the permission builder. This
  // is a bit more complicated than for permitted handlers, since restricted
  // permission builders use `Object.freeze({ ... } as const)` instead of a
  // `satisfies` expression, so the AST structure looks like this:
  //
  // VariableDeclaration
  //  └─ CallExpression (Object.freeze)
  //      └─ AsExpression (as const)
  //          └─ ObjectLiteralExpression (the actual permission builder definition)
  const declaration = definition
    .getDeclarationNode()
    ?.asKindOrThrow(SyntaxKind.VariableDeclaration);

  assert(
    declaration,
    `Declaration for perimssion builder "${name}" not found.`,
  );

  const declarationInitializer = declaration.getInitializerIfKindOrThrow(
    SyntaxKind.CallExpression,
  );

  const asExpression = declarationInitializer
    .getArguments()[0]
    .asKindOrThrow(SyntaxKind.AsExpression);
  const object = asExpression.getExpressionIfKindOrThrow(
    SyntaxKind.ObjectLiteralExpression,
  );

  // Extract the method names and parameters from the permission builder
  // definition.
  const methodName = getMethodTargetName(object);
  const description = getMethodDescription(declaration);
  const parameters = getRestrictedMethodParameters(object);
  const result = getRestrictedMethodResult(object);
  const examples = await getMethodExamples(declaration);
  const subjectTypes = getMethodSubjectTypes(methodName);

  return {
    name: methodName,
    description,
    parameters,
    result,
    examples,
    subjectTypes,
    restricted: true,
  };
}

/**
 * Process the restricted permission builders defined in
 * `src/restricted/index.ts`, extracting the method names, descriptions,
 * parameters, return types, and subject types for each permission builder.
 *
 * @param project - The `ts-morph` project instance to use for processing the
 * restricted permission builders file.
 * @returns An array of method schemas extracted from the restricted permission
 * builders.
 */
async function processRestrictedPermissionBuilders(project: Project) {
  const restrictedPermissionBuildersFile = project.getSourceFile(
    'src/restricted/index.ts',
  );

  assert(
    restrictedPermissionBuildersFile,
    'Restricted permission builders file not found.',
  );

  const restrictedHandlers =
    restrictedPermissionBuildersFile.getVariableDeclaration(
      'restrictedMethodPermissionBuilders',
    );

  assert(
    restrictedHandlers,
    '`restrictedMethodPermissionBuilders` variable not found.',
  );

  // The `restrictedMethodPermissionBuilders` variable is expected to be an
  // object literal with an `as const` assertion.
  const initializer = restrictedHandlers
    .getInitializerIfKindOrThrow(SyntaxKind.AsExpression)
    .getExpressionIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);

  const promises = initializer.getProperties().map(async (property) => {
    const propertyAssignment = property.asKindOrThrow(
      SyntaxKind.PropertyAssignment,
    );

    return processRestrictedPermissionBuilder(propertyAssignment);
  });

  return await Promise.all(promises);
}

const project = new Project({
  tsConfigFilePath: TS_CONFIG_PATH,
});

const permittedMethods = await processPermittedHandlers(project);
const restrictedMethods = await processRestrictedPermissionBuilders(project);

const schema = [...permittedMethods, ...restrictedMethods].toSorted((a, b) =>
  a.name.localeCompare(b.name),
);

console.log(`Writing "schema.json" to ${SCHEMA_OUTPUT_PATH}...`);
await mkdir(dirname(SCHEMA_OUTPUT_PATH), { recursive: true });
await writeFile(SCHEMA_OUTPUT_PATH, JSON.stringify(schema, null, 2));
