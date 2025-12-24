"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/constants";
import { Loader2, Trash2 } from "lucide-react";

interface StatusSelectProps {
    applicationId: string;
    currentStatus: ApplicationStatus;
}

export function StatusSelect({ applicationId, currentStatus }: StatusSelectProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const handleStatusChange = async (newStatus: ApplicationStatus) => {
        if (newStatus === currentStatus) return;

        setLoading(true);
        try {
            await supabase
                .from("applications")
                .update({
                    status: newStatus,
                    applied_at: newStatus !== "todo" ? new Date().toISOString() : null,
                })
                .eq("id", applicationId);

            router.refresh();
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            <Select value={currentStatus} onValueChange={handleStatusChange} disabled={loading}>
                <SelectTrigger className="w-40">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(APPLICATION_STATUSES).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                            {label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

interface DeleteButtonProps {
    applicationId: string;
}

export function DeleteButton({ applicationId }: DeleteButtonProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Supprimer cette candidature ? Cette action est irréversible.")) {
            return;
        }

        setLoading(true);
        try {
            await supabase.from("applications").delete().eq("id", applicationId);
            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            console.error("Failed to delete:", error);
            setLoading(false);
        }
    };

    return (
        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
                <Trash2 className="h-4 w-4 mr-2" />
            )}
            Supprimer
        </Button>
    );
}
