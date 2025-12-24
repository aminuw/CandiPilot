"use client";

import { useState } from "react";
import Link from "next/link";
import { ApplicationForm } from "@/components/application-form";
import { PaywallDialog } from "@/components/paywall-dialog";
import { ArrowLeft } from "lucide-react";

interface NewPageClientProps {
    userId: string;
}

export function NewPageClient({ userId }: NewPageClientProps) {
    const [showPaywall, setShowPaywall] = useState(false);

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour au dashboard
                </Link>

                <ApplicationForm
                    userId={userId}
                    onLimitReached={() => setShowPaywall(true)}
                />
            </div>

            <PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} />
        </>
    );
}
