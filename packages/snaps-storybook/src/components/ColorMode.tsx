import { useColorMode } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';
import { useEffect } from 'react';

/**
 * The props for the {@link ColorMode} component.
 */
export type ColorModeProps = {
  /**
   * The color mode to set.
   */
  colorMode: 'light' | 'dark';
};

/**
 * A component to set the color mode of the application. This is used by the
 * toolbar button to toggle the color mode.
 *
 * @param props - The props of the component.
 * @param props.colorMode - The color mode to set.
 * @returns A component to set the color mode.
 */
export const ColorMode: FunctionComponent<ColorModeProps> = ({ colorMode }) => {
  const { setColorMode } = useColorMode();

  useEffect(() => {
    setColorMode(colorMode);
  }, [colorMode, setColorMode]);

  return null;
};
