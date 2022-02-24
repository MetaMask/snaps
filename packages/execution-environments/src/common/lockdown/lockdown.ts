export function executeLockdown() {
  try {
    lockdown({
      consoleTaming: 'unsafe',
      errorTaming: 'unsafe',
      mathTaming: 'unsafe',
      dateTaming: 'unsafe',
      overrideTaming: 'severe',
    });
  } catch (error) {
    // If the `lockdown` call throws an exception, it should not be able to continue
    console.error('Lockdown failed:', error);
    throw error;
  }
}
