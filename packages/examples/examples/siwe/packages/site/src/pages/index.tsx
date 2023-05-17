import { useContext } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  connectSnap,
  getSnap,
  makeAuthenticatedRequest,
  shouldDisplayReconnectButton,
  signInWithEthereum,
  signOut,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  Card,
  Button,
} from '../components';
import { useIsSignedIn } from '../hooks/useIsSignedIn';
import { useSnapRequest } from '../hooks/useSnapRequest';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);

  const { isSignedIn, refreshIsSignedIn } = useIsSignedIn();

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const signInHandler = async () => {
    try {
      await signInWithEthereum();
      refreshIsSignedIn();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const signOutHandler = async () => {
    await signOut();
    refreshIsSignedIn();
  };

  const {
    result: requestResult,
    error: requestError,
    isLoading: isLoadingResult,
    makeRequest: makeSnapRequest,
  } = useSnapRequest();

  return (
    <Container>
      <Heading>
        Welcome to <Span>siwe-snap</Span>
      </Heading>
      <Subtitle>
        Get started by editing <code>src/index.ts</code>
      </Subtitle>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the SIWE snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}
        <Card
          content={{
            title: 'Sign-in with Ethereum',
            description:
              'Sign-in with Ethereum to a mock API. This will retrieve a mock API key, and send it to the snap for safekeeping.',
            button: (
              <Button onClick={signInHandler} disabled={!state.installedSnap}>
                Sign-in
              </Button>
            ),
          }}
          disabled={!state.installedSnap}
        />
        <Card
          content={{
            title: 'Sign-out',
            description: 'Remove the API key stored in the snap secure storage',
            button: (
              <Button onClick={signOutHandler} disabled={!state.installedSnap}>
                Sign-out
              </Button>
            ),
          }}
          disabled={!state.installedSnap}
        />
        <Card
          disabled={!state.installedSnap}
          content={{
            title: 'Signed in?',
            description: isSignedIn ? 'YES' : 'NO',
            button: (
              <Button
                onClick={refreshIsSignedIn}
                disabled={!state.installedSnap}
              >
                Refresh
              </Button>
            ),
          }}
        />
        <Card
          disabled={!state.installedSnap}
          fullWidth
          content={{
            title: 'Make authenticated request from snap',
            description: (
              <>
                <p>Try to make an authenticated request from the Snap</p>
                <p>Error: {requestError}</p>
                <p>Result: {requestResult}</p>
              </>
            ),
            button: (
              <Button
                onClick={makeSnapRequest}
                disabled={!state.installedSnap || isLoadingResult}
              >
                Make request
              </Button>
            ),
          }}
        />
        <Notice>
          <p>
            Please note that the <b>snap.manifest.json</b> and{' '}
            <b>package.json</b> must be located in the server root directory and
            the bundle must be hosted at the location specified by the location
            field.
          </p>
        </Notice>
      </CardContainer>
    </Container>
  );
};

export default Index;
