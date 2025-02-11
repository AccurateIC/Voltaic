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

import { useEffect, useState } from "react";
import { CiBellOn } from "react-icons/ci";
import ThemeSwitcher from "./ThemeSwitcher";
import Profile from "./Profile";
import { useDispatch, useSelector } from "react-redux";
import Logo from "../assets/accurate.svg";
import { addNotification, removeNotification } from "../Redux/notificationSlice.js"; // Import actions

const Navbar = ({ l1IsAnomaly, l2IsAnomaly, l3IsAnomaly }) => {
  const dispatch = useDispatch();

  // Get notifications from Redux
  const notifications = useSelector((state) => state.notifications.notifications);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Check for anomalies and add notifications if necessary
    if (l1IsAnomaly) {
      dispatch(addNotification({ id: "L1", message: "Anomaly detected in L1 phase!" }));
    } else {
      dispatch(removeNotification("L1"));
    }

    if (l2IsAnomaly) {
      dispatch(addNotification({ id: "L2", message: "Anomaly detected in L2 phase!" }));
    } else {
      dispatch(removeNotification("L2"));
    }

    if (l3IsAnomaly) {
      dispatch(addNotification({ id: "L3", message: "Anomaly detected in L3 phase!" }));
    } else {
      dispatch(removeNotification("L3"));
    }
  }, [l1IsAnomaly, l2IsAnomaly, l3IsAnomaly, dispatch]); // Re-run when anomalies change

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <>
      <div
        className="navbar"
        style={{
          backgroundColor: "rgba(177, 213, 189, 1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
        }}>
        <div className="flex-1">
          <a className="btn btn-ghost">
            <img
              src={Logo}
              alt="AccurateIC Logo"
              style={{
                width: "150px",
                height: "auto",
                backgroundColor: "white",
                padding: "5px",
                borderRadius: "4px",
              }}
            />
          </a>
        </div>

        {/* <div className="flex gap-3 mr-[38rem] mt-6">
          <button
            className="btn btn-outline"
            style={{
              backgroundColor: "rgba(48, 48, 48, 1)",
              color: "white",
              fontWeight: "bold",
              border: "0px solid black",
              padding: "8px 16px",
            }}
            onClick={() => handlePageChange("Reports")}
            
          >
            <MdNotificationsActive className="mr-2 size-5 " /> FUEL LEVEL ALARM
          </button>
        </div> */}

        <div className="flex items-center space-x-3">
          <div className="relative cursor-pointer" onClick={toggleNotifications}>
            <CiBellOn size={38} color="black" />
            {notifications.length > 0 && (
              <div
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex justify-center items-center text-xs"
                style={{ fontSize: "12px" }}>
                {notifications.length}
              </div>
            )}
          </div>

          <ThemeSwitcher size={32} />
          <Profile />
        </div>
      </div>

      {showNotifications && notifications.length > 0 && (
        <div
          className="absolute top-12 right-0 bg-white border border-gray-300 shadow-md w-60 max-h-60 overflow-y-auto"
          style={{ zIndex: 10 }}>
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
