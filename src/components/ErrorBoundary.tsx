import React, { Component, ErrorInfo, ReactNode } from "react";
import { LanguageContext } from "../lib/i18n.tsx";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      const t = this.context?.t || ((key: string) => {
          const fallbackLangSK: Record<string, string> = {
            'errorBoundary.title': 'Niečo sa pokazilo',
            'errorBoundary.message': 'Došlo k neočakávanej chybe. Skús aplikáciu obnoviť.',
            'errorBoundary.button': 'Obnoviť aplikáciu',
            'errorBoundary.details': 'Detaily chyby (dev mode)'
          };
          return fallbackLangSK[key] || key;
      });
      
      const message = this.state.error?.message || t('errorBoundary.message');

      return (
        <div className="w-full h-screen bg-black text-white flex flex-col items-center justify-center text-center p-4">
          <div className="text-[#FFD700] mb-4">
            <h1 className="text-2xl font-bold">{t('errorBoundary.title')}</h1>
            <p className="mt-2 text-gray-400">
              {message}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left max-w-md mx-auto bg-gray-800 p-2 rounded">
                <summary className="cursor-pointer text-[#FFD700]">{t('errorBoundary.details')}</summary>
                <pre className="text-xs mt-2 text-gray-300 overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="mt-6 bg-[#FFD700] text-black font-bold py-2 px-6 rounded-md hover:bg-yellow-400 transition-colors"
            >
              {t('errorBoundary.button')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;