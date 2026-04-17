import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import transmitConnection from "../lib/TransmitConnection";
import { TransmitChannels } from "../lib/TransmitChannels";

export const RealtimeProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const archiveSub = transmitConnection.subscription(TransmitChannels.ARCHIVE);
    const notifSub = transmitConnection.subscription(TransmitChannels.NOTIFICATION);
    const pdmSub = transmitConnection.subscription(TransmitChannels.PDM);

    (async () => {
      await archiveSub.create();
      await notifSub.create();
      await pdmSub.create();
    })();

    const unsub1 = archiveSub.onMessage(() => {
      queryClient.invalidateQueries({ queryKey: ["archive"] });
    });
    // ✅ FIX: Only invalidate the lightweight count query (50 bytes), NOT the full summary (500kB).
    // The full summary is fetched only when the user opens the notification dropdown.
    const unsub2 = notifSub.onMessage(() => {
      // notifications-count is NOT invalidated here — it self-polls every 10s.
      // Invalidating it from SSE would cause the SAME spam bug as notifications-summary.
    });

    const unsub3 = pdmSub.onMessage(() => {
      queryClient.invalidateQueries({ queryKey: ["pdm"] });
      // notifications-count is NOT invalidated here — it self-polls every 10s.
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [queryClient]);

  return children;
};