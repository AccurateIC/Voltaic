import { Navigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import Loader from "./Loader";
import { toast } from "sonner";
import { ROUTES } from "../config/backend";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checkIfAuthenticated = async () => {
  await sleep(1500);
  const response = await fetch(ROUTES.AUTH_USER_GET_LOGGED_IN_USER, { method: "GET", credentials: "include" });
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
    // loading spinner
    return (
      <div className="h-screen opacity-90 w-full flex items-center justify-center bg-base-200">
        <Loader />
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
