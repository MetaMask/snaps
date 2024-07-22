import { Input } from './form/Input';
import { RadioButton } from './RadioButton';

describe('RadioButton', () => {
  it('renders a radio button', () => {
    const result = (
      <RadioButton name="RadioButtonSwitch">
        <Input type="radio" name="switch" value="A" />
        <Input type="radio" name="switch" value="B" />
      </RadioButton>
    );

    expect(result).toStrictEqual({
      type: 'RadioButton',
      props: {
        name: 'RadioButtonSwitch',
        children: [
          {
            type: 'Input',
            key: null,
            props: {
              name: 'switch',
              type: 'radio',
              value: 'A',
            },
          },
          {
            type: 'Input',
            key: null,
            props: {
              name: 'switch',
              type: 'radio',
              value: 'B',
            },
          },
        ],
      },
      key: null,
    });
  });
});
