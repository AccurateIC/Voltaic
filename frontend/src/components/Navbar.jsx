// /src/components/Navbar.jsx
import Profile from "./Profile";
// import ThemeSwitcher from "./ThemeSwitcher";

const Navbar = () => {
  return (
    <>
      <div className="navbar bg-base-200">
        <div className="flex-1"><a className="btn btn-ghost text-2xl">AccurateIC</a></div>
        <div className="space-x-3">
          {/* <ThemeSwitcher size={32} /> */}
          <Profile />
        </div>
      </div>
    </>
  );
};

export default Navbar;
