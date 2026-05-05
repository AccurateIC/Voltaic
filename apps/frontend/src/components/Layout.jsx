import Navbar from "./Navbar";
import SideBar from "./SideBar";
import { Outlet } from "react-router";
import { useState } from "react";
import { cn } from "../lib/Utils";
const Layout = () => {
const [collapsed, setCollapsed] = useState(false);

const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen bg-base-300 overflow-hidden">
     <SideBar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div
  className={cn(
  "h-screen flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
  "ml-0",
  collapsed ? "lg:ml-[88px]" : "lg:ml-[256px]"
)}
      >
       <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-3 md:px-5 pt-3 pb-3 md:pb-5 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
