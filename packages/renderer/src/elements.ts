export type Fragment = {
  type: 'fragment';
  children: Element[];
};

export type Input = {
  type: 'input';
  name: string;
  value?: string;
};

export type Row = {
  type: 'row';
  children: Element[];
};

export type Text = {
  type: 'text';
  value: string;
};

export type Element = Fragment | Input | Row | Text;
