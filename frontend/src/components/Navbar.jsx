import { useEffect, useState } from "react";
import { CiBellOn } from "react-icons/ci";
import ThemeSwitcher from "./ThemeSwitcher";
import Profile from "./Profile";
import Logo from "../assets/accurate.svg";
import { Transmit } from "@adonisjs/transmit-client";
import { TransmitChannels } from "../lib/TransmitChannels.js";
import { toast } from "sonner";
import { useMessageBus } from "../lib/MessageBus.js";

const Navbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const archiveMessageBus = useMessageBus("archive");

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
        console.error(error);
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
    const archiveSubscription = transmit.subscription(TransmitChannels.ARCHIVE);

    (async () => {
      await notificationSubscription.create();
      console.log("Subscribed to notification channel");
      await archiveSubscription.create();
      console.log("Subscribed to archive channel");
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
        console.error(error);
        toast.error("Error updating notifications");
      }
    });

    const archiveUnsubscribe = archiveSubscription.onMessage(async () => {
      try {
        console.log(":::::::::::archive data inserted:::::::::");
        archiveMessageBus({ time: Date.now(), message: "data inserted in archive table" });
      } catch (error) {
        console.error(error);
        toast.error("Error updating archive");
      }
    });

    return () => {
      notificationUnsubscribe();
      console.log("Unsubscribed from notification channel");
      archiveUnsubscribe();
      console.log("Unsubscribed from archive channel");
    };
  }, [archiveMessageBus]);

  return (
    <nav className="bg-[rgba(177,213,189,1)] px-4 py-2 flex justify-between items-center">
      <div className="">
        <img src={Logo} alt="AccurateIC Logo" className="w-40" />
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative">
          <button onClick={toggleNotifications} className="btn btn-ghost rounded-field relative">
            <CiBellOn size={38} color="black" />
            {notifications.length > 0 && (
              <div className="badge badge-xs badge-primary absolute -top-1 -right-1">{notifications.length}</div>
            )}
          </button>

          {showNotifications && notifications.length > 0 && (
            <div className="absolute right-0 mt-4 w-96 max-h-[32vh] overflow-y-auto rounded-lg shadow-lg bg-base-200 z-50">
              <div className="p-2 space-y-2 text-base-content">
                {notifications.map((notification) => (
                  <div key={notification.id} className="bg-error/20 hover:bg-error/40 p-4 rounded transition-all">
                    <h3 className="text-lg font-semibold break-words">{notification.summary}</h3>
                    <p className="text-sm mt-1 break-words">{notification.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/*
        <ThemeSwitcher size={32} />
      */}
        <Profile />
      </div>
    </nav>
  );
};

export default Navbar;
