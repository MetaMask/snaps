import type { JsonObject, SnapComponent } from '@metamask/snaps-sdk/jsx';
import type {
  Args,
  ComponentAnnotations,
  DecoratorFunction,
  ProjectAnnotations,
  StoryAnnotations,
  StrictArgs,
  WebRenderer,
  ArgsStoryFn,
} from '@storybook/types';

/**
 * The renderer for the component stories.
 *
 * @template Props - The props type for the component that is being rendered.
 */
export type SnapsRenderer<Props extends JsonObject = Record<string, any>> =
  WebRenderer & {
    component: SnapComponent<Props>;
  };

/**
 * Decorator function for the component story.
 */
export type Decorator<DecoratorArgs = StrictArgs> = DecoratorFunction<
  SnapsRenderer,
  DecoratorArgs
>;

/**
 * Meta data for the component story.
 */
export type Meta<ComponentOrArgs = JsonObject> = [ComponentOrArgs] extends [
  SnapComponent<infer Props>,
]
  ? ComponentAnnotations<SnapsRenderer<Props>, Props>
  : ComponentAnnotations<SnapsRenderer<JsonObject>, ComponentOrArgs>;

/**
 * Story object for the component story.
 */
export type Story<Props = Args> = StoryAnnotations<SnapsRenderer, Props>;

/**
 * Story function for the component story. Note that this is not supported by
 * the documentation source code generation, so using {@link Story} is
 * recommended.
 */
export type StoryFunction<Props = Args> = ArgsStoryFn<SnapsRenderer, Props>;

/**
 * Preview config for the project.
 */
export type Preview = ProjectAnnotations<SnapsRenderer>;
