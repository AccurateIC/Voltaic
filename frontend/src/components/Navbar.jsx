// // /src/components/Navbar.jsx
// import Profile from "./Profile";
// import ThemeSwitcher from "./ThemeSwitcher";
// import { CiBellOn } from "react-icons/ci"; // Bell icon from react-icons

// const Navbar = () => {
//   return (
//     <>
//       <div className="navbar bg-base-200">
//         <div className="flex-1">
//           <a className="btn btn-ghost text-2xl">AccurateIC</a>
//         </div>
//         <div className="space-x-3">
//           <div>
//             <div
//               className="relative cursor-pointer"
//               onClick={""}
//               style={{ position: "absolute", right: "100px", marginTop:"2px", marginRight:"10px" }}
//             >
//               <CiBellOn size={38} color="black" />
//               {10 > 0 && (
//                 <div
//                   className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex justify-center items-center text-xs"
//                   style={{ fontSize: "12px" }}
//                 >
//                   {10}
//                 </div>
//               )}
//             </div>
//           </div>
//           <ThemeSwitcher size={32} />
//           <Profile />
//         </div>
//       </div>
//     </>
//   );
// };

// export default Navbar;
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addNotification,
  removeNotification,
} from "../redux/notificationSlice"; // Import actions
import Profile from "./Profile";
import ThemeSwitcher from "./ThemeSwitcher";
import { CiBellOn } from "react-icons/ci"; // Bell icon from react-icons

const Navbar = ({ l1IsAnomaly, l2IsAnomaly, l3IsAnomaly }) => {
  const dispatch = useDispatch();

  // Get notifications from Redux
  const notifications = useSelector(
    (state) => state.notifications.notifications
  );

  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Check for anomalies and add notifications if necessary
    if (l1IsAnomaly) {
      dispatch(
        addNotification({ id: "L1", message: "Anomaly detected in L1 phase!" })
      );
    } else {
      dispatch(removeNotification("L1"));
    }

    if (l2IsAnomaly) {
      dispatch(
        addNotification({ id: "L2", message: "Anomaly detected in L2 phase!" })
      );
    } else {
      dispatch(removeNotification("L2"));
    }

    if (l3IsAnomaly) {
      dispatch(
        addNotification({ id: "L3", message: "Anomaly detected in L3 phase!" })
      );
    } else {
      dispatch(removeNotification("L3"));
    }
  }, [l1IsAnomaly, l2IsAnomaly, l3IsAnomaly, dispatch]); // Re-run when anomalies change

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <>
      <div className="navbar bg-base-200">
        <div className="flex-1">
          <a className="btn btn-ghost text-2xl">AccurateIC</a>
        </div>
        <div className="space-x-3">
          <div>
            <div
              className="relative cursor-pointer"
              onClick={toggleNotifications}
              style={{
                position: "absolute",
                right: "100px",
                marginTop: "2px",
                marginRight: "10px",
              }}
            >
              <CiBellOn size={38} color="black" />
              {notifications.length > 0 && (
                <div
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex justify-center items-center text-xs"
                  style={{ fontSize: "12px" }}
                >
                  {notifications.length}
                </div>
              )}
            </div>
          </div>

          {/* Theme Switcher and Profile */}
          <ThemeSwitcher size={32} />
          <Profile />
        </div>
      </div>

      {/* Notification Dropdown */}
      {showNotifications && notifications.length > 0 && (
        <div
          className="absolute top-12 right-0 bg-white border border-gray-300 shadow-md w-60 max-h-60 overflow-y-auto"
          style={{ zIndex: 10 }}
        >
          <ul className="p-2">
            {notifications.map((notification) => (
              <li key={notification.id} className="p-2 border-b text-sm">
                {notification.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar;
