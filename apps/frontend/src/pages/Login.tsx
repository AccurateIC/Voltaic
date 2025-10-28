import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { FaGithub, FaGoogle } from "react-icons/fa6";
import { LiaConnectdevelop } from "react-icons/lia";
import { User } from "../types/auth.types";
import { SessionStore } from "../lib/SessionStore";
import { tuyau } from "../lib/Tuyau";
import DotMatrixBackground from "../components/DotMatrixBackground";
import { motion, AnimatePresence } from "motion/react";

const InputField = ({ label, type, placeholder, value, onChange }) => (
  <motion.div
    className="form-control w-full"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    <label className="label">
      <span className="label-text text-base-content">{label}</span>
    </label>                
    <motion.input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="input w-full text-base-content placeholder:text-base-content/50 focus:outline-none transition-all duration-200"
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
  </motion.div>
);

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roleId, setRoleId] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const { data, error } = await tuyau.auth.getLoggedInUser.$get();

        if (error) {
          console.error("Error checking authentication:", error);
          return;
        }

        if (data) {
          setIsAuthenticated(true);
          toast.success("User is already authenticated!");
          navigate("/engine");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        toast.error("Error checking authentication status.");
      }
    };

    checkAuthentication();
  }, [navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();

    // fetch id of role where roleName is 'user'
    const { data: roleData, error: roleError } = await tuyau.role.getAll.$get();
    if (roleError) {
      console.error("error fetching roles", roleError);
      toast.error("Failed to sign up.");
      return;
    }

    const userRole = roleData.find((role) => role.roleName === "user");
    if (!userRole) {
      console.error("user role not found", roleError);
      toast.error("Failed to sign up.");
      return;
    }
    const roleIdForUserRole = userRole.id;

    const userData = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      roleId: roleIdForUserRole,
      isActive: true,
    };

    try {
      let user: User;

      if (isSignUp) {
        const { data, error } = await tuyau.auth.register.$post(userData);
        if (error) {
          throw new Error(`Registration failed: ${error.status}`);
        }
        user = data; // TODO: type the API better so that we get correct type of User in frontend
      } else {
        const { data, error } = await tuyau.auth.login.$post({ email: userData.email, password: userData.password });
        if (error) {
          throw new Error(`Login failed: ${error.status}`);
        }
        user = data;
      }

      sessionStorage.setItem("user", JSON.stringify(user));
      // SessionStore.set("user", user);

      console.log(isSignUp ? "User registered:" : "User logged in:", user);
      toast.success(isSignUp ? "Account created successfully!" : "Logged in successfully!");

      // ##################################################################

      // TEMPORARY: delete data from archive and notification table on login
      // const delResponse = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/archive/deleteAll`, {
      //   method: "DELETE",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   credentials: "include",
      // });
      //
      // if (!response.ok) {
      //   throw new Error(`Failed to reset archive table`);
      // }
      //
      // toast.success("Data Reset");

      // TEMPORARY: send request to ML models to notify which user has logged in

      // ##################################################################

      navigate("/engine");

      // sendLoggedInUser(user, Modules.ANOMALY).then((res) => {
      //   if (res.error) toast.error("Failed to send user details to Anomaly Server.");
      // });
      // sendLoggedInUser(user, Modules.RUL).then((res) => {
      //   if (res.error) toast.error("Failed to send user details to RUL Server.");
      // });
      // sendLoggedInUser(user, Modules.PDM).then((res) => {
      //   if (res.error) toast.error("Failed to send user details to PDM Server.");
      // });
    } catch (error) {
      console.error(isSignUp ? "Error creating account:" : "Error logging in:", error);
      // toast.error(error.message || "An error occurred");
    }
  };

  const handleGithubSignIn = () => {
    window.location.assign(tuyau.auth.github.redirect.$url());
  };

  const handleGoogleSignIn = () => {
    window.location.assign(tuyau.auth.google.redirect.$url());
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
              <span className="text-3xl">NeuroGen</span>
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
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <InputField
                      label="Last Name"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <InputField
                label="Email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <InputField
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Submit Button */}
              <motion.button
                type="submit"
                className="btn w-full mt-6 text-base-content font-medium bg-base-300 hover:bg-base-200 border border-base-content/10"
                style={{ backdropFilter: "blur(10px)", boxShadow: "var(--btn-shadow, 0 4px 16px rgba(0, 0, 0, 0.1))" }}
                whileHover={{ scale: 1.01, y: -1, "--btn-shadow": "0 6px 20px rgba(0, 0, 0, 0.15)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {isSignUp ? "Sign Up" : "Sign In"}
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
                className="btn w-full text-base-content font-medium bg-base-300 hover:bg-base-200 border border-base-content/10"
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
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-base-content/90 hover:text-base-content font-medium underline-offset-4 hover:underline transition-all duration-200"
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
