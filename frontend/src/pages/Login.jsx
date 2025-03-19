import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import GoogleIcon from "../assets/google-g-logo.svg";
import GithubIcon from "../assets/github-mark.svg";
import Logo from "../assets/accurate.svg";
import { useNavigate } from "react-router";
import BackImage from "../assets/back.svg";
import { FaGithub } from "react-icons/fa6";

const InputField = ({ label, type, placeholder, value, onChange }) => (
  <label className="floating-label w-full">
    <span>{label}</span>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="input input-md w-full p-3 rounded-md border border-gray-300 text-base-content focus:outline-none focus:ring-2 focus:ring-[#B1D5BD]"
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
        const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/auth/isAuthenticated`, {
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
      console.log(delResponse);

      // TEMPORARY: send request to ML models to notify which user has logged in
      // fetch logged in user details
      const loggedInUser = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/auth/isAuthenticated`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const user = await loggedInUser.json();
      console.log(user);
      //const sendLoggedInUserDetails = await fetch()

      // send to anomaly detection server
      const sendUserToAnomalyServerResponse = await fetch(`${import.meta.env.VITS_ANOMALY_BACKEND}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!sendUserToAnomalyServerResponse.ok) {
        toast.error("Failed to send user details to anomaly server");
      }
      // send to pdm server
      const sendUserToPdmServerResponse = await fetch(`${import.meta.env.VITS_PDM_BACKEND}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!sendUserToPdmServerResponse.ok) {
        toast.error("Failed to send user details to anomaly server");
      }
      // send to rul server
      const sendUserToRulServerResponse = await fetch(`${import.meta.env.VITS_RUL_BACKEND}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!sendUserToRulServerResponse.ok) {
        toast.error("Failed to send user details to anomaly server");
      }

      // ##################################################################

      navigate("/engine");
    } catch (error) {
      console.error(isSignUp ? "Error creating account:" : "Error logging in:", error);
      toast.error(error.message || "An error occurred");
    }
  };

  const handleGithubSignIn = () => {
    window.location.assign("http://localhost:3333/auth/github/redirect");
  };

  return (
    <div className="h-screen w-full flex relative">
      <div className="w-full sm:w-[40%] md:w-[35%] lg:w-[30%] h-full flex flex-col justify-center items-center bg-[#B1D5BD] p-4"></div>

      <div
        className="hidden sm:block w-[70%] h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${BackImage})` }}></div>

      <div className="absolute left-1/3 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-base-200 p-10 rounded-xl shadow-lg">
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
        <div className="flex items-center justify-center gap-6 my-4">
          {/* <button
            className="btn btn-square flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full"
            onClick={handleGoogleSignIn}>
            <img src={GoogleIcon} alt="Google Logo" className="w-6 h-6" />
          </button> */}
          {/* <button
            className="btn btn-square flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full"
            onClick={handleGithubSignIn}>
            <img src={GithubIcon} alt="GitHub Logo" className="w-6 h-6" />
          </button> */}
          <button className="btn btn-soft flex" onClick={handleGithubSignIn}>
            <FaGithub />
            Login with GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
