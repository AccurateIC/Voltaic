// /src/components/SideBar.jsx
import { NavLink } from "react-router";

const SideBar = () => {
  return (
    <ul className="menu bg-base-200 w-56 ">
      {/* <li>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "active bg-base-content text-base-300" : ""
          }
          end
        >
          Dashboard
        </NavLink>
      </li> */}
      <li>
        <NavLink
          to="/engine"
          className={({ isActive }) =>
            isActive ? "active bg-base-content text-base-300" : ""
          }
          end
        >
          Engine
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/generator"
          className={({ isActive }) =>
            isActive ? "active bg-base-content text-base-300" : ""
          }
          end
        >
          Generator
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            isActive ? "active bg-base-content text-base-300" : ""
          }
          end
        >
          Reports
        </NavLink>
      </li>
      {/* <li>
        <details open>
          <summary>Parent</summary>
          <ul>
            <li>
              <NavLink
                to="/testchart"
                className={({ isActive }) =>
                  isActive ? "active bg-base-content text-base-300" : ""
                }
                end
              >
                TestChart
              </NavLink>
            </li>
            <li>
              <a>Submenu 1</a>
            </li>
            <li>
              <a>Submenu 2</a>
            </li>
            <li>
              <details open>
                <summary>Parent</summary>
                <ul>
                  <li>
                    <a>Submenu 2</a>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </details>
      </li> */}
      {/* <li>
        <a>Item 3</a>
      </li> */}
    </ul>
  );
};

export default SideBar;
