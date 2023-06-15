import { hexlifyTransactionData } from './utils';

describe('hexlifyTransactionData', () => {
  it('hexlifies decimals', () => {
    expect(
      hexlifyTransactionData({
        from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        to: '0x',
        value: '0.01',
        gas: '21000',
        nonce: '5',
        maxFeePerGas: '10',
        maxPriorityFeePerGas: '1',
        data: '0x',
      }),
    ).toStrictEqual({
      data: '0x',
      from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      gas: '0x5208',
      maxFeePerGas: '0x2540be400',
      maxPriorityFeePerGas: '0x3b9aca00',
      nonce: '0x5',
      to: '0x',
      value: '0x2386f26fc10000',
    });
  });

  it('supports hex', () => {
    expect(
      hexlifyTransactionData({
        data: '0x',
        from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        gas: '0x5208',
        maxFeePerGas: '0x2540be400',
        maxPriorityFeePerGas: '0x3b9aca00',
        nonce: '0x5',
        to: '0x',
        value: '0x2386f26fc10000',
      }),
    ).toStrictEqual({
      data: '0x',
      from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      gas: '0x5208',
      maxFeePerGas: '0x2540be400',
      maxPriorityFeePerGas: '0x3b9aca00',
      nonce: '0x5',
      to: '0x',
      value: '0x2386f26fc10000',
    });
  });

  it('returns 0x for empty fields', () => {
    expect(
      hexlifyTransactionData({
        data: '',
        from: '',
        gas: '',
        maxFeePerGas: '',
        maxPriorityFeePerGas: '',
        nonce: '',
        to: '',
        value: '',
      }),
    ).toStrictEqual({
      data: '0x',
      from: '0x',
      gas: '0x',
      maxFeePerGas: '0x',
      maxPriorityFeePerGas: '0x',
      nonce: '0x',
      to: '0x',
      value: '0x',
    });
  });
});
