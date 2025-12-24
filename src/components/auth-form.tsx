"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type AuthMode = "login" | "signup";

export function AuthForm() {
    const [mode, setMode] = useState<AuthMode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === "signup") {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/dashboard`,
                    },
                });
                if (error) throw error;

                // Si la session existe, l'utilisateur est auto-connecté (email confirmation désactivé)
                if (data.session) {
                    window.location.href = "/dashboard";
                } else {
                    setMessage("Vérifiez votre email pour confirmer votre inscription !");
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                // Redirect will be handled by middleware
                window.location.href = "/dashboard";
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                    {mode === "login" ? "Connexion" : "Créer un compte"}
                </CardTitle>
                <CardDescription>
                    {mode === "login"
                        ? "Connectez-vous pour suivre vos candidatures"
                        : "Commencez à tracker vos candidatures gratuitement"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="votre@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                            {message}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === "login" ? "Se connecter" : "S'inscrire"}
                    </Button>

                    <p className="text-center text-sm text-slate-400">
                        {mode === "login" ? (
                            <>
                                Pas encore de compte ?{" "}
                                <button
                                    type="button"
                                    onClick={() => setMode("signup")}
                                    className="text-indigo-400 hover:underline font-medium"
                                >
                                    S&apos;inscrire
                                </button>
                            </>
                        ) : (
                            <>
                                Déjà un compte ?{" "}
                                <button
                                    type="button"
                                    onClick={() => setMode("login")}
                                    className="text-indigo-400 hover:underline font-medium"
                                >
                                    Se connecter
                                </button>
                            </>
                        )}
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}
