import Task from "~src/models/task/index";
import { getCurrentSprintNumber } from "~src/models/legacy/sprint/data";
import { fetchTaskById, postTask } from "~src/models/task/data";

export type ActionOrigin = "daily" | "sprint" | "backlog";

export interface ActionContext {
    origin: ActionOrigin;
}

export interface CreationContext extends ActionContext {
    projectId: string | undefined;
    sprintNumber: number | undefined;
    parentTaskId?: string;
}

export async function createTask(text: string, context: CreationContext): Promise<Task> {
    if (context.origin === "daily") context.sprintNumber = await getCurrentSprintNumber();
    return postTask(new Task("null", {
        text,
        projectId: context.projectId || "none",
        sprintNumber: context.sprintNumber,
        isInDaily: context.origin === "daily",
        progress: [false],
        sessions: 1,
        isCompleted: false,
        parentTaskId: context.parentTaskId,
        scope: {
            id: "pile",
            location: "Pile",
        }
    }));
}

export function getTaskById(id: string): Promise<Task> {
    return fetchTaskById(id);
}
