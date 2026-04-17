import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/Components/Login/AuthContext";
import { ProtectedRoute } from "@/Components/Login/ProtectedRoute";
import Login from "@/Components/Login/Login";
import Layout from "@/Layout";
import Dashboard from "@/Pages/Dashboard/Dashboard";
import Company from "@/Pages/Master/Company/Company";
import Priority from "@/Pages/Master/Priority/Priority";
import Designation from "@/Pages/Master/Designation/Designation";
import Department from "@/Pages/Master/Department/Department";
import TicketStatus from "@/Pages/Master/TicketStatus/TicketStatus";
import User from "@/Pages/Master/User/User";
import TicketList from "@/Components/TicketDash/TicketList";
import CreateTicket from "@/Components/TicketDash/CreateTicket";
import Worker from "@/Components/TicketDash/WorkerAnalysisPage";
import MaterialApproved from "@/Components/TicketDash/MaterialApprovedPage";
import ClosedTicket from "@/Components/TicketDash/ClosedTicket";
import ShowTicket from "@/Components/TicketDash/ShowTicket";

const App = () => (
    <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                    <Route index element={<Dashboard />} />
                    <Route path="master/company" element={<Company />} />
                    <Route path="master/priority" element={<Priority />} />
                    <Route
                        path="master/designation"
                        element={<Designation />}
                    />
                    <Route path="master/department" element={<Department />} />
                    <Route
                        path="master/ticket-status"
                        element={<TicketStatus />}
                    />
                    <Route path="master/user" element={<User />} />
                    <Route path="ticket/ticket" element={<TicketList />} />
                    <Route
                        path="ticket/create-ticket"
                        element={<CreateTicket />}
                    />
                    <Route path="ticket/worker" element={<Worker />} />
                    <Route
                        path="ticket/material-approved"
                        element={<MaterialApproved />}
                    />
                    <Route path="ticket/closed" element={<ClosedTicket />} />
                    <Route path="ticket/show-ticket" element={<ShowTicket />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </AuthProvider>
    </BrowserRouter>
);

export default App;
