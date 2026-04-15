import React from "react";
import MasterPage from "@/Components/MasterDash/MasterPage";
import { designationAPI } from "@/Api/MasterApi/masterAPI";

const columns = [
    { key: "name", label: "Designation" },
    { key: "description", label: "Description" },
];

const formFields = [
    { name: "name", label: "Designation Name", type: "text", placeholder: "Enter designation name" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Enter description" },
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
