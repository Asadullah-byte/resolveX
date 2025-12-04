// hooks/useChatSocket.js
import { io } from "socket.io-client";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";

let socket;

const useChatSocket = (assignmentId, onMessage) => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user || !assignmentId) return;

    if (!socket) {
      socket = io("http://localhost:3001");
    }

    socket.emit("join", user.id); // join personal room
    socket.emit("join", assignmentId); // join assignment chat room

    socket.on("chat:message", (data) => {
      onMessage(data);
      toast.success("New chat message");
    });
    

    return () => {
      socket.off("chat:message");
      socket.emit("leave", assignmentId);
    };
  }, [user, assignmentId, onMessage]);
};

export default useChatSocket;
