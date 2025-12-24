import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MAX_FREE_APPLICATIONS } from "@/lib/constants";

export async function GET() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user subscription status
    const { data: userProfile } = await supabase
        .from("users")
        .select("subscription_status")
        .eq("id", user.id)
        .single();

    // Count applications
    const { count } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

    const applicationCount = count || 0;
    const isPro = userProfile?.subscription_status === "pro";
    const canCreate = isPro || applicationCount < MAX_FREE_APPLICATIONS;

    return NextResponse.json({
        count: applicationCount,
        limit: MAX_FREE_APPLICATIONS,
        canCreate,
        isPro,
    });
}
