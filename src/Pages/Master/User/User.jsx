import React from "react";
import MasterPage from "@/Components/MasterDash/MasterPage";
import { userAPI } from "@/Api/MasterApi/masterAPI";

const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "mobile", label: "Mobile" },
    { key: "role", label: "Role" },
];

const formFields = [
    { name: "name", label: "Full Name", type: "text", placeholder: "Enter full name" },
    { name: "email", label: "Email", type: "email", placeholder: "Enter email address" },
    { name: "mobile", label: "Mobile", type: "tel", placeholder: "Enter mobile number" },
    { name: "password", label: "Password", type: "password", placeholder: "Enter password" },
    { name: "role", label: "Role", type: "select", options: [
        { value: "admin", label: "Admin" },
        { value: "user", label: "User" },
        { value: "worker", label: "Worker" },
    ]},
];

const User = () => (
    <MasterPage
        title="User Master"
        api={userAPI}
        columns={columns}
        formFields={formFields}
        searchKey="name"
    />
);

export default User;
