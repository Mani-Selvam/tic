import React from "react";
import MasterPage from "@/Components/MasterDash/MasterPage";
import { departmentAPI } from "@/Api/MasterApi/masterAPI";

const STATUS_OPTIONS = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
];

const columns = [
    { key: "name", label: "Department Name" },
    { key: "status", label: "Status" },
];

const formFields = [
    { name: "name", label: "Department Name", type: "text", placeholder: "Engineering" },
    { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, default: "Active" },
];

const Department = () => (
    <MasterPage
        title="Department Master"
        api={departmentAPI}
        columns={columns}
        formFields={formFields}
        searchKey="name"
    />
);

export default Department;
