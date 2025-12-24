import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { KanbanBoard } from "@/components/kanban-board";
import { StatsOverview, StatusBreakdown } from "@/components/stats-overview";
import { ExportCSVButton } from "@/components/export-csv-button";
import { Button } from "@/components/ui/button";
import { Application, User } from "@/lib/types";
import { MAX_FREE_APPLICATIONS } from "@/lib/constants";
import Link from "next/link";
import { Plus, Inbox } from "lucide-react";

export default async function DashboardPage() {
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

    // Fetch applications
    const { data: applications } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

    const user: User = userProfile || {
        id: authUser.id,
        email: authUser.email || "",
        subscription_status: "free",
        created_at: new Date().toISOString(),
    };

    const apps: Application[] = applications || [];
    const remainingFree = MAX_FREE_APPLICATIONS - apps.length;

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar user={user} />

            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
                        <p className="text-slate-400">
                            {apps.length === 0
                                ? "Commence par ajouter ta première candidature !"
                                : `${apps.length} candidature${apps.length > 1 ? "s" : ""} en cours`}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {user.subscription_status === "free" && (
                            <span className="text-sm text-slate-500">
                                {remainingFree > 0
                                    ? `${remainingFree} gratuites restantes`
                                    : "Limite atteinte"}
                            </span>
                        )}
                        <ExportCSVButton isPro={user.subscription_status === "pro"} />
                        <Link href="/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Nouvelle candidature
                            </Button>
                        </Link>
                    </div>
                </div>

                {apps.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6">
                            <Inbox className="h-10 w-10 text-slate-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-200 mb-2">
                            Aucune candidature
                        </h2>
                        <p className="text-slate-400 mb-6 max-w-md">
                            Ajoute ta première candidature pour commencer à tracker ta recherche de stage.
                        </p>
                        <Link href="/new">
                            <Button size="lg">
                                <Plus className="h-5 w-5 mr-2" />
                                Ajouter une candidature
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="mb-8">
                            <StatsOverview applications={apps} />
                        </div>

                        {/* Kanban Board */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-slate-200 mb-4">
                                Mes candidatures
                            </h2>
                            <KanbanBoard applications={apps} />
                        </div>

                        {/* Status breakdown on mobile */}
                        <div className="lg:hidden">
                            <StatusBreakdown applications={apps} />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
