import { useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const useCurrentUser = () => {
    const { setUser, setLoading } = useAuth();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get("/users/current-user");

                if (res.data.success) {
                    setUser(res.data.user);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};

export default useCurrentUser;