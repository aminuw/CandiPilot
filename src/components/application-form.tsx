"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/constants";
import { Loader2, Link2, Sparkles } from "lucide-react";

interface ApplicationFormProps {
    userId: string;
    onLimitReached?: () => void;
}

export function ApplicationForm({ userId, onLimitReached }: ApplicationFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingUrl, setFetchingUrl] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        company: "",
        role: "",
        url: "",
        status: "todo" as ApplicationStatus,
        notes: "",
    });

    const supabase = createClient();

    const fetchUrlMetadata = async () => {
        if (!formData.url) return;

        setFetchingUrl(true);
        try {
            const response = await fetch("/api/fetch-metadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: formData.url }),
            });

            if (response.ok) {
                const data = await response.json();
                setFormData((prev) => ({
                    ...prev,
                    company: data.company || prev.company,
                    role: data.role || prev.role,
                }));
            }
        } catch {
            // Silently fail - user can fill manually
        } finally {
            setFetchingUrl(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // First check application count
            const countResponse = await fetch("/api/applications/count");
            const { count, canCreate } = await countResponse.json();

            if (!canCreate) {
                onLimitReached?.();
                setLoading(false);
                return;
            }

            const { error: insertError } = await supabase
                .from("applications")
                .insert({
                    user_id: userId,
                    company: formData.company,
                    role: formData.role,
                    url: formData.url || null,
                    status: formData.status,
                    notes: formData.notes || null,
                    applied_at: formData.status !== "todo" ? new Date().toISOString() : null,
                });

            if (insertError) throw insertError;

            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de la création");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                    Nouvelle candidature
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* URL with auto-fill */}
                    <div className="space-y-2">
                        <Label htmlFor="url">URL de l&apos;offre (optionnel)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="url"
                                type="url"
                                placeholder="https://example.com/job/..."
                                value={formData.url}
                                onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={fetchUrlMetadata}
                                disabled={fetchingUrl || !formData.url}
                            >
                                {fetchingUrl ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Link2 className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500">
                            Collez l&apos;URL et cliquez pour auto-remplir
                        </p>
                    </div>

                    {/* Company */}
                    <div className="space-y-2">
                        <Label htmlFor="company">Entreprise *</Label>
                        <Input
                            id="company"
                            placeholder="Google, Apple, StartupXY..."
                            value={formData.company}
                            onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                            required
                        />
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <Label htmlFor="role">Poste *</Label>
                        <Input
                            id="role"
                            placeholder="Stage développeur fullstack..."
                            value={formData.role}
                            onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                            required
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label>Statut</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: ApplicationStatus) =>
                                setFormData((prev) => ({ ...prev, status: value }))
                            }
                        >
                            <SelectTrigger>
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

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Ajoutez des notes sur cette candidature..."
                            value={formData.notes}
                            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.back()}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Créer
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
