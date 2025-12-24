"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Application } from "@/lib/types";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";

// Feature 3: Tone options for AI generation
type ToneType = "formal" | "neutral" | "short";

const TONE_OPTIONS: { value: ToneType; label: string; description: string }[] = [
    { value: "formal", label: "Formel", description: "Ton soutenu et professionnel" },
    { value: "neutral", label: "Neutre", description: "Équilibré, adapté à tous" },
    { value: "short", label: "Court", description: "Très bref, va droit au but" },
];

interface AIFollowupProps {
    application: Application;
}

export function AIFollowup({ application }: AIFollowupProps) {
    const [loading, setLoading] = useState(false);
    const [followupEmail, setFollowupEmail] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [tone, setTone] = useState<ToneType>("neutral");

    const generateFollowup = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/ai/followup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    company: application.company,
                    role: application.role,
                    appliedAt: application.applied_at,
                    tone: tone, // Feature 3: Pass tone to API
                }),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la génération");
            }

            const data = await response.json();
            setFollowupEmail(data.email);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!followupEmail) return;
        await navigator.clipboard.writeText(followupEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                    Relance IA
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!followupEmail ? (
                    <div className="text-center py-4">
                        <p className="text-slate-400 mb-4">
                            Génère un email de relance professionnel adapté à ta candidature
                        </p>

                        {/* Feature 3: Tone selector */}
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                            {TONE_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setTone(option.value)}
                                    className={`px-3 py-2 rounded-lg border text-sm transition-all ${tone === option.value
                                            ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                                            : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                                        }`}
                                >
                                    <span className="font-medium">{option.label}</span>
                                    <span className="hidden sm:inline text-xs ml-1 opacity-70">
                                        - {option.description}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <Button onClick={generateFollowup} disabled={loading}>
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Générer une relance
                        </Button>
                        {error && (
                            <p className="text-red-400 text-sm mt-3">{error}</p>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="relative">
                            <div className="bg-slate-800/50 rounded-lg p-4 max-h-80 overflow-y-auto">
                                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">
                                    {followupEmail}
                                </pre>
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="absolute top-2 right-2"
                                onClick={copyToClipboard}
                            >
                                {copied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setFollowupEmail(null)}
                                className="flex-1"
                            >
                                Regénérer
                            </Button>
                            <Button onClick={copyToClipboard} className="flex-1">
                                {copied ? "Copié !" : "Copier l'email"}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
