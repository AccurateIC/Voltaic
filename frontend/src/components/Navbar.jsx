import { useEffect, useState } from "react";
import { CiBellOn } from "react-icons/ci";
import ThemeSwitcher from "./ThemeSwitcher";
import Profile from "./Profile";
import Logo from "../assets/accurate.svg";
import { Transmit } from "@adonisjs/transmit-client";
import { TransmitChannels } from "../lib/TransmitChannels.js";
import { toast } from "sonner";

const Navbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch initial notifications
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
        setNotifications(unreadNotifications);
      } catch (error) {
        toast.error("Error fetching notifications");
      }
    };

    fetchNotifications();
  }, []);

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    if (notifications.length === 0) {
      toast.info("No new notifications");
      setShowNotifications(false);
    } else {
      setShowNotifications(!showNotifications);
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    const transmit = new Transmit({ baseUrl: import.meta.env.VITE_ADONIS_BACKEND });
    const notificationSubscription = transmit.subscription(TransmitChannels.NOTIFICATION);

    (async () => {
      await notificationSubscription.create();
      console.log("Subscribed to notification channel");
    })();

    const notificationUnsubscribe = notificationSubscription.onMessage(async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/notification/getAll`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!response.ok) throw new Error("Fetch failed");
        const data = await response.json();
        const unreadNotifications = data.filter((element) => element.shouldBeDisplayed === 1);
        setNotifications(unreadNotifications);
      } catch (error) {
        toast.error("Error updating notifications");
      }
    });

    return () => {
      notificationUnsubscribe();
      console.log("Unsubscribed from notification channel");
    };
  }, []);

  return (
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

      <div className="flex items-center space-x-3">
        {/* Notifications Dropdown */}
        <div className={`dropdown dropdown-end ${showNotifications ? "dropdown-open" : ""}`}>
          <button onClick={toggleNotifications} className="btn btn-ghost rounded-field relative">
            <CiBellOn size={38} color="black" />
            {notifications.length > 0 && (
              <div className="badge badge-xs badge-primary absolute -top-1 -right-1">{notifications.length}</div>
            )}
          </button>

          {/* Dropdown Content */}
          {showNotifications && notifications.length > 0 && (
            <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-box z-50 mt-4 w-64 p-2 shadow-lg">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`bg-error/20 hover:bg-error/40 p-2 text-base-content rounded duration-200 transition-all`}>
                  <div className="text-xl font-bold">{notification.summary}</div>
                  <div className="text-sm">{notification.message}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ThemeSwitcher size={32} />
        <Profile />
      </div>
    </div>
  );
};

export default Navbar;
