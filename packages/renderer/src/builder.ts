import { Row, Element, Fragment, Input, Text } from './elements';

export const fragment = (...children: Element[]): Fragment => ({
  type: 'fragment',
  children,
});

export const input = (name: string, value?: string): Input => ({
  type: 'input',
  name,
  value,
});

export const row = (...children: Element[]): Row => ({
  type: 'row',
  children,
});

export const text = (value: string): Text => ({
  type: 'text',
  value,
});
