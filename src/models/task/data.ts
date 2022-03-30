import { addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    QueryConstraint,
    setDoc } from "@firebase/firestore";
import { userDoc } from "~src/models/tools";
import Task, { CompletedTaskDocumentPart,
    PendingTaskDocumentPart } from "~src/models/task/index";

export type PartialTaskWithId = { id: string } & Partial<Task | PendingTaskDocumentPart | CompletedTaskDocumentPart>;

export async function postTask(task: Task): Promise<Task> {
    const snap = await addDoc(collection(userDoc(), "tasks").withConverter(Task.converter), task);
    return new Task(snap.id, task);
}

export async function fetchTasksWithFilter(...constraints: QueryConstraint[]): Promise<Task[]> {
    const q = query(collection(userDoc(), "tasks").withConverter(Task.converter), orderBy("text"), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(v => v.data());
}

export function updateTask(task: PartialTaskWithId): Promise<void> {
    // Don't use updateDoc() - it does not work with convertors!
    return setDoc(doc(userDoc(), "tasks", task.id).withConverter(Task.converter), task, { merge: true }).then();
}

export function deleteTask(id: string): Promise<void> {
    return deleteDoc(doc(userDoc(), "tasks", id));
}
