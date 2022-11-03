import { Json } from '@metamask/utils';
import {
  ArrayExpression as ArrayExpressionEstree,
  Identifier as IdentifierEstree,
  ObjectExpression as ObjectExpressionEstree,
  Property as PropertyEstree,
  SimpleLiteral as LiteralEstree,
  UnaryExpression as UnaryExpressionEstree,
} from 'estree';
import { Node } from 'unist';

export type Expression =
  | ArrayExpression
  | ObjectExpression
  | Literal
  | UnaryExpression;

export interface Identifier extends Node, IdentifierEstree {
  type: 'Identifier';
  name: 'Infinity' | 'NaN';
}

export interface UnaryExpression extends Node, UnaryExpressionEstree {
  type: 'UnaryExpression';
  operator: '-' | '+';
  argument: Literal<number> | Identifier;
}

export interface Literal<
  Value extends string | boolean | number | null =
    | string
    | boolean
    | number
    | null,
> extends Node,
    LiteralEstree {
  type: 'Literal';
  value: Value;
}

export interface Property extends Node, PropertyEstree {
  type: 'Property';
  key: Literal<string>;
  value: Expression;
  method: false;
  shorthand: false;
  computed: false;
}

export interface ObjectExpression extends Node, ObjectExpressionEstree {
  type: 'ObjectExpression';
  properties: Array<Property>;
}

export interface ArrayExpression extends Node, ArrayExpressionEstree {
  type: 'ArrayExpression';
  elements: Array<Expression>;
}

declare module 'vfile' {
  interface DataMap {
    shouldFix: boolean;
    sourceCode?: string;
    parsed?: Json;
  }
}
