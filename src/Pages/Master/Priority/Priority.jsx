import React from "react";
import MasterPage from "@/Components/MasterDash/MasterPage";
import { priorityAPI } from "@/Api/MasterApi/masterAPI";

const STATUS_OPTIONS = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
];

const columns = [
    { key: "name", label: "Priority Name" },
    {
        key: "color", label: "Color",
        render: (row) => (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 4, background: row.color || "#000", border: "1px solid #e2e8f0" }} />
                {row.color || "-"}
            </div>
        )
    },
    { key: "status", label: "Status" },
];

const formFields = [
    { name: "name", label: "Priority Name", type: "text", placeholder: "e.g. High" },
    { name: "color", label: "Color", type: "color", default: "#000000" },
    { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, default: "Active" },
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
