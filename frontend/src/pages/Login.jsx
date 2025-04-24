import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Logo from "../assets/accurate.svg";
import { useNavigate } from "react-router";
import BackImage from "../assets/back.svg";
import { FaGithub, FaGoogle } from "react-icons/fa6";

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

      console.log(isSignUp ? "User registered:" : "User logged in:", response);
      toast.success(isSignUp ? "Account created successfully!" : "Logged in successfully!");

      // ##################################################################

      // TEMPORARY: delete data from archive and notification table on login
      const delResponse = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/archive/deleteAll`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to reset archive table`);
      }

      toast.success("Data Reset");

      // TEMPORARY: send request to ML models to notify which user has logged in
      // fetch logged in user details
      const loggedInUser = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/auth/getLoggedInUser`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const user = await loggedInUser.json();

      // send to anomaly detection server
      try {
        console.log("sending to anomaly server");
        console.log(import.meta.env.VITE_ANOMALY_BACKEND);
        const sendUserToAnomalyServerResponse = fetch(`${import.meta.env.VITE_ANOMALY_BACKEND}/user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });
        console.log(":::");
        if (!sendUserToAnomalyServerResponse.ok) {
          // toast.error("Failed to send user details to Anomaly server");
        }
      } catch (anomalyErr) {
        console.error(anomalyErr);
      }

      // send to pdm server
      try {
        console.log("sending to pdm");
        const sendUserToPdmServerResponse = fetch(`${import.meta.env.VITE_PDM_BACKEND}/user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...user, logged_in: true }),
        });
        if (!sendUserToPdmServerResponse.ok) {
          // toast.error("Failed to send user details to PDM server");
        }
        console.log("sent to pdm");
      } catch (pdmErr) {
        console.error(pdmErr);
      }

      // send to rul server
      try {
        console.log("rul req start");
        const sendUserToRulServerResponse = fetch(`${import.meta.env.VITE_RUL_BACKEND}/user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...user, logged_in: true }),
        });
        if (!sendUserToRulServerResponse.ok) {
          // toast.error("Failed to send user details to RUL server");
        }
        console.log("rul req end");
        // console.log(await sendUserToRulServerResponse.json());
      } catch (rulErr) {
        console.error(rulErr);
      }

      // ##################################################################

      navigate("/engine");
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
    <div className="min-h-screen w-full flex relative bg-base-200">
      {/* Left Panel */}
      <div className="hidden md:flex w-full bg-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: `url(${BackImage})` }} />
        <div className="relative z-10 w-full flex flex-col justify-center items-center p-8">
          <div className="max-w-md text-center"></div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full md:w-1/2 bg-success/5 flex items-center justify-center p-4">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img src={Logo} alt="AccurateIC Logo" className="w-48 h-auto" />
            </div>

            {/* Title */}
            <h2 className="card-title text-2xl text-base-content font-bold text-center mb-6 justify-center">
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
                className="btn w-full mt-6 bg-success/25 hover:bg-success/30 transition-all duration-300 text-base-content">
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

              <button
                onClick={handleGoogleSignIn}
                className="btn btn-neutral hover:bg-black/90 gap-2 transition-all duration-100">
                <FaGoogle className="h-5 w-5" />
                Login with Google
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
