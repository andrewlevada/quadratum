import Task from "~services/task";
import { addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    QueryConstraint,
    setDoc,
    where } from "@firebase/firestore";
import { userDoc } from "~services/tools";

export async function postTask(task: Task): Promise<Task> {
    const snap = await addDoc(collection(userDoc(), "tasks").withConverter(Task.converter), task);
    return new Task(snap.id, task);
}

export async function fetchTaskById(id: string): Promise<Task> {
    const snap = await getDoc(doc(userDoc(), "tasks", id).withConverter(Task.converter));
    return snap.data() || Promise.reject();
}

export async function fetchTasksByIds(ids: readonly string[]): Promise<Task[]> {
    if (ids.length === 0) return [];
    const q = query(collection(userDoc(), "tasks").withConverter(Task.converter), where("id", "in", ids));
    const snap = await getDocs(q);
    return snap.docs.map(v => v.data());
}

export async function fetchTasksWithFilter(...constraints: QueryConstraint[]): Promise<Task[]> {
    const q = query(collection(userDoc(), "tasks").withConverter(Task.converter), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(v => v.data());
}

export function updateTask(task: Task): Promise<void> {
    return setDoc(doc(userDoc(), "tasks", task.id).withConverter(Task.converter), task).then();
}

export function deleteTask(id: string): Promise<void> {
    return deleteDoc(doc(userDoc(), "tasks", id));
}
