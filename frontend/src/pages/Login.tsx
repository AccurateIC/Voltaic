import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import BackImage from "../assets/back.svg";
import { FaGithub, FaGoogle } from "react-icons/fa6";
import { LiaConnectdevelop } from "react-icons/lia";
import { User } from "../types/auth.types";
import { Result, ExternalServerError, catchErrTyped } from "../lib/Err";
import { Modules } from "../config/extern";
import { ROUTES } from "../config/backend";
import { SessionStore } from "../lib/SessionStore";

const InputField = ({ label, type, placeholder, value, onChange }) => (
  <div className="form-control w-full">
    <label className="label">
      <span className="label-text text-base-content">{label}</span>
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm text-base-content"
    />
  </div>
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
        const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/auth/getLoggedInUser`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();

          if (data) {
            setIsAuthenticated(true);
            toast.success("User is already authenticated!");
            navigate("/engine");
          }
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

    const userData = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      roleId: roleId,
      isActive: true,
    };

    try {
      const url = isSignUp
        ? `${import.meta.env.VITE_ADONIS_BACKEND}/auth/register`
        : `${import.meta.env.VITE_ADONIS_BACKEND}/auth/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const user: User = (await response.json()) as User;
      sessionStorage.setItem("user", JSON.stringify(user));
      // SessionStore.set("user", user);

      console.log(isSignUp ? "User registered:" : "User logged in:", response);
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
    window.location.assign("http://localhost:3333/auth/github/redirect");
  };

  const handleGoogleSignIn = () => {
    window.location.assign("http://localhost:3333/auth/google/redirect");
  };

  return (
    <div className="min-h-screen w-full flex relative bg-base-300">
      {/* Left Panel */}
      <div className="hidden md:flex w-full bg-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: `url(${BackImage})` }} />
        <div className="relative z-10 w-full flex flex-col justify-center items-center p-8">
          <div className="max-w-md text-center"></div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <div className="card w-full max-w-md bg-base-200 shadow-xl">
          <div className="card-body gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 justify-center">
              <LiaConnectdevelop size={56} />
              <span className="text-3xl">NeuroGen</span>
              {/* <img src={Logo} alt="AccurateIC Logo" className="w-48 h-auto" /> */}
            </div>

            {/* Title */}
            <h2 className="card-title text-2xl text-base-content font-bold text-center justify-center">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              )}

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
              <button
                type="submit"
                //  className="btn w-full mt-6 bg-success/25 hover:bg-success/30 transition-all duration-300 text-base-content"
                className="btn btn-success w-full mt-6">
                {isSignUp ? "Sign Up" : "Sign In"}
              </button>
            </form>

            {/* Switch between SignUp and SignIn */}
            <div className="divider text-base-content">OR</div>

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

              <button onClick={handleGoogleSignIn} className="btn btn-soft">
                <div className="flex flex-row gap-2 items-center justify-center">
                  <FaGoogle size={22} />
                  <span>Login with Google</span>
                </div>
              </button>
            </div>

            {/* Account Switch Link */}
            <div className="text-center mt-4">
              <button onClick={() => setIsSignUp(!isSignUp)} className="link link-primary">
                {isSignUp ? "Already have an account? Sign In" : "New here? Create Account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
