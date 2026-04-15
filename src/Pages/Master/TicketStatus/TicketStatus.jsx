import React from "react";
import MasterPage from "@/Components/MasterDash/MasterPage";
import { ticketStatusAPI } from "@/Api/MasterApi/masterAPI";

const STATUS_OPTIONS = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
];

const columns = [
    { key: "name", label: "Ticket Status Name" },
    { key: "sortOrder", label: "Sort Order" },
    { key: "status", label: "Status" },
];

const formFields = [
    { name: "name", label: "Ticket Status Name", type: "text", placeholder: "e.g. Open, In Progress, Closed" },
    { name: "sortOrder", label: "Sort Order", type: "number", placeholder: "1" },
    { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, default: "Active" },
];

const TicketStatus = () => (
    <MasterPage
        title="Ticket Status Master"
        api={ticketStatusAPI}
        columns={columns}
        formFields={formFields}
        searchKey="name"
    />
);

export default TicketStatus;
