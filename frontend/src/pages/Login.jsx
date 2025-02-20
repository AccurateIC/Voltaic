import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import Logo from "../assets/accurate.svg";
import { useNavigate } from "react-router";
import BackImage from "../assets/back.svg";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-screen w-full flex relative">
      <div className="w-full sm:w-[40%] md:w-[35%] lg:w-[30%] h-full flex flex-col justify-center items-center bg-[#B1D5BD] p-4">
        <h1 className="text-xl sm:text-4xl lg:text-4xl font-bold mb-6 text-center"></h1>
      </div>

      <div
        className="hidden sm:block w-[70%] h-full bg-# bg-center"
        style={{ backgroundImage: `url(${BackImage})` }}
      ></div>

      <div className="absolute left-1/3 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#303030] p-6 rounded-xl shadow-lg w-full sm:w-[350px] lg:w-[350px] lg:h-[400px] 2xl:w-[400px] 2xl:h-[460px] shadow-md">
        <Toaster richColors={true} />
        <div className="flex justify-center items-center mb-6 ml-[2rem] bg-white w-[15rem] h-[4.5rem] rounded-lg ">
          <img
            src={Logo}
            alt="AccurateIC Logo"
            className="w-[180px] sm:w-[200px] h-auto "
          />
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
            <fieldset className="gap-5 flex flex-col">
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black text-xl">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  placeholder="USERNAME"
                  required
                  className="w-full pl-14 pr-4 py-3 bg-gray-700 border-[2.5px] border-white rounded-lg text-white text-sm tracking-wide placeholder-white focus:outline-none focus:ring-2 focus:ring-[#B1D5BD]"
                />
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black text-xl">
                  <FaLock />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="PASSWORD"
                  required
                  className="w-full pl-14 pr-10 py-3 bg-gray-700 border-[2.5px] border-white rounded-lg text-black text-sm tracking-wide placeholder-white focus:outline-none focus:ring-2 focus:ring-[#B1D5BD]"
                />
                <span
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black text-xl cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <IoEyeOff /> : <IoEye />}
                </span>
              </div>

              <button
                type="submit"
                className="mt-6 w-[12rem] bg-[#9FC5AA] py-3 rounded-full text-black shadow-lg shadow-black text-lg font-bold shadow-md hover:bg-[#8AB094] transition-all mx-auto block"
              >
                LOGIN
              </button>
            </fieldset>
          </form>
        )}

        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#6D9886] hover:text-[#517e68] transition-all font-bold underline"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "New here? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
