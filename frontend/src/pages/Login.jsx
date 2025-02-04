import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import GoogleIcon from "../assets/google-g-logo.svg";
import GithubIcon from "../assets/github-mark.svg";
import Logo from "../assets/accurate.svg";
import { useNavigate } from "react-router";
import BackImage from "../assets/back.svg";

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

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
      <div className="w-full sm:w-[40%] md:w-[35%] lg:w-[30%] h-full flex flex-col justify-center items-center bg-[#B1D5BD] p-4">
        <h1 className="text-xl sm:text-4xl lg:text-4xl font-bold mb-6 text-center"></h1>
      </div>

      <div
        className="hidden sm:block w-[70%] h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${BackImage})` }}
      ></div>

      <div className="absolute left-1/3 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-100 p-6 rounded-xl shadow-lg w-full sm:w-[350px] lg:w-[350px] lg:h-[390px] 2xl:w-[400px] 2xl:h-[450px] shadow-md">
        <Toaster richColors={true} />
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="AccurateIC Logo" className="w-[180px] sm:w-[200px] h-auto" />
        </div>

        {isSignUp ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log("Sign Up Form Submitted");
              navigate("/engine");
            }}
          >
            <fieldset className="fieldset gap-2 flex flex-col ">
              <div className="flex flex-col w-full gap-4">
                <label className="floating-label w-full">
                  <span>Full Name</span>
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    className="input input-md w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B1D5BD]"
                  />
                </label>
                <label className="floating-label w-full">
                  <span>Email</span>
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    className="input input-md w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B1D5BD]"
                  />
                </label>
                <label className="floating-label w-full">
                  <span>Password</span>
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    className="input input-md w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B1D5BD]"
                  />
                </label>
                {/* <label className="floating-label w-full">
                  <span>Confirm Password</span>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    required
                    className="input input-md w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B1D5BD]"
                  />
                </label> */}
              </div>
              <div className="flex justify-center mt-4">
                <button
                  type="submit"
                  className="btn rounded-md bg-[#B1D5BD] text-black hover:bg-[#9FC5AA] transition-all w-full py-3 text-lg"
                >
                  Sign Up
                </button>
              </div>
            </fieldset>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log("Login Form Submitted");
              navigate("/engine");
            }}
          >
            <fieldset className="fieldset gap-5 flex flex-col">
              <div className="flex flex-col w-full gap-4">
                <label className="floating-label w-full">
                  <span>Email</span>
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    className="input input-md w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B1D5BD]"
                  />
                </label>
                <label className="floating-label w-full">
                  <span>Password</span>
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    className="input input-md w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B1D5BD]"
                  />
                </label>
              </div>
              <div className="flex justify-center mt-4">
                <button
                  type="submit"
                  className="btn rounded-md bg-[#B1D5BD] text-black hover:bg-[#9FC5AA] transition-all w-full py-3 text-lg"
                >
                  Sign In
                </button>
              </div>
            </fieldset>
          </form>
        )}

        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#6D9886] hover:text-[#517e68] transition-all font-bold"
          >
            {isSignUp ? "Already have an account? Sign In" : "New here? Sign Up"}
          </button>
        </div>

        {/* <div className="flex items-center gap-4 my-4">
          <hr className="border-t w-full" />
          <span className="text-gray-500 text-sm whitespace-nowrap">or sign in with</span>
          <hr className="border-t w-full" />
        </div>

        <div className="flex items-center justify-center gap-6">
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
