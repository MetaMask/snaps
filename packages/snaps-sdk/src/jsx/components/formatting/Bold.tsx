import type { SnapComponent } from '../../component';

export type BoldProps = {
  children: string;
};

export type BoldElement = ReturnType<typeof Bold>;

export const Bold: SnapComponent<BoldProps, 'bold'> = ({
  key = null,
  children,
}) => {
  return {
    type: 'bold',
    props: {
      children,
    },
    key,
  };
};
