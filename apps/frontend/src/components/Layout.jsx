import Navbar from "./Navbar";
import SideBar from "./SideBar";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 min-h-0 bg-base-100">
        <SideBar />
        <main className="flex-1 p-4 overflow-y-auto min-w-0 bg-base-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
