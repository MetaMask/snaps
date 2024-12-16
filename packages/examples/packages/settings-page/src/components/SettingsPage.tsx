import {
  Box,
  Checkbox,
  Dropdown,
  Heading,
  Option,
  Radio,
  RadioGroup,
  Section,
  SettingCell,
  Text,
  type SnapComponent,
} from '@metamask/snaps-sdk/jsx';

export type SettingsPageProps = {
  setting1?: boolean;
  setting2?: 'option1' | 'option2';
  setting3?: 'option1' | 'option2';
};

/**
 * A settings page component that displays three settings.
 *
 * @param param - The settings page props.
 * @param param.setting1 - The first setting.
 * @param param.setting2 - The second setting.
 * @param param.setting3 - The third setting.
 * @returns The settings page component.
 */
export const SettingsPage: SnapComponent<SettingsPageProps> = ({
  setting1,
  setting2,
  setting3,
}) => (
  <Box>
    <SettingCell title="Setting 1" description="This is the first setting">
      <Checkbox name="setting1" variant="toggle" checked={setting1} />
    </SettingCell>
    <SettingCell title="Setting 2" description="This is the second setting">
      <RadioGroup name="setting2" value={setting2}>
        <Radio value="option1">Option 1</Radio>
        <Radio value="option2">Option 2</Radio>
      </RadioGroup>
    </SettingCell>
    <SettingCell title="Setting 3" description="This is the third setting">
      <Dropdown name="setting3" value={setting3}>
        <Option value="option1">Option 1</Option>
        <Option value="option2">Option 2</Option>
      </Dropdown>
    </SettingCell>
    <Section>
      <Heading size="sm">Setting 1</Heading>
      <Text color="muted">This is the first setting</Text>
      <Dropdown name="setting4" value={setting3}>
        <Option value="option1">Option 1</Option>
        <Option value="option2">Option 2</Option>
      </Dropdown>
    </Section>
  </Box>
);
