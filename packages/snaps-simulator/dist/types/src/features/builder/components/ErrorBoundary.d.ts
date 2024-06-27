import React from 'react';
declare type ErrorBoundaryProps = {
    fallback: React.ReactNode;
    children: React.ReactNode;
};
declare type ErrorBoundaryState = {
    hasError: boolean;
};
export declare class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    componentDidUpdate(prevProps: ErrorBoundaryProps): void;
    static getDerivedStateFromError(): {
        hasError: boolean;
    };
    render(): React.ReactNode;
}
export {};
