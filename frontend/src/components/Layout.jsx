import Navbar from "./Navbar";
import SideBar from "./SideBar";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 min-h-0" style={{ backgroundColor: "rgba(48, 48, 48, 1)" }}>
        <SideBar />
        <div className="flex-1 p-4 min-h-0 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
