import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const socket = io(backendUrl.replace("/api", ""), {
    withCredentials: true,
});

export default socket;