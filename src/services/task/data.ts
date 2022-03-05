import Task from "~services/task";

export interface PostTaskPayload {
    text: string;
    projectId: string;
}

export function postTask(payload: PostTaskPayload): Promise<Task> {
    throw new Error("Not implemented!");
}

export function fetchTaskById(id: string): Promise<Task> {
    throw new Error("Not implemented!");
}

export function fetchTasksByIds(ids: readonly string[]): Promise<Task[]> {
    throw new Error("Not implemented!");
}

export function updateTask(task: Task): Promise<void> {
    throw new Error("Not implemented!");
}

export function deleteTask(task: Task): Promise<void> {
    throw new Error("Not implemented!");
}
