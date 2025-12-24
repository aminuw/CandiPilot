"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Lock } from "lucide-react";

interface ExportCSVButtonProps {
    isPro: boolean;
}

export function ExportCSVButton({ isPro }: ExportCSVButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        if (!isPro) {
            router.push("/billing");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/export/csv");

            if (!response.ok) {
                const data = await response.json();
                if (data.error === "PRO_REQUIRED") {
                    router.push("/billing");
                    return;
                }
                throw new Error(data.message || "Erreur lors de l'export");
            }

            // Download the file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `candipilot_export_${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Export error:", error);
            alert("Erreur lors de l'export. Réessaie plus tard.");
        } finally {
            setLoading(false);
        }
    };

    if (!isPro) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/billing")}
                className="opacity-60"
                title="Réservé aux comptes Pro"
            >
                <Lock className="h-4 w-4 mr-2" />
                Export CSV
                <span className="ml-1 text-xs text-amber-400">(Pro)</span>
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
                <Download className="h-4 w-4 mr-2" />
            )}
            Export CSV
        </Button>
    );
}
