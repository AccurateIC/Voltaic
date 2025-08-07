import { cn } from "../lib/Utils";
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { FaGears } from "react-icons/fa6";
import { GoPerson } from "react-icons/go";
import { RxArchive } from "react-icons/rx";
import { ImPowerCord } from "react-icons/im";
import { RiAlertFill } from "react-icons/ri";
import { GiAutoRepair, GiLifeBar } from "react-icons/gi";
import { FaPlug, FaFileAlt, FaBell, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { TbReportAnalytics } from "react-icons/tb";

const SideBarLink = ({ to, name, Icon }) => {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            "flex items-center duration-200 transition-all hover:bg-base-content/20 text-base-content",
            "rounded p-4 m-2 font-semibold text-lg",
            `${isActive ? "bg-base-content text-base-100 rounded-md hover:text-base-content" : "text-base-content"}`
          )
        }
        end
      >
        <Icon className="text-xl" />
        <span className="hidden md:inline ml-3">{name}</span>
      </NavLink>
    </li>
  );
};

const SideBarGroup = ({ name, Icon, defaultOpen = false, children, routes = [] }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Check if current path matches any route in this group
  useEffect(() => {
    const currentPath = location.pathname;
    const shouldBeOpen = routes.some((route) => currentPath.startsWith(route));

    if (shouldBeOpen) {
      setIsOpen(true);
    } else if (defaultOpen) {
      setIsOpen(true);
    }
  }, [location.pathname, routes, defaultOpen]);

  return (
    <li>
      <div
        className={cn(
          "flex items-center justify-between cursor-pointer duration-200 transition-all ",
          "hover:bg-base-content/20 rounded p-4 m-2 font-semibold text-lg text-base-content"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <Icon className="text-xl" />
          <span className="hidden md:inline ml-3">{name}</span>
        </div>
        {isOpen ? <FaChevronDown className="text-sm" /> : <FaChevronRight className="text-sm" />}
      </div>
      {isOpen && <ul className="ml-7 border-l-1 border-base-content/30 px-1">{children}</ul>}
    </li>
  );
};

const SideBar = () => {
  return (
    <aside className="sticky top-0 h-[calc(100vh-4rem)] flex flex-col justify-between bg-[rgba(177,213,189,1)] bg-base-200 text-base-content w-15 md:w-58">
      <ul className="flex-1 bg-[rgba(177,213,189,1)] bg-base-200 px-1 py-2 overflow-y-auto">
        <SideBarGroup name="Genset" Icon={ImPowerCord} routes={["/engine", "/generator", "/mains"]}>
          <SideBarLink to="/engine" name="Engine" Icon={FaGears} />
          <SideBarLink to="/generator" name="Generator" Icon={FaPlug} />
          <SideBarLink to="/mains" name="Mains" Icon={FaPlug} />
        </SideBarGroup>

        <SideBarLink to="/live-data" name="Live Data" Icon={FaFileAlt} />
        <SideBarLink to="/anomalies-old" name="Anomalies" Icon={RiAlertFill} />
        {/* <SideBarLink to="/anomalies" name="Anomalies" Icon={RiAlertFill} /> */}
        <SideBarLink to="/reports" name="Reports" Icon={TbReportAnalytics} />
        <SideBarLink to="/alarms" name="Alarms" Icon={FaBell} />
        <SideBarLink to="/predictive-maintenance" name="Maintenance" Icon={GiAutoRepair} />
        <SideBarLink to="/rul" name="RUL" Icon={GiLifeBar} />
        <SideBarLink to="/archive" name="Archive" Icon={RxArchive} />
      </ul>
      <div className="flex flex-col text-xs items-center justify-center p-2 md:visible">
        <span>Neurogen v1.3.5</span>
        <span>© NeuBodhi 2025</span>
      </div>
    </aside>
  );
};

export default SideBar;
