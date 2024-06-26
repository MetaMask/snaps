import { Box } from './Box';
import { Container } from './Container';
import { Footer } from './Footer';
import { Button } from './form';
import { Text } from './Text';

describe('Container', () => {
  it('renders a container element with a box', () => {
    const result = (
      <Container>
        <Box>
          <Text>Hello world!</Text>
        </Box>
      </Container>
    );

    expect(result).toStrictEqual({
      type: 'Container',
      key: null,
      props: {
        children: {
          type: 'Box',
          key: null,
          props: {
            children: {
              type: 'Text',
              key: null,
              props: {
                children: 'Hello world!',
              },
            },
          },
        },
      },
    });
  });

  it('renders a container element with a box and a footer', () => {
    const result = (
      <Container>
        <Box>
          <Text>Hello world!</Text>
        </Box>
        <Footer>
          <Button name="confirm">Confirm</Button>
        </Footer>
      </Container>
    );

    expect(result).toStrictEqual({
      type: 'Container',
      key: null,
      props: {
        children: [
          {
            type: 'Box',
            key: null,
            props: {
              children: {
                type: 'Text',
                key: null,
                props: {
                  children: 'Hello world!',
                },
              },
            },
          },
          {
            type: 'Footer',
            key: null,
            props: {
              children: {
                type: 'Button',
                key: null,
                props: {
                  name: 'confirm',
                  children: 'Confirm',
                },
              },
            },
          },
        ],
      },
    });
  });
});
