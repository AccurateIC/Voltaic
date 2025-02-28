// /src/components/Profile.jsx

import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Link } from "react-router-dom";


const Profile = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      //   throw new Error();
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error(`Status Code: ${response.status}`);
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (err) {
      toast.error(`Failed to logout`);
      console.error(`Failed to logout: ${err}`);
    }
  };

  const profile = async ()=>{
    navigate("/profile");
  }

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
        <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS Navbar component"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
          />
        </div>
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box z-[1] mt-3 w-52 p-2 shadow">
        <li>
          <a className="justify-between">
            Profile
            <a onClick={profile} className="cursor-pointer">
            <span className="badge">New</span>
            </a>
            
          </a>
        </li>
        <li>
          <a>Settings</a>
        </li>
        <li>
          <a onClick={handleLogout} className="cursor-pointer">
            Logout
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Profile;
