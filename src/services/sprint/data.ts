import Sprint from "~services/sprint";
import { doc, getDoc, setDoc } from "@firebase/firestore";
import { db, userDoc, userId } from "~services/tools";
import { UserInfoDocument } from "~services/user-service";

interface SprintDocument {
    id: string;
    startDate: number;
    listId: string;
}

export function createNewSprint(listId: string): Promise<Sprint> {
    return getCurrentSprintNumber()
        .then(number => setDoc(doc(userDoc(), "sprints", (number + 1).toString()), {
            id: "TODO", startDate: 0, listId,
        } as SprintDocument).then(() => new Sprint("TODO", number + 1, new Date(), listId)));
}

export function getCurrentSprintNumber(): Promise<number> {
    return getDoc(doc(db(), "users", userId()))
        .then(snap => snap.data() as UserInfoDocument)
        .then(userInfo => userInfo.lastSprintNumber - 1);
}

export async function fetchSprintByNumber(number: number): Promise<Sprint | null> {
    const snap = await getDoc(doc(userDoc(), "sprints", number.toString()));
    const data = snap.data() as SprintDocument | undefined;
    if (!data) return Promise.reject();
    return new Sprint(data.id, number, new Date(data.startDate), data.listId);
}
