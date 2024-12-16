import {
  Box,
  Checkbox,
  Dropdown,
  Option,
  Radio,
  RadioGroup,
  Section,
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
    <Section>
      <Text>Setting 1</Text>
      <Text color="alternative">This is the first setting</Text>
      <Checkbox name="setting1" variant="toggle" checked={setting1} />
    </Section>
    <Section>
      <Text>Setting 2</Text>
      <Text color="alternative">This is the second setting</Text>
      <RadioGroup name="setting2" value={setting2}>
        <Radio value="option1">Option 1</Radio>
        <Radio value="option2">Option 2</Radio>
      </RadioGroup>
    </Section>
    <Section>
      <Text>Setting 3</Text>
      <Text color="alternative">This is the third setting</Text>
      <Dropdown name="setting3" value={setting3}>
        <Option value="option1">Option 1</Option>
        <Option value="option2">Option 2</Option>
      </Dropdown>
    </Section>
  </Box>
);
