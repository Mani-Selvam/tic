import React from "react";
import MasterPage from "@/Components/MasterDash/MasterPage";
import { designationAPI } from "@/Api/MasterApi/masterAPI";

const STATUS_OPTIONS = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
];

const columns = [
    { key: "name", label: "Designation" },
    { key: "status", label: "Status" },
];

const formFields = [
    { name: "name", label: "Designation Name", type: "text", placeholder: "Enter designation name" },
    { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, default: "Active" },
];

const Designation = () => (
    <MasterPage
        title="Designation Master"
        api={designationAPI}
        columns={columns}
        formFields={formFields}
        searchKey="name"
    />
);

export default Designation;
