// eslint-disable-next-line @typescript-eslint/no-shadow
import { Bold, Panel, Text } from './components';

describe('jsx', () => {
  it('renders a JSX component', () => {
    const element = <Text>Hello</Text>;

    expect(element).toStrictEqual({
      type: 'text',
      value: 'Hello',
    });
  });
});

describe('jsxs', () => {
  it('renders a JSX component', () => {
    const element = <Text>Hello</Text>;

    expect(element).toStrictEqual({
      type: 'text',
      value: 'Hello',
    });
  });

  it('renders a nested JSX component', () => {
    const element = (
      <Panel>
        <Text>
          Hello, <Bold>world</Bold>
        </Text>
      </Panel>
    );

    expect(element).toStrictEqual({
      type: 'panel',
      children: [
        {
          type: 'text',
          value: 'Hello, **world**',
        },
      ],
    });
  });

  it('renders a fragment', () => {
    const element = (
      <>
        <Text>Hello</Text>
        <Text>World</Text>
      </>
    );

    expect(element).toStrictEqual({
      type: 'panel',
      children: [
        {
          type: 'text',
          value: 'Hello',
        },
        {
          type: 'text',
          value: 'World',
        },
      ],
    });
  });
});
