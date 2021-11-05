export const INLINE_SNAPS = {
  IDLE: `
    console.log('Welcome to Flavortown.');
  `,

  INFINITE_LOOP: `
    console.log('Infinite loop snap start.');
    let num = 0;
    let time;
    while (true) {
      if (num === 0) {
        time = Date.now();
      }
      if (num === (2e8 - 1)) {
        console.log('Ding, gratz.');
        console.log(console.log((Date.now() - time) / 1000))
      }
      num = (num + 1) % 2e8;
  `,

  MEMORY_LEAK: `
    console.log('Memory leak snap start.')
    const getStr = () => Math.random().toString(2)
    const getLongStr = (str) => new Array(1000000).join(str)
    wallet.leakyBoi = {}
    let str
    while (true) {
      str = getStr()
      wallet.leakyBoi[str] = Object.assign({}, wallet.leakyBoi, { [str]: getLongStr(str) })
    }
  `,
};
