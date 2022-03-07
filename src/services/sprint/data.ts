import Sprint from "~services/sprint";
import { doc, getDoc, setDoc, updateDoc } from "@firebase/firestore";
import { userDoc } from "~services/tools";
import { getSprintAnchor, UserDocument } from "~services/user-service";

interface SprintDocument {
    startWeek: number;
    listId: string;
}

export function createNewSprint(listId: string, number: number, weekNumber: number): Promise<Sprint> {
    return setDoc(doc(userDoc(), "sprints", number.toString()), {
        startWeek: weekNumber, listId,
    } as SprintDocument)
        .then(() => updateDoc(userDoc(), { "sprintAnchor.lastSprintNumber": number } as Partial<UserDocument>))
        .then(() => new Sprint(number, weekNumber, listId));
}

export async function getCurrentSprintNumber(): Promise<number> {
    const anchor = await getSprintAnchor();
    const num = anchor.currentSprintNumber + (new Date().week() - anchor.currentSprintWeek);
    if (num !== anchor.currentSprintNumber)
        await updateDoc(userDoc(), {
            sprintAnchor: {
                currentSprintWeek: new Date().week(),
                currentSprintNumber: num,
                lastSprintNumber: anchor.lastSprintNumber,
            },
        } as Partial<UserDocument>);

    return num;
}

export async function fetchSprintByNumber(number: number): Promise<Sprint | null> {
    const snap = await getDoc(doc(userDoc(), "sprints", number.toString()));
    const data = snap.data() as SprintDocument | undefined;
    if (!data) return null;
    return new Sprint(number, data.startWeek, data.listId);
}
