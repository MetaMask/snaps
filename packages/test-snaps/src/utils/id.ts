import { assert } from '@metamask/utils';

export const getSnapId = (
  snapId: `npm:${string}` | undefined,
  port: number | undefined,
): string => {
  assert(snapId ?? port);

  if (!port) {
    return snapId as string;
  }

  const localId = `local:http://localhost:${port}`;
  if (!snapId) {
    return localId;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? snapId : localId;
};
