import Task, { CompletedTaskDocument, PendingTaskDocument } from "~src/models/task/index";
import { fetchTaskById, listenToTasksWithFilter, postTask } from "~src/models/task/data";
import { orderBy, Unsubscribe, where } from "@firebase/firestore";
import { Callback } from "~utils/types";

export type ActionOrigin = "daily" | "sprint" | "backlog";

export interface ActionContext {
    origin?: ActionOrigin;
    parentTask?: Task;
}

export interface CreationContext extends ActionContext {
    scope: {
        id: string;
        label: string;
    },
    dueDate?: Date;
}

export async function createTask(text: string, context: CreationContext): Promise<Task> {
    const payload = {
        text,
        progress: [false],
        sessions: 1,
        isCompleted: false,
        scope: {
            id: (context as CreationContext)?.scope?.id || "pile",
            location: getLocation() || "Pile",
        }
    } as PendingTaskDocument | CompletedTaskDocument;

    if (context.parentTask) payload.parentTaskId = context.parentTask.id;
    if (context.dueDate) payload.dueDate = context.dueDate!.getTime();

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

export function listenForTasksFromScope(scopeId: string, callback: Callback<Task[]>): Unsubscribe {
    return listenToTasksWithFilter([where("scope.id", "==", scopeId), orderBy("text")], callback);
}
