import { object, optional, size, string } from '@metamask/superstruct';
import { Box, Text } from 'ink';
import type { FunctionComponent } from 'react';

import { Field, Input } from '../../../components';
import { useForm } from '../../../hooks/useForm.js';
import { useFlow } from '../hooks/useFlow.js';

const MetadataSchema = object({
  name: size(string(), 3, Infinity),
  packageName: size(string(), 3, Infinity),
  description: optional(string()),
});

export const Metadata: FunctionComponent = () => {
  const { context, setContext, next } = useFlow();
  const { register, submit, errors } = useForm(MetadataSchema);

  const handleSubmit = () => {
    submit((validatedValues) => {
      setContext({
        ...context,
        ...validatedValues,
      });

      next();
    });
  };

  return (
    <Box flexDirection="column" margin={1}>
      <Text>
        Enter metadata for your Snap, such as the name and description. Press{' '}
        <Text color="green">Tab</Text> to navigate between fields, and{' '}
        <Text color="green">Enter</Text> to submit the form.
      </Text>
      <Field
        name="Name"
        description="A human-readable name for your Snap."
        error={errors.name}
      >
        <Input {...register('name')} autoFocus={true} placeholder="My Snap" />
      </Field>
      <Field
        name="Package name"
        description="The NPM package name for your Snap, which should be unique."
        error={errors.packageName}
      >
        <Input {...register('packageName')} placeholder="@my-scope/my-snap" />
      </Field>
      <Field
        name="Description"
        description="A short description of your Snap."
        error={errors.description}
      >
        <Input
          {...register('description')}
          onSubmit={handleSubmit}
          placeholder="An optional description of your Snap."
        />
      </Field>
      <Box marginTop={1}>
        <Text dimColor={true}>
          Each of these fields can be changed later in the Snap's package.json
          and snap.manifest.json files.
        </Text>
      </Box>
    </Box>
  );
};
