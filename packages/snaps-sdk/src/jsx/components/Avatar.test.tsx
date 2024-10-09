import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders an avatar', () => {
    const result = (
      <Avatar address="eip155:1:0x1234567890123456789012345678901234567890" />
    );

    expect(result).toStrictEqual({
      type: 'Avatar',
      key: null,
      props: {
        address: 'eip155:1:0x1234567890123456789012345678901234567890',
      },
    });
  });

  it('renders an avatar of a certain size', () => {
    const result = (
      <Avatar
        address="eip155:1:0x1234567890123456789012345678901234567890"
        size="lg"
      />
    );

    expect(result).toStrictEqual({
      type: 'Avatar',
      key: null,
      props: {
        address: 'eip155:1:0x1234567890123456789012345678901234567890',
        size: 'lg',
      },
    });
  });
});
