import type { Json } from '@metamask/utils';

export type PBKDF2Params = {
  iterations: number;
};

export type KeyDerivationOptions = {
  algorithm: 'PBKDF2';
  params: PBKDF2Params;
};

export type EncryptionResult = {
  data: string;
  iv: string;
  salt: string;
  keyMetadata?: KeyDerivationOptions;
};

/**
 * A generic encryptor interface that supports encrypting and decrypting
 * serializable data with a password.
 */
export type GenericEncryptor = {
  /**
   * Encrypt the given object with the given password.
   *
   * @param password - The password to encrypt with.
   * @param object - The object to encrypt.
   * @returns The encrypted string.
   */
  encrypt: (password: string, object: Json) => Promise<string>;

  /**
   * Decrypt the given encrypted string with the given password.
   *
   * @param password - The password to decrypt with.
   * @param encryptedString - The encrypted string to decrypt.
   * @returns The decrypted object.
   */
  decrypt: (password: string, encryptedString: string) => Promise<unknown>;

  /**
   * Check if the provided vault is up to date with the
   * desired encryption algorithm.
   *
   * @param vault - The encrypted string to check.
   * @param targetDerivationParams - The desired target derivation params.
   * @returns The updated encrypted string.
   */
  isVaultUpdated: (
    vault: string,
    targetDerivationParams?: KeyDerivationOptions,
  ) => boolean;
};

/**
 * An encryptor interface that supports encrypting and decrypting
 * serializable data with a password, and exporting and importing keys.
 */
export type ExportableKeyEncryptor = GenericEncryptor & {
  /**
   * Encrypt the given object with the given encryption key.
   *
   * @param key - The encryption key to encrypt with.
   * @param object - The object to encrypt.
   * @returns The encryption result.
   */
  encryptWithKey: (key: unknown, object: Json) => Promise<EncryptionResult>;

  /**
   * Decrypt the given encrypted string with the given encryption key.
   *
   * @param key - The encryption key to decrypt with.
   * @param encryptedString - The encrypted string to decrypt.
   * @returns The decrypted object.
   */
  decryptWithKey: (
    key: unknown,
    encryptedString: EncryptionResult,
  ) => Promise<unknown>;

  /**
   * Generate an encryption key from exported key string.
   *
   * @param key - The exported key string.
   * @returns The encryption key.
   */
  importKey: <Type>(key: string) => Promise<Type>;

  /**
   * Export a generated key as a string.
   *
   * @param key - The encryption key.
   * @returns The exported key string.
   */
  exportKey: (key: unknown) => Promise<string>;

  /**
   * Generate a salt with a given length.
   *
   * @param length - The length of the salt, default is 32 bytes.
   * @returns The base64 encoded salt bytes.
   */
  generateSalt: (length?: number) => string;

  /**
   * Generate an encryption key using a password.
   *
   * @param password - The password to use to generate key.
   * @param salt - The salt string to use in key derivation.
   * @param exportable - Whether or not the key should be exportable.
   * @param opts - The options to use for key derivation.
   * @returns The encryption key.
   */
  keyFromPassword: <Type>(
    password: string,
    salt: string,
    exportable?: boolean,
    opts?: KeyDerivationOptions,
  ) => Promise<Type>;
};
