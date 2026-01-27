import { Accordeon } from './Accordeon';
import { Text } from './Text';

describe('Accordeon', () => {
  it('renders with required props', () => {
    const result = (
      <Accordeon title="Details">
        <Text>Content</Text>
      </Accordeon>
    );

    expect(result).toStrictEqual({
      type: 'Accordeon',
      key: null,
      props: {
        title: 'Details',
        children: {
          type: 'Text',
          key: null,
          props: {
            children: 'Content',
          },
        },
      },
    });
  });

  it('renders with all props', () => {
    const result = (
      <Accordeon title="Details" expanded>
        <Text>Content</Text>
      </Accordeon>
    );

    expect(result).toStrictEqual({
      type: 'Accordeon',
      key: null,
      props: {
        title: 'Details',
        expanded: true,
        children: {
          type: 'Text',
          key: null,
          props: {
            children: 'Content',
          },
        },
      },
    });
  });

  it('renders with expanded false', () => {
    const result = (
      <Accordeon title="Section" expanded={false}>
        <Text>Hidden</Text>
      </Accordeon>
    );

    expect(result.props.expanded).toBe(false);
  });

  it('renders with multiple children', () => {
    const result = (
      <Accordeon title="Section">
        <Text>First</Text>
        <Text>Second</Text>
      </Accordeon>
    );

    expect(result).toStrictEqual({
      type: 'Accordeon',
      key: null,
      props: {
        title: 'Section',
        children: [
          { type: 'Text', key: null, props: { children: 'First' } },
          { type: 'Text', key: null, props: { children: 'Second' } },
        ],
      },
    });
  });

  it('handles conditional rendering', () => {
    const result = (
      <Accordeon title="Section">{false && <Text>Hidden</Text>}</Accordeon>
    );

    expect(result.props.children).toBe(false);
  });

  it('renders with a key', () => {
    const result = (
      <Accordeon key="acc-1" title="Section">
        <Text>Content</Text>
      </Accordeon>
    );

    expect(result).toStrictEqual({
      type: 'Accordeon',
      key: 'acc-1',
      props: {
        title: 'Section',
        children: {
          type: 'Text',
          key: null,
          props: {
            children: 'Content',
          },
        },
      },
    });
  });
});
