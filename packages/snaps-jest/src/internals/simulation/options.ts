export type SimulationOptions = {
  secretRecoveryPhrase: string;
  locale: string;
};

// TODO: Use Superstruct to validate and coerce options.
export type SimulationUserOptions = Partial<SimulationOptions>;
