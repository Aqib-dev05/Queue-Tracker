"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { api, SOCKET_URL } from "./api";

// Live queue numbers: { nowServing, lastIssued, waiting }.
// The server pushes every change over a socket. A refetch every 2 minutes
// is only a safety net (e.g. the day rolls over, or the socket was offline).
export function useQueueStatus() {
  const [status, setStatus] = useState(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const refetch = () =>
      api
        .queueStatus()
        .then((data) => setStatus(data.status))
        .catch(() => {});

    refetch();
    const timer = setInterval(refetch, 120000);

    const socket = io(SOCKET_URL);
    socket.on("connect", () => setLive(true));
    socket.on("disconnect", () => setLive(false));
    socket.on("queue:update", setStatus);

    return () => {
      clearInterval(timer);
      socket.disconnect();
    };
  }, []);

  return { status, live };
}
