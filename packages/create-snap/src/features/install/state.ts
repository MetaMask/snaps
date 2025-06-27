import { atom } from 'jotai';

import { yarn } from './package-managers/yarn.js';

export const packageManagerAtom = atom(yarn);

export const metadataAtom = atom({
  name: '',
  description: '',
});
