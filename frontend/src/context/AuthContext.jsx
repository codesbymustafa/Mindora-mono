import { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState(
        localStorage.getItem("accessToken")
    );
    const [theme, setTheme] = useState("light");

    const apiRef = useRef(null);
    if (!apiRef.current) {
        apiRef.current = axios.create({ baseURL: import.meta.env.VITE_API_URL });
        apiRef.current.interceptors.request.use((config) => {
            const token = localStorage.getItem("accessToken"); // Always fresh
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        });
    }
    const api = apiRef.current;

    useEffect(() => {
        // Initial Theme Check
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle(
                "dark",
                savedTheme === "dark"
            );
        } else {
            setTheme("light");
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const fetchCurrentUser = async () => {
        setLoading(true);
        try {
            const response = await api.get("/users/current-user");
            setUser(response.data.data);

            // Fetch theme preference
            try {
                const themeRes = await api.get("/users/theme");
                const isDark = themeRes.data.data.prefferedTheme === "dark"; // Fix typo to match API
                const newTheme = isDark ? "dark" : "light";
                setTheme(newTheme);
                localStorage.setItem("theme", newTheme);
                document.documentElement.classList.toggle(
                    "dark",
                    newTheme === "dark"
                );
            } catch (e) {
                console.log("Error fetching theme", e);
            }
        } catch (error) {
            console.error("Auth check failed", error);
            setAccessToken(null);
            localStorage.removeItem("accessToken");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchCurrentUser();
        } else {
            setLoading(false);
        }
    }, [accessToken]);

    const toggleTheme = async () => {
        const currentTheme = theme;
        const newTheme = currentTheme === "light" ? "dark" : "light";

        // Optimistic Update
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");

        try {
            await api.patch("/users/theme");
        } catch (error) {
            console.error("Error syncing theme with backend", error);
        }
    };

    const login = async (data) => {
        try {
            const response = await api.post("/users/login", data);
            const { accessToken: newAccessToken, user: userData } =
                response.data.data;
            setAccessToken(newAccessToken);
            localStorage.setItem("accessToken", newAccessToken);
            setUser(userData);
            toast.success("Logged in successfully");

            // Fetch theme after login
            try {
                const themeRes = await api.get("/users/theme");
                const isDark = themeRes.data.data.prefferedTheme === "dark"; // Fix typo to match API
                const newTheme = isDark ? "dark" : "light";
                setTheme(newTheme);
                localStorage.setItem("theme", newTheme);
                document.documentElement.classList.toggle(
                    "dark",
                    newTheme === "dark"
                );
            } catch (e) {
                console.log("Error fetching theme", e);
            }

            return true;
        } catch (error) {
            console.error("Login error", error);
            // Throw error to be handled by component
            throw error;
        }
    };

    const register = async (formData) => {
        try {
            await api.post("/users/register", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Registration successful! Please login.");
            return true;
        } catch (error) {
            console.error("Register error", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post("/users/logout");
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            setAccessToken(null);
            localStorage.removeItem("accessToken");
            setUser(null);
            toast.success("Logged out");
        }
    };

    const updateCoverImage = async (file) => {
        try {
            const formData = new FormData();
            formData.append("coverImage", file);
            const response = await api.patch("/users/cover-image", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setUser((prev) => ({
                ...prev,
                coverImage: response.data.data.coverImage,
            }));
            toast.success("Cover image updated");
        } catch (error) {
            toast.error("Failed to update cover image");
            throw error;
        }
    };

    // ✅ Fixed with useMemo
    const value = useMemo(() => ({
        user,
        loading,
        login,
        register,
        logout,
        updateCoverImage,
        theme,
        toggleTheme,
        api
    }), [user, loading, theme]); 

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
