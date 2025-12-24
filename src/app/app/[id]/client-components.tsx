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
import { Loader2, Trash2, Check, Save } from "lucide-react";

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

// Feature 1: Notes Editor Component
interface NotesEditorProps {
    applicationId: string;
    initialNotes: string | null | undefined;
}

export function NotesEditor({ applicationId, initialNotes }: NotesEditorProps) {
    const router = useRouter();
    const supabase = createClient();
    const [notes, setNotes] = useState(initialNotes || "");
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        setSaved(false);
        try {
            await supabase
                .from("applications")
                .update({ notes })
                .eq("id", applicationId);

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            router.refresh();
        } catch (error) {
            console.error("Failed to save notes:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <h3 className="font-medium text-slate-200 mb-3">Notes</h3>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoute tes notes sur cette candidature..."
                className="w-full h-32 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center gap-2 mt-3">
                <Button onClick={handleSave} disabled={loading} size="sm">
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : saved ? (
                        <Check className="h-4 w-4 mr-2" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    {saved ? "Sauvegardé !" : "Sauvegarder"}
                </Button>
            </div>
        </div>
    );
}

