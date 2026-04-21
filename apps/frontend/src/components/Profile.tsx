import { useNavigate } from "react-router";
import { prefetchRouteChunk } from "../lib/prefetchRouteChunk";

const Profile = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onMouseEnter={() => prefetchRouteChunk("/profile")}
      onFocus={() => prefetchRouteChunk("/profile")}
      onClick={() => navigate("/profile")}
      className="btn btn-ghost btn-circle avatar"
      aria-label="Open profile page"
    >
      <div className="w-10 rounded-full">
        <img
          alt="User avatar"
          src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        />
      </div>
    </button>
  );
};

export default Profile;
