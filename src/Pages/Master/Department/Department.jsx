import React from "react";
import MasterPage from "@/Components/MasterDash/MasterPage";
import { departmentAPI } from "@/Api/MasterApi/masterAPI";

const columns = [
    { key: "name", label: "Department Name" },
    { key: "description", label: "Description" },
];

const formFields = [
    { name: "name", label: "Department Name", type: "text", placeholder: "Enter department name" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Enter description" },
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
