import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "URL required" }, { status: 400 });
        }

        // Fetch the URL
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; CandiPilot/1.0)",
            },
        });

        if (!response.ok) {
            return NextResponse.json({ company: "", role: "" });
        }

        const html = await response.text();

        // Extract metadata from HTML
        let company = "";
        let role = "";

        // Try og:site_name for company
        const siteNameMatch = html.match(/<meta[^>]*property="og:site_name"[^>]*content="([^"]*)"[^>]*>/i);
        if (siteNameMatch) {
            company = siteNameMatch[1];
        }

        // Try og:title for role
        const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
        if (ogTitleMatch) {
            role = ogTitleMatch[1];
        }

        // Fallback to <title> for role if no og:title
        if (!role) {
            const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
            if (titleMatch) {
                role = titleMatch[1].trim();

                // Try to extract company from title if not already found
                // Common patterns: "Role at Company" or "Role - Company"
                if (!company) {
                    const atMatch = role.match(/(.+?)\s+(?:at|chez|@)\s+(.+?)(?:\s*[|\-–]|$)/i);
                    const dashMatch = role.match(/(.+?)\s*[|\-–]\s*(.+?)(?:\s*[|\-–]|$)/i);

                    if (atMatch) {
                        role = atMatch[1].trim();
                        company = atMatch[2].trim();
                    } else if (dashMatch) {
                        role = dashMatch[1].trim();
                        company = dashMatch[2].trim();
                    }
                }
            }
        }

        // Clean up
        company = company.replace(/\s+/g, " ").trim().slice(0, 100);
        role = role.replace(/\s+/g, " ").trim().slice(0, 200);

        return NextResponse.json({ company, role });
    } catch (error) {
        console.error("Metadata fetch error:", error);
        return NextResponse.json({ company: "", role: "" });
    }
}
