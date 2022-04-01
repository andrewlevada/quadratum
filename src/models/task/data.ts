import { addDoc,
    collection,
    deleteDoc,
    doc, getDoc,
    getDocs,
    orderBy,
    query,
    QueryConstraint,
    setDoc } from "@firebase/firestore";
import { userDoc } from "~src/models/tools";
import Task, { CompletedTaskDocumentPart,
    PendingTaskDocumentPart } from "~src/models/task/index";
import { FullPartial } from "~utils/types";

export async function postTask(task: Task): Promise<Task> {
    const snap = await addDoc(collection(userDoc(), "tasks").withConverter(Task.converter), task);
    return new Task(snap.id, task);
}

export async function fetchTaskById(id: string): Promise<Task> {
    const snap = await getDoc(doc(userDoc(), "tasks", id).withConverter(Task.converter));
    return snap.data() as Task;
}

export async function fetchTasksWithFilter(constraints: QueryConstraint[], dontOrder?: boolean): Promise<Task[]> {
    const q = query(collection(userDoc(), "tasks").withConverter(Task.converter), ...constraints.concat(dontOrder ? [] : orderBy("text")));
    const snap = await getDocs(q);
    return snap.docs.map(v => v.data());
}

export type PartialTaskWithId = { id: string } & FullPartial<Task | PendingTaskDocumentPart | CompletedTaskDocumentPart>;
export function updateTask(task: PartialTaskWithId): Promise<void> {
    // Don't use updateDoc() - it does not work with convertors!
    return setDoc(doc(userDoc(), "tasks", task.id).withConverter(Task.converter), task, { merge: true }).then();
}

export function deleteTask(id: string): Promise<void> {
    return deleteDoc(doc(userDoc(), "tasks", id));
}
