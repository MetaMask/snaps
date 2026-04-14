import { Address } from './Address';
import { CollapsibleSection } from './CollapsibleSection';
import { Row } from './Row';
import { Text } from './Text';

describe('CollapsibleSection', () => {
  it('renders a collapsible section', () => {
    const result = (
      <CollapsibleSection label="Details">
        <Text>Hello</Text>
      </CollapsibleSection>
    );

    expect(result).toStrictEqual({
      type: 'CollapsibleSection',
      key: null,
      props: {
        label: 'Details',
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

  it('renders a collapsible section with multiple children', () => {
    const result = (
      <CollapsibleSection label="Transaction details">
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
      </CollapsibleSection>
    );

    expect(result).toStrictEqual({
      type: 'CollapsibleSection',
      key: null,
      props: {
        label: 'Transaction details',
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

  it('renders a collapsible section with props', () => {
    const result = (
      <CollapsibleSection
        label="Details"
        direction="horizontal"
        alignment="space-between"
        isLoading={false}
        isExpanded={true}
      >
        <Text>Hello</Text>
        <Text>World</Text>
      </CollapsibleSection>
    );

    expect(result).toStrictEqual({
      type: 'CollapsibleSection',
      key: null,
      props: {
        label: 'Details',
        direction: 'horizontal',
        alignment: 'space-between',
        isExpanded: true,
        isLoading: false,
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
