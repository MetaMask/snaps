// Components that are exported here can be used by Snaps to render JSX
// elements. There are some custom components that are not part the Snaps JSX
// components, but are used by the Storybook plugin to render the extension
// window and provide the necessary context for the Snap to render.

import * as Address from './address';
import * as Box from './box';
import * as Button from './button';
import * as Copyable from './copyable';
import * as Divider from './divider';
import * as Heading from './heading';
import * as Row from './row';
import * as Text from './text';
import type { Component } from './types';

// TODO: Change `string` to `JSXElement['type']`.
export const SNAPS_COMPONENTS: Record<string, Component> = {
  Address,
  Box,
  Button,
  Copyable,
  Divider,
  Heading,
  Row,
  Text,
};

export * from './types';
