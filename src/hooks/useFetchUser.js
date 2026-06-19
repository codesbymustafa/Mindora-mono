import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const useFetchUser = (userId) => {
    const { api } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }
            // If userId is already an object (populated), use it
            if (typeof userId === 'object') {
                setUserData(userId);
                setLoading(false);
                return;
            }

            try {
                const res = await api.get(`/users/u/${userId}`);
                setUserData(res.data.data);
            } catch (error) {
                console.error(`Error fetching user ${userId}`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId, api]);

    return { userData, loading };
};

export default useFetchUser;
