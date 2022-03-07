import List from "~services/list";
import { addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    setDoc,
    updateDoc } from "@firebase/firestore";
import { userDoc } from "~services/tools";

interface ListDocument {
    tasksIds: string[];
}

export async function postList(): Promise<string> {
    const snap = await addDoc(collection(userDoc(), "lists"), { taskIds: [] });
    return snap.id;
}

export async function fetchListById(id: string): Promise<List> {
    const snap = await getDoc(doc(userDoc(), "lists", id));
    const data = snap.data() as ListDocument | undefined;
    if (!data) return Promise.reject();
    return new List(id, data.tasksIds);
}

export function updateList(list: List): Promise<void> {
    return setDoc(doc(userDoc(), "lists", list.id), { tasksIds: list.tasksIds } as ListDocument).then();
}

export function addTaskToList(listId: string, taskId: string): Promise<void> {
    return updateDoc(doc(userDoc(), "lists", listId), {
        taskIds: arrayUnion(taskId),
    }).then();
}

export function removeTaskFromList(listId: string, taskId: string): Promise<void> {
    return updateDoc(doc(userDoc(), "lists", listId), {
        taskIds: arrayRemove(taskId),
    }).then();
}

export function deleteList(id: string): Promise<void> {
    return deleteDoc(doc(userDoc(), "lists", id)).then();
}
