import React from "react";
import { toast, Toaster } from "sonner";
import GoogleIcon from "../assets/google-g-logo.svg";
import GithubIcon from "../assets/github-mark.svg";
import Logo from "../assets/accurate.svg"; // Ensure the path is correct
import { useNavigate } from "react-router";
import BackImage from "../assets/back.svg";

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    console.log("Google sign-in clicked");
    toast.error("Google sign-in functionality not implemented");
  };

  const handleGithubSignIn = () => {
    console.log("GitHub sign-in clicked");
    toast.error("GitHub sign-in functionality not implemented");
  };

  return (
    <div className="h-screen w-screen flex">
      <div
        className="w-[30%] h-full flex flex-col justify-center items-center relative"
        style={{ backgroundColor: "rgba(177, 213, 189, 1)" }}
      >
        <h1 className="text-3xl font-bold mb-4">AccurateIC | GenSet</h1>
        {/* <p className="text-center px-6">Sign in to get started.</p> */}

        <div className="bg-gray-100 p-8 ml-[rem] rounded-xl shadow-lg w-[300px] h-[400px]">
          <Toaster richColors={true} />
          <div className="flex justify-center mb-6">
            <a className="btn btn-ghost">
              <img
                src={Logo}
                alt="AccurateIC Logo"
                style={{
                  width: "200px",
                  height: "auto",
                  padding: "2px",
                  borderRadius: "4px",
                }}
              />
            </a>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log("Form submitted");
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
                    aria-label="Enter your email"
                    className="input input-md w-full"
                  />
                </label>
                <label className="floating-label w-full">
                  <span>Password</span>
                  <input
                    type="password"
                    placeholder="Password"
                    aria-label="Enter your password"
                    className="input input-md w-full"
                  />
                </label>
              </div>
              <div className="flex justify-center">
                <button type="submit" className="btn btn-neutral rounded-xl mt-5">
                  Sign In
                </button>
              </div>
            </fieldset>
          </form>

          <div className="flex items-center gap-4 my-4">
            <hr className="border-t w-full" />
            <span className="text-gray-500 text-sm whitespace-nowrap">or sign in with</span>
            <hr className="border-t w-full" />
          </div>

          <div className="flex items-center justify-center gap-6">
            <button className="btn btn-square flex items-center justify-center w-10 h-10" onClick={handleGoogleSignIn}>
              <img src={GoogleIcon} alt="Google Logo" className="w-6 h-6" />
            </button>
            <button className="btn btn-square flex items-center justify-center w-10 h-10" onClick={handleGithubSignIn}>
              <img src={GithubIcon} alt="GitHub Logo" className="w-6 h-6" />
            </button>
            <button className="btn btn-square flex items-center justify-center w-10 h-10" aria-label="Sign in with Heart">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        className="w-[70%] h-full bg-cover bg-center relative"
        style={{ backgroundImage: `url(${BackImage})` }}
      >
      </div>
    </div>
  );
};

export default Login;
