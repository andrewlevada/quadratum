// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Task } from "~services/task/view-model";

export function getTasksByListId(listId: string): Promise<Task[]> {
    throw new Error("Not implemented!");
}

export function postTaskToList(listId: string, taskId: string): Promise<void> {
    throw new Error("Not implemented!");
}
