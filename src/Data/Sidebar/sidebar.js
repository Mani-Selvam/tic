import { DashboardRoutes, MasterRoutes, TicketRoutes } from "@/Route/AuthRoutes";

export const sidebarConfig = [
    {
        name: "Dashboard",
        path: DashboardRoutes.MAIN_PAGE,
        iconClass: "icon-dashboard",
    },
    {
        type: "dropdown",
        title: "Master",
        name: "master",
        collapseId: "master",
        path: "/master",
        iconClass: "icon-master",
        children: [
            { name: "Company", path: MasterRoutes.COMPANY_MASTER_PAGE },
            { name: "Priority", path: MasterRoutes.PRIORITY_MASTER_PAGE },
            { name: "Designation", path: MasterRoutes.DESIGNATION_MASTER_PAGE },
            { name: "User", path: MasterRoutes.USER_MASTER_PAGE },
            { name: "Department", path: MasterRoutes.DEPARTMENT_MASTER_PAGE },
            { name: "Ticket Status", path: MasterRoutes.TICKET_STATUS_MASTER_PAGE },
        ],
    },
    {
        type: "dropdown",
        title: "Tickets",
        name: "ticket",
        collapseId: "ticket",
        path: "/ticket",
        iconClass: "icon-ticket",
        children: [
            { name: "Ticket List", path: TicketRoutes.TICKET_PAGE },
            { name: "Work Details", path: TicketRoutes.WORK_PAGE },
            { name: "Material Approved", path: TicketRoutes.MATERIAL_APPROVED_PAGE },
            { name: "Closed Ticket", path: TicketRoutes.CLOSED_PAGE },
        ],
    },
];
