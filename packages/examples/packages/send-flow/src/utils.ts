import type { Context } from '.';

export type SendFormState = {
  to: string;
  amount: string;
  accountSelector: string;
};

export type SendFormErrors = {
  to?: string;
  amount?: string;
};

export const formValidation = (
  formState: SendFormState,
  context: Context,
): SendFormErrors => {
  const errors: Partial<SendFormErrors> = {};

  if (formState.to === 'invalid address') {
    errors.to = 'Invalid address';
  }

  if (!formState.amount) {
    errors.amount = 'Required';
  } else if (
    Number(formState.amount) >
    context.accounts[formState.accountSelector].balance
  ) {
    errors.amount = 'Insufficient funds';
  }

  return errors;
};
