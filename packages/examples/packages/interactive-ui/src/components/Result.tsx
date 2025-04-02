import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Heading,
  Button,
  Box,
  Text,
  Copyable,
  Container,
  Footer,
} from '@metamask/snaps-sdk/jsx';

import type { InteractiveFormState } from './InteractiveForm';

type ResultProps = {
  values: InteractiveFormState;
};

export const Result: SnapComponent<ResultProps> = ({ values }) => {
  return (
    <Container>
      <Box>
        <Heading>Interactive UI Example Snap</Heading>
        <Text>You submitted the following values:</Text>
        <Box>
          {Object.values(values).map((value) => (
            <Copyable value={value?.toString() ?? ''} />
          ))}
        </Box>
      </Box>
      <Footer>
        <Button name="back">Back</Button>
        <Button name="ok">OK</Button>
      </Footer>
    </Container>
  );
};
