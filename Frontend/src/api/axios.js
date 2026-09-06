import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.PROD
        ? "/api"
        : import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

export default api;