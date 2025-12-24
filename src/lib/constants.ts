export const MAX_FREE_APPLICATIONS = 20;
export const PRO_PRICE_MONTHLY = 5.99;

export const APPLICATION_STATUSES = {
    todo: { label: "À faire", color: "bg-slate-500" },
    applied: { label: "Postulé", color: "bg-blue-500" },
    followup: { label: "Relance", color: "bg-yellow-500" },
    interview: { label: "Entretien", color: "bg-purple-500" },
    offer: { label: "Offre", color: "bg-green-500" },
    rejected: { label: "Refusé", color: "bg-red-500" },
} as const;

export type ApplicationStatus = keyof typeof APPLICATION_STATUSES;

export const KANBAN_COLUMNS: ApplicationStatus[] = [
    "todo",
    "applied",
    "followup",
    "interview",
    "offer",
    "rejected",
];
