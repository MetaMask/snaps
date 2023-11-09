import { SeverityLevel } from './transaction';

describe('SeverityLevel', () => {
  it('has the correct values', () => {
    expect(Object.values(SeverityLevel)).toHaveLength(1);
    expect(SeverityLevel.Critical).toBe('critical');
  });
});
