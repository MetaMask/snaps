export type Key = string | number;

export type SnapElement<Props> = {
  type: string;
  props: Props;
  key: Key | null;
};

export type SnapProps<Props> = Props & {
  key?: Key;
};

export type SnapComponent<Props = Record<string, never>> = (
  props: SnapProps<Props>,
) => SnapElement<Props>;
