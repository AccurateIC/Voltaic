import React, { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import GoogleIcon from "../assets/google-g-logo.svg";
import GithubIcon from "../assets/github-mark.svg";
import Logo from "../assets/accurate.svg";
import { useNavigate } from "react-router";
import BackImage from "../assets/back.svg";
import Cookies from "js-cookie";

const InputField = ({ label, type, placeholder, value, onChange }) => (
  <label className="floating-label w-full">
    <span>{label}</span>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="input input-md w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B1D5BD]"
    />
  </label>
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
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/isAuthenticated`, {
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
        ? `${import.meta.env.VITE_BACKEND_URL}/auth/register`
        : `${import.meta.env.VITE_BACKEND_URL}/auth/login`;
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

      navigate("/engine");
    } catch (error) {
      console.error(isSignUp ? "Error creating account:" : "Error logging in:", error);
      toast.error(error.message || "An error occurred");
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Google sign-in clicked");
    toast.error("Google sign-in functionality not implemented");
  };

  const handleGithubSignIn = () => {
    console.log("GitHub sign-in clicked");
    toast.error("GitHub sign-in functionality not implemented");
  };

  return (
    <div className="h-screen w-full flex relative">
      <div className="w-full sm:w-[40%] md:w-[35%] lg:w-[30%] h-full flex flex-col justify-center items-center bg-[#B1D5BD] p-4"></div>

      <div
        className="hidden sm:block w-[70%] h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${BackImage})` }}></div>

      <div className="absolute left-1/3 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-100 p-6 rounded-xl shadow-lg w-full sm:w-[350px] lg:w-[350px] lg:h-[390px] 2xl:w-[400px] 2xl:h-[450px] shadow-md">
        <Toaster richColors={true} />
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="AccurateIC Logo" className="w-[180px] sm:w-[200px] h-auto" />
        </div>

        <form onSubmit={handleAuth}>
          <fieldset className="fieldset gap-5 flex flex-col">
            {isSignUp && (
              <>
                <InputField
                  label="First Name"
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <InputField
                  label="Last Name"
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </>
            )}
            <InputField
              label="Email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              label="Password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Submit Button */}
            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="btn rounded-md bg-[#B1D5BD] text-black hover:bg-[#9FC5AA] transition-all w-full py-3 text-lg">
                {isSignUp ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </fieldset>
        </form>

        {/* Switch between SignUp and SignIn */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#6D9886] hover:text-[#517e68] transition-all font-bold">
            {isSignUp ? "Already have an account? Sign In" : "New here? Sign Up"}
          </button>
        </div>

        {/* Uncomment for Social Media Login Options */}
        {/* <div className="flex items-center gap-6 my-4">
          <button
            className="btn btn-square flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full"
            onClick={handleGoogleSignIn}
          >
            <img src={GoogleIcon} alt="Google Logo" className="w-6 h-6" />
          </button>
          <button
            className="btn btn-square flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full"
            onClick={handleGithubSignIn}
          >
            <img src={GithubIcon} alt="GitHub Logo" className="w-6 h-6" />
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
