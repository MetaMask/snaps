const getMessage = (originString: string): string => `Hello, ${originString}!`;

export async function onRPC(
  originString: string,
  requestObject: Record<string, unknown>,
) {
  switch (requestObject.method) {
    case 'hello':
      return wallet.request({
        method: 'snap_notify',
        params: [
          {
            type: 'native',
            message: getMessage(originString),
          },
        ],
      });
    default:
      throw new Error('Method not found.');
  }
}
