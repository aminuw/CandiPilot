"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Application } from "@/lib/types";
import { Loader2, Sparkles, Copy, Check, Mail, Lock, Zap } from "lucide-react";

// Tone options for AI generation
type ToneType = "formal" | "neutral" | "short";

const TONE_OPTIONS: { value: ToneType; label: string; description: string }[] = [
    { value: "formal", label: "Formel", description: "Ton soutenu et professionnel" },
    { value: "neutral", label: "Neutre", description: "Équilibré, adapté à tous" },
    { value: "short", label: "Court", description: "Très bref, va droit au but" },
];

const MAX_FREE_FOLLOWUPS = 5;

interface AIFollowupProps {
    application: Application;
    isPro?: boolean;
    initialRemaining?: number;
}

export function AIFollowup({ application, isPro = false, initialRemaining }: AIFollowupProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [followupEmail, setFollowupEmail] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [tone, setTone] = useState<ToneType>("neutral");
    const [remaining, setRemaining] = useState<number>(initialRemaining ?? MAX_FREE_FOLLOWUPS);
    const [limitReached, setLimitReached] = useState(false);

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
                    tone: tone,
                }),
            });

            const data = await response.json();

            if (data.error === "AI_LIMIT_REACHED") {
                setLimitReached(true);
                setRemaining(0);
                setError(data.message);
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || "Erreur lors de la génération");
            }

            setFollowupEmail(data.email);
            if (typeof data.remaining === "number") {
                setRemaining(data.remaining);
            }
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

    // Feature 3: Send email via mailto:
    const sendEmail = () => {
        if (!followupEmail) return;

        // Parse subject and body from generated email
        const lines = followupEmail.split("\n");
        let subject = "";
        let body = followupEmail;

        // Try to extract "Objet :" line
        const subjectLine = lines.find(line => line.toLowerCase().startsWith("objet"));
        if (subjectLine) {
            subject = subjectLine.replace(/^objet\s*:\s*/i, "").trim();
            body = lines.filter(line => !line.toLowerCase().startsWith("objet")).join("\n").trim();
        }

        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Try multiple methods to open email client
        try {
            // Method 1: Create a hidden link and click it
            const link = document.createElement("a");
            link.href = mailtoUrl;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch {
            // Method 2: Fallback to window.location
            window.location.href = mailtoUrl;
        }

        // Copy to clipboard as backup
        navigator.clipboard.writeText(followupEmail).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-indigo-400" />
                        Relance IA
                    </CardTitle>
                    {/* Usage counter */}
                    <div className="flex items-center gap-1 text-sm">
                        <Zap className="h-4 w-4" />
                        {isPro ? (
                            <span className="text-green-400 font-medium">Illimité</span>
                        ) : (
                            <span className={remaining <= 1 ? "text-amber-400" : "text-slate-400"}>
                                {remaining}/{MAX_FREE_FOLLOWUPS}
                            </span>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {!followupEmail ? (
                    <div className="text-center py-4">
                        <p className="text-slate-400 mb-4">
                            Génère un email de relance professionnel adapté à ta candidature
                        </p>

                        {/* Tone selector */}
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

                        <Button onClick={generateFollowup} disabled={loading || (limitReached && !isPro)}>
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Générer une relance
                        </Button>

                        {/* Limit reached message for Free users */}
                        {limitReached && !isPro && (
                            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                <p className="text-amber-400 text-sm mb-2">
                                    Tu as utilisé tes 5 relances gratuites ce mois.
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => router.push("/billing")}
                                    className="text-amber-400 border-amber-500/30"
                                >
                                    Passe en Pro pour l&apos;illimité
                                </Button>
                            </div>
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

                        {/* Feature 3: Send Email Button (Pro only) */}
                        <div className="mt-3">
                            {isPro ? (
                                <Button
                                    onClick={sendEmail}
                                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400"
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Envoyer par email
                                </Button>
                            ) : (
                                <Button
                                    disabled
                                    variant="outline"
                                    className="w-full opacity-60 cursor-not-allowed"
                                    onClick={() => router.push("/billing")}
                                    title="Réservé aux comptes Pro"
                                >
                                    <Lock className="h-4 w-4 mr-2" />
                                    Envoyer par email
                                    <span className="ml-2 text-xs text-amber-400">(Pro)</span>
                                </Button>
                            )}
                            {!isPro && (
                                <p className="text-center text-xs text-slate-500 mt-2">
                                    <button
                                        onClick={() => router.push("/billing")}
                                        className="text-amber-400 hover:underline"
                                    >
                                        Passe en Pro
                                    </button>
                                    {" "}pour envoyer directement par email
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
