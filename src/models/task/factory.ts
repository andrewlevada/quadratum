import Task, { CompletedTaskDocument, PendingTaskDocument } from "~src/models/task/index";
import { getCurrentSprintNumber } from "~src/models/legacy/sprint/data";
import { fetchTaskById, postTask } from "~src/models/task/data";

export type ActionOrigin = "daily" | "sprint" | "backlog";

export interface ActionContext {
    origin?: ActionOrigin;
    parentTask?: Task;
}

export interface LegacyCreationContext extends ActionContext {
    projectId: string | undefined;
    sprintNumber: number | undefined;
}

export interface CreationContext extends ActionContext {
    scope: {
        id: string;
        label: string;
    }
}

export async function createTask(text: string, context: LegacyCreationContext | CreationContext): Promise<Task> {
    if (context.origin === "daily")
        (context as LegacyCreationContext).sprintNumber = await getCurrentSprintNumber();

    const payload = {
        text,
        isInDaily: context.origin === "daily",
        progress: [false],
        sessions: 1,
        isCompleted: false,
        scope: {
            id: (context as CreationContext)?.scope?.id || "pile",
            location: getLocation() || "Pile",
        }
    } as PendingTaskDocument | CompletedTaskDocument;

    if (context.parentTask)
        payload.parentTaskId = context.parentTask.id;

    if ("projectId" in context) payload.projectId = context.projectId;
    if ("sprintNumber" in context) payload.sprintNumber = context.sprintNumber;

    return postTask(payload);

    function getLocation(): string | undefined {
        return context.parentTask
            ? `${context.parentTask.scope.location}/${context.parentTask.text}`
            : (context as CreationContext)?.scope?.label;
    }
}

export function getTaskById(id: string): Promise<Task> {
    return fetchTaskById(id);
}
