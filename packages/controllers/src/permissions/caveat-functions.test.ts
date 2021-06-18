import { CaveatType } from './Caveat';
import { caveatFunctionGenerators } from './caveat-functions';

describe('caveat functions', () => {
  it('implements all caveat types', () => {
    const types = Object.values(CaveatType);
    expect(types.length).toStrictEqual(
      Object.keys(caveatFunctionGenerators).length,
    );

    for (const caveatType of types) {
      expect(caveatFunctionGenerators).toHaveProperty(caveatType);
    }
  });
});
