import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// Feature 3: Tone-specific prompt configurations
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

        // Feature 3: Get tone-specific settings
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

        return NextResponse.json({ email });
    } catch (error) {
        console.error("AI followup error:", error);
        return NextResponse.json(
            { error: "Failed to generate followup email" },
            { status: 500 }
        );
    }
}
