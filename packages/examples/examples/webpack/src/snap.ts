export async function onRPC(
  originString: string,
  requestObject: Record<string, unknown>,
) {
  switch (requestObject.method) {
    case 'inApp':
      return wallet.request({
        method: 'snap_notify',
        params: [
          {
            type: 'inApp',
            message: `Hello, ${originString}!`,
          },
        ],
      });
    case 'native':
      return wallet.request({
        method: 'snap_notify',
        params: [
          {
            type: 'native',
            message: `Hello, ${originString}!`,
          },
        ],
      });
    default:
      throw new Error('Method not found.');
  }
}
