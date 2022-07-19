import { Row, Element, Fragment, Input, Text } from './elements';

export const fragment = (...children: Element[]): Fragment => ({
  type: 'fragment',
  children,
});

export const input = (placeholder?: string): Input => ({
  type: 'input',
  placeholder,
});

export const row = (...children: Element[]): Row => ({
  type: 'row',
  children,
});

export const text = (value: string): Text => ({
  type: 'text',
  value,
});
