import React, { lazy, Suspense, useState, useEffect } from "react";

// Import providers and necessary components
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { NotificationContainer } from "./components/NotificationContainer";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Spinner from "./components/Spinner";
import { getShareSession } from "./services/sharingService";
import { useNotification } from "./hooks/useNotification";
import { useTranslation } from "./hooks/useTranslation";

// Lazy load screen components for better performance
const LoginScreen = lazy(() => import("./components/LoginScreen"));
const VirtualTryOn = lazy(() => import("./components/VirtualTryOn"));

const AppContent: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { addNotification } = useNotification();
  const { t } = useTranslation();
  const [sharedImage, setSharedImage] = useState<string | null>(null);
  const [isSharedSession, setIsSharedSession] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session");

    if (sessionId) {
      setIsSharedSession(true);
      getShareSession(sessionId).then((imageUrl) => {
        if (imageUrl) {
          setSharedImage(imageUrl);
        } else {
          addNotification({
            type: "error",
            title: t("vto_error_title"),
            message: "Zdieľaná relácia sa nenašla alebo vypršala.",
          });
          // Clear the session parameter from URL to avoid re-fetching on refresh
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }
        setSessionLoading(false);
      });
    } else {
      setSessionLoading(false);
    }
  }, [addNotification, t]);

  if (authLoading || sessionLoading) {
    return <Spinner />;
  }

  // If it's a shared session, show VTO with the shared image.
  if (isSharedSession) {
    return (
      <div className="min-h-screen text-gray-800 bg-white dark:bg-black dark:text-gray-200">
        <Suspense fallback={<Spinner />}>
          {sharedImage ? (
            <VirtualTryOn sharedImage={sharedImage} />
          ) : (
            <LoginScreen />
          )}
          <NotificationContainer />
        </Suspense>
      </div>
    );
  }

  // Skip authentication and go directly to VirtualTryOn
  return (
    <div className="min-h-screen text-gray-800 bg-white dark:bg-black dark:text-gray-200">
      <Suspense fallback={<Spinner />}>
        <VirtualTryOn />
        <NotificationContainer />
      </Suspense>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
