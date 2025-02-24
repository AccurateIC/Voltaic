import { Navigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import Keyframes from "./Loader";
import { toast } from "sonner";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checkIfAuthenticated = async () => {
  await sleep(1500);
  const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/auth/isAuthenticated`, { credentials: "include" });
  if (!response.ok) return false;
  return true;
};

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        setIsAuthenticated(await checkIfAuthenticated());
      } catch (err) {
        console.log(`Error while checking is user is authenticated: ${err}`);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    // replace this with a loading spinner component
    return (
      <div className="h-screen w-full flex items-center justify-center bg-base-content">
        <Keyframes />
      </div>
    );
  }

  if (!isAuthenticated) {
    toast.error("You're not authenticated. Please login first.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
