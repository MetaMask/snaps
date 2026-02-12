/* eslint-disable no-bitwise, no-console */

import { assert } from '@metamask/utils';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import type {
  ObjectLiteralElementLike,
  ObjectLiteralExpression,
  PropertyAssignment,
  Symbol,
  Type,
  TypeNode,
  VariableDeclaration,
} from 'ts-morph';
import { Project, SyntaxKind, TypeFormatFlags } from 'ts-morph';

const TS_CONFIG_PATH = resolve(process.cwd(), 'tsconfig.json');
const SCHEMA_OUTPUT_PATH = resolve(process.cwd(), 'schema.json');

// Types which should be kept as-is, without trying to expand them or use type
// aliases.
const LITERAL_TYPES = ['Json', 'SnapId'];

// Types which should be represented as `null` in the schema.
const NULLABLE_TYPES = ['null', 'undefined', 'void', 'never'];

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
 * Find a property assignment by name in an array of object literal properties.
 *
 * @param properties - The properties of the object literal. This is expected to
 * be an array of property assignments.
 * @param propertyName - The name of the property to find.
 * @returns The property assignment with the specified name.
 */
function findProperty(
  properties: ObjectLiteralElementLike[],
  propertyName: string,
) {
  return properties.find((property) => {
    if (
      // Some handlers use shorthand property assignments, so we need to check
      // for both.
      !property.isKind(SyntaxKind.PropertyAssignment) &&
      !property.isKind(SyntaxKind.ShorthandPropertyAssignment)
    ) {
      return false;
    }

    return property.getName() === propertyName;
  });
}

/**
 * Get the type of a property at the location of the implementation function o
 * a handler. This is needed to extract the type of the properties at the
 * correct location.
 *
 * @param symbol - The symbol of the handler, which is expected to be the symbol
 * of the object literal that defines the handler.
 * @param properties - The properties of the object literal that defines the
 * handler.
 * @returns The type of the property at the location of the implementation
 * function of the handler.
 */
function getTypeAtLocation(
  symbol: Symbol,
  properties: ObjectLiteralElementLike[],
) {
  const property =
    findProperty(properties, 'implementation') ??
    findProperty(properties, 'specificationBuilder');

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
 * Get the string representation of a type, using type aliases where possible
 * and without truncating the type (e.g., to `string` or `object`).
 *
 * @param type - The type to get the string representation of.
 * @returns The string representation of the type.
 */
function getTypeString(type: Type) {
  const plainType = type.getText(
    undefined,

    // This flag tells TypeScript to use type aliases when possible.
    TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
  );

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

  return type.getText(
    undefined,
    TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
      TypeFormatFlags.NoTruncation |
      TypeFormatFlags.InTypeAlias,
  );
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

  const description = jsDocs.map((jsDoc) => jsDoc.getCommentText()).join(' ');

  return description || null;
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
      const description = descriptionParts.join(' ').replace(/^\s?-\s/u, '');

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
 * @param properties - The properties of the object literal that defines the
 * type. This is needed to extract the type of the properties at the correct
 * location.
 * @returns An array of properties, where each property includes its name,
 * type, and JSDoc description (if any).
 */
function getObjectProperties(
  typeNode: TypeNode,
  properties: ObjectLiteralElementLike[],
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
    const propertyType = getTypeAtLocation(property, properties);

    return {
      name: property.getName(),
      type: getTypeString(propertyType),
      description: getObjectPropertyDescription(property, propertyTags),
    };
  });
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
 * @param properties - The properties of the handler object, i.e., the result of
 * `objectLiteralExpression.getProperties()`.
 * @returns An array of method parameters, where each parameter includes its
 * name, type, and JSDoc description (if any).
 */
function getMethodParameters(
  properties: ObjectLiteralElementLike[],
): MethodParameter | MethodParameter[] | null {
  // Get the call signatures of the implementation function, which is expected
  // to be a middleware function.
  const implementation = findProperty(properties, 'implementation')?.getType();
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

  return getObjectProperties(requestParameters, properties);
}

/**
 * Get the method return type from the `implementation` property of a handler.
 *
 * @param properties - The properties of the handler object, i.e., the result of
 * `objectLiteralExpression.getProperties()`.
 * @returns The method return type, including its name, type, and JSDoc
 * description (if any).
 */
function getMethodResult(
  properties: ObjectLiteralElementLike[],
): MethodParameter | MethodParameter[] | null {
  // Get the call signatures of the implementation function, which is expected
  // to be a middleware function.
  const implementation = findProperty(properties, 'implementation')?.getType();
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

  return getObjectProperties(responseResult, properties);
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
function processPermittedHandler(property: PropertyAssignment): Method {
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
  const properties = object.getProperties();

  const description = getMethodDescription(declaration);
  const parameters = getMethodParameters(properties);
  const result = getMethodResult(properties);
  const subjectTypes = getMethodSubjectTypes(name);

  return {
    name,
    description,
    parameters,
    result,
    subjectTypes,
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
function processPermittedHandlers(project: Project) {
  const handlersFile = project.getSourceFile('src/permitted/handlers.ts');
  assert(handlersFile, 'Handlers file not found.');

  const permittedHandlers =
    handlersFile.getVariableDeclaration('methodHandlers');
  assert(permittedHandlers, '`methodHandlers` variable not found.');

  const initializer = permittedHandlers.getInitializerIfKindOrThrow(
    SyntaxKind.ObjectLiteralExpression,
  );

  return initializer.getProperties().map((property) => {
    const propertyAssignment = property.asKindOrThrow(
      SyntaxKind.PropertyAssignment,
    );

    return processPermittedHandler(propertyAssignment);
  });
}

/**
 * Get the target name of a restricted method from the `targetName` property of
 * the handler. This function expects properties to include a `targetName`
 * property that is a string literal type:
 *
 * ```ts
 * {
 *   targetName: 'method_one',
 *   // ...
 * }
 * ```
 *
 * @param properties - The properties of the handler object, i.e., the result of
 * `objectLiteralExpression.getProperties()`.
 * @returns The target name of the restricted method.
 */
function getMethodTargetName(properties: ObjectLiteralElementLike[]) {
  const targetName = findProperty(properties, 'targetName')?.getType();
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
 * handler. This function expects the property to include a
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

  return getObjectProperties(requestParameters, object.getProperties());
}

/**
 * Get the method return type from the `implementation` property of a restricted
 * method handler.
 *
 * @param object - The object literal expression that defines the handler.
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

  // Get the actual function declaration of the handler.
  const functionDeclaration = expressionIdentifier
    .getSymbolOrThrow()
    .getDeclarations()
    .find((symbolDeclaration) =>
      symbolDeclaration.isKind(SyntaxKind.FunctionDeclaration),
    )
    ?.asKindOrThrow(SyntaxKind.FunctionDeclaration);

  assert(
    functionDeclaration,
    'Function declaration for handler implementation not found.',
  );

  const childFunction = functionDeclaration.getFirstDescendantByKindOrThrow(
    SyntaxKind.FunctionExpression,
  );

  const maybePromise = childFunction
    .getReturnTypeNodeOrThrow()
    .asKindOrThrow(SyntaxKind.TypeReference);
  const unwrappedReturnTypeNode = unwrapPromiseTypeNode(maybePromise);

  return getObjectProperties(unwrappedReturnTypeNode, object.getProperties());
}

/**
 * Process a single restricted handler property assignment, extracting the
 * method names, descriptions, parameters, return types, and subject types for
 * the handler.
 *
 * @param property - The property assignment that defines the restricted
 * handler, e.g., the `handler_one` property in the following object literal:
 *
 * ```ts
 * {
 *   handler_one: handlerOne,
 *   // ...
 * }
 * ```
 *
 * @returns The method schema extracted from the restricted handler.
 */
function processRestrictedHandler(property: PropertyAssignment): Method {
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

  // Get the object literal expression that defines the handler. This is a bit
  // more complicated than for permitted handlers, since restricted handlers
  // use `Object.freeze({ ... } as const)` instead of a `satisfies` expression,
  // so the AST structure looks like this:
  //
  // VariableDeclaration
  //  └─ CallExpression (Object.freeze)
  //      └─ AsExpression (as const)
  //          └─ ObjectLiteralExpression (the actual handler definition)
  const declaration = definition
    .getDeclarationNode()
    ?.asKindOrThrow(SyntaxKind.VariableDeclaration);
  assert(declaration, `Declaration for handler "${name}" not found.`);

  const declarationInitializer = declaration.getInitializerIfKindOrThrow(
    SyntaxKind.CallExpression,
  );

  const asExpression = declarationInitializer
    .getArguments()[0]
    .asKindOrThrow(SyntaxKind.AsExpression);
  const object = asExpression.getExpressionIfKindOrThrow(
    SyntaxKind.ObjectLiteralExpression,
  );

  const properties = object.getProperties();

  // Extract the method names and parameters from the handler definition.
  const methodName = getMethodTargetName(properties);
  const description = getMethodDescription(declaration);
  const parameters = getRestrictedMethodParameters(object);
  const result = getRestrictedMethodResult(object);

  return {
    name: methodName,
    description,
    parameters,
    result,
    // Restricted methods are only callable by Snaps, so we can hard code the
    // subject type here.
    subjectTypes: ['snap'],
    restricted: true,
  };
}

/**
 * Process the restricted handlers defined in `src/restricted/index.ts`,
 * extracting the method names, descriptions, parameters, return types, and
 * subject types for each handler.
 *
 * @param project - The `ts-morph` project instance to use for processing the
 * handlers file.
 * @returns An array of method schemas extracted from the restricted handlers.
 */
function processRestrictedHandlers(project: Project) {
  const restrictedHandlersFile = project.getSourceFile(
    'src/restricted/index.ts',
  );
  assert(restrictedHandlersFile, 'Restricted handlers file not found.');

  const restrictedHandlers = restrictedHandlersFile.getVariableDeclaration(
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

  return initializer
    .getProperties()
    .map((property) => {
      const propertyAssignment = property.asKindOrThrow(
        SyntaxKind.PropertyAssignment,
      );

      return processRestrictedHandler(propertyAssignment);
    })
    .toSorted((a, b) => a.name.localeCompare(b.name));
}

const project = new Project({
  tsConfigFilePath: TS_CONFIG_PATH,
});

const permittedMethods = processPermittedHandlers(project);
const restrictedMethods = processRestrictedHandlers(project);

const schema = [...permittedMethods, ...restrictedMethods].toSorted((a, b) =>
  a.name.localeCompare(b.name),
);

console.log(`Writing "schema.json" to ${SCHEMA_OUTPUT_PATH}...`);
await writeFile(SCHEMA_OUTPUT_PATH, JSON.stringify(schema, null, 2));
