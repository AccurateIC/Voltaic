import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import transmitConnection from "../lib/TransmitConnection";
import { TransmitChannels } from "../lib/TransmitChannels";
import { messageBus } from "../lib/MessageBus";

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
      messageBus.publish(TransmitChannels.ARCHIVE, { source: "sse" });
      queryClient.invalidateQueries({ queryKey: ["archive"] });
    });
    const unsub2 = notifSub.onMessage(() => {
  messageBus.publish(TransmitChannels.NOTIFICATION, { source: "sse" });
  // Navbar handles invalidation via useMessageBus(NOTIFICATION)
});

    const unsub3 = pdmSub.onMessage(() => {
      messageBus.publish(TransmitChannels.PDM, { source: "sse" });
      queryClient.invalidateQueries({ queryKey: ["pdm"] });
      // notifications-count is handled by Navbar's own useMessageBus(PDM) listener
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [queryClient]);

  return children;
};