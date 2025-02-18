import type { ReactNode } from 'react';
import { Component } from 'react';

type ErrorBoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = { hasError: false };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
    }
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}
