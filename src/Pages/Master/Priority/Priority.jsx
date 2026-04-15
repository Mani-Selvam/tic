import React from "react";
import MasterPage from "@/Components/MasterDash/MasterPage";
import { priorityAPI } from "@/Api/MasterApi/masterAPI";

const columns = [
    { key: "name", label: "Priority Name" },
    { key: "description", label: "Description" },
];

const formFields = [
    { name: "name", label: "Priority Name", type: "text", placeholder: "e.g. High, Medium, Low" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Enter description" },
];

const Priority = () => (
    <MasterPage
        title="Priority Master"
        api={priorityAPI}
        columns={columns}
        formFields={formFields}
        searchKey="name"
    />
);

export default Priority;
