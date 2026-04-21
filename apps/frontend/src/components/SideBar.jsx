import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router";
import { cn } from "../lib/Utils";

import { FaGears } from "react-icons/fa6";
import { RxArchive } from "react-icons/rx";
import { ImPowerCord } from "react-icons/im";
import { RiAlertFill } from "react-icons/ri";
import { GiAutoRepair, GiLifeBar } from "react-icons/gi";
import { FaPlug, FaFileAlt, FaBell, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { TbReportAnalytics } from "react-icons/tb";
import { MdKeyboardArrowRight } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { LuMoon } from "react-icons/lu";
import { LiaConnectdevelop } from "react-icons/lia";
import { useOptimisticLogout } from "../hooks/useOptimisticLogout";
import { prefetchRouteChunk } from "../lib/prefetchRouteChunk";

/* ── Tooltip (collapsed mode only) ── */
const Tooltip = ({ label, collapsed }) => {
  if (!collapsed) return null;
  return (
    <span className="
      absolute left-full ml-3 top-1/2 -translate-y-1/2
      bg-base-300 border border-base-content/20 text-base-content
      text-sm font-semibold px-3 py-1.5
      whitespace-nowrap pointer-events-none
      opacity-0 group-hover:opacity-100
      transition-opacity duration-150
      z-50
    ">
      {label}
    </span>
  );
};

/* ── Single nav link ── */
const SideBarLink = ({ to, name, Icon, collapsed }) => (
  <li className="relative group">
    <NavLink
      to={to}
      end
      onMouseEnter={() => prefetchRouteChunk(to)}
      onFocus={() => prefetchRouteChunk(to)}
      className={({ isActive }) =>
        cn(
          "flex items-center rounded-sm transition-all duration-200",
          collapsed
            ? "mx-3 my-1 p-3 justify-center"
            : "mx-3 my-1 px-3 py-3 gap-3",
          isActive
            ? "bg-base-content text-base-100 shadow-sm"
            : "text-base-content/60 hover:bg-base-300 hover:text-base-content"
        )
      }
    >
      <span className="flex items-center justify-center w-5 h-5 flex-shrink-0">
        <Icon size={19} />
      </span>
      {!collapsed && (
        <span className="text-[15px] font-semibold whitespace-nowrap">{name}</span>
      )}
    </NavLink>
    <Tooltip label={name} collapsed={collapsed} />
  </li>
);

/* ── Collapsible group ── */
const SideBarGroup = ({ name, Icon, children, routes = [], collapsed }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = routes.some((r) => location.pathname.startsWith(r));

  useEffect(() => {
    if (routes.some((r) => location.pathname.startsWith(r))) setIsOpen(true);
  }, [location.pathname]);

  return (
    <li className="relative group">
      <div
        onClick={() => !collapsed && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between rounded-sm cursor-pointer transition-all duration-200",
          collapsed
            ? "mx-3 my-1 p-3 justify-center"
            : "mx-3 my-1 px-3 py-3",
          isActive
            ? "bg-base-content text-base-100 shadow-sm"
            : "text-base-content/60 hover:bg-base-300 hover:text-base-content"
        )}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-5 h-5 flex-shrink-0">
            <Icon size={19} />
          </span>
          {!collapsed && (
            <span className="text-[15px] font-semibold whitespace-nowrap">{name}</span>
          )}
        </div>
        {!collapsed && (
          <span className="opacity-40 ml-auto pl-2">
            {isOpen ? <FaChevronDown size={11} /> : <FaChevronRight size={11} />}
          </span>
        )}
      </div>

      {!collapsed && isOpen && (
        <ul className="ml-6 pl-3 border-l border-base-content/15 mt-1 mb-1 space-y-1">
          {children}
        </ul>
      )}

      <Tooltip label={name} collapsed={collapsed} />
    </li>
  );
};

/* ── Sidebar ── */
const SideBar = ({ collapsed, setCollapsed }) => {
  const expandedWidth = "w-[256px]";
  const collapsedWidth = "w-[88px]";
  const { logout, isLoggingOut } = useOptimisticLogout();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen flex flex-col z-[70]",
        "bg-base-200 text-base-content border-r border-base-content/10",
        "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-visible",
        collapsed ? collapsedWidth : expandedWidth
      )}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute right-0 top-13 translate-x-1/2 z-[80] flex h-6 w-6 items-center justify-center rounded-full bg-base-content text-base-100 shadow-md hover:opacity-90 transition"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <MdKeyboardArrowRight
          size={18}
          className={cn("transition-transform duration-300", collapsed ? "rotate-0" : "rotate-180")}
        />
      </button>

      {/* ── Header ── */}
      <div className={cn("border-b border-base-content/10", collapsed ? "px-2 py-3" : "px-2 py-3")}>
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <div className="h-9 w-9 rounded-sm bg-base-content/10 text-base-content flex items-center justify-center font-bold">
            <LiaConnectdevelop size={48} />
          </div>
          {!collapsed && (
            <div>
              <p className="text-2xl font-bold leading-none text-base-content">NeuroGen</p>
              <p className="text-xs text-base-content/55">Monitoring Suite</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Nav ── */}
      <ul className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        <SideBarGroup
          name="Genset"
          Icon={ImPowerCord}
          routes={["/engine", "/generator", "/mains"]}
          collapsed={collapsed}
        >
          <SideBarLink to="/engine"    name="Engine"    Icon={FaGears} collapsed={false} />
          <SideBarLink to="/generator" name="Generator" Icon={FaPlug}  collapsed={false} />
          <SideBarLink to="/mains"     name="Mains"     Icon={FaPlug}  collapsed={false} />
        </SideBarGroup>

        <SideBarLink to="/live-data"     name="Live Data"  Icon={FaFileAlt}         collapsed={collapsed} />
        <SideBarLink to="/anomalies-old" name="Anomalies"  Icon={RiAlertFill}       collapsed={collapsed} />
        <SideBarLink to="/reports"       name="Reports"    Icon={TbReportAnalytics} collapsed={collapsed} />
        <SideBarLink to="/alarms"        name="Alarms"     Icon={FaBell}            collapsed={collapsed} />

        <SideBarLink to="/predictive-maintenance" name="Maintenance" Icon={GiAutoRepair} collapsed={collapsed} />
        <SideBarLink to="/rul"     name="RUL"     Icon={GiLifeBar} collapsed={collapsed} />
        <SideBarLink to="/archive" name="Archive" Icon={RxArchive} collapsed={collapsed} />
      </ul>

      {/* ── Footer ── */}
      <div className="px-3 py-3 border-t border-base-content/10 flex-shrink-0">
        <button
          type="button"
          onClick={logout}
          disabled={isLoggingOut}
          className={cn(
            "w-full rounded-xl transition-all duration-200",
            "text-base-content/70 hover:bg-base-300 hover:text-base-content",
            isLoggingOut && "pointer-events-none opacity-50",
            collapsed ? "p-3 flex items-center justify-center" : "px-3 py-3 flex items-center gap-3"
          )}
        >
          <FiLogOut size={18} />
          {!collapsed && <span className="text-[15px] font-semibold">{isLoggingOut ? "Logging out..." : "Logout"}</span>}
        </button>

      </div>
    </aside>
  );
};

export default SideBar;