import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, isAuthenticated, logoutUser } from "@/Components/Login/loginAPI";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const user = getCurrentUser();
        const authenticated = isAuthenticated();
        if (user && authenticated) {
            setUser(user);
            setIsAuth(true);
        }
        setLoading(false);
    }, []);

    const logout = () => {
        logoutUser();
        setUser(null);
        setIsAuth(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuth, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
