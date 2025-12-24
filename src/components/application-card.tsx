"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Application } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";
import { Building2, Calendar, ExternalLink, GripVertical } from "lucide-react";

interface ApplicationCardProps {
    application: Application;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: application.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`p-4 cursor-pointer hover:border-indigo-500/50 transition-all duration-200 group ${isDragging ? "shadow-2xl ring-2 ring-indigo-500" : ""
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Drag handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="mt-1 p-1 rounded hover:bg-slate-800 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <GripVertical className="h-4 w-4 text-slate-500" />
                </button>

                <Link
                    href={`/app/${application.id}`}
                    className="flex-1 min-w-0"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <h3 className="font-semibold text-slate-100 truncate">
                            {application.company}
                        </h3>
                        {application.url && (
                            <ExternalLink className="h-3 w-3 text-slate-500 flex-shrink-0" />
                        )}
                    </div>

                    <p className="text-sm text-slate-400 truncate mb-3">
                        {application.role}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                        <Badge variant={application.status}>
                            {application.status === "todo" && "À faire"}
                            {application.status === "applied" && "Postulé"}
                            {application.status === "followup" && "Relance"}
                            {application.status === "interview" && "Entretien"}
                            {application.status === "offer" && "Offre"}
                            {application.status === "rejected" && "Refusé"}
                        </Badge>

                        {application.applied_at && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Calendar className="h-3 w-3" />
                                {formatRelativeDate(application.applied_at)}
                            </div>
                        )}
                    </div>
                </Link>
            </div>
        </Card>
    );
}

// Non-draggable version for detail page
export function ApplicationCardStatic({ application }: ApplicationCardProps) {
    return (
        <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-6 w-6 text-indigo-400" />
                <h2 className="text-2xl font-bold text-slate-100">
                    {application.company}
                </h2>
                {application.url && (
                    <a
                        href={application.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300"
                    >
                        <ExternalLink className="h-5 w-5" />
                    </a>
                )}
            </div>

            <p className="text-lg text-slate-300 mb-4">{application.role}</p>

            <div className="flex items-center gap-4 text-sm text-slate-400">
                <Badge variant={application.status} className="text-sm">
                    {application.status === "todo" && "À faire"}
                    {application.status === "applied" && "Postulé"}
                    {application.status === "followup" && "Relance"}
                    {application.status === "interview" && "Entretien"}
                    {application.status === "offer" && "Offre"}
                    {application.status === "rejected" && "Refusé"}
                </Badge>

                {application.applied_at && (
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Postulé {formatRelativeDate(application.applied_at)}
                    </div>
                )}
            </div>

            {application.notes && (
                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                    <p className="text-slate-300 whitespace-pre-wrap">{application.notes}</p>
                </div>
            )}
        </Card>
    );
}
