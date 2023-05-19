import { parseUnits } from '@ethersproject/units';
import { bigIntToHex, isStrictHexString } from '@metamask/utils';

export type TransactionFormData = {
  chainId: string;
  transactionOrigin: string;
  from: string;
  to: string;
  nonce: string;
  value: string;
  data: string;
  gas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
};

const hexlify = (input: string, unit?: string) => {
  if (input.length === 0) {
    return '0x';
  }

  if (isStrictHexString(input) || input === '0x') {
    return input;
  }

  if (unit) {
    const parsed = parseUnits(input, unit);
    return bigIntToHex(parsed.toBigInt());
  }
  return bigIntToHex(BigInt(input));
};

export const hexlifyTransactionData = (
  transaction: Omit<TransactionFormData, 'transactionOrigin' | 'chainId'>,
) => {
  const gas = hexlify(transaction.gas);
  const nonce = hexlify(transaction.nonce);
  const maxFeePerGas = hexlify(transaction.maxFeePerGas, 'gwei');
  const maxPriorityFeePerGas = hexlify(
    transaction.maxPriorityFeePerGas,
    'gwei',
  );
  const value = hexlify(transaction.value, 'ether');
  const to = hexlify(transaction.to);
  const from = hexlify(transaction.from);
  const data = hexlify(transaction.data);
  return {
    ...transaction,
    to,
    from,
    data,
    gas,
    nonce,
    maxFeePerGas,
    maxPriorityFeePerGas,
    value,
  };
};
