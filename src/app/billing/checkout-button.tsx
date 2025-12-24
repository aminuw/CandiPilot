"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

interface CheckoutButtonProps {
    userEmail: string;
}

export function CheckoutButton({ userEmail }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail }),
            });

            const { url, error } = await response.json();

            if (error) {
                alert(error);
                return;
            }

            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Erreur lors du checkout. Réessaye plus tard.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleCheckout}
            disabled={loading}
            size="lg"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25"
        >
            {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
                <Sparkles className="h-5 w-5 mr-2" />
            )}
            Passer à Pro
        </Button>
    );
}
