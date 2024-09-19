import { Button, Footer, type SnapComponent } from '@metamask/snaps-sdk/jsx';

/**
 * A component that shows the send flow footer.
 *
 * @returns The SendFlowFooter component.
 */
export const SendFlowFooter: SnapComponent = () => (
  <Footer>
    <Button name="review">Review</Button>
  </Footer>
);
