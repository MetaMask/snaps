import { NodeType } from '../nodes';
import { input, InputTypes } from './input';

describe('Input', () => {
  it('creates an input component', () => {
    expect(
      input({
        value: 'Hello, world!',
        name: 'myInput',
        inputType: InputTypes.Text,
        placeholder: 'Type here...',
        label: 'Hello',
      }),
    ).toStrictEqual({
      type: NodeType.Input,
      value: 'Hello, world!',
      name: 'myInput',
      inputType: InputTypes.Text,
      placeholder: 'Type here...',
      label: 'Hello',
    });

    expect(
      input({
        name: 'myInput',
      }),
    ).toStrictEqual({
      type: NodeType.Input,
      name: 'myInput',
    });
  });
  it('creates an input component using the shorthand form', () => {
    expect(
      input('myInput', InputTypes.Text, 'type here...', 'foo bar', 'input'),
    ).toStrictEqual({
      type: NodeType.Input,
      inputType: InputTypes.Text,
      placeholder: 'type here...',
      value: 'foo bar',
      name: 'myInput',
      label: 'input',
    });

    expect(input('myInput')).toStrictEqual({
      type: NodeType.Input,
      name: 'myInput',
    });
  });

  it('validates the args', () => {
    // @ts-expect-error - Invalid args.
    expect(() => input({ name: 'foo', bar: 'baz' })).toThrow(
      'Invalid input component: At path: bar -- Expected a value of type `never`, but received: `"baz"`.',
    );

    // @ts-expect-error - Invalid args.
    expect(() => input({})).toThrow(
      'Invalid input component: At path: name -- Expected a string, but received: undefined.',
    );
  });
});
