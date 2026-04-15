import React from "react";
import MasterPage from "@/Components/MasterDash/MasterPage";
import { companyAPI } from "@/Api/MasterApi/masterAPI";

const columns = [
    { key: "code", label: "Code" },
    { key: "name", label: "Company Name" },
    { key: "phone", label: "Phone" },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    { key: "website", label: "Website" },
];

const formFields = [
    { name: "code", label: "Company Code", type: "text", placeholder: "e.g. CMP001" },
    { name: "name", label: "Company Name", type: "text", placeholder: "Acme Corp" },
    { name: "phone", label: "Phone", type: "tel", placeholder: "+1 234 567 890" },
    { name: "mobile", label: "Mobile", type: "tel", placeholder: "+1 987 654 321" },
    { name: "email", label: "Email", type: "email", placeholder: "contact@company.com" },
    { name: "website", label: "Website", type: "text", placeholder: "https://www.company.com" },
    { name: "address", label: "Address", type: "textarea", placeholder: "Enter full address..." },
    { name: "logo", label: "Company Logo", type: "file", accept: "image/*" },
];

const Company = () => (
    <MasterPage
        title="Company Directory"
        api={companyAPI}
        columns={columns}
        formFields={formFields}
        searchKey="name"
    />
);

export default Company;
