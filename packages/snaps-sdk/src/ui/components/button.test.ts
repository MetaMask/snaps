import { NodeType } from '../nodes';
import { ButtonTypes, ButtonVariants, button } from './button';

describe('button', () => {
  it('creates a button component', () => {
    expect(
      button({
        variant: ButtonVariants.Primary,
        value: 'Hello, world!',
        name: 'myButton',
        buttonType: ButtonTypes.Button,
      }),
    ).toStrictEqual({
      type: NodeType.Button,
      variant: ButtonVariants.Primary,
      buttonType: ButtonTypes.Button,
      name: 'myButton',
      value: 'Hello, world!',
    });

    expect(
      button({
        value: 'Hello, world!',
      }),
    ).toStrictEqual({
      type: NodeType.Button,
      value: 'Hello, world!',
    });
  });

  it('creates a button component using the shorthand form', () => {
    expect(
      button(
        'Hello, world!',
        ButtonTypes.Button,
        'myButton',
        ButtonVariants.Primary,
      ),
    ).toStrictEqual({
      type: NodeType.Button,
      value: 'Hello, world!',
      buttonType: ButtonTypes.Button,
      variant: ButtonVariants.Primary,
      name: 'myButton',
    });

    expect(button('foo bar')).toStrictEqual({
      type: NodeType.Button,
      value: 'foo bar',
    });
  });
});
