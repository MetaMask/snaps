# Contributing

## Adding new JSX components

The MetaMask Snaps SDK uses JSX components for building user interfaces in
Snaps. To add a new component, follow these steps:

1. Create a new file in the `src/jsx/components` directory, optionally in a
   subdirectory if the component is part of a group of related components.
2. It is recommended to copy an existing component file and modify it to create
   the new component.
3. Create a test for the new component, following the existing test files for
   the other components.
4. Add the new component to the `src/jsx/components/index.ts` file, exporting it
   from the file.
   - This file also contains a `JSXElement` union type that should
     be updated to include the new component.
5. Add validation for the component to `src/jsx/validation.ts`, making sure to
   use the `Describe` helper type to ensure that the component is correctly
   validated.
   - Make sure to add tests for the validation in `src/jsx/validation.test.ts`
     as well.
6. If the component is stateful, make sure to add it to the
   `SnapInterfaceController` too.
   - You can use [this PR](https://github.com/MetaMask/snaps/pull/2501) as a
     reference.

### Component props

When adding a new component, make sure to document the props that the component
accepts. This can be done by adding a JSDoc comment to the component function
declaration, like so:

```typescript
/**
 * The props of the {@link Dropdown} component.
 *
 * @property name - The name of the dropdown. This is used to identify the
 * state in the form data.
 * @property value - The selected value of the dropdown.
 * @property children - The children of the dropdown.
 */
export type DropdownProps = {
  name: string;
  value?: string | undefined;
  children: SnapsChildren<OptionElement>;
};
```

The props type should be exported from the component file and used in the
component function declaration, like so:

```typescript
// ...
export const Dropdown = createSnapComponent<DropdownProps, typeof TYPE>(TYPE);
```

To ensure consistency, make sure to follow the existing patterns in the codebase
when documenting component props.

#### Optional props

Optional props should be both marked with a `?` in the type definition, and
also include `undefined` in the type definition. This is to ensure that the
component can be used with or without TypeScript's exact optional props feature.

```typescript
export type ComponentProps = {
  value?: string | undefined;
};
```

#### Children

In most cases, the children prop should be defined as `SnapsChildren` to allow
for both a single child element or an array of child elements. There are some
exceptions to this rule, such as when the component only accepts a single child
element (e.g., `Field`).

Children should also accept `boolean` and `null` values to allow for conditional
rendering of child elements. This is handled automatically by the
`SnapsChildren` type.

```typescript
export type ComponentProps = {
  children: SnapsChildren<string>; // Nestable<string | boolean | null>;
};
```

If the children are optional, make sure to include `undefined` in the type and
add the `?` to the prop definition.

```typescript
export type ComponentProps = {
  children?: SnapsChildren<string> | undefined;
};
```
