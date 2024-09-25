export type Cryptocurrency = 'btc';

export type Rate = {
  conversionRate: string;
  conversionDate: number;
  usdConversionRate?: string;
};

export type GetRateParams = {
  cryptocurrency: Cryptocurrency;
};

export type GetRateResult = Rate | null;
