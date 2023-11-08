import { ManageStateOperation } from './manage-state';

describe('ManageStateOperation', () => {
  it('has the correct values', () => {
    expect(Object.values(ManageStateOperation)).toHaveLength(3);
    expect(ManageStateOperation.ClearState).toBe('clear');
    expect(ManageStateOperation.GetState).toBe('get');
    expect(ManageStateOperation.UpdateState).toBe('update');
  });
});
