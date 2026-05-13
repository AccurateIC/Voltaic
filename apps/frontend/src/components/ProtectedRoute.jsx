import { Navigate, useLocation } from "react-router";
import Skeleton from "./Skeleton";
import { toast } from "sonner";
import { useLoggedInUserQuery } from "../hooks/useLoggedInUserQuery";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { data: user, isLoading, isError } = useLoggedInUserQuery();

  if (isLoading) {
    return (
      <div className="h-screen opacity-90 w-full flex items-center justify-center p-8 bg-base-200">
        <Skeleton type="card" />
      </div>
    );
  }

  if (isError || !user) {
    // only show toast if user was previously on a protected page
    if (localStorage.getItem("user")) {
      toast.error("You're not authenticated. Please login first.");
    }
    localStorage.removeItem("user");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;