import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { FaGoogle } from "react-icons/fa6";
import { LiaConnectdevelop } from "react-icons/lia";
import { Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "../types/auth.types";
import { tuyau } from "../lib/Tuyau";
import { loggedInUserQueryFn, loggedInUserQueryKey } from "../hooks/useLoggedInUserQuery";
import { rolesQueryFn, rolesQueryKey } from "../hooks/useRolesQuery";
import DotMatrixBackground from "../components/DotMatrixBackground";
import { motion, AnimatePresence } from "motion/react";
function withTimeout<T>(promise: Promise<T>, ms = 15000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      (timer = setTimeout(() => reject(new Error("Request timed out")), ms))
    ),
  ]).finally(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });
}
interface InputFieldProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  autoComplete?: string;
}

const InputField = ({ label, type, placeholder, value, onChange, autoComplete }: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <motion.div
      className="form-control w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <label className="label">
        <span className="label-text text-base-content">{label}</span>
      </label>
      <div className="relative">
        <motion.input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="input w-full text-base-content placeholder:text-base-content/50 focus:outline-none transition-all duration-200 pr-10"
          style={{
            background: "var(--input-bg, rgba(140, 140, 140, 0.05))",
            border: "1px solid var(--input-border, rgba(140, 140, 140, 0.15))",
            backdropFilter: "blur(10px)",
            boxShadow: "var(--input-shadow, none)",
          }}
          whileFocus={{
            scale: 1.02,
            "--input-bg": "rgba(140, 140, 140, 0.1)",
            "--input-border": "rgba(65, 105, 225, 0.3)",
            "--input-shadow": "0 0 0 2px rgba(65, 105, 225, 0.1)",
          }}
          transition={{ duration: 0.2 }}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors z-20 pointer-events-auto"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </motion.div>
  );
};

const Login = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
const isSubmitting = useRef(false);
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    queryClient
      .fetchQuery({
        queryKey: loggedInUserQueryKey,
        queryFn: loggedInUserQueryFn,
      })
      .then((data) => {
        if (data) {
          toast.success("User is already authenticated!");
          navigate("/engine");
        }
      })
      .catch(() => {
        // session invalid or offline — stay on login
      });
  }, [navigate, queryClient]);

const handleAuth = async (e: React.FormEvent) => {
  e.preventDefault();

 if (isLoading || isSubmitting.current) return;
isSubmitting.current = true;
setIsLoading(true);

  try {
    let roleIdForUserRole: string | undefined;

    if (isSignUp) {
      let roleData;
      try {
        roleData = await queryClient.fetchQuery({
          queryKey: rolesQueryKey,
          queryFn: rolesQueryFn,
        });
      } catch {
        toast.error("Failed to create account.");
        return;
      }

      const userRole = roleData.find((role) => role.roleName === "user");
      if (!userRole) {
        toast.error("Failed to create account.");
        return;
      }

      roleIdForUserRole = userRole.id;
    }

    const userData = {
      email,
      password,
      firstName,
      lastName,
      roleId: roleIdForUserRole,
      isActive: true,
    };

    let user: User;

    if (isSignUp) {
      const { data, error } = await tuyau.auth.register.$post(userData);
      if (error) {
        throw new Error(`Registration failed: ${error.status}`);
      }
      user = data as unknown as User;
    } else {
     const { data, error } = await withTimeout(
  tuyau.auth.login.$post({
    email: userData.email,
    password: userData.password,
  })
);
      if (error) {
        throw new Error(`Login failed: ${error.status}`);
      }
      user = data as unknown as User;
    }

    localStorage.setItem("user", JSON.stringify(user));

    toast.success(isSignUp ? "Account created successfully!" : "Logged in successfully!");

    navigate("/engine");

    const notifyPayload = { ...user, logged_in: true };

    fetch(`http://localhost:3333/ml/notify-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notifyPayload),
    }).then(r => {
      if (!r.ok) console.error("Failed to notify ML servers");
    }).catch(e => {
      console.error("ML notification error:", e?.message);
    });

  } catch {
    toast.error(isSignUp ? "Failed to create account." : "Failed to log in.");
    setIsLoading(false);
    isSubmitting.current = false;
  }
};

 const handleGoogleSignIn = () => {
  if (isLoading) return;
  globalThis.location.assign(tuyau.auth.google.redirect.$url());
};

  return (
    <div className="min-h-screen w-full relative bg-base-300">
      {/* Full-screen dot matrix background */}
      <DotMatrixBackground />

      {/* Content overlay */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        {/* Centered Login Form */}
        <motion.div
          className="card w-full max-w-md bg-base-200/30 backdrop-blur-md shadow-lg border border-base-content/10"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            background: "rgba(26, 26, 26, 0.15)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(140, 140, 140, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          }}
        >
          <div className="card-body gap-4">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2 justify-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }}>
                <LiaConnectdevelop size={56} />
              </motion.div>
              <span className="text-3xl">Neurogen</span>
            </motion.div>

            {/* Title */}
            <motion.h2
              className="card-title text-2xl text-base-content font-bold text-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {isSignUp ? "Create Account" : "Welcome Back"}
            </motion.h2>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    key="signup-fields"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <InputField
                      label="First Name"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName((e.target as HTMLInputElement).value)}
                      autoComplete="given-name"
                    />
                    <InputField
                      label="Last Name"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName((e.target as HTMLInputElement).value)}
                      autoComplete="family-name"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <InputField
                label="Email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                autoComplete="email"
              />

              <InputField
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="btn w-full mt-6 text-base-content font-medium bg-base-300 hover:bg-base-200 border border-base-content/10 flex items-center justify-center gap-2"
                style={{ backdropFilter: "blur(10px)", boxShadow: "var(--btn-shadow, 0 4px 16px rgba(0, 0, 0, 0.1))" }}
                whileHover={{ scale: 1.01, y: -1, "--btn-shadow": "0 6px 20px rgba(0, 0, 0, 0.15)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
              {isLoading ? (
  <span className="flex items-center gap-2">
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
    {isSignUp ? "Creating account..." : "Signing in..."}
  </span>
) : (isSignUp ? "Sign Up" : "Sign In")}
              </motion.button>
            </form>

            {/* Switch between SignUp and SignIn */}
            <div className="divider text-base-content/60 opacity-50">OR</div>

            {/* Social Login */}
            <div className="flex flex-col gap-3">
              {/*
              <button
                onClick={handleGithubSignIn}
                className="btn btn-neutral hover:bg-black/90 gap-2 transition-all duration-300">
                <FaGithub className="h-5 w-5" />
                Continue with GitHub
              </button>
              */}

              <motion.button
  onClick={handleGoogleSignIn}
  disabled={isLoading}
  className="btn w-full text-base-content font-medium bg-base-300 hover:bg-base-200 border border-base-content/10 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backdropFilter: "blur(10px)",
                  boxShadow: "var(--google-shadow, 0 4px 16px rgba(0, 0, 0, 0.1))",
                }}
                whileHover={{ scale: 1.01, "--google-shadow": "0 6px 20px rgba(0, 0, 0, 0.15)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-row gap-2 items-center justify-center">
                  <FaGoogle size={22} />
                  <span>Login with Google</span>
                </div>
              </motion.button>
            </div>

            {/* Account Switch Link */}
            <div className="text-center mt-4">
              <motion.button
  onClick={() => !isLoading && setIsSignUp(!isSignUp)}
  disabled={isLoading}
  className="text-base-content/90 hover:text-base-content font-medium underline-offset-4 hover:underline transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)" }}
                whileHover={{}}
                whileTap={{}}
                transition={{ duration: 0.2 }}
              >
                {isSignUp ? "Already have an account? Sign In" : "New here? Create Account"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
