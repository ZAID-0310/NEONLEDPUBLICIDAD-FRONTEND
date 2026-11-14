"use client";

import { useEffect, useRef, useState } from "react";
import { User, Lock, ArrowLeft, AlertCircle, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/AutContext";
import { Turnstile } from "@marsidev/react-turnstile";
import PublicOnlyGuard from "@/app/dashboard/components/PublicOnlyGuard";

const LOCKOUT_STORAGE_KEY = "login_lockout_expiry";
const ATTEMPTS_STORAGE_KEY = "login_remaining_attempts";
const LOGIN_ATTEMPT_STORAGE_KEY = "login_attempt_state";

const normalizeEmail = (email) => email.trim().toLowerCase();

const saveLoginAttemptState = (state) => {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(LOGIN_ATTEMPT_STORAGE_KEY, JSON.stringify(state));
};

const readLoginAttemptState = () => {
  if (typeof window === "undefined") return null;

  try {
    const rawState = sessionStorage.getItem(LOGIN_ATTEMPT_STORAGE_KEY);
    return rawState ? JSON.parse(rawState) : null;
  } catch {
    sessionStorage.removeItem(LOGIN_ATTEMPT_STORAGE_KEY);
    return null;
  }
};

const clearLoginAttemptState = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(LOGIN_ATTEMPT_STORAGE_KEY);
};

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loadingForm, setLoadingForm] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState(null);
  const [errorType, setErrorType] = useState("credentials");
  const [darkMode, setDarkMode] = useState(true);
  const [showAttemptsPopup, setShowAttemptsPopup] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [lockPopup, setLockPopup] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });
  const [emailSuggestion, setEmailSuggestion] = useState("");
  const turnstileRef = useRef(null);
  const { login } = useAuth();

  // Recupera el último estado visual después de presionar F5.
  // La seguridad real continúa en la caché del backend.
  useEffect(() => {
    const savedState = readLoginAttemptState();

    if (!savedState || typeof savedState !== "object") return;

    const savedEmail =
      typeof savedState.email === "string" ? savedState.email : "";
    const savedRemainingAttempts = Number(savedState.remainingAttempts);
    const savedBlockedUntil = Number(savedState.blockedUntil);

    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
      }));
    }

    if (Number.isFinite(savedBlockedUntil) && savedBlockedUntil > Date.now()) {
      const secondsLeft = Math.max(
        1,
        Math.ceil((savedBlockedUntil - Date.now()) / 1000),
      );

      setBlockedUntil(savedBlockedUntil);
      setCooldownTime(secondsLeft);
      setRemainingAttempts(0);
      setLockPopup(true);
      setShowAttemptsPopup(true);
      setError(true);
      setErrorType("rate_limit");
      setErrorMessage(
        "Cuenta temporalmente bloqueada. Espera a que termine el contador.",
      );
      return;
    }

    if (
      Number.isInteger(savedRemainingAttempts) &&
      savedRemainingAttempts > 0 &&
      savedRemainingAttempts < 5
    ) {
      setRemainingAttempts(savedRemainingAttempts);
      setLockPopup(false);
      setShowAttemptsPopup(true);
      return;
    }

    clearLoginAttemptState();
  }, []);

  // El bloqueo se calcula con una fecha absoluta para que continúe tras F5
  // y no se reinicie si la pestaña queda en segundo plano.
  useEffect(() => {
    if (!blockedUntil) return undefined;

    const updateCooldown = () => {
      const secondsLeft = Math.max(
        0,
        Math.ceil((blockedUntil - Date.now()) / 1000),
      );

      setCooldownTime(secondsLeft);

      if (secondsLeft <= 0) {
        setBlockedUntil(null);
        setRemainingAttempts(null);
        setLockPopup(false);
        setShowAttemptsPopup(false);
        setError(false);
        setErrorMessage("");
        clearLoginAttemptState();
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);

    return () => clearInterval(interval);
  }, [blockedUntil]);

  const validateEmail = (value) => {
    const email = value.trim();

    if (!email) {
      return "El correo electrónico es obligatorio.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(email)) {
      return "Ingresa un correo electrónico válido.";
    }

    return "";
  };

  const detectEmailTypo = (value) => {
    const email = value.trim().toLowerCase();
    const parts = email.split("@");

    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return "";
    }

    const [username, domain] = parts;
    const commonDomainCorrections = {
      "gmail.co": "gmail.com",
      "gmai.com": "gmail.com",
      "gmial.com": "gmail.com",
      "gmail.con": "gmail.com",
      "gmail.om": "gmail.com",
      "hotmail.co": "hotmail.com",
      "hotmai.com": "hotmail.com",
      "hotmail.con": "hotmail.com",
      "outlook.co": "outlook.com",
      "outlok.com": "outlook.com",
      "outlook.con": "outlook.com",
    };

    const correctedDomain = commonDomainCorrections[domain];

    return correctedDomain ? `${username}@${correctedDomain}` : "";
  };

  const validateForm = () => {
    const errors = {
      email: validateEmail(formData.email),
      password: formData.password ? "" : "La contraseña es obligatoria.",
    };

    setFieldErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cooldownTime > 0) {
      setError(true);
      setErrorType("rate_limit");
      setErrorMessage(
        `Por favor, espera ${cooldownTime} segundos antes de intentar nuevamente.`,
      );
      return;
    }

    if (!validateForm()) {
      setError(false);
      setErrorMessage("");
      return;
    }

    setLoadingForm(true);
    setError(false);
    setErrorMessage("");
    setErrorType("credentials");

    if (!turnstileToken) {
      setError(true);
      setErrorType("captcha");
      setErrorMessage("Por favor completa la verificación de seguridad");
      setLoadingForm(false);
      return;
    }

    try {
      const result = await login({
        ...formData,
        turnstile_token: turnstileToken,
      });

      if (!result.success) {
        handleLoginError(result.status, result.message, result.data);
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      } else {
        clearLoginAttemptState();
        setRemainingAttempts(null);
        setBlockedUntil(null);
        setCooldownTime(0);
        setShowAttemptsPopup(false);
      }
    } catch (error) {
      setError(true);
      setErrorType("credentials");
      setErrorMessage("Error de conexión. Intenta nuevamente.");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleLoginError = (status, message, data) => {
    switch (status) {
      case 429: {
        const retryAfter = Math.max(
          1,
          Math.ceil(Number(data?.retry_after) || 5 * 60),
        );
        const lockExpiration = Date.now() + retryAfter * 1000;

        // Persistir la hora de expiración del bloqueo en localStorage
        try {
          const expiryTimestamp = Math.floor(Date.now() / 1000) + retryAfter;
          localStorage.setItem(LOCKOUT_STORAGE_KEY, String(expiryTimestamp));
          localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
        } catch (e) {
          // localStorage no disponible, ignorar
        }

        setError(true);
        setErrorType("rate_limit");
        setErrorMessage(
          message || "Cuenta temporalmente bloqueada durante 5 minutos.",
        );
        setBlockedUntil(lockExpiration);
        setCooldownTime(retryAfter);
        setRemainingAttempts(0);
        setLockPopup(true);
        setShowAttemptsPopup(true);

        saveLoginAttemptState({
          email: normalizeEmail(formData.email),
          remainingAttempts: 0,
          blockedUntil: lockExpiration,
        });
        break;
      }

      case 422: {
        const validationErrors = data?.errors || {};
        const emailValidation = validationErrors.email?.[0] || "";
        const passwordValidation = validationErrors.password?.[0] || "";
        const turnstileValidation = validationErrors.turnstile_token?.[0] || "";

        if (emailValidation || passwordValidation) {
          setError(false);
          setErrorMessage("");
          setFieldErrors({
            email: emailValidation,
            password: passwordValidation,
          });
        } else {
          setError(true);
          setErrorType("captcha");
          setErrorMessage(
            turnstileValidation ||
              message ||
              "Error de verificación de seguridad. Inténtalo nuevamente.",
          );
        }
        break;
      }

      case 401:
        setError(true);
        setErrorType("credentials");
        setErrorMessage(message || "Usuario o contraseña incorrectos");

        if (
          data &&
          typeof data.remaining_attempts === "number" &&
          data.remaining_attempts > 0
        ) {
          try {
            localStorage.setItem(ATTEMPTS_STORAGE_KEY, String(data.remaining_attempts));
          } catch(e) {}
          setRemainingAttempts(data.remaining_attempts);
          setLockPopup(false);
          setShowAttemptsPopup(true);

          saveLoginAttemptState({
            email: normalizeEmail(formData.email),
            remainingAttempts: data.remaining_attempts,
            blockedUntil: null,
          });
        }
        break;

      default:
        setError(true);
        setErrorType("credentials");
        setErrorMessage(
          message || "Error al iniciar sesión. Intenta nuevamente.",
        );
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [id]: "",
    }));

    if (id === "email") {
      setEmailSuggestion(detectEmailTypo(value));

      const savedState = readLoginAttemptState();
      const savedEmail =
        typeof savedState?.email === "string" ? savedState.email : "";

      // Evita mostrar los intentos de un correo cuando el usuario escribe otro.
      // Esto solo limpia la interfaz; el contador real del backend no se altera.
      if (
        savedEmail &&
        normalizeEmail(value) !== normalizeEmail(savedEmail) &&
        cooldownTime <= 0
      ) {
        clearLoginAttemptState();
        setRemainingAttempts(null);
        setShowAttemptsPopup(false);
        setLockPopup(false);
      }
    }

    if (errorType === "credentials") {
      setError(false);
      setErrorMessage("");
    }
  };

  const renderErrorMessage = () => {
    if (!error) return null;

    const config = {
      credentials: {
        container: darkMode
          ? "bg-red-500/10 border-red-500/30"
          : "bg-red-50 border-red-200",
        text: darkMode ? "text-red-200" : "text-red-700",
        icon: darkMode ? "text-red-300" : "text-red-500",
      },

      rate_limit: {
        container: darkMode
          ? "bg-orange-500/10 border-orange-500/30"
          : "bg-orange-50 border-orange-200",
        text: darkMode ? "text-orange-200" : "text-orange-700",
        icon: darkMode ? "text-orange-300" : "text-orange-500",
      },

      captcha: {
        container: darkMode
          ? "bg-yellow-500/10 border-yellow-500/30"
          : "bg-yellow-50 border-yellow-200",
        text: darkMode ? "text-yellow-200" : "text-yellow-700",
        icon: darkMode ? "text-yellow-300" : "text-yellow-500",
      },
    };

    const current = config[errorType];

    return (
      <div
        className={`
        mb-5
        rounded-xl
        border
        backdrop-blur-sm
        px-4
        py-3
        animate-in
        fade-in
        slide-in-from-top-1
        duration-300
        ${current.container}
      `}
      >
        <div className="flex items-start gap-3">
          <div
            className={`
            flex-shrink-0
            mt-0.5
            ${current.icon}
          `}
          >
            <AlertCircle className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p
              role="alert"
              aria-live="polite"
              className={`
                w-full
                text-[13px]
                sm:text-sm
                leading-5
                whitespace-normal
                break-words
                [overflow-wrap:anywhere]
                pr-1
                ${current.text}
              `}
            >
              {errorMessage}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PublicOnlyGuard>
      <>
      {/* <Header /> */}

      <div className={`min-h-screen w-full flex flex-col lg:flex-row  ${darkMode ? 'bg-[#07152d]': 'bg-blue-600'}`}>
        {/* PANEL IZQUIERDO */}
        <div
          className="w-full h-[55vh] min-h-[420px] lg:h-auto lg:w-1/2 relative flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage:
              "url('/login/fondo.web.Neon.Led.Publicidad (1).webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/55" />

          <div className="relative z-10 flex flex-col items-center text-center px-8 sm:px-12 max-w-2xl">
            <h1 className="text-3xl xl:text-4xl font-bold text-white mb-5">
              ¡Bienvenido!
            </h1>

            <p className="text-base xl:text-lg text-gray-200 leading-relaxed">
              Accede a tu cuenta para gestionar tus recursos y servicios
            </p>

            <img
              src="/login/login.Neon.Led.Publicidad.webp"
              alt="Login"
              className="w-full max-w-[220px] sm:max-w-[260px] xl:max-w-[300px] mt-8 lg:mt-10 animate-float"
            />
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="relative w-full lg:w-1/2 flex items-start lg:items-center justify-center px-6 py-8">
          {/* BOTÓN REGRESAR */}
          <div className="absolute top-5 left-5 z-30">
            <Link href="/">
              <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${darkMode ? 'bg-[#13233f] hover:bg-[#1c3157] text-white': 'bg-white text-black'}  shadow-lg`}>
                <ArrowLeft className="w-5 h-5" />
                Regresar
              </button>
            </Link>
          </div>

          {/* BOTÓN DARK MODE */}
          <div className="absolute top-6 right-6 z-20">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${darkMode ? 'bg-[#13233f] hover:bg-[#1c3157]': 'bg-white'} shadow-lg`}
            >
              {darkMode ? (
                <Moon className="w-5 h-5 text-white" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-600" />
              )}
            </button>
          </div>

          {/* FORMULARIO */}
          <div
            className={`w-full max-w-[380px] mt-10 lg:mt-0 rounded-2xl border p-5 md:p-6 shadow-2xl transition-all duration-300 ${
              darkMode
                ? "bg-[#13233f] border-[#22385f]"
                : "bg-white border-[#3d6ec5]"
            }`}
          >
            <div className="text-center mb-6">
              <div
                className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-6 ${
                  darkMode ? "bg-blue-500/20" : "bg-blue-600"
                }`}
              >
                <User
                  className={`w-7 h-7 ${
                    darkMode ? "text-blue-300" : "text-white"
                  }`}
                />
              </div>

              <h2
                className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}
              >
                Iniciar Sesión
              </h2>

              <p
                className={`mt-2 text-sm text-gray-400`}
              >
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {renderErrorMessage()}

            <form onSubmit={handleSubmit} className="space-y-7" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm mb-2 font-medium ${
                    darkMode ? "text-gray-300" : "text-black"
                  }`}
                >
                  Correo electrónico
                </label>

                <div className="relative">
                  <User className="absolute left-4 top-4 w-5 h-5 text-gray-400" />

                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => {
                      const emailError = validateEmail(formData.email);

                      setFieldErrors((prev) => ({
                        ...prev,
                        email: emailError,
                      }));

                      setEmailSuggestion(detectEmailTypo(formData.email));
                    }}
                    placeholder="nombre@correo.com"
                    autoComplete="email"
                    inputMode="email"
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={
                      fieldErrors.email
                        ? "email-error"
                        : emailSuggestion
                          ? "email-suggestion"
                          : undefined
                    }
                    className={`w-full h-11 pl-12 pr-4 rounded-md border transition-all focus:ring-2 outline-none ${
                      fieldErrors.email
                        ? "border-red-500 focus:ring-red-500"
                        : darkMode
                          ? "bg-[#0d1b33] border-[#31486d] text-white placeholder-gray-500 focus:ring-blue-500"
                          : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                    }`}
                    disabled={cooldownTime > 0}
                  />
                </div>

                {fieldErrors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className={`mt-2 text-sm text-red-400`}
                  >
                    {fieldErrors.email}
                  </p>
                )}

                {!fieldErrors.email && emailSuggestion && (
                  <p
                    id="email-suggestion"
                    className={`mt-2 text-sm ${darkMode ? 'text-yellow-300': 'text-red-400'}`}
                  >
                    ¿Quisiste decir{" "}
                    <button
                      type="button"
                      className="font-semibold underline hover:text-red-600"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          email: emailSuggestion,
                        }));
                        setEmailSuggestion("");
                        setFieldErrors((prev) => ({
                          ...prev,
                          email: "",
                        }));
                      }}
                    >
                      {emailSuggestion}
                    </button>
                    ?
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="password"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-black"
                    }`}
                  >
                    Contraseña
                  </label>

                  <Link
                    href="./email/"
                    className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-black hover:text-blue-600'} `}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />

                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => {
                      setFieldErrors((prev) => ({
                        ...prev,
                        password: formData.password
                          ? ""
                          : "La contraseña es obligatoria.",
                      }));
                    }}
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={
                      fieldErrors.password ? "password-error" : undefined
                    }
                    className={`w-full h-11 pl-12 pr-4 rounded-md border transition-all focus:ring-2 outline-none ${
                      fieldErrors.password
                        ? "border-red-500 focus:ring-red-500"
                        : darkMode
                          ? "bg-[#0d1b33] border-[#31486d] text-white placeholder-gray-500 focus:ring-blue-500"
                          : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                    }`}
                    disabled={cooldownTime > 0}
                  />
                </div>

                {fieldErrors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className={`mt-2 text-sm text-red-400`}
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="flex justify-center pt-2">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                  options={{
                    theme: `${darkMode ? 'dark' : 'light'}`
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loadingForm || cooldownTime > 0}
                className={`w-full h-11 text-base rounded-md font-semibold transition-all ${
                  loadingForm || cooldownTime > 0
                    ? "bg-gray-500 cursor-not-allowed"
                    : `${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white': 'bg-white hover:bg-blue-600 hover:text-white text-black border-2 border-solid border-blue-600'}`
                }`}
              >
                {loadingForm
                  ? "Iniciando sesión..."
                  : cooldownTime > 0
                    ? `Esperar ${Math.floor(cooldownTime / 60)}:${String(
                        cooldownTime % 60,
                      ).padStart(2, "0")}`
                    : "Iniciar sesión"}
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* POP-UP DE INTENTOS FALLIDOS / CUENTA BLOQUEADA */}
      {showAttemptsPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setShowAttemptsPopup(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#13233f] border border-[#22385f] shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7 text-orange-300" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              {lockPopup ? "Cuenta bloqueada" : "Intento fallido"}
            </h3>

            {lockPopup ? (
              <p className="text-sm text-gray-300 mb-6">
                Alcanzaste los 5 intentos permitidos. Podrás volver a intentar
                en{" "}
                <span className="font-bold text-orange-300">
                  {Math.floor(cooldownTime / 60)}:
                  {String(cooldownTime % 60).padStart(2, "0")}
                </span>
                .
              </p>
            ) : (
              <p className="text-sm text-gray-300 mb-6">
                Te quedan{" "}
                <span className="font-bold text-orange-300">
                  {remainingAttempts}
                </span>{" "}
                intento{remainingAttempts === 1 ? "" : "s"} restante
                {remainingAttempts === 1 ? "" : "s"}.
              </p>
            )}

            <button
              onClick={() => setShowAttemptsPopup(false)}
              className="w-full h-10 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* <Footer /> */}
    </>
    </PublicOnlyGuard>
  );
}
