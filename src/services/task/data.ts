import Task from "~services/task";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "@firebase/firestore";
import { userDoc } from "~services/tools";

interface TaskDocument {
    text: string;
    projectId: string;
}

export async function postTask(payload: TaskDocument): Promise<Task> {
    const snap = await addDoc(collection(userDoc(), "tasks"), payload);
    return new Task(snap.id, payload.text, payload.projectId);
}

export async function fetchTaskById(id: string): Promise<Task> {
    const snap = await getDoc(doc(userDoc(), "tasks", id));
    const data = snap.data() as TaskDocument | undefined;
    if (!data) return Promise.reject();
    return new Task(id, data.text, data.projectId);
}

export async function fetchTasksByIds(ids: readonly string[]): Promise<Task[]> {
    if (ids.length === 0) return [];
    const q = await getDocs(query(collection(userDoc(), "tasks"), where("id", "in", ids)));
    const snaps = q.docs;
    return snaps.map(snap => {
        const data = snap.data() as TaskDocument | undefined;
        if (!data) return null;
        return new Task(snap.id, data.text, data.projectId);
    }).filter(v => !!v) as Task[];
}

export function updateTask(task: Task): Promise<void> {
    return setDoc(doc(userDoc(), "tasks", task.id), {
        text: task.text, projectId: task.projectId,
    } as TaskDocument).then();
}

export function deleteTask(id: string): Promise<void> {
    return deleteDoc(doc(userDoc(), "tasks", id));
    // TODO: Also delete all references to this task in lists
}
