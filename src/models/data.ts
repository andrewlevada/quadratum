import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    FirestoreDataConverter,
    getDoc,
    getDocs, onSnapshot,
    orderBy,
    query, QueryConstraint,
    setDoc, Unsubscribe
} from "@firebase/firestore";
import { userDoc } from "~src/models/tools";
import Task from "~src/models/task";
import { Callback } from "~utils/types";

type Constructor<I> = new (...args: any[]) => I;
type Model<T> = Constructor<T> & { converter: FirestoreDataConverter<T> };

export async function postModel<T>(model: Model<T>, collectionName: string, obj: any): Promise<T> {
    const snap = await addDoc(collection(userDoc(), collectionName).withConverter(model.converter), obj);
    return new model(snap.id, obj);
}

export async function fetchModelById<T>(model: Model<T>, collectionName: string, id: string): Promise<T> {
    const snap = await getDoc(doc(userDoc(), collectionName, id).withConverter(model.converter));
    return snap.data() || Promise.reject();
}

export function listenForModelById<T>(model: Model<T>, collectionName: string, id: string, callback: Callback<T>): Unsubscribe {
    const d = doc(userDoc(), collectionName, id).withConverter(model.converter);
    return onSnapshot(d, snap => callback(snap.data()!));
}

export async function fetchModelsWithFilter<T>(model: Model<T>, collectionName: string, constraints: QueryConstraint[]): Promise<T[]> {
    const q = query(collection(userDoc(), collectionName).withConverter(model.converter), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(v => v.data());
}

export function listenForModelsWithFilter<T>(model: Model<T>, collectionName: string, callback: Callback<T[]>, constraints: QueryConstraint[]): Unsubscribe {
    const q = query(collection(userDoc(), collectionName).withConverter(model.converter), ...constraints);
    return onSnapshot(q, snap => callback(snap.docs.map(v => v.data())));
}

export async function updateModel(model: Model<any>, collectionName: string, obj: any): Promise<void> {
    // Don't use updateDoc() - it does not work with convertors!
    return setDoc(doc(userDoc(), collectionName, obj.id).withConverter(model.converter), obj, { merge: true }).then();
}

export async function fetchAllModels<T>(model: Model<T>, collectionName: string, order: string): Promise<T[]> {
    const q = query(collection(userDoc(), collectionName).withConverter(model.converter), orderBy(order));
    const docs = await getDocs(q);
    const snaps = docs.docs;
    return snaps.map(snap => snap.data());
}

export function listenForAllModels<T>(model: Model<T>, collectionName: string, order: keyof T, callback: Callback<T[]>): Unsubscribe {
    const q = query(collection(userDoc(), collectionName).withConverter(model.converter), orderBy(order as string));
    return onSnapshot(q, snap => callback(snap.docs.map(v => v.data())));
}

export function deleteModel(collectionName: string, id: string): Promise<void> {
    return deleteDoc(doc(userDoc(), collectionName, id));
}
