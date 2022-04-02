import { deleteField, doc, DocumentReference, Firestore, getFirestore } from "@firebase/firestore";
import { TaskDocument } from "~src/models/task";

export function db(): Firestore {
    return getFirestore();
}

export function userId(): string | null {
    return localStorage.getItem("fb_user_uid") || null;
}

export function userDoc(): DocumentReference {
    const id = userId();
    if (id === null) {
        window.location.pathname = "/enter";
        throw new Error("User not authed! [Sentry ignore]");
    }
    return doc(db(), "users", id);
}

export function nullishPayloadSet<T>(field: keyof T, o: Partial<T>, payload: any): void {
    if (o[field] === undefined) return;
    if (o[field] === null) payload[field as keyof TaskDocument] = deleteField();
    else (payload as Record<string, unknown>)[field as string] = o[field];
}
