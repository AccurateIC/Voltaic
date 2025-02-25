import { NavLink } from "react-router-dom";
import { FaPlug, FaFileAlt, FaHome, FaBell } from "react-icons/fa";
import { RiAlertFill } from "react-icons/ri";
import { GiAutoRepair, GiLifeBar, GiVibratingBall } from "react-icons/gi";

const SideBarLink = ({ to, name, Icon }) => {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center duration-200 transition-all hover:bg-base-content/50 hover:text-base-200 rounded p-4 m-2 font-semibold text-lg ${
            isActive ? "bg-base-content text-base-100 rounded-md" : "text-gray-700"
          }`
        }
        end>
        <Icon className="text-xl" />
        <span className="hidden md:inline ml-3">{name}</span>
      </NavLink>
    </li>
  );
};

const SideBar = () => {
  return (
    <ul className="bg-[rgba(177,213,189,1)] px-1 py-2">
      <SideBarLink to="/engine" name="Engine" Icon={FaHome} />
      <SideBarLink to="/generator" name="Generator" Icon={FaPlug} />
      <SideBarLink to="/mains" name="Mains" Icon={FaPlug} />
      <SideBarLink to="/reports" name="Reports" Icon={FaFileAlt} />
      <SideBarLink to="/anomalies" name="Anomalies" Icon={RiAlertFill} />
      <SideBarLink to="/alarms" name="Alarms" Icon={FaBell} />
      <SideBarLink to="/predictive-maintenance" name="Maintenance" Icon={GiAutoRepair} />
      <SideBarLink to="/rul" name="RUL" Icon={GiLifeBar} />
      {/* <SideBarLink to="/vibration" name="Vibration" Icon={GiVibratingBall} /> */}
    </ul>
  );
};

export default SideBar;
