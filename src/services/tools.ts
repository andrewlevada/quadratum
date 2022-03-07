import { doc, DocumentReference, Firestore, getFirestore } from "@firebase/firestore";

export function db(): Firestore {
    return getFirestore();
}

export function userId(): string {
    return ""; // TODO: Implement
}

export function userDoc(): DocumentReference {
    return doc(db(), "users", userId());
}
