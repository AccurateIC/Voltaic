// /src/components/Layout.jsx
import Navbar from "./Navbar";
import SideBar from "./SideBar";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div
        className="flex flex-1 overflow-hidden"
        style={{ backgroundColor: "rgba(48, 48, 48, 1)" }}
      >
        <SideBar />

        {/* Content Slot */}
        <div className="flex-1 p-4 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
