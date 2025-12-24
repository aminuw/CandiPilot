import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { NewPageClient } from "./client";

export default async function NewPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar user={null} />
            <NewPageClient userId={user.id} />
        </div>
    );
}
