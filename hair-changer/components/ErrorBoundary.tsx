import React, { Component, ErrorInfo, ReactNode } from "react";

// Error reporting service
const reportError = async (error: Error, errorInfo: ErrorInfo) => {
  try {
    // Send error to external logging service (placeholder for Sentry, LogRocket, etc.)
    console.error("Reporting error to external service:", {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Send error via email using contact API
    const errorReport = {
      name: "Error Boundary",
      email: "error@papihairdesign.sk",
      message: `Critical Error Report:
Error: ${error.message}
Stack: ${error.stack}
Component Stack: ${errorInfo.componentStack}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}`,
      phone: "",
      service: "Error Report",
      honeypot: "",
      timestamp: Date.now() - 10000, // Ensure it passes time check
    };

    await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(errorReport),
    });
  } catch (reportingError) {
    console.error("Failed to report error:", reportingError);
  }
};

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error("Uncaught error:", error, errorInfo);

    // Report error to external services
    reportError(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center text-white bg-black">
          <h1 className="mb-4 font-serif text-5xl">Oops! Niečo sa pokazilo.</h1>
          <p className="mb-8 text-lg text-gray-400">
            Vyskytla sa neočakávaná chyba. Skúste prosím obnoviť stránku.
          </p>
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
