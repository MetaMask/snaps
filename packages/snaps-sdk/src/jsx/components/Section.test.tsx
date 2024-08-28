import { Address } from './Address';
import { Row } from './Row';
import { Section } from './Section';
import { Text } from './Text';

describe('Section', () => {
  it('renders a section', () => {
    const result = (
      <Section>
        <Text>Hello</Text>
      </Section>
    );

    expect(result).toStrictEqual({
      type: 'Section',
      key: null,
      props: {
        children: {
          type: 'Text',
          key: null,
          props: {
            children: 'Hello',
          },
        },
      },
    });
  });

  it('renders a section with multiple children', () => {
    const result = (
      <Section>
        <Row label="From">
          <Address address="0x1234567890123456789012345678901234567890" />
        </Row>
        <Row
          label="To"
          variant="warning"
          tooltip="This address has been deemed dangerous."
        >
          <Address address="0x0000000000000000000000000000000000000000" />
        </Row>
      </Section>
    );

    expect(result).toStrictEqual({
      type: 'Section',
      key: null,
      props: {
        children: [
          {
            type: 'Row',
            key: null,
            props: {
              label: 'From',
              children: {
                type: 'Address',
                key: null,
                props: {
                  address: '0x1234567890123456789012345678901234567890',
                },
              },
            },
          },
          {
            type: 'Row',
            key: null,
            props: {
              label: 'To',
              tooltip: 'This address has been deemed dangerous.',
              variant: 'warning',
              children: {
                type: 'Address',
                key: null,
                props: {
                  address: '0x0000000000000000000000000000000000000000',
                },
              },
            },
          },
        ],
      },
    });
  });

  it('renders a section with props', () => {
    const result = (
      <Section direction="horizontal" alignment="space-between">
        <Text>Hello</Text>
        <Text>World</Text>
      </Section>
    );

    expect(result).toStrictEqual({
      type: 'Section',
      key: null,
      props: {
        direction: 'horizontal',
        alignment: 'space-between',
        children: [
          {
            type: 'Text',
            key: null,
            props: {
              children: 'Hello',
            },
          },
          {
            type: 'Text',
            key: null,
            props: {
              children: 'World',
            },
          },
        ],
      },
    });
  });
});
