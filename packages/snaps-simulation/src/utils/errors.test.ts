import { formatTypeErrorMessage } from './errors';

describe('formatTypeErrorMessage', () => {
  it('should format error message for one type', () => {
    const types = ['Input'];
    const result = formatTypeErrorMessage(types);
    expect(result).toBe('"Input"');
  });

  it('should format error message for two types', () => {
    const types = ['Input', 'AddressInput'];
    const result = formatTypeErrorMessage(types);
    expect(result).toBe('"Input" or "AddressInput"');
  });

  it('should format error message for multiple types', () => {
    const types = ['Input', 'AddressInput', 'NewInput'];
    const result = formatTypeErrorMessage(types);
    expect(result).toBe('"Input", "AddressInput" or "NewInput"');
  });
});
