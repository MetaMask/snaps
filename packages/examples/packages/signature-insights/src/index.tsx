import type { OnSignatureHandler } from '@metamask/snaps-sdk';
import { SeverityLevel } from '@metamask/snaps-sdk';
import { Box, Heading, Row, Text } from '@metamask/snaps-sdk/jsx';

/**
 * The MetaMask test dapp uses the below contract address as the verifying
 * contract for `eth_signTypedData_v3` and `eth_signTypedData_v4`, it is being
 * used here as a flag to return content and to make e2e testing easier in the extension.
 */
const MALICIOUS_CONTRACT = '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC';

/**
 * Handle incoming signature requests, sent through one of the following methods:
 * `personal_sign`, `eth_signTypedData`, `eth_signTypedData_v3`, `eth_signTypedData_v4`.
 *
 * The `onSignature` handler is different from the `onRpcRequest` handler in
 * that it is called by MetaMask when a signature request is initiated, rather than
 * when a dapp sends a JSON-RPC request. The handler is called before the
 * signature is made, so it can be used to display information about the
 * signature request to the user before they sign.
 *
 * The `onSignature` handler returns a Snaps UI component, which is displayed
 * in the signature insights panel.
 *
 * @param args - The request parameters.
 * @param args.signature - The signature object. This contains the
 * transaction parameters, such as the `from` and `data` fields.
 * @returns The signature insights.
 */
export const onSignature: OnSignatureHandler = async ({ signature }) => {
  const { signatureMethod, from, data } = signature;
  let domain;
  if (
    signatureMethod === 'eth_signTypedData_v3' ||
    signatureMethod === 'eth_signTypedData_v4'
  ) {
    domain = data.domain;
  }

  const getSignedTypedDataRows = (typeData: Record<string, any>[]) => {
    const typeCount = typeData.reduce(
      (acc: Record<string, number>, currVal: Record<string, string>) => {
        if (acc[currVal.type]) {
          acc[currVal.type] += 1;
        } else {
          acc[currVal.type] = 1;
        }
        return acc;
      },
      {},
    );
    return Object.entries(typeCount).map(([type, count]) => (
      <Row label={type}>
        <Text>{`${count}`}</Text>
      </Row>
    ));
  };

  switch (signatureMethod) {
    case 'personal_sign':
      return {
        content: (
          <Box>
            <Row label="From:">
              <Text>{from}</Text>
            </Row>
            <Row label="Data:">
              <Text>{data}</Text>
            </Row>
          </Box>
        ),
        severity: SeverityLevel.Critical,
      };

    case 'eth_signTypedData':
      // Show a count of the different types.
      return {
        content: (
          <Box>
            <Heading>Message type count</Heading>
            {getSignedTypedDataRows(data)}
          </Box>
        ),
        severity: SeverityLevel.Critical,
      };

    case 'eth_signTypedData_v3':
      if (domain.verifyingContract === MALICIOUS_CONTRACT) {
        return {
          content: (
            <Box>
              <Heading>Danger!</Heading>
              <Text>
                {domain.verifyingContract} has been identified as a malicious
                verifying contract.
              </Text>
            </Box>
          ),
          severity: SeverityLevel.Critical,
        };
      }
      return null;

    case 'eth_signTypedData_v4':
      if (domain.verifyingContract === MALICIOUS_CONTRACT) {
        return {
          content: (
            <Box>
              <Heading>Danger!</Heading>
              <Text>
                {domain.verifyingContract} has been identified as a malicious
                verifying contract.
              </Text>
            </Box>
          ),
          severity: SeverityLevel.Critical,
        };
      }
      return null;

    default:
      return null;
  }
};
