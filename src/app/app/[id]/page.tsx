import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { ApplicationCardStatic } from "@/components/application-card";
import { AIFollowup } from "@/components/ai-followup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/constants";
import { Application, User } from "@/lib/types";
import { ArrowLeft, Trash2 } from "lucide-react";
import { DeleteButton, StatusSelect, NotesEditor } from "./client-components";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
        redirect("/");
    }

    // Fetch user profile
    const { data: userProfile } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

    const user: User = userProfile || {
        id: authUser.id,
        email: authUser.email || "",
        subscription_status: "free",
        created_at: new Date().toISOString(),
    };

    // Fetch application
    const { data: application, error } = await supabase
        .from("applications")
        .select("*")
        .eq("id", id)
        .eq("user_id", authUser.id)
        .single();

    if (error || !application) {
        notFound();
    }

    const app = application as Application;

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar user={user} />

            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour au dashboard
                </Link>

                <div className="space-y-6">
                    {/* Application details */}
                    <ApplicationCardStatic application={app} />

                    {/* Status change */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div>
                            <h3 className="font-medium text-slate-200 mb-1">Changer le statut</h3>
                            <p className="text-sm text-slate-400">
                                Déplace cette candidature vers une autre étape
                            </p>
                        </div>
                        <StatusSelect applicationId={app.id} currentStatus={app.status} />
                    </div>

                    {/* Notes Editor */}
                    <NotesEditor applicationId={app.id} initialNotes={app.notes} />

                    {/* AI Followup */}
                    <AIFollowup application={app} isPro={user.subscription_status === "pro"} />

                    {/* Danger zone */}
                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <h3 className="font-medium text-red-400 mb-2">Zone de danger</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Supprimer définitivement cette candidature
                        </p>
                        <DeleteButton applicationId={app.id} />
                    </div>
                </div>
            </main>
        </div>
    );
}
