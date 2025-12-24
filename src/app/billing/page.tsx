import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/lib/types";
import { PRO_PRICE_MONTHLY } from "@/lib/constants";
import { Check, Crown, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CheckoutButton } from "./checkout-button";

export default async function BillingPage() {
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

    const features = [
        "Candidatures illimitées",
        "Relances IA personnalisées illimitées",
        "Statistiques détaillées",
        "Export CSV de tes données",
        "Support prioritaire par email",
        "Accès anticipé aux nouvelles fonctionnalités",
    ];

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar user={user} />

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour au dashboard
                </Link>

                {user.subscription_status === "pro" ? (
                    /* Already Pro */
                    <Card className="border-green-500/30 bg-green-500/5">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                <Check className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-2xl">Tu es Pro ! 🎉</CardTitle>
                            <CardDescription className="text-base">
                                Merci pour ton soutien. Tu as accès à toutes les fonctionnalités.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-slate-400 mb-4">
                                Pour gérer ton abonnement, contacte-nous à support@candipilot.fr
                            </p>
                            <Link href="/dashboard">
                                <Button>Retour au dashboard</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    /* Upgrade to Pro */
                    <Card>
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <Crown className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-3xl">CandiPilot Pro</CardTitle>
                            <CardDescription className="text-base">
                                Débloque tout le potentiel de ta recherche de stage
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Price */}
                            <div className="text-center my-6">
                                <div className="text-5xl font-bold text-slate-100">
                                    {PRO_PRICE_MONTHLY}€
                                    <span className="text-xl font-normal text-slate-400">/mois</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-2">
                                    Sans engagement, annule quand tu veux
                                </p>
                            </div>

                            {/* Features */}
                            <div className="space-y-3 mb-8">
                                {features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-slate-300">
                                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="h-3 w-3 text-green-400" />
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            {/* Checkout button */}
                            <CheckoutButton userEmail={user.email} />

                            <p className="text-center text-xs text-slate-500 mt-4">
                                Paiement sécurisé par Stripe. Factures disponibles.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
