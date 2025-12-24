"use client";

import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MAX_FREE_APPLICATIONS, PRO_PRICE_MONTHLY } from "@/lib/constants";
import { Crown, Check, Sparkles } from "lucide-react";

interface PaywallDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PaywallDialog({ open, onOpenChange }: PaywallDialogProps) {
    const router = useRouter();

    const features = [
        "Candidatures illimitées",
        "Relances IA personnalisées",
        "Statistiques avancées",
        "Export des données",
        "Support prioritaire",
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Crown className="h-8 w-8 text-white" />
                    </div>
                    <DialogTitle className="text-2xl">
                        Passe à CandiPilot Pro !
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Tu as atteint la limite de {MAX_FREE_APPLICATIONS} candidatures gratuites.
                        Débloque tout avec Pro !
                    </DialogDescription>
                </DialogHeader>

                <div className="my-6 space-y-3">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-slate-300">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <Check className="h-3 w-3 text-green-400" />
                            </div>
                            {feature}
                        </div>
                    ))}
                </div>

                <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-slate-100">
                        {PRO_PRICE_MONTHLY}€
                        <span className="text-lg font-normal text-slate-400">/mois</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        Annule quand tu veux
                    </p>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-col">
                    <Button
                        onClick={() => router.push("/billing")}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25"
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Devenir Pro
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="w-full"
                    >
                        Plus tard
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
