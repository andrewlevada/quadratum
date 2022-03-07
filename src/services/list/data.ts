import List from "~services/list";
import { addDoc, collection, deleteDoc, doc, getDoc, setDoc } from "@firebase/firestore";
import { userDoc } from "~services/tools";

interface ListDocument {
    tasksIds: string[];
}

export async function fetchListById(id: string): Promise<List> {
    const snap = await getDoc(doc(userDoc(), "lists", id));
    const data = snap.data() as ListDocument | undefined;
    if (!data) return Promise.reject();
    return new List(id, data.tasksIds);
}

export async function postList(): Promise<string> {
    const snap = await addDoc(collection(userDoc(), "lists"), { taskIds: [] });
    return snap.id;
}

export function updateList(list: List): Promise<void> {
    return setDoc(doc(userDoc(), "lists", list.id), { tasksIds: list.tasksIds } as ListDocument).then();
}

export function deleteList(id: string): Promise<void> {
    return deleteDoc(doc(userDoc(), "lists", id)).then();
}
