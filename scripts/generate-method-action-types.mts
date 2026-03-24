#!yarn tsx

// ESLint is saying `ts` can be replaced with named imports, but this doesn't
// seem to actually work with the current TypeScript version.
/* eslint-disable no-console, import-x/no-named-as-default-member */

import { assert, hasProperty, isObject } from '@metamask/utils';
import { ESLint } from 'eslint';
import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';
import yargs from 'yargs';

type MethodInfo = {
  name: string;
  jsDoc: string;
  signature: string;
};

type ControllerInfo = {
  name: string;
  filePath: string;
  exposedMethods: string[];
  methods: MethodInfo[];
};

/**
 * The parsed command-line arguments.
 */
type CommandLineArguments = {
  /**
   * Whether to check if the action types files are up to date.
   */
  check: boolean;
  /**
   * Whether to fix the action types files.
   */
  fix: boolean;
  /**
   * Optional path to a specific controller to process.
   */
  controllerPath: string;
};

/**
 * Uses `yargs` to parse the arguments given to the script.
 *
 * @returns The command line arguments.
 */
async function parseCommandLineArguments(): Promise<CommandLineArguments> {
  const {
    check,
    fix,
    path: controllerPath,
  } = await yargs(process.argv.slice(2))
    .command(
      '$0 [path]',
      'Generate method action types for a controller messenger',
      (yargsInstance) => {
        yargsInstance.positional('path', {
          type: 'string',
          description: 'Path to the folder where controllers are located',
          default: 'src',
        });
      },
    )
    .option('check', {
      type: 'boolean',
      description: 'Check if generated action type files are up to date',
      default: false,
    })
    .option('fix', {
      type: 'boolean',
      description: 'Generate/update action type files',
      default: false,
    })
    .help()
    .check((argv) => {
      if (!argv.check && !argv.fix) {
        throw new Error('Either --check or --fix must be provided.\n');
      }
      return true;
    }).argv;

  return {
    check,
    fix,
    // TypeScript doesn't narrow the type of `controllerPath` even though we defined it as a string in yargs, so we need to cast it here.
    controllerPath: controllerPath as string,
  };
}

/**
 * Checks if generated action types files are up to date.
 *
 * @param controllers - Array of controller information objects.
 * @param eslint - The ESLint instance to use for formatting.
 */
async function checkActionTypesFiles(
  controllers: ControllerInfo[],
  eslint: ESLint,
): Promise<void> {
  let hasErrors = false;

  // Track files that exist and their corresponding temp files
  const fileComparisonJobs: {
    expectedTempFile: string;
    actualFile: string;
    baseFileName: string;
  }[] = [];

  try {
    // Check each controller and prepare comparison jobs
    for (const controller of controllers) {
      console.log(`\n🔧 Checking ${controller.name}...`);
      const outputDir = path.dirname(controller.filePath);
      const baseFileName = path.basename(controller.filePath, '.ts');
      const actualFile = path.join(
        outputDir,
        `${baseFileName}-method-action-types.ts`,
      );

      const expectedContent = generateActionTypesContent(controller);
      const expectedTempFile = actualFile.replace('.ts', '.tmp.ts');

      try {
        // Check if actual file exists first
        await fs.promises.access(actualFile);

        // Write expected content to temp file
        await fs.promises.writeFile(expectedTempFile, expectedContent, 'utf8');

        // Add to comparison jobs
        fileComparisonJobs.push({
          expectedTempFile,
          actualFile,
          baseFileName,
        });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          console.error(
            `❌ ${baseFileName}-method-action-types.ts does not exist`,
          );
        } else {
          console.error(
            `❌ Error reading ${baseFileName}-method-action-types.ts:`,
            error,
          );
        }
        hasErrors = true;
      }
    }

    // Run ESLint on all files at once if we have comparisons to make
    if (fileComparisonJobs.length > 0) {
      console.log('\n📝 Running ESLint to compare files...');

      const results = await eslint.lintFiles(
        fileComparisonJobs.map((job) => job.expectedTempFile),
      );
      await ESLint.outputFixes(results);

      // Compare expected vs actual content
      for (const job of fileComparisonJobs) {
        const expectedContent = await fs.promises.readFile(
          job.expectedTempFile,
          'utf8',
        );
        const actualContent = await fs.promises.readFile(
          job.actualFile,
          'utf8',
        );

        if (expectedContent === actualContent) {
          console.log(
            `✅ ${job.baseFileName}-method-action-types.ts is up to date`,
          );
        } else {
          console.error(
            `❌ ${job.baseFileName}-method-action-types.ts is out of date`,
          );
          hasErrors = true;
        }
      }
    }
  } finally {
    // Clean up temp files
    for (const job of fileComparisonJobs) {
      try {
        await fs.promises.unlink(job.expectedTempFile);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  if (hasErrors) {
    console.error('\n💥 Some action type files are out of date or missing.');
    console.error(
      'Run `yarn generate-method-action-types --fix` to update them.',
    );
    process.exitCode = 1;
  } else {
    console.log('\n🎉 All action type files are up to date!');
  }
}

/**
 * Main entry point for the script.
 */
async function main(): Promise<void> {
  const { fix, controllerPath } = await parseCommandLineArguments();

  console.log('🔍 Searching for controllers with MESSENGER_EXPOSED_METHODS...');

  const controllers = await findControllersWithExposedMethods(controllerPath);

  if (controllers.length === 0) {
    console.log('⚠️  No controllers found with MESSENGER_EXPOSED_METHODS');
    return;
  }

  console.log(
    `📦 Found ${controllers.length} controller(s) with exposed methods`,
  );

  const eslint = new ESLint({
    fix: true,
    errorOnUnmatchedPattern: false,
  });

  if (fix) {
    await generateAllActionTypesFiles(controllers, eslint);
    console.log('\n🎉 All action types generated successfully!');
  } else {
    // -check mode: check files
    await checkActionTypesFiles(controllers, eslint);
  }
}

/**
 * Check if a path is a directory.
 *
 * @param pathValue - The path to check.
 * @returns True if the path is a directory, false otherwise.
 * @throws If an error occurs other than the path not existing.
 */
async function isDirectory(pathValue: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(pathValue);
    return stats.isDirectory();
  } catch (error) {
    if (
      isObject(error) &&
      hasProperty(error, 'code') &&
      error.code === 'ENOENT'
    ) {
      return false;
    }

    throw error;
  }
}

/**
 * Recursively get all files in a directory and its subdirectories.
 *
 * @param directory - The directory to search.
 * @returns An array of file paths.
 */
async function getFiles(directory: string): Promise<string[]> {
  const entries = await fs.promises.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      return entry.isDirectory() ? await getFiles(fullPath) : fullPath;
    }),
  );

  return files.flat();
}

/**
 * Finds all controller files that have MESSENGER_EXPOSED_METHODS constants.
 *
 * @param controllerPath - Path to the folder where controllers are located.
 * @returns A list of controller information objects.
 */
async function findControllersWithExposedMethods(
  controllerPath: string,
): Promise<ControllerInfo[]> {
  const srcPath = path.resolve(process.cwd(), controllerPath);
  const controllers: ControllerInfo[] = [];

  if (!(await isDirectory(srcPath))) {
    throw new Error(`The specified path is not a directory: ${srcPath}`);
  }

  const srcFiles = await getFiles(srcPath);

  for (const file of srcFiles) {
    if (!file.endsWith('.ts') || file.endsWith('.test.ts')) {
      continue;
    }

    const content = await fs.promises.readFile(file, 'utf8');

    if (content.includes('MESSENGER_EXPOSED_METHODS')) {
      const controllerInfo = await parseControllerFile(file);
      if (controllerInfo) {
        controllers.push(controllerInfo);
      }
    }
  }

  return controllers;
}

/**
 * Context for AST visiting.
 */
type VisitorContext = {
  exposedMethods: string[];
  className: string;
  methods: MethodInfo[];
  sourceFile: ts.SourceFile;
};

/**
 * Visits AST nodes to find exposed methods and controller class.
 *
 * @param context - The visitor context.
 * @returns A function to visit nodes.
 */
function createASTVisitor(context: VisitorContext): (node: ts.Node) => void {
  /**
   * Gets the class members from a class declaration or type alias declaration
   * node.
   *
   * @param node - The class declaration or type alias declaration node.
   * @returns The class members, or null if the node is not a class or type
   * alias declaration.
   */
  function getClassMembers(
    node: ts.ClassDeclaration | ts.TypeAliasDeclaration,
  ): ts.NodeArray<ts.ClassElement> | ts.NodeArray<ts.TypeElement> | null {
    if (ts.isClassDeclaration(node)) {
      return node.members;
    }

    if (ts.isTypeAliasDeclaration(node) && ts.isTypeLiteralNode(node.type)) {
      return node.type.members;
    }

    return null;
  }

  /**
   * Visits AST nodes to find exposed methods and controller class.
   *
   * @param node - The AST node to visit.
   */
  function visitNode(node: ts.Node): void {
    if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0];
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === 'MESSENGER_EXPOSED_METHODS'
      ) {
        if (declaration.initializer) {
          let arrayExpression: ts.ArrayLiteralExpression | undefined;

          // Handle direct array literal
          if (ts.isArrayLiteralExpression(declaration.initializer)) {
            arrayExpression = declaration.initializer;
          }
          // Handle "as const" assertion: expression is wrapped in type assertion
          else if (
            ts.isAsExpression(declaration.initializer) &&
            ts.isArrayLiteralExpression(declaration.initializer.expression)
          ) {
            arrayExpression = declaration.initializer.expression;
          }

          if (arrayExpression) {
            context.exposedMethods = arrayExpression.elements
              .filter(ts.isStringLiteral)
              .map((element) => element.text);
          }
        }
      }
    }

    // Find the controller or service class
    if (
      (ts.isClassDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      node.name
    ) {
      const classText = node.name.text;
      if (classText.endsWith('Controller') || classText.endsWith('Service')) {
        context.className = classText;

        const members = getClassMembers(node);
        if (!members) {
          return;
        }

        // Extract method info for exposed methods
        const seenMethods = new Set<string>();
        for (const member of members) {
          if (
            ts.isMethodDeclaration(member) &&
            member.name &&
            ts.isIdentifier(member.name)
          ) {
            const methodName = member.name.text;
            if (
              context.exposedMethods.includes(methodName) &&
              !seenMethods.has(methodName)
            ) {
              seenMethods.add(methodName);
              const jsDoc = extractJSDoc(member, context.sourceFile);
              const signature = extractMethodSignature(member);
              context.methods.push({
                name: methodName,
                jsDoc,
                signature,
              });
            }
          }
        }
      }
    }

    ts.forEachChild(node, visitNode);
  }

  return visitNode;
}

/**
 * Create a TypeScript program for the given file by locating the nearest
 * tsconfig.json.
 *
 * @param filePath - Absolute path to the source file.
 * @returns A TypeScript program, or null if no tsconfig was found.
 */
function createProgramForFile(filePath: string): ts.Program | null {
  const configPath = ts.findConfigFile(
    path.dirname(filePath),
    ts.sys.fileExists.bind(ts.sys),
    'tsconfig.json',
  );
  if (!configPath) {
    return null;
  }

  const { config, error } = ts.readConfigFile(
    configPath,
    ts.sys.readFile.bind(ts.sys),
  );

  if (error) {
    return null;
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    path.dirname(configPath),
  );

  return ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: parsedConfig.options,
  });
}

/**
 * Find a class declaration with the given name in a source file.
 *
 * @param sourceFile - The source file to search.
 * @param className - The class name to look for.
 * @returns The class declaration node, or null if not found.
 */
function findClassInSourceFile(
  sourceFile: ts.SourceFile,
  className: string,
): ts.ClassDeclaration | ts.TypeAliasDeclaration | null {
  return (
    sourceFile.statements.find(
      (node): node is ts.ClassDeclaration | ts.TypeAliasDeclaration =>
        (ts.isClassDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
        node.name?.text === className,
    ) ?? null
  );
}

/**
 * Search through the class hierarchy of a TypeScript type to find the
 * declaration of a method with the given name.
 *
 * @param classType - The class type to search.
 * @param methodName - The method name to look for.
 * @returns The method declaration node, or null if not found.
 */
function findMethodInHierarchy(
  classType: ts.Type,
  methodName: string,
): ts.MethodDeclaration | null {
  const symbol = classType.getProperty(methodName);
  if (!symbol) {
    return null;
  }

  const declarations = symbol.getDeclarations();
  if (!declarations) {
    return null;
  }

  for (const declaration of declarations) {
    if (ts.isMethodDeclaration(declaration)) {
      return declaration;
    }
  }

  return null;
}

/**
 * Parses a controller file to extract exposed methods and their metadata.
 *
 * @param filePath - Path to the controller file to parse.
 * @returns Controller information or null if parsing fails.
 */
async function parseControllerFile(
  filePath: string,
): Promise<ControllerInfo | null> {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
    );

    const context: VisitorContext = {
      exposedMethods: [],
      className: '',
      methods: [],
      sourceFile,
    };

    createASTVisitor(context)(sourceFile);

    if (context.exposedMethods.length === 0 || !context.className) {
      return null;
    }

    // For exposed methods not found directly in the class body, attempt to
    // locate them in the inheritance hierarchy using the type checker.
    const foundMethodNames = new Set(
      context.methods.map((method) => method.name),
    );

    const inheritedMethodNames = context.exposedMethods.filter(
      (name) => !foundMethodNames.has(name),
    );

    if (inheritedMethodNames.length > 0) {
      const program = createProgramForFile(filePath);
      const checker = program?.getTypeChecker();
      const programSourceFile = program?.getSourceFile(filePath);

      assert(
        checker,
        `Type checker could not be created for "${filePath}". Ensure a valid tsconfig.json is present.`,
      );

      assert(
        programSourceFile,
        `Source file "${filePath}" not found in program.`,
      );

      const classNode = findClassInSourceFile(
        programSourceFile,
        context.className,
      );

      assert(
        classNode,
        `Class "${context.className}" not found in "${filePath}".`,
      );

      const classType = checker.getTypeAtLocation(classNode);
      for (const methodName of inheritedMethodNames) {
        const methodDeclaration = findMethodInHierarchy(classType, methodName);

        const jsDoc = methodDeclaration
          ? extractJSDoc(methodDeclaration, methodDeclaration.getSourceFile())
          : '';
        context.methods.push({ name: methodName, jsDoc, signature: '' });
      }
    }

    return {
      name: context.className,
      filePath,
      exposedMethods: context.exposedMethods,
      methods: context.methods,
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

/**
 * Extracts JSDoc comment from a method declaration.
 *
 * @param node - The method declaration node.
 * @param sourceFile - The source file.
 * @returns The JSDoc comment.
 */
function extractJSDoc(
  node: ts.MethodDeclaration,
  sourceFile: ts.SourceFile,
): string {
  const jsDocTags = ts.getJSDocCommentsAndTags(node);
  if (jsDocTags.length === 0) {
    return '';
  }

  const jsDoc = jsDocTags[0];
  if (ts.isJSDoc(jsDoc)) {
    const fullText = sourceFile.getFullText();
    const start = jsDoc.getFullStart();
    const end = jsDoc.getEnd();
    const rawJsDoc = fullText.substring(start, end).trim();
    return formatJSDoc(rawJsDoc);
  }

  return '';
}

/**
 * Formats JSDoc comments to have consistent indentation for the generated file.
 *
 * @param rawJsDoc - The raw JSDoc comment from the source.
 * @returns The formatted JSDoc comment.
 */
function formatJSDoc(rawJsDoc: string): string {
  const lines = rawJsDoc.split('\n');
  const formattedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0) {
      // First line should be /**
      formattedLines.push('/**');
    } else if (i === lines.length - 1) {
      // Last line should be */
      formattedLines.push(' */');
    } else {
      // Middle lines should start with ' * '
      const trimmed = line.trim();
      if (trimmed.startsWith('*')) {
        // Remove existing * and normalize
        const content = trimmed.substring(1).trim();
        formattedLines.push(content ? ` * ${content}` : ' *');
      } else {
        // Handle lines that don't start with *
        formattedLines.push(trimmed ? ` * ${trimmed}` : ' *');
      }
    }
  }

  return formattedLines.join('\n');
}

/**
 * Extracts method signature as a string for the handler type.
 *
 * @param node - The method declaration node.
 * @returns The method signature.
 */
function extractMethodSignature(node: ts.MethodDeclaration): string {
  // Since we're just using the method reference in the handler type,
  // we don't need the full signature - just return the method name
  // The actual signature will be inferred from the controller class
  return node.name ? (node.name as ts.Identifier).text : '';
}

/**
 * Generates action types files for all controllers.
 *
 * @param controllers - Array of controller information objects.
 * @param eslint - The ESLint instance to use for formatting.
 */
async function generateAllActionTypesFiles(
  controllers: ControllerInfo[],
  eslint: ESLint,
): Promise<void> {
  const outputFiles: string[] = [];

  // Write all files first
  for (const controller of controllers) {
    console.log(`\n🔧 Processing ${controller.name}...`);
    const outputDir = path.dirname(controller.filePath);
    const baseFileName = path.basename(controller.filePath, '.ts');
    const outputFile = path.join(
      outputDir,
      `${baseFileName}-method-action-types.ts`,
    );

    const generatedContent = generateActionTypesContent(controller);
    await fs.promises.writeFile(outputFile, generatedContent, 'utf8');
    outputFiles.push(outputFile);
    console.log(`✅ Generated action types for ${controller.name}`);
  }

  // Run ESLint on all the actual files
  if (outputFiles.length > 0) {
    console.log('\n📝 Running ESLint on generated files...');

    const results = await eslint.lintFiles(outputFiles);
    await ESLint.outputFixes(results);
    const errors = ESLint.getErrorResults(results);
    if (errors.length > 0) {
      console.error('❌ ESLint errors:', errors);
      process.exitCode = 1;
    } else {
      console.log('✅ ESLint formatting applied');
    }
  }
}

/**
 * Generates the content for the action types file.
 *
 * @param controller - The controller information object.
 * @returns The content for the action types file.
 */
function generateActionTypesContent(controller: ControllerInfo): string {
  const baseFileName = path.basename(controller.filePath, '.ts');
  const controllerImportPath = `./${baseFileName}`;

  let content = `/**
 * This file is auto generated by \`scripts/generate-method-action-types.ts\`.
 * Do not edit manually.
 */

import type { ${controller.name} } from '${controllerImportPath}';

`;

  const actionTypeNames: string[] = [];

  // Generate action types for each exposed method
  for (const method of controller.methods) {
    const actionTypeName = `${controller.name}${capitalize(method.name)}Action`;
    const actionString = `${controller.name}:${method.name}`;

    actionTypeNames.push(actionTypeName);

    // Add the JSDoc if available
    if (method.jsDoc) {
      content += `${method.jsDoc}\n`;
    }

    content += `export type ${actionTypeName} = {
  type: \`${actionString}\`;
  handler: ${controller.name}['${method.name}'];
};\n\n`;
  }

  // Generate union type of all action types
  if (actionTypeNames.length > 0) {
    const unionTypeName = `${controller.name}MethodActions`;
    content += `/**
 * Union of all ${controller.name} action types.
 */
export type ${unionTypeName} = ${actionTypeNames.join(' | ')};\n`;
  }

  return `${content.trimEnd()}\n`;
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param str - The string to capitalize.
 * @returns The capitalized string.
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Error handling wrapper
main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exitCode = 1;
});
