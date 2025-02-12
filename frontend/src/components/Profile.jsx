import { isCookie, useNavigate } from "react-router-dom";
import { useState } from "react";
import Cookies from "js-cookie";

const Profile = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
        method: "POST",
        // headers: {
        //   'Content-Type': 'application/json',
        // },
        credentials: "include",
      });

      if (response.ok) {
        navigate("/login");
      } else {
        alert(`Logout failed}`);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
        <div className="w-10 rounded-full">
          <img alt="User Avatar" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </div>
      <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
        <li>
          <a className="justify-between">
            Profile
            <span className="badge">New</span>
          </a>
        </li>
        <li>
          <a>Settings</a>
        </li>
        <li>
          {/* Show "Logging out..." if the user is logging out */}
          <a onClick={handleLogout} className="cursor-pointer">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </a>
        </li>
      </ul>
    </div>
  );
};
export default Profile;
