// eslint-disable-next-line import/no-unassigned-import
require('ses');

// eslint-disable-next-line @typescript-eslint/no-var-requires

// eslint-disable-next-line no-proto
console.log('about to lockdown');

// eslint-disable-next-line no-proto
console.log(delete ArrayBuffer.__proto__);

global.lockdown({
  // TODO: Which would we use in prod?
  mathTaming: 'unsafe',
  errorTaming: 'unsafe',
  dateTaming: 'unsafe',
});

console.log('locked down now');
