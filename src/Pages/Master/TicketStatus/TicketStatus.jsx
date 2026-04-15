import React from "react";
import MasterPage from "@/Components/MasterDash/MasterPage";
import { ticketStatusAPI } from "@/Api/MasterApi/masterAPI";

const columns = [
    { key: "name", label: "Status Name" },
    { key: "description", label: "Description" },
];

const formFields = [
    { name: "name", label: "Status Name", type: "text", placeholder: "e.g. Open, Closed, In Progress" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Enter description" },
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
