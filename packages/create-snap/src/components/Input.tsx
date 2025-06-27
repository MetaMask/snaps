import { useFocus, useFocusManager } from 'ink';
import type { Props as TextInputProps } from 'ink-text-input';
import TextInput from 'ink-text-input';
import type { FunctionComponent } from 'react';
import { useState, useEffect } from 'react';

export type InputProps = TextInputProps & {
  autoFocus?: boolean;

  onBlur?: () => void;
  onSubmit?: () => void;
};

export const Input: FunctionComponent<InputProps> = ({
  autoFocus,
  onBlur,
  onSubmit,
  ...props
}) => {
  const { focusNext } = useFocusManager();
  const { isFocused } = useFocus({ autoFocus });
  const [isTouched, setTouched] = useState(false);

  useEffect(() => {
    if (isFocused && !isTouched) {
      setTouched(true);
    }

    !isFocused && isTouched && onBlur?.();
  }, [isFocused]);

  const handleSubmit = () => {
    if (onSubmit) {
      return onSubmit();
    }

    return focusNext();
  };

  return <TextInput {...props} focus={isFocused} onSubmit={handleSubmit} />;
};
