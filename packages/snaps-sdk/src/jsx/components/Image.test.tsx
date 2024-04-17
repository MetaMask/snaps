import { Image } from './Image';

describe('Image', () => {
  it('renders an image', () => {
    const result = <Image src="<svg />" alt="Foo" />;

    expect(result).toStrictEqual({
      type: 'image',
      key: null,
      props: {
        src: '<svg />',
        alt: 'Foo',
      },
    });
  });
});
