import { Box, Text } from 'ink';
import Link from 'ink-link';
import SelectInput from 'ink-select-input';
import type { FunctionComponent, ComponentProps } from 'react';
import { useState } from 'react';

import { GITHUB_ISSUES_URL, SUPPORTED_TEMPLATES } from '../../../constants.js';
import { useFlow } from '../hooks/useFlow.js';
import type { InstallFlowContext } from '../types.js';

type Item<Type> = Parameters<
  Exclude<ComponentProps<typeof SelectInput>['onSelect'], undefined>
>[0] & {
  value: Type;
};

export const Template: FunctionComponent = () => {
  const { context, setContext, next } = useFlow<InstallFlowContext>();
  const [description, setDescription] = useState<string>(
    SUPPORTED_TEMPLATES.minimal.description,
  );

  const items = Object.values(SUPPORTED_TEMPLATES).map(({ name, type }) => ({
    label: name,
    value: type as keyof typeof SUPPORTED_TEMPLATES,
  }));

  const initialIndex = items.findIndex(
    (item) => item.value === context.template,
  );

  const handleSelect = (item: Item<keyof typeof SUPPORTED_TEMPLATES>) => {
    setContext({
      template: item.value,
    });

    next();
  };

  const handleHighlight = (item: Item<keyof typeof SUPPORTED_TEMPLATES>) => {
    setDescription(SUPPORTED_TEMPLATES[item.value].description);
  };

  return (
    <Box flexDirection="column" margin={1} gap={1}>
      <Text>
        Welcome to <Text bold={true}>create-snap</Text>! This tool will help you
        set up a new Snap project with your preferred template and package
        manager. In just a few steps, you'll have a fully functional Snap ready
        to start developing!
      </Text>
      <Text>
        To get started, select a Snap template from the list below, and press{' '}
        <Text color="green">Enter</Text> to continue.
      </Text>
      <Box marginX={2} gap={1} flexDirection="column">
        <SelectInput
          items={items}
          onSelect={handleSelect}
          onHighlight={handleHighlight}
          initialIndex={initialIndex}
        />
        <Text>{description}</Text>
      </Box>
      <Text dimColor={true}>
        If you want to request a new template, feel free to open an issue on{' '}
        <Link url={GITHUB_ISSUES_URL}>GitHub</Link>
      </Text>
    </Box>
  );
};
