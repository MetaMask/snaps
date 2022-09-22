import { Maybe, None, Some } from './Option';

describe('Option', () => {
  const NUMBER = 42;
  describe('Maybe', () => {
    it('returns Some on data', () => {
      const option = Maybe(NUMBER);
      expect(option.expect()).toStrictEqual(NUMBER);
    });
    it('returns None on undefined and null', () => {
      const optionUndefined = Maybe(undefined);
      const optionNull = Maybe(null);

      expect(optionUndefined.isNone).toStrictEqual(true);
      expect(optionNull.isNone).toStrictEqual(true);
    });
    it('works correctly with falsy', () => {
      expect(Maybe(false).expect()).toStrictEqual(false);
    });
  });

  describe('Some', () => {
    it('returns Option with data', () => {
      const option = Some(NUMBER);
      expect(option.expect()).toStrictEqual(NUMBER);
    });
    it('returns Some with undefined and null', () => {
      const optionUndefined = Some(undefined);
      const optionNull = Some(null);

      expect(optionUndefined.expect()).toStrictEqual(undefined);
      expect(optionNull.expect()).toStrictEqual(null);
    });
  });

  describe('None', () => {
    it('returns Option with nothing', () => {
      const option = None();
      expect(option.isNone).toStrictEqual(true);
    });
  });

  describe('isSome', () => {
    it('returns true on data', () => {
      expect(Some(NUMBER).isSome).toStrictEqual(true);
    });
    it('returns false on nothing', () => {
      expect(None().isSome).toStrictEqual(false);
    });
  });
  describe('isNone', () => {
    it('returns true on nothing', () => {
      expect(None().isNone).toStrictEqual(true);
    });
    it('returns false on data', () => {
      expect(Some(NUMBER).isNone).toStrictEqual(false);
    });
  });

  describe('Symbol.iterator', () => {
    it('iterates on Some', () => {
      expect([...Some(NUMBER)]).toStrictEqual([NUMBER]);
      expect([...Some(NUMBER).values()]).toStrictEqual([NUMBER]);
    });
    it('returns empty iterator on None', () => {
      expect([...None()]).toStrictEqual([]);
      expect([...None().values()]).toStrictEqual([]);
    });
  });

  describe('switch', () => {
    it('works with 2 args', () => {
      expect(
        Some(NUMBER).switch(
          (v) => v + 1,
          () => {
            throw new Error();
          },
        ),
      ).toStrictEqual(NUMBER + 1);

      expect(
        None().switch(
          (v) => {
            throw new Error();
          },
          () => NUMBER + 1,
        ),
      ).toStrictEqual(NUMBER + 1);
    });

    it('works with 1 arg', () => {
      expect(
        Some(NUMBER).switch({
          some: (v) => v + 1,
          none: () => {
            throw new Error();
          },
        }),
      ).toStrictEqual(NUMBER + 1);

      expect(
        None().switch({
          some: (v) => {
            throw new Error();
          },
          none: () => NUMBER + 1,
        }),
      ).toStrictEqual(NUMBER + 1);
    });
  });

  describe('switchPartial', () => {
    it('works', () => {
      expect(Some(NUMBER).switchPartial({ some: (v) => v + 1 })).toStrictEqual(
        NUMBER + 1,
      );
      expect(None().switchPartial({ none: () => NUMBER + 1 })).toStrictEqual(
        NUMBER + 1,
      );
      expect(
        Some(NUMBER).switchPartial({
          none: () => {
            throw new Error();
          },
        }),
      ).toStrictEqual(undefined);
      expect(
        None().switchPartial({
          some: (v) => {
            throw new Error();
          },
        }),
      ).toStrictEqual(undefined);
      expect(
        Some(NUMBER).switchPartial({
          some: (v) => v + 1,
          none: () => {
            throw new Error();
          },
        }),
      ).toStrictEqual(NUMBER + 1);
      expect(
        None().switchPartial({
          some: (v) => {
            throw new Error();
          },
          none: () => NUMBER + 1,
        }),
      ).toStrictEqual(NUMBER + 1);
    });
  });

  describe('expect', () => {
    it('unwraps', () => {
      expect(Some(NUMBER).expect()).toStrictEqual(NUMBER);
    });
    it('throws default error', () => {
      expect(() => None().expect()).toThrow('Tried to unwrap None');
    });
    it('throws custom message', () => {
      expect(() => None().expect('foo bar')).toThrow('foo bar');
    });
    it('throw custom Error', () => {
      expect(() => None().expect(new TypeError('foo bar'))).toThrow(TypeError);
    });
  });

  describe('unwrapOr', () => {
    it('unwraps', () => {
      expect(Some(NUMBER).unwrapOr(NUMBER + 1)).toStrictEqual(NUMBER);
    });
    it('returns default value', () => {
      expect(None().unwrapOr(NUMBER)).toStrictEqual(NUMBER);
    });
  });

  describe('unwrapOrElse', () => {
    it('unwraps', () => {
      expect(
        Some(NUMBER).unwrapOrElse(() => {
          throw new Error();
        }),
      ).toStrictEqual(NUMBER);
    });
    it('executes orElse', () => {
      expect(None().unwrapOrElse(() => NUMBER)).toStrictEqual(NUMBER);
    });
  });

  describe('filter', () => {
    it('no-ops on None', () => {
      expect(
        None().filter(() => {
          throw new Error();
        }).isNone,
      ).toStrictEqual(true);
    });
    it('filters Some', () => {
      expect(Some(NUMBER).filter(() => false).isNone).toStrictEqual(true);
      expect(
        Some(NUMBER)
          .filter(() => true)
          .expect(),
      ).toStrictEqual(NUMBER);
    });
  });

  describe('flat', () => {
    it('flattens', () => {
      expect(Some(Some(NUMBER)).flat().expect()).toStrictEqual(NUMBER);
    });
    it('no-ops if not nested', () => {
      expect(Some(NUMBER).flat().expect()).toStrictEqual(NUMBER);
    });
    it('no-ops on None', () => {
      expect(None().flat().isNone).toStrictEqual(true);
    });
    it('throws on negative number', () => {
      expect(() => Some(NUMBER).flat(-1)).toThrow(TypeError);
      expect(() => None().flat(-1)).toThrow(TypeError);
    });
    it('defaults to depth 1', () => {
      expect(
        Some(Some(Some(NUMBER)))
          .flat()
          .expect()
          .expect(),
      ).toStrictEqual(NUMBER);
    });
    it('depth arg works', () => {
      expect(
        Some(Some(Some(NUMBER)))
          .flat(2)
          .expect(),
      ).toStrictEqual(NUMBER);
    });
    it('works with Infinity', () => {
      expect(
        Some(Some(Some(Some(NUMBER))))
          .flat(Infinity)
          .expect(),
      ).toStrictEqual(NUMBER);
    });
    it('works correctly if depth > actual levels', () => {
      expect(Some(Some(NUMBER)).flat(3).expect()).toStrictEqual(NUMBER);
    });
  });

  describe('map', () => {
    it('maps Some', () => {
      expect(
        Some(NUMBER)
          .map((v) => v + 1)
          .expect(),
      ).toStrictEqual(NUMBER + 1);
    });

    it('no-ops on None', () => {
      expect(
        None().map(() => {
          throw new Error();
        }).isNone,
      ).toStrictEqual(true);
    });
  });

  describe('mapOr', () => {
    it('maps Some', () => {
      expect(
        Some(NUMBER)
          .mapOr((v) => v + 1, NUMBER)
          .expect(),
      ).toStrictEqual(NUMBER + 1);
    });
    it('returns default on None', () => {
      expect(
        None()
          .mapOr(() => {
            throw new Error();
          }, NUMBER)
          .expect(),
      ).toStrictEqual(NUMBER);
    });
  });

  describe('mapOrElse', () => {
    it('maps Some', () => {
      expect(
        Some(NUMBER)
          .mapOrElse(
            (v) => v + 1,
            () => {
              throw new Error();
            },
          )
          .expect(),
      ).toStrictEqual(NUMBER + 1);
    });

    it('calls orElse on None', () => {
      expect(
        None()
          .mapOrElse(
            () => {
              throw new Error();
            },
            () => NUMBER,
          )
          .expect(),
      ).toStrictEqual(NUMBER);
    });
  });

  describe('zip', () => {
    it('zips', () => {
      expect(
        Some(NUMBER)
          .zip(Some(NUMBER + 1))
          .expect(),
      ).toStrictEqual([NUMBER, NUMBER + 1]);
    });

    it.each([
      [null, null],
      [1, null],
      [null, 1],
    ])('returns None on %p/%p', (a, b) => {
      expect(Maybe(a).zip(Maybe(b)).isNone).toStrictEqual(true);
    });
  });

  describe('or', () => {
    it.each([
      [1, null, 1],
      [null, 1, 1],
      [1, 2, 1],
    ])('%p/%p or circuits to %p', (a, b, result) => {
      expect(Maybe(a).or(Maybe(b)).expect()).toStrictEqual(result);
    });
    it('returns None on None/None', () => {
      expect(None().or(None()).isNone).toStrictEqual(true);
    });
  });

  describe('orElse', () => {
    it('returns itself on Some', () => {
      expect(
        Some(NUMBER)
          .orElse(() => {
            throw new Error();
          })
          .expect(),
      ).toStrictEqual(NUMBER);
    });
    it('calls orElse on None', () => {
      expect(
        None()
          .orElse(() => Some(NUMBER))
          .expect(),
      ).toStrictEqual(NUMBER);
    });
  });
});
