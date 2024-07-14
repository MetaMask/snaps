# @metamask/snaps-storybook

A Storybook plugin for the MetaMask Snaps SDK.

## Installation

Use Node.js `18.0.0` or later. We recommend using [nvm](https://github.com/nvm-sh/nvm)
for managing Node.js versions.

Install a dependency in your snap project using `yarn` or `npm`:

- `npm install @metamask/snaps-storybook`
- `yarn add @metamask/snaps-storybook`

## Usage

`snaps-storybook` is a framework rather than an addon. To use it, add the
following to your `.storybook/main.[tj]s`:

```js
module.exports = {
  framework: {
    name: '@metamask/snaps-storybook',
    options: {
      // Add options here
    },
  },
};
```

In addition to supporting the Snaps SDK components, `snaps-storybook` also
loads some additional addons that are useful for developing Snaps:

- `@storybook/addon-docs` for automatically generating documentation for your
  components.
- `@storybook/addon-toolbar` for adding a toolbar to the Storybook UI.

Other addons may or may not work with `snaps-storybook`. If you encounter
issues, please file a bug report.

### Example

After installing `snaps-storybook`, you can create a new story as usual:

```js
import { Meta, Story } from '@metamask/snaps-storybook';
import { Text, TextProps } from './Text';

const meta: Meta<typeof Text> = {
  title: 'Text/Text',
  component: Text,
  argTypes: {
    // ...
  },
};

export default meta;

/**
 * The text component renders text. It can be used in combination with other
 * formatting components to create rich text.
 */
export const Default: Story<TextProps> = {
  render: (props) => <Text {...props} />,
  args: {
    children: 'This is some text.',
  },
};
```
