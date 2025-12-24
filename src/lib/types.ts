import { ApplicationStatus } from "./constants";

export interface User {
    id: string;
    email: string;
    subscription_status: "free" | "pro";
    stripe_customer_id?: string;
    created_at: string;
}

export interface Application {
    id: string;
    user_id: string;
    company: string;
    role: string;
    url?: string;
    status: ApplicationStatus;
    applied_at?: string;
    last_contact_at?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateApplicationInput {
    company: string;
    role: string;
    url?: string;
    status?: ApplicationStatus;
    notes?: string;
}

export interface UpdateApplicationInput {
    company?: string;
    role?: string;
    url?: string;
    status?: ApplicationStatus;
    applied_at?: string;
    last_contact_at?: string;
    notes?: string;
}
