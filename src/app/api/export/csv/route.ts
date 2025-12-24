import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is Pro
        const { data: userProfile } = await supabase
            .from("users")
            .select("subscription_status")
            .eq("id", authUser.id)
            .single();

        if (userProfile?.subscription_status !== "pro") {
            return NextResponse.json(
                { error: "PRO_REQUIRED", message: "L'export CSV est réservé aux comptes Pro." },
                { status: 403 }
            );
        }

        // Get all applications for the user
        const { data: applications, error } = await supabase
            .from("applications")
            .select("company, role, status, applied_at, notes, url, created_at")
            .eq("user_id", authUser.id)
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        // Status labels in French
        const statusLabels: Record<string, string> = {
            todo: "À postuler",
            applied: "Candidature envoyée",
            followup: "Relance envoyée",
            interview: "Entretien",
            offer: "Offre reçue",
            rejected: "Refusé",
        };

        // Generate CSV content
        const headers = ["Entreprise", "Poste", "Statut", "Date candidature", "URL", "Notes", "Créé le"];

        const rows = applications?.map(app => [
            `"${(app.company || "").replace(/"/g, '""')}"`,
            `"${(app.role || "").replace(/"/g, '""')}"`,
            `"${statusLabels[app.status] || app.status}"`,
            app.applied_at ? new Date(app.applied_at).toLocaleDateString("fr-FR") : "",
            `"${(app.url || "").replace(/"/g, '""')}"`,
            `"${(app.notes || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
            new Date(app.created_at).toLocaleDateString("fr-FR"),
        ]) || [];

        const csvContent = [
            headers.join(";"),
            ...rows.map(row => row.join(";"))
        ].join("\n");

        // Add BOM for Excel compatibility
        const bom = "\uFEFF";
        const csvWithBom = bom + csvContent;

        // Return CSV file
        return new NextResponse(csvWithBom, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="candipilot_export_${new Date().toISOString().split("T")[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error("CSV export error:", error);
        return NextResponse.json(
            { error: "Failed to export CSV" },
            { status: 500 }
        );
    }
}
