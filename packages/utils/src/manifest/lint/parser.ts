import { parseExpression, ParseResult } from '@babel/parser';
import { fromEstree } from 'esast-util-from-estree';
import {
  ArrayExpression,
  ArrayPattern,
  AssignmentPattern,
  Expression as ExpressionEstree,
  Identifier,
  Literal,
  ObjectExpression,
  ObjectPattern,
  PrivateIdentifier,
  Property,
  RestElement,
  SpreadElement,
  UnaryExpression,
} from 'estree';
import { Parser, Plugin } from 'unified';
import { positionFromEstree as posEstree } from 'unist-util-position-from-estree';
import { Expression as ExpressionOur } from './types';

const JSON_ERROR = 'Expected JSON expression';

const plugin: Plugin<void[], string, ExpressionOur> = function () {
  const parser: Parser<ExpressionOur> = (document, file) => {
    const babelAst = parseExpression(document, {
      attachComment: false,
      ranges: true,
      plugins: ['estree'],
    }) as ParseResult<ExpressionEstree>;

    if (babelAst.errors.length > 0) {
      for (const error of babelAst.errors) {
        try {
          file.fail(error.reasonCode);
        } catch {}
      }
      throw new Error(babelAst.errors[0].reasonCode);
    }
    assertJsonNode(babelAst);
    file.data.parsed = JSON.parse(document);
    return fromEstree(babelAst);

    function assertJsonNode(
      node:
        | ExpressionEstree
        | SpreadElement
        | RestElement
        | AssignmentPattern
        | Property
        | PrivateIdentifier
        | ObjectPattern
        | ArrayPattern,
    ): asserts node is
      | ArrayExpression
      | Property
      | ObjectExpression
      | Literal
      | Identifier
      | UnaryExpression {
      switch (node.type) {
        case 'ArrayExpression':
          for (const element of node.elements) {
            if (element === null) {
              file.fail(JSON_ERROR, posEstree(node));
            } else {
              assertJsonNode(element);
            }
          }
          return;
        case 'ObjectExpression':
          for (const property of node.properties) {
            assertJsonNode(property);
          }
          return;
        case 'Property':
          if (node.method) {
            file.fail(JSON_ERROR, posEstree(node));
          }
          if (node.computed) {
            file.fail(JSON_ERROR, posEstree(node));
          }
          if (node.shorthand) {
            file.fail(JSON_ERROR, posEstree(node));
          }
          if (
            node.key.type !== 'Literal' ||
            typeof node.key.value !== 'string'
          ) {
            file.fail(JSON_ERROR, posEstree(node));
          }
          assertJsonNode(node.key);
          assertJsonNode(node.value);
          return;
        case 'UnaryExpression':
          const { operator, argument } = node;
          if (operator !== '+' && operator !== '-') {
            file.fail(JSON_ERROR, posEstree(node));
          }
          if (
            (argument.type === 'Literal' &&
              typeof argument.value === 'number') ||
            (argument.type === 'Identifier' &&
              (argument.name === 'Infinity' || argument.name === 'NaN'))
          ) {
            return;
          }
          file.fail(JSON_ERROR, posEstree(node));
          // TS complains without this thinking it fails through
          return;
        case 'Identifier':
          if (node.name !== 'Infinity' && node.name !== 'NaN') {
            file.fail(JSON_ERROR, posEstree(node));
          }
          return;
        case 'Literal':
          return;
        default:
          file.fail(JSON_ERROR, posEstree(node));
      }
    }
  };

  Object.assign(this, { Parser: parser });
};
export default plugin;
