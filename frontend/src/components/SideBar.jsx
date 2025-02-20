import { NavLink } from "react-router-dom";
import {
  FaPlug,
  FaFileAlt,
  FaHome,
  FaRegBell,
  FaTools,
  FaLifeRing,
} from "react-icons/fa";
import { AiOutlineWarning } from "react-icons/ai";
import { GiElectric } from "react-icons/gi";
import { MdElectricalServices } from "react-icons/md";
import { BsClockHistory } from "react-icons/bs";

const SideBar = () => {
  return (
    <ul className="bg-[rgba(177,213,189,1)] w-20 md:w-60 lg:h-[68rem] h-screen px-2 py-4">
      <li>
        <NavLink
          to="/engine"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-4 font-semibold text-lg ${
              isActive
                ? "bg-base-content text-white rounded-md"
                : "text-gray-700"
            }`
          }
          end
        >
          <FaHome className="text-xl" />
          <span className="hidden md:inline ml-3">Engine</span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/generator"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-4 font-semibold text-lg ${
              isActive
                ? "bg-base-content text-white rounded-md"
                : "text-gray-700"
            }`
          }
          end
        >
          <FaPlug className="text-xl" />
          <span className="hidden md:inline ml-3">Generator</span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/mains"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-3 ${
              isActive
                ? "bg-base-content text-white rounded-md"
                : "text-gray-700"
            }`
          }
          end
        >
          <MdElectricalServices className="text-xl" />
          <span className="hidden md:inline ml-2 font-semibold">MAIN</span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-4 font-semibold text-lg ${
              isActive
                ? "bg-base-content text-white rounded-md"
                : "text-gray-700"
            }`
          }
          end
        >
          <FaFileAlt className="text-xl" />
          <span className="hidden md:inline ml-3">Reports</span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/anamolies"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-3 ${
              isActive
                ? "bg-base-content text-white rounded-md"
                : "text-gray-700"
            }`
          }
          end
        >
          <AiOutlineWarning className="text-xl" />
          <span className="hidden md:inline ml-2 font-semibold">Anamolies</span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/alarms"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-3 ${
              isActive
                ? "bg-base-content text-white rounded-md"
                : "text-gray-700"
            }`
          }
          end
        >
          <FaRegBell className="text-xl" />
          <span className="hidden md:inline ml-2 font-semibold">Alarms</span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/predictive-maintenance"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-3 ${
              isActive
                ? "bg-base-content text-white rounded-md"
                : "text-gray-700"
            }`
          }
          end
        >
          <FaTools className="text-xl" />
          <span className="hidden md:inline ml-2 font-semibold">
            Predictive Maintenance
          </span>
        </NavLink>

        <ul className="ml-4 mt-1 whitespace-nowrap">
          <li>
            <NavLink
              to="/genset-data"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-md ${
                  isActive ? "bg-gray-300 font-semibold" : "text-gray-700"
                } hover:bg-gray-200`
              }
              end
            >
              <GiElectric className="text-2xl" />
              <span className="font-semibold">Genset Vibration</span>
            </NavLink>
          </li>
        </ul>
      </li>

      <li>
        <NavLink
          to="/RUL"
          className={({ isActive }) =>
            `flex items-center justify-center md:justify-start py-3 ${
              isActive
                ? "bg-base-content text-white rounded-md"
                : "text-gray-700"
            }`
          }
          end
        >
          <BsClockHistory className="text-xl" />
          <span className="hidden md:inline ml-2 font-semibold">RUL</span>
        </NavLink>
      </li>
    </ul>
  );
};

export default SideBar;
