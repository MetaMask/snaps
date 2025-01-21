import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders a skeleton component', () => {
    const result = <Skeleton width={320} height={32} borderRadius="medium" />;

    expect(result).toStrictEqual({
      type: 'Skeleton',
      key: null,
      props: {
        width: 320,
        height: 32,
        borderRadius: 'medium',
      },
    });
  });
});
