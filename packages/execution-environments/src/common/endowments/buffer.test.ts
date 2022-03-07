import buffer from './buffer';

describe('Buffer endowment', () => {
  it('has expected properties', () => {
    expect(buffer).toMatchObject({
      names: ['Buffer'],
      factory: expect.any(Function),
    });
  });

  it('has expected factory output', () => {
    expect(buffer.factory()).toStrictEqual({ Buffer });
  });
});
