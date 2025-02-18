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
import Logo from "../assets/accurate.svg";
import { Transmit } from "@adonisjs/transmit-client";
import { TransmitChannels } from "../lib/TransmitChannels.js";
import { toast } from "sonner";

const Navbar = () => {
  // get notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // initial fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/notification/getAll`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        const unreadNotifications = data.filter((element) => element.shouldBeDisplayed === 1);
        setNotifications(unreadNotifications); // Store filtered data
      } catch (error) {
        toast.error("Error fetching notifications");
      }
    };

    fetchNotifications();
  }, []);

  // show - hide notification pop out
  const toggleNotifications = () => {
    if (notifications.length === 0) {
      toast.info("No new notifications");
      return;
    } else {
      setShowNotifications(!showNotifications);
      return;
    }
  };

  useEffect(() => {
    const transmit = new Transmit({ baseUrl: import.meta.env.VITE_ADONIS_BACKEND });

    const notificationSubscription = transmit.subscription(TransmitChannels.NOTIFICATION);
    (async () => {
      await notificationSubscription.create();
      console.log("subscribed to notification channel");
    })();

    // on message on the notification channel, use this callback
    const notificationUnsubscribe = notificationSubscription.onMessage(async (message) => {
      // fetch all notifications
      // TODO: fetch a sub-set of notifications instead of fetching all notifications
      //       maybe we could just fetch unread notifications? that should be good enough
      console.log(`${import.meta.env.VITE_ADONIS_BACKEND}/notification/getAll`);
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/notification/getAll`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) toast.error(`Error fetching notifications`);
      const data = await response.json();

      // TODO: when we start receiving just the unread notifications from the backend,
      // we can skip the filtering inside javascript
      const unreadNotifications = data.filter((element) => element.shouldBeDisplayed === 1);
      for (const notif of unreadNotifications) {
        console.log(notif.shouldBeDisplayed === 1);
        console.log(notif);
      }
      console.log("notification message: ", message);
      setNotifications(unreadNotifications);
    });

    return () => {
      notificationUnsubscribe();
      console.log("unsubscribed from notification channel");
    };
  }, []);

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
        <div className="absolute top-12 right-0 bg-base-100 border border-gray-300 shadow-md w-60 max-h-60 overflow-y-auto z-10">
          <ul className="p-2">
            {notifications.map((notification) => (
              <li key={notification.id} className="p-2 border-b text-sm text-base-content">
                {notification.summary}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar;
