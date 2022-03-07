import { doc, DocumentReference, Firestore, getFirestore } from "@firebase/firestore";

export function db(): Firestore {
    return getFirestore();
}

export function userId(): string {
    return localStorage.getItem("fb_user_uid") || "";
}

export function userDoc(): DocumentReference {
    return doc(db(), "users", userId());
}
