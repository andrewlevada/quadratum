import Sprint from "~services/sprint";
import { doc, getDoc, setDoc, updateDoc } from "@firebase/firestore";
import { userDoc } from "~services/tools";
import { getSprintAnchor, UserDocument } from "~services/user-service";

export async function createNewSprint(sprint: Sprint): Promise<Sprint> {
    await setDoc(doc(userDoc(), "sprints", sprint.number.toString()).withConverter(Sprint.converter), sprint);
    await updateDoc(userDoc(), { "sprintAnchor.lastSprintNumber": sprint.number } as Partial<UserDocument>);
    return sprint;
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
    const snap = await getDoc(doc(userDoc(), "sprints", number.toString()).withConverter(Sprint.converter));
    return snap.data() || null;
}
