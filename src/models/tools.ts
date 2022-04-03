import { deleteField, doc, DocumentReference, Firestore, getFirestore } from "@firebase/firestore";
import { TaskDocument } from "~src/models/task";
import { updateScope } from "~src/models/scope/data";
import Scope from "~src/models/scope";

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

// TODO: make reusable
export function updatable(additionalPayload?: Partial<Scope>) {
    return (target: Object, key: string) => {
        const privateKey = `${key}Inner`;

        const getter = function() {
            return this[privateKey];
        }

        const setter = function (value: unknown) {
            if (value === this[privateKey]) return;
            this[privateKey] = value;

            const payload: Record<string, unknown> = additionalPayload || {};
            payload[key] = value;
            updateScope({ ...(payload as Partial<Scope>), id: this.id }).then();
        }

        delete (target as any)[key];
        Object.defineProperty(target, key, { get: getter, set: setter });
    }
}
