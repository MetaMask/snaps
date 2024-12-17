import { Banner } from './Banner';
import { Button } from './form/Button';
import { Bold } from './formatting/Bold';
import { Italic } from './formatting/Italic';
import { Icon } from './Icon';
import { Link } from './Link';
import { Text } from './Text';

describe('Banner', () => {
  it('renders a banner component', () => {
    const result = (
      <Banner title="Test Banner" severity="info">
        <Text>Example test banner.</Text>
        <Link href="https://example.com">foo</Link>
        <Button type="button">foo</Button>
        <Icon name="arrow-left" color="primary" size="md" />
        <Bold>foo</Bold>
        <Italic>bar</Italic>
      </Banner>
    );

    expect(result).toStrictEqual({
      type: 'Banner',
      key: null,
      props: {
        title: 'Test Banner',
        severity: 'info',
        children: [
          {
            type: 'Text',
            props: {
              children: 'Example test banner.',
            },
            key: null,
          },
          {
            type: 'Link',
            props: {
              href: 'https://example.com',
              children: 'foo',
            },
            key: null,
          },
          {
            type: 'Button',
            props: {
              type: 'button',
              children: 'foo',
            },
            key: null,
          },
          {
            type: 'Icon',
            props: {
              name: 'arrow-left',
              color: 'primary',
              size: 'md',
            },
            key: null,
          },
          {
            type: 'Bold',
            props: {
              children: 'foo',
            },
            key: null,
          },
          {
            type: 'Italic',
            props: {
              children: 'bar',
            },
            key: null,
          },
        ],
      },
    });
  });
});
