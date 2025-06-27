import { validate } from '@metamask/superstruct';
import type { Struct, ObjectType } from '@metamask/superstruct';
import { useState } from 'react';

import type { InputProps } from '../components';

export type Form<Type> = {
  values: Type;
  errors: Partial<Record<keyof Type, string>>;
  register: (name: keyof Type) => InputProps;
  submit: (onSuccess: (validatedValues: Type) => void) => void;
};

/**
 *
 * @param schema
 * @param initialValues
 */
export function useForm<Type>(
  schema: Struct<Type, ObjectType<Type>>,
  initialValues: Partial<Type> = {},
): Form<Type> {
  const [values, setValues] = useState<Partial<Type>>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof Type, string>>>({});

  const register = (name: keyof Type): InputProps => {
    return {
      value: values[name] ?? '',
      onBlur: () => {
        const fieldSchema = schema.schema[name];
        const [error] = validate(values[name], fieldSchema);

        if (error) {
          const { message } = error;
          setErrors((previousErrors) => ({
            ...previousErrors,
            [name]: message,
          }));
        } else {
          setErrors((previousErrors) => {
            const { [name]: _, ...rest } = previousErrors;
            return rest as Partial<Record<keyof Type, string>>;
          });
        }
      },

      onChange: (value: string) => {
        setValues((previousValues) => ({
          ...previousValues,
          [name]: value,
        }));
      },
    };
  };

  const submit = (onSuccess: (values: Type) => void) => {
    const [error, validatedValues] = validate(values, schema);
    if (error) {
      const validationErrors = error.failures().reduce((target, failure) => {
        const key = failure.path.join('.') as keyof Type;
        const { message } = failure;

        return {
          ...target,
          [key]: message,
        };
      }, {});

      setErrors(validationErrors);
      return;
    }

    onSuccess(validatedValues);
  };

  return {
    values: values as Type,
    errors,
    register,
    submit,
  };
}
