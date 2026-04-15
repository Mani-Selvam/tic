import React from "react";
import MasterPage from "@/Components/MasterDash/MasterPage";
import { companyAPI } from "@/Api/MasterApi/masterAPI";

const columns = [
    { key: "name", label: "Company Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
];

const formFields = [
    { name: "name", label: "Company Name", type: "text", placeholder: "Enter company name" },
    { name: "email", label: "Email", type: "email", placeholder: "Enter email address" },
    { name: "phone", label: "Phone", type: "tel", placeholder: "Enter phone number" },
    { name: "address", label: "Address", type: "textarea", placeholder: "Enter address" },
];

const Company = () => (
    <MasterPage
        title="Company Master"
        api={companyAPI}
        columns={columns}
        formFields={formFields}
        searchKey="name"
    />
);

export default Company;
