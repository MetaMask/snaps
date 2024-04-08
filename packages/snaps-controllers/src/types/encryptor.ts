export type PBKDF2Params = {
  iterations: number;
};

export type KeyDerivationOptions = {
  algorithm: 'PBKDF2';
  params: PBKDF2Params;
};
