"use client";

import { useState } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createClient } from "@/lib/supabase/client";
import { ApplicationCard } from "@/components/application-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Application } from "@/lib/types";
import { APPLICATION_STATUSES, KANBAN_COLUMNS, type ApplicationStatus } from "@/lib/constants";
import { useDroppable } from "@dnd-kit/core";

interface KanbanBoardProps {
    applications: Application[];
}

function KanbanColumn({
    status,
    applications,
}: {
    status: ApplicationStatus;
    applications: Application[];
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    const statusConfig = APPLICATION_STATUSES[status];

    return (
        <div
            ref={setNodeRef}
            className={`flex-shrink-0 w-80 md:w-72 transition-all duration-200 ${isOver ? "scale-[1.02]" : ""
                }`}
        >
            <Card className={`h-full ${isOver ? "ring-2 ring-indigo-500" : ""}`}>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
                            {statusConfig.label}
                        </div>
                        <span className="text-slate-500 text-sm font-normal">
                            {applications.length}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pb-4">
                    <SortableContext
                        items={applications.map((a) => a.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {applications.length === 0 ? (
                            <p className="text-center text-slate-500 text-sm py-8">
                                Aucune candidature
                            </p>
                        ) : (
                            applications.map((app) => (
                                <ApplicationCard key={app.id} application={app} />
                            ))
                        )}
                    </SortableContext>
                </CardContent>
            </Card>
        </div>
    );
}

export function KanbanBoard({ applications: initialApps }: KanbanBoardProps) {
    const [applications, setApplications] = useState(initialApps);
    const [activeApplication, setActiveApplication] = useState<Application | null>(null);
    const supabase = createClient();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const getApplicationsByStatus = (status: ApplicationStatus) => {
        return applications.filter((app) => app.status === status);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const app = applications.find((a) => a.id === event.active.id);
        setActiveApplication(app || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveApplication(null);

        const { active, over } = event;
        if (!over) return;

        const activeApp = applications.find((a) => a.id === active.id);
        if (!activeApp) return;

        // Check if dropped on a column (status change)
        const newStatus = KANBAN_COLUMNS.includes(over.id as ApplicationStatus)
            ? (over.id as ApplicationStatus)
            : applications.find((a) => a.id === over.id)?.status;

        if (!newStatus || activeApp.status === newStatus) return;

        // Optimistic update
        setApplications((prev) =>
            prev.map((app) =>
                app.id === active.id
                    ? {
                        ...app,
                        status: newStatus,
                        applied_at: newStatus !== "todo" && !app.applied_at
                            ? new Date().toISOString()
                            : app.applied_at,
                    }
                    : app
            )
        );

        // Update in database
        const { error } = await supabase
            .from("applications")
            .update({
                status: newStatus,
                applied_at: newStatus !== "todo" && !activeApp.applied_at
                    ? new Date().toISOString()
                    : activeApp.applied_at,
            })
            .eq("id", active.id);

        if (error) {
            // Revert on error
            setApplications(initialApps);
            console.error("Failed to update status:", error);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4 px-1">
                {KANBAN_COLUMNS.map((status) => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        applications={getApplicationsByStatus(status)}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeApplication ? (
                    <div className="w-72 opacity-90">
                        <ApplicationCard application={activeApplication} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
