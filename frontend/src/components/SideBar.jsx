import { NavLink } from "react-router";
import { FaPlug, FaFileAlt, FaHome, FaRegBell } from "react-icons/fa";
import { AiOutlineWarning } from 'react-icons/ai';

const SideBar = () => {
  return (
    <ul
      className="menu bg-[rgba(177,213,189,1)] w-16 md:w-56 h-screen"
    >
      <li>
        <NavLink
          to="/engine"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-4 ${
              isActive ? "active bg-base-content text-base-300" : ""
            }`
          }
          end
        >
          <FaHome className="text-lg" />
          <span className="hidden md:inline ml-2">Engine</span>
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/generator"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-4 ${
              isActive ? "active bg-base-content text-base-300" : ""
            }`
          }
          end
        >
          <FaPlug className="text-lg" />
          <span className="hidden md:inline ml-2">Generator</span>
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-4 ${
              isActive ? "active bg-base-content text-base-300" : ""
            }`
          }
          end
        >
          <FaFileAlt className="text-lg" />
          <span className="hidden md:inline ml-2">Reports</span>
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/alarms"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-4 ${
              isActive ? "active bg-base-content text-base-300" : ""
            }`
          }
          end
        >
          <FaRegBell className="text-lg" />
          <span className="hidden md:inline ml-2">Alarms</span>
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/anamolies"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-4 ${
              isActive ? "active bg-base-content text-base-300" : ""
            }`
          }
          end
        >
          <AiOutlineWarning className="text-lg" />
          <span className="hidden md:inline ml-2">Anamolies</span>
        </NavLink>
      </li>
    </ul>
  );
};

export default SideBar;
