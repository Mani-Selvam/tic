import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/Components/Login/AuthContext";

export const ProtectedRoute = ({ children }) => {
    const { isAuth, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f0f4f8' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                    <p style={{ color: '#718096', fontSize: '14px' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    return children;
};
