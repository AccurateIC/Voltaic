import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import GoogleIcon from "../assets/google-g-logo.svg";
import GithubIcon from "../assets/github-mark.svg";
import Logo from "../assets/accurate.svg";
import { useNavigate } from "react-router";
import BackImage from "../assets/back.svg";

const InputField = ({ label, type, placeholder, value, onChange }) => (
    <label className="floating-label w-full">
      <span>{label}</span>
      <input
        type={type}
        value={value} // Bind the value to the state
        onChange={onChange}
        placeholder={placeholder}
        required
        className="input input-md w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B1D5BD]"
      />
    </label>
  );
  

const SignIn =()=>{
    const navigate = useNavigate();
     const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");

      const handleAuth = async (e) => {
        e.preventDefault();

        const userData={
            email: email,
            password: password,
        };

        try{
            const response = await fetch("http://localhost:3333/auth/login",{
                method:"POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      toast.success("Login successfully!");
        }catch(error){}
    };
    return (
        <div className="h-screen w-full flex relative">
          <div className="w-full sm:w-[40%] md:w-[35%] lg:w-[30%] h-full flex flex-col justify-center items-center bg-[#B1D5BD] p-4">
            {/* <h1 className="text-xl sm:text-4xl lg:text-4xl font-bold mb-6 text-center">Welcome</h1> */}
          </div>
    
          <div
            className="hidden sm:block w-[70%] h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${BackImage})` }}></div>
    
          <div className="absolute left-1/3 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-100 p-6 rounded-xl shadow-lg w-full sm:w-[350px] lg:w-[350px] lg:h-[390px] 2xl:w-[400px] 2xl:h-[450px] shadow-md">
            <Toaster richColors={true} />
            <div className="flex justify-center mb-6">
              <img src={Logo} alt="AccurateIC Logo" className="w-[180px] sm:w-[200px] h-auto" />
            </div>
    
            {/* Form (Login/SignUp) */}
            <form onSubmit={handleAuth}>
              <fieldset className="fieldset gap-5 flex flex-col">
                {/* Conditional Fields for Signup or Login */}
                
                    {/* <InputField label="First Name" type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    <InputField label="Last Name" type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                   */}
                <InputField label="Email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <InputField label="Password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
    
                {/* Submit Button */}
                <div className="flex justify-center mt-4">
                  <button
                    type="submit"
                    className="btn rounded-md bg-[#B1D5BD] text-black hover:bg-[#9FC5AA] transition-all w-full py-3 text-lg">
                    {/* {isSignUp ? "Sign Up" : "/login"} */}
                  </button>
                </div>
              </fieldset>
            </form>
    
            {/* Switch between SignUp and SignIn */}
            <div className="flex justify-center mt-4">
              <button
                // onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#6D9886] hover:text-[#517e68] transition-all font-bold">
                {/* {isSignUp ? "Already have an account? Sign In" : "New here? Sign Up"} */}
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

export default SignIn;