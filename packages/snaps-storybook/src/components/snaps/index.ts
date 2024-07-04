// Components that are exported here can be used by Snaps to render JSX
// elements. There are some custom components that are not part the Snaps JSX
// components, but are used by the Storybook plugin to render the extension
// window and provide the necessary context for the Snap to render.

import * as Address from './address';
import * as Bold from './bold';
import * as Box from './box';
import * as Button from './button';
import * as Card from './card';
import * as Checkbox from './checkbox';
import * as Container from './container';
import * as Copyable from './copyable';
import * as Divider from './divider';
import * as Dropdown from './dropdown';
import * as Field from './field';
import * as FileInput from './file-input';
import * as Footer from './footer';
import * as Form from './form';
import * as Heading from './heading';
import * as Image from './image';
import * as Input from './input';
import * as Italic from './italic';
import * as Link from './link';
import * as Option from './option';
import * as Row from './row';
import * as Text from './text';
import * as Tooltip from './tooltip';
import type { Component } from './types';

// TODO: Change `string` to `JSXElement['type']`.
export const SNAPS_COMPONENTS: Record<string, Component> = {
  Address,
  Bold,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Copyable,
  Divider,
  Dropdown,
  Field,
  FileInput,
  Footer,
  Form,
  Heading,
  Image,
  Input,
  Italic,
  Link,
  Option,
  Row,
  Text,
  Tooltip,
};

export * from './types';
