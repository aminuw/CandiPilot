"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Rocket, CreditCard } from "lucide-react";
import { User } from "@/lib/types";

interface NavbarProps {
    user: User | null;
}

export function Navbar({ user }: NavbarProps) {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg">
            <div className="container flex h-16 items-center justify-between px-4 mx-auto">
                <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
                    <Rocket className="h-6 w-6 text-indigo-400" />
                    <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        CandiPilot
                    </span>
                </Link>

                {user && (
                    <nav className="flex items-center gap-2">
                        <Link href="/new">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Nouvelle candidature</span>
                                <span className="sm:hidden">Nouvelle</span>
                            </Button>
                        </Link>

                        {user.subscription_status === "free" && (
                            <Link href="/billing">
                                <Button variant="outline" size="sm" className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10">
                                    <CreditCard className="h-4 w-4 mr-1" />
                                    <span className="hidden sm:inline">Pro</span>
                                </Button>
                            </Link>
                        )}

                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </nav>
                )}
            </div>
        </header>
    );
}
