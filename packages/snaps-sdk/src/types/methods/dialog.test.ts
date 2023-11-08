import { DialogType } from './dialog';

describe('DialogType', () => {
  it('has the correct values', () => {
    expect(Object.values(DialogType)).toHaveLength(3);
    expect(DialogType.Alert).toBe('alert');
    expect(DialogType.Confirmation).toBe('confirmation');
    expect(DialogType.Prompt).toBe('prompt');
  });
});
