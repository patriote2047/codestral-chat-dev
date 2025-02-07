import React from 'react';
import * as Sentry from '@sentry/nextjs';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        if (process.env.NODE_ENV === 'production') {
            Sentry.withScope((scope) => {
                scope.setExtras(errorInfo);
                Sentry.captureException(error);
            });
        }
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ? (
                this.props.fallback(this.state.error)
            ) : (
                <div className="error-boundary">
                    <h2>Une erreur est survenue</h2>
                    {process.env.NODE_ENV === 'development' && (
                        <pre>{this.state.error.toString()}</pre>
                    )}
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                    >
                        Réessayer
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export const withErrorBoundary = (WrappedComponent, fallback) => {
    return function WithErrorBoundary(props) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
};
