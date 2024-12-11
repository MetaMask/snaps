import { Input } from './form';
import { SettingCell } from './SettingCell';

describe('SettingCell', () => {
  it('renders a setting cell', () => {
    const result = (
      <SettingCell title="Title" description="Description">
        <Input name="setting1" />
      </SettingCell>
    );

    expect(result).toStrictEqual({
      type: 'SettingCell',
      key: null,
      props: {
        title: 'Title',
        description: 'Description',
        children: {
          type: 'Input',
          key: null,
          props: {
            name: 'setting1',
          },
        },
      },
    });
  });
});
