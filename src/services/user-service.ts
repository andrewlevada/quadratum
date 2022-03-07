import { doc, getDoc, setDoc } from "@firebase/firestore";
import Sprint from "~services/sprint";
import List from "~services/list";
import { db, userDoc, userId } from "~services/tools";
import { createNewSprint } from "~services/sprint/data";

export interface UserDocument {
    dailyListId: string;
    sprintAnchor: SprintAnchor;
}

export interface SprintAnchor {
    currentSprintWeek: number
    currentSprintNumber: number;
    lastSprintNumber: number;
}

export async function initializeUser(userUid: string): Promise<void> {
    localStorage.setItem("fb_user_uid", userUid);

    const listForSprint = await List.create();
    const listForDaily = await List.create();

    await setDoc(doc(db(), "users", userId()), {
        dailyListId: listForDaily.id,
        sprintAnchor: {
            currentSprintWeek: new Date().week(),
            currentSprintNumber: 0,
            lastSprintNumber: 0,
        },
    } as Partial<UserDocument>);

    await createNewSprint(listForSprint.id, 0, new Date().week());
    await Sprint.createAndAppend();
}

export function getSprintAnchor(): Promise<SprintAnchor> {
    return getDoc(userDoc())
        .then(snap => snap.data() as UserDocument)
        .then(user => user.sprintAnchor);
}

export function getDailyListId(): Promise<string> {
    return getDoc(doc(db(), "users", userId()))
        .then(snap => snap.data() as UserDocument)
        .then(userInfo => userInfo.dailyListId);
}
