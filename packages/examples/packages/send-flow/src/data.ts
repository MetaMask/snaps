import jazzicon1 from './images/jazzicon1.svg';
import jazzicon2 from './images/jazzicon2.svg';
import type { Account } from './types';

/**
 * Example accounts data.
 */
export const accounts: Record<string, Account> = {
  bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh: {
    name: 'My Bitcoin Account',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    balance: { amount: 1.8, fiat: 92000 },
    icon: jazzicon1,
  },
  bc1pmpg8yzpty4xgp497qdydkcqt90zz68n48wzwm757vk8nrlkat99q272xm3: {
    name: 'Savings Account',
    address: 'bc1pmpg8yzpty4xgp497qdydkcqt90zz68n48wzwm757vk8nrlkat99q272xm3',
    balance: { amount: 2.5, fiat: 150000 },
    icon: jazzicon2,
  },
};

/**
 * Example accounts data as an array.
 */
export const accountsArray = Object.values(accounts);
