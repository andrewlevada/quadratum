import Sprint from "~services/sprint";
import { doc, getDoc, setDoc, updateDoc } from "@firebase/firestore";
import { db, userDoc, userId } from "~services/tools";
import { UserDocument } from "~services/user-service";

interface SprintDocument {
    id: string;
    startDate: number;
    listId: string;
}

export function createNewSprint(listId: string): Promise<Sprint> {
    return getCurrentSprintNumber()
        .then(number => setDoc(doc(userDoc(), "sprints", (number + 1).toString()), {
            id: "TODO", startDate: 0, listId,
        } as SprintDocument)
            .then(() => updateDoc(userDoc(), { lastSprintNumber: number + 2 } as Partial<UserDocument>))
            .then(() => new Sprint("TODO", number + 1, new Date(), listId)));
}

export function getCurrentSprintNumber(): Promise<number> {
    return getDoc(doc(db(), "users", userId()))
        .then(snap => snap.data() as UserDocument | undefined)
        .then(userInfo => (userInfo?.lastSprintNumber || 0) - 1);
}

export async function fetchSprintByNumber(number: number): Promise<Sprint | null> {
    const snap = await getDoc(doc(userDoc(), "sprints", number.toString()));
    const data = snap.data() as SprintDocument | undefined;
    if (!data) return null;
    return new Sprint(data.id, number, new Date(data.startDate), data.listId);
}
