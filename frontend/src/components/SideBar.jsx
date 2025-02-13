import { NavLink } from "react-router-dom";
import { FaPlug, FaFileAlt, FaHome, FaRegBell, FaTools } from "react-icons/fa";
import { AiOutlineWarning } from "react-icons/ai";

const SideBar = () => {
  return (
    <ul className="bg-[rgba(177,213,189,1)] w-20 md:w-60 lg:h-[57rem]  h-screen px-2 py-4">
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
      <ul className="ml-3">
        <li>
          <NavLink
            to="/anomalies"
            className={({ isActive }) =>
              `flex items-center justify-center md:justify-start py-3 ${
                isActive ? "bg-base-content text-white rounded-md" : "text-gray-700"
              }`
            }
            end>
            <AiOutlineWarning className="text-xl" />
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
            <FaRegBell className="text-xl" />
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
            <FaTools className="text-xl" />
            <span className="hidden md:inline ml-2 font-semibold">Predictive Maintenance</span>
          </NavLink>
        </li>
      </ul>
    </ul>
  );
};

export default SideBar;
