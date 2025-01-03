// /src/pages/Login.jsx
import { toast, Toaster } from 'sonner'
import GoogleIcon from "../assets/google-g-logo.svg"
import GithubIcon from "../assets/github-mark.svg";

const Login = () => {
  const handleGoogleSignIn = () => {
    console.log("google sign in clicked");
    toast.error("Google sign in functionality not implemented");
  };

  const handleGithubSignIn = () => {
    console.log("github sign in clicked");
    toast.error("GitHub sign in functionality not implemented", {})
  };

  return (
    // Add this outer wrapper with relative positioning
    <div className="relative min-h-screen">
      <Toaster richColors={true} />
      {/* Add these two divs for the background effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_100%_-30%,rgba(120,119,198,0.6),rgba(255,255,255,0))]" /> */}

      <div className="flex flex-col justify-center items-center h-screen relative">
        <div className="text-3xl font-bold">AccurateIC | GenSet</div>
        <div className="w-1/4 flex flex-col justify-center p-10 rounded-xl">
          <fieldset className="fieldset gap-5 flex flex-col">
            <div className="flex flex-col w-full justify-center items-center gap-2">
              <label className="floating-label w-full">
                <span>Email</span>
                <input type="email" placeholder="Email" className="input input-md w-full"></input>
              </label>
            </div>
            <div className="flex flex-col w-full justify-center items-center gap-2">
              <label className="floating-label w-full">
                <span className="">Password</span>
                <input type="password" placeholder="Password" className="input input-md w-full"></input>
              </label>
            </div>
            <div className="flex justify-center">
              <button className="btn btn-neutral rounded-xl mt-5">Sign in to account</button>
            </div>
          </fieldset>
          <div className="divider">or sign in with</div>
          <div className="flex flex-row items-center justify-center gap-10 m-4">
            {/* Google Sign In */}
            <button className="btn btn-square" onClick={handleGoogleSignIn}>
              <img src={GoogleIcon} alt="Google Logo" className="w-6 h-6" />
            </button>
            {/* GitHub Sign In */}
            <button className="btn btn-square" onClick={handleGithubSignIn}>
              <img src={GithubIcon} alt="Github Logo" className="w-6 h-6" />
            </button>
            <button className="btn btn-square">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-[1.2em]"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Login;
