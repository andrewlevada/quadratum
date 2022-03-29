import { doc, DocumentReference, Firestore, getFirestore } from "@firebase/firestore";

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
