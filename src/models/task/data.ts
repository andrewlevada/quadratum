import { collection, getDocs, onSnapshot, orderBy, query, QueryConstraint, Unsubscribe } from "@firebase/firestore";
import { userDoc } from "~src/models/tools";
import Task, { CompletedTaskDocumentPart, PendingTaskDocumentPart } from "~src/models/task/index";
import { FullPartial } from "~utils/types";
import { deleteModel, fetchModelById, postModel, updateModel } from "~src/models/data";

export function postTask(task: Task): Promise<Task> {
    return postModel(Task, "tasks", task);
}

export function fetchTaskById(id: string): Promise<Task> {
    return fetchModelById(Task, "tasks", id);
}

export async function fetchTasksWithFilter(constraints: QueryConstraint[], dontOrder?: boolean): Promise<Task[]> {
    const q = query(collection(userDoc(), "tasks").withConverter(Task.converter), ...constraints.concat(dontOrder ? [] : orderBy("text")));
    const snap = await getDocs(q);
    return snap.docs.map(v => v.data());
}

export function listenToTasksWithFilter(constraints: QueryConstraint[], callback: (tasks: Task[]) => void): Unsubscribe {
    const q = query(collection(userDoc(), "tasks").withConverter(Task.converter), ...constraints);
    return onSnapshot(q, snap => callback(snap.docs.map(v => v.data())));
}

export type PartialTaskWithId = { id: string } & FullPartial<Task | PendingTaskDocumentPart | CompletedTaskDocumentPart>;
export function updateTask(task: PartialTaskWithId): Promise<void> {
    return updateModel(Task, "tasks", task);
}

export function deleteTask(id: string): Promise<void> {
    return deleteModel("tasks", id);
}
