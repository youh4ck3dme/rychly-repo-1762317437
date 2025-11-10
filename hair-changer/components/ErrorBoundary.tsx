

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-5xl font-serif mb-4">Oops! Niečo sa pokazilo.</h1>
          <p className="text-lg text-gray-400 mb-8">Vyskytla sa neočakávaná chyba. Skúste prosím obnoviť stránku.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Obnoviť Stránku
          </button>
        </div>
      );
    }

    // FIX: Explicitly cast `this` to `React.Component<Props, State>`
    // This addresses a potential type inference issue where 'this.props'
    // might not be recognized on the 'ErrorBoundary' type itself in certain environments,
    // despite correctly extending 'React.Component'.
    return (this as React.Component<Props, State>).props.children;
  }
}

export default ErrorBoundary;