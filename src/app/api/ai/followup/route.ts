import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

// Constants
const MAX_FREE_FOLLOWUPS = 5;

// Tone-specific prompt configurations
const TONE_PROMPTS = {
    formal: {
        style: "très formel et soutenu, utilisant le vouvoiement systématiquement",
        maxWords: 180,
    },
    neutral: {
        style: "professionnel mais accessible, adapté à un étudiant",
        maxWords: 150,
    },
    short: {
        style: "très court et direct, allant droit à l'essentiel",
        maxWords: 80,
    },
};

export async function POST(request: NextRequest) {
    try {
        const { company, role, appliedAt, tone = "neutral" } = await request.json();

        if (!company || !role) {
            return NextResponse.json(
                { error: "Company and role are required" },
                { status: 400 }
            );
        }

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { error: "Groq API key not configured" },
                { status: 500 }
            );
        }

        // Get authenticated user and check limits
        const supabase = await createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user profile with subscription status and AI usage
        const { data: userProfile } = await supabase
            .from("users")
            .select("subscription_status, ai_followups_count, ai_followups_reset_at")
            .eq("id", authUser.id)
            .single();

        const isPro = userProfile?.subscription_status === "pro";
        let currentCount = userProfile?.ai_followups_count || 0;
        const resetAt = userProfile?.ai_followups_reset_at ? new Date(userProfile.ai_followups_reset_at) : new Date();

        // Check if we need to reset the counter (new month)
        const now = new Date();
        const monthDiff = (now.getFullYear() - resetAt.getFullYear()) * 12 + (now.getMonth() - resetAt.getMonth());

        if (monthDiff >= 1) {
            // Reset counter for new month
            currentCount = 0;
            await supabase
                .from("users")
                .update({ ai_followups_count: 0, ai_followups_reset_at: now.toISOString() })
                .eq("id", authUser.id);
        }

        // Check limit for free users
        if (!isPro && currentCount >= MAX_FREE_FOLLOWUPS) {
            return NextResponse.json(
                {
                    error: "AI_LIMIT_REACHED",
                    message: "Tu as atteint ta limite de 5 relances gratuites ce mois.",
                    remaining: 0,
                    limit: MAX_FREE_FOLLOWUPS,
                    isPro: false
                },
                { status: 403 }
            );
        }

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        const appliedDate = appliedAt
            ? new Date(appliedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
            })
            : "récemment";

        const toneConfig = TONE_PROMPTS[tone as keyof typeof TONE_PROMPTS] || TONE_PROMPTS.neutral;

        const prompt = `Tu es un assistant carrière français expert en rédaction d'emails professionnels.

Génère un email de relance pour une candidature de stage avec ces informations :
- Entreprise : ${company}
- Poste : ${role}
- Date de candidature : ${appliedDate}

Règles :
1. Ton ${toneConfig.style}
2. Maximum ${toneConfig.maxWords} mots
3. Montre ta motivation et ta curiosité pour le poste
4. Demande poliment des nouvelles de ta candidature
5. Ne pas être insistant ou désespéré
6. Format : Objet + Corps de l'email + Signature "[Votre nom]"

Réponds uniquement avec l'email, sans commentaires.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 500,
        });

        const email = chatCompletion.choices[0]?.message?.content || "";

        // Increment counter for free users
        if (!isPro) {
            await supabase
                .from("users")
                .update({ ai_followups_count: currentCount + 1 })
                .eq("id", authUser.id);
        }

        // Calculate remaining
        const remaining = isPro ? -1 : MAX_FREE_FOLLOWUPS - (currentCount + 1);

        return NextResponse.json({
            email,
            remaining,
            limit: MAX_FREE_FOLLOWUPS,
            isPro
        });
    } catch (error) {
        console.error("AI followup error:", error);
        return NextResponse.json(
            { error: "Failed to generate followup email" },
            { status: 500 }
        );
    }
}
