import { NavLink } from "react-router";
import { FaTachometerAlt, FaCog, FaPlug, FaFileAlt } from 'react-icons/fa';

const SideBar = () => {
  return (
<ul
      className="menu w-56"
      style={{ backgroundColor: "rgba(177, 213, 189, 1)" }}
    >
      <li>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "active bg-base-content text-base-300" : ""
          }
          end
        >
          <FaTachometerAlt className="mr-2" /> Dashboard
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/engine"
          className={({ isActive }) =>
            isActive ? "active bg-base-content text-base-300" : ""
          }
          end
        >
          <FaCog className="mr-2" /> Engine
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
          <FaPlug className="mr-2" /> Generator
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
          <FaFileAlt className="mr-2" /> Reports
        </NavLink>
      </li>
      {/* <li>
        <NavLink
          to="/maintenance"
          className={({ isActive }) =>
            isActive ? "active bg-base-content text-base-300" : ""
          }
          end
        >
          Predictive Maintenance
        </NavLink>
      </li> */}
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
