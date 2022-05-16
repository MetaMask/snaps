const getMessage = (originString: string): string => `Hello, ${originString}!`;

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
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
});

// Just for compatibility with the ESLint `import/unambiguous` rule.
export {};
