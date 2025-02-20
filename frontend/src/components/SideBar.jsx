import { NavLink } from "react-router-dom";
import { FaPlug, FaFileAlt, FaHome, FaBell, FaTools } from "react-icons/fa";
import { RiAlertFill } from "react-icons/ri";
import { GiAutoRepair, GiLifeBar, GiVibratingBall } from "react-icons/gi";

const SideBar = () => {
  return (
    <ul className="bg-[rgba(177,213,189,1)] w-20 md:w-60 min-h-0 overflow-y-auto px-2 py-4">
      <li>
        <NavLink
          to="/engine"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-4 font-semibold text-lg ${
              isActive ? "bg-base-content text-white rounded-md" : "text-gray-700"
            }`
          }
          end>
          <FaHome className="text-xl" />
          <span className="hidden md:inline ml-3">Engine</span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/generator"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-4 font-semibold text-lg ${
              isActive ? "bg-base-content text-white rounded-md" : "text-gray-700"
            }`
          }
          end>
          <FaPlug className="text-xl" />
          <span className="hidden md:inline ml-3">Generator</span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-4 font-semibold text-lg ${
              isActive ? "bg-base-content text-white rounded-md" : "text-gray-700"
            }`
          }
          end>
          <FaFileAlt className="text-xl" />
          <span className="hidden md:inline ml-3">Reports</span>
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/anomalies"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-3 ${
              isActive ? "bg-base-content text-white rounded-md" : "text-gray-700"
            }`
          }
          end>
          <RiAlertFill className="text-xl" />
          <span className="hidden md:inline ml-2 font-semibold">Anomalies</span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/alarms"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-3 ${
              isActive ? "bg-base-content text-white rounded-md" : "text-gray-700"
            }`
          }
          end>
          <FaBell className="text-xl" />
          <span className="hidden md:inline ml-2 font-semibold">Alarms</span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/predictive-maintenance"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-3 ${
              isActive ? "bg-base-content text-white rounded-md" : "text-gray-700"
            }`
          }
          end>
          <GiAutoRepair className="text-xl" />
          <span className="hidden md:inline ml-2 font-semibold">Predictive Maintenance</span>
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/rul"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-3 ${
              isActive ? "bg-base-content text-white rounded-md" : "text-gray-700"
            }`
          }
          end>
          <GiLifeBar className="text-xl" />
          <span className="hidden md:inline ml-2 font-semibold">RUL</span>
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/vibration"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-3 ${
              isActive ? "bg-base-content text-white rounded-md" : "text-gray-700"
            }`
          }
          end>
          <GiVibratingBall className="text-xl" />
          <span className="hidden md:inline ml-2 font-semibold">Vibration</span>
        </NavLink>
      </li>
    </ul>
  );
};

export default SideBar;
