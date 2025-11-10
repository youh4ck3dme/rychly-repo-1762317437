import React, { useState, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../hooks/useNotification";
import FancyButton from "./common/FancyButton"; // Import FancyButton

const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const { login, signup, devLogin } = useAuth(); // Destructure devLogin
  const { addNotification } = useNotification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [isLoginView, setIsLoginView] = useState(true);

  // Real-time validation as the user types
  useEffect(() => {
    const newErrors: { email?: string; password?: string } = {};
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = t("login_validation_email");
    }
    if (password && password.length > 0 && password.length < 6) {
      newErrors.password = t("login_validation_password");
    }
    setErrors(newErrors);
  }, [email, password, t]);

  const handleAuthError = (error: any) => {
    let errorCode = "login_error_generic";
    if (error instanceof Error && "code" in error) {
      const code = (error as { code: string }).code;
      switch (code) {
        case "auth/invalid-credential":
          errorCode = "login_error_message";
          break;
        case "auth/email-already-in-use":
          errorCode = "login_error_email_in_use";
          break;
        case "auth/weak-password":
          errorCode = "login_error_weak_password";
          break;
        default:
          console.error("Firebase Auth Error:", error);
      }
    } else {
      console.error("Unknown Auth Error:", error);
    }

    addNotification({
      type: "error",
      title: t("login_error_title"),
      message: t(errorCode),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.keys(errors).length > 0 || !email || !password) {
      addNotification({
        type: "error",
        title: t("login_error_title"),
        message: t("login_validation_form_error"),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevLogin = async () => {
    setIsSubmitting(true);
    try {
      await devLogin();
      addNotification({
        type: "success",
        title: t("login_dev_welcome_title"),
        message: t("login_dev_welcome_message"),
        duration: 5000,
      });
    } catch (error) {
      console.error("Dev Login Error:", error);
      addNotification({
        type: "error",
        title: t("login_error_title"),
        message: t("api_unexpectedError"), // Use a generic error for now
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonText = isLoginView ? t("login_button") : t("login_signup_button");
  const toggleText = isLoginView
    ? t("login_switch_to_signup")
    : t("login_switch_to_login");

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="w-full max-w-md text-center">
        <h1
          className="text-5xl md:text-6xl font-serif text-black dark:text-white mb-10"
          style={{ textShadow: "0 2px 10px rgba(0 0 0 / 20%)" }}
        >
          {t("vto_title")}
        </h1>

        <div className="glass-panel p-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login_email_placeholder")}
                required
                className="form-input text-center"
                aria-label={t("login_email_placeholder")}
                aria-invalid={!!errors.email}
                aria-describedby="email-error"
              />
              {errors.email && (
                <p id="email-error" className="text-red-500 text-sm mt-2">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login_password_placeholder")}
                required
                className="form-input text-center"
                aria-label={t("login_password_placeholder")}
                aria-invalid={!!errors.password}
                aria-describedby="password-error"
              />
              {errors.password && (
                <p id="password-error" className="text-red-500 text-sm mt-2">
                  {errors.password}
                </p>
              )}
            </div>
            <FancyButton
              type="submit"
              className="w-full !py-3.5 text-base mt-4"
              disabled={
                isSubmitting ||
                Object.keys(errors).length > 0 ||
                !email ||
                !password
              }
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-t-transparent border-black rounded-full animate-spin mx-auto"></div>
              ) : (
                buttonText
              )}
            </FancyButton>
          </form>

          <button
            onClick={() => setIsLoginView(!isLoginView)}
            className="mt-6 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            {toggleText}
          </button>
          {/* Dev Login Button: Apply user's desired style and translation key */}
          <FancyButton
            onClick={handleDevLogin}
            disabled={isSubmitting}
            className="w-full !py-3.5 text-base mt-4 !bg-gray-700/80 dark:!bg-gray-600/90 hover:!bg-gray-700 dark:hover:!bg-gray-600 !text-white"
            aria-label={t("login_dev_button")}
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin mx-auto"></div>
            ) : (
              t("login_dev_button")
            )}
          </FancyButton>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
