import type { ReactNode } from 'react';
import { PureComponent } from 'react';

/**
 * The props of the {@link ErrorBoundary} component.
 */
export type ErrorBoundaryProps = {
  /**
   * The children to render.
   */
  children: ReactNode;

  /**
   * A function that displays the main view.
   */
  showMain: () => void;

  /**
   * A function that displays an exception.
   */
  showException: (error: Error) => void;
};

/**
 * The state of the {@link ErrorBoundary} component.
 */
export type ErrorBoundaryState = {
  /**
   * Whether an error has occurred.
   */
  hasError: boolean;
};

/**
 * An error boundary component, which catches errors in its children and
 * displays an error message.
 *
 * @param props - The props of the component.
 * @param props.children - The children to render.
 * @param props.showMain - A function that displays the main view.
 * @param props.showException - A function that displays an exception.
 */
export class ErrorBoundary extends PureComponent<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidMount() {
    if (!this.state.hasError) {
      this.props.showMain();
    }
  }

  componentDidCatch(error: Error): void {
    this.props.showException(error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
