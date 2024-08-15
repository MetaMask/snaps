import { Icon } from './Icon';

describe('Icon', () => {
  it('renders an icon', () => {
    const result = <Icon name="warning" />;

    expect(result).toStrictEqual({
      type: 'Icon',
      key: null,
      props: {
        name: 'warning',
      },
    });
  });

  it('renders an icon with color', () => {
    const result = <Icon name="warning" color="primary" />;

    expect(result).toStrictEqual({
      type: 'Icon',
      key: null,
      props: { name: 'warning', color: 'primary' },
    });
  });

  it('renders an icon with size', () => {
    const result = <Icon name="warning" size="md" />;

    expect(result).toStrictEqual({
      type: 'Icon',
      key: null,
      props: { name: 'warning', size: 'md' },
    });
  });
});
