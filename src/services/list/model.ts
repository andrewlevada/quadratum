import List from "~services/list/view-model";

interface ListStored {
    id: string;
    tasksIds: string[];
}

export function fetchListById(id: string): Promise<List> {
    throw new Error("Not implemented!");
}

export function postList(): Promise<string> {
    throw new Error("Not implemented!");
}

export function postTaskToList(listId: string, taskId: string): Promise<void> {
    throw new Error("Not implemented!");
}

export function updateList(list: List): Promise<void> {
    throw new Error("Not implemented!");
}

export function deleteTaskFromList(listId: string, taskId: string): Promise<void> {
    throw new Error("Not implemented!");
}

export function deleteList(listId: string): Promise<void> {
    throw new Error("Not implemented!");
}
