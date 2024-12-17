import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Copyable,
  Box,
  Container,
  Heading,
  Text,
  Footer,
  Button,
} from '@metamask/snaps-sdk/jsx';

export type ResultProps = {
  value: string;
};

/**
 * A result component.
 *
 * @param props - The props of the component.
 * @param props.value - The value to display.
 * @returns The result component.
 */
export const Result: SnapComponent<ResultProps> = ({ value }) => (
  <Container>
    <Box>
      <Heading>Custom Dialog</Heading>
      <Text>The form was submitted with the following value:</Text>
      <Copyable value={value} />
    </Box>
    <Footer>
      <Button name="ok">Ok</Button>
    </Footer>
  </Container>
);
