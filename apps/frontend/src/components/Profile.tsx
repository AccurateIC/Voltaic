// src/components/Profile.jsx

import { useNavigate } from "react-router";
import { toast } from "sonner";
import { SessionStore } from "../lib/SessionStore";
import { tuyau } from "../lib/Tuyau";
import { Modules } from "../config/extern";

const Profile = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      SessionStore.clear();
      //   throw new Error();
      // TEMPORARY
      // ####################################
      // fetch logged in user details
      const { data: user, error: userError } = await tuyau.auth.getLoggedInUser.$get();
      if (userError) {
        throw new Error("Failed to get logged in user");
      }

      // send to pdm server
      try {
        console.log("sending logout to pdm");
        const sendUserToPdmServerResponse = fetch(Modules.PDM + "/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...user, logged_in: false }),
        });
        if (!sendUserToPdmServerResponse.ok) {
          toast.error("Failed to send user details to PDM server");
        }
        console.log("sent logout to pdm");
      } catch (pdmErr) {
        console.error(pdmErr);
      }

      // send to rul server
      try {
        console.log("sending logout to rul");
        const sendUserToPdmServerResponse = fetch(Modules.RUL + "/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...user, logged_in: false }),
        });
        if (!sendUserToPdmServerResponse.ok) {
          toast.error("Failed to send user details to PDM server");
        }
        console.log("sent logout to rul");
      } catch (pdmErr) {
        console.error(pdmErr);
      }
      // ####################################

      const { data, error } = await tuyau.auth.logout.$post();
      if (error) throw new Error(`Logout failed: ${error.status}`);
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (err) {
      toast.error(`Failed to logout`);
      console.error(`Failed to logout: ${err}`);
    }
  };

  const profile = async () => {
    navigate("/profile");
  };

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
        className="menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box z-[1] mt-3 w-52 p-2 shadow"
      >
        <li>
          <a onClick={profile}>Profile</a>
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
