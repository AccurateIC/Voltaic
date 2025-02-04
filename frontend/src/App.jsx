// src/App.jsx
import { useEffect } from "react";
import { Transmit } from "@adonisjs/transmit-client";

const App = () => {
  useEffect(() => {
    const transmit = new Transmit({ baseUrl: "http://localhost:3333" });

    const subscription = transmit.subscription("global");
    (async () => {
      await subscription.create();
    })();
    const unsubscribe = subscription.onMessage((message) => {
      console.log("sse message: ", message);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* <div className="skeleton h-32 w-full"></div>
      <div className="skeleton h-4 w-28"></div>
      <div className="skeleton h-4 w-full"></div>
      <div className="skeleton h-4 w-full"></div> */}
    </div>
  );
};

export default App;
