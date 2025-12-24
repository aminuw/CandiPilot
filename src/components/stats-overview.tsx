import { Card, CardContent } from "@/components/ui/card";
import { Application } from "@/lib/types";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { TrendingUp, Send, Calendar, Trophy } from "lucide-react";

interface StatsOverviewProps {
    applications: Application[];
}

export function StatsOverview({ applications }: StatsOverviewProps) {
    const totalCount = applications.length;
    const appliedCount = applications.filter((a) => a.status !== "todo").length;
    const interviewCount = applications.filter((a) => a.status === "interview").length;
    const offerCount = applications.filter((a) => a.status === "offer").length;

    // Calculate success rate (offers / applications sent)
    const successRate = appliedCount > 0 ? Math.round((offerCount / appliedCount) * 100) : 0;

    const stats = [
        {
            label: "Total candidatures",
            value: totalCount,
            icon: Send,
            color: "text-blue-400",
            bg: "bg-blue-500/20",
        },
        {
            label: "Postulées",
            value: appliedCount,
            icon: Calendar,
            color: "text-indigo-400",
            bg: "bg-indigo-500/20",
        },
        {
            label: "Entretiens",
            value: interviewCount,
            icon: TrendingUp,
            color: "text-purple-400",
            bg: "bg-purple-500/20",
        },
        {
            label: "Offres reçues",
            value: offerCount,
            icon: Trophy,
            color: "text-amber-400",
            bg: "bg-amber-500/20",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <Card key={i}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
                                <p className="text-xs text-slate-400">{stat.label}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// Detailed stats breakdown by status
export function StatusBreakdown({ applications }: StatsOverviewProps) {
    const statusCounts = Object.keys(APPLICATION_STATUSES).map((status) => ({
        status: status as keyof typeof APPLICATION_STATUSES,
        count: applications.filter((a) => a.status === status).length,
        ...APPLICATION_STATUSES[status as keyof typeof APPLICATION_STATUSES],
    }));

    return (
        <Card>
            <CardContent className="p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Par statut</h3>
                <div className="space-y-2">
                    {statusCounts.map(({ status, count, label, color }) => (
                        <div key={status} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${color}`} />
                                <span className="text-sm text-slate-300">{label}</span>
                            </div>
                            <span className="text-sm font-medium text-slate-100">{count}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
