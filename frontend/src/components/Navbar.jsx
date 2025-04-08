import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { CiBellOn } from "react-icons/ci";
import Profile from "./Profile";
import Logo from "../assets/accurate.svg";
import { TransmitChannels } from "../lib/TransmitChannels.js";
import { toast } from "sonner";
import { useMessageBus } from "../lib/MessageBus.js";
import transmitConnection from "../lib/TransmitConnection";

const Navbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const archiveMessageBus = useMessageBus("archive");
  const notificationMessageBus = useMessageBus("notification");
  const pdmMessageBus = useMessageBus("pdm");


  const formatTimestamp = (timestamp) => {
    if (!timestamp) return;
    const dt = DateTime.fromISO(timestamp);
    return dt.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
  };


  // fetch initial notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/notification/getAll`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      const unreadNotifications = data.filter((element) => element.shouldBeDisplayed === true);
      setNotifications(unreadNotifications);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching notifications");
    }
  };
  useEffect(() => {
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
    const transmit = transmitConnection;
    const notificationSubscription = transmit.subscription(TransmitChannels.NOTIFICATION);
    const archiveSubscription = transmit.subscription(TransmitChannels.ARCHIVE);
    const pdmSubscription = transmit.subscription(TransmitChannels.PDM);

    (async () => {
      await notificationSubscription.create();
      console.log("Subscribed to notification channel");
      await archiveSubscription.create();
      console.log("Subscribed to archive channel");
      await pdmSubscription.create();
      console.log("Subscribed to pdm channel");
    })();

    const notificationUnsubscribe = notificationSubscription.onMessage(async () => {
      try {
        console.log("new notificationssss");
        const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/notification/getAll`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!response.ok) throw new Error("Fetch failed");
        const data = await response.json();
        const unreadNotifications = data.filter((element) => element.shouldBeDisplayed === true);
        setNotifications(unreadNotifications);
        notificationMessageBus({ time: Date.now(), message: "data inserted in notification table" });
      } catch (error) {
        console.error(error);
        toast.error("Error updating notifications");
      }
    });

    const archiveUnsubscribe = archiveSubscription.onMessage(async () => {
      try {
        archiveMessageBus({ time: Date.now(), message: "data inserted in archive table" });
      } catch (error) {
        console.error(error);
        toast.error("Error updating archive");
      }
    });

    const pdmUnsubscribe = pdmSubscription.onMessage(async (message) => {
      try {
        console.log("::::new pdm data:::", message);
        localStorage.setItem("pdmData", JSON.stringify(message));
        console.log("pdm data stored to local storage");
        pdmMessageBus({ time: Date.now(), message: "new pdm data recieved" });
      } catch (err) {
        console.error(err);
      }
    });

    return () => {
      notificationUnsubscribe();
      console.log("Unsubscribed from notification channel");
      archiveUnsubscribe();
      console.log("Unsubscribed from archive channel");
      pdmUnsubscribe();
      console.log("Unsubscribed from pdm channel");
    };
  }, [archiveMessageBus, notificationMessageBus, pdmMessageBus]);


  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      // make req to backend to mark notification as read
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/notification/read/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || `Failed to resolve notification`);
        return;
      }


      // Send message on the notification bus to inform other components
      notificationMessageBus({
        time: Date.now(),
        message: "notification marked as read",
        notificationId: notificationId
      });

      // re fetch notifications?
      fetchNotifications();
    } catch (err) {
      console.error("Error resolving notification:", err);
      toast.error(`Failed to resolve notification: ${err.message}`);
    }
  };




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
                  <div key={notification.id} className="flex flex-row justify-between bg-error/20 hover:bg-error/40 p-4 rounded transition-all">
                    <div>
                      <h3 className="text-lg font-semibold break-words">{notification.summary}</h3>
                      <p className="text-sm mt-1 break-words">{notification.message}</p>
                      <p className="text-sm mt-1">Started At: {formatTimestamp(notification.startedAt)}</p>
                    </div>
                    <div className="flex items-center">
                      {notification.shouldBeDisplayed &&
                        <button className="btn btn-primary btn-outline btn-sm"
                          onClick={() => handleMarkNotificationAsRead(notification.id)}
                        >Resolve</button>
                      }
                    </div>
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
