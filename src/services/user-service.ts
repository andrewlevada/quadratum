import { doc, getDoc, setDoc } from "@firebase/firestore";
import Sprint from "~services/sprint";
import { db, userDoc, userId } from "~services/tools";
import { createNewSprint } from "~services/sprint/data";

export interface UserDocument {
    sprintAnchor: SprintAnchor;
}

export interface SprintAnchor {
    currentSprintWeek: number
    currentSprintNumber: number;
    lastSprintNumber: number;
}

export async function initializeUser(userUid: string): Promise<void> {
    localStorage.setItem("fb_user_uid", userUid);

    const d = await getDoc(userDoc());
    if (d.exists()) return;

    await setDoc(userDoc(), {
        sprintAnchor: {
            currentSprintWeek: new Date().week(),
            currentSprintNumber: 0,
            lastSprintNumber: 0,
        },
    } as UserDocument);

    await createNewSprint(new Sprint(0, { startWeek: new Date().week() }));
    await Sprint.createAndAppend();
}

export function getUserInfo(): Promise<UserDocument> {
    return getDoc(doc(db(), "users", userId()))
        .then(snap => snap.data() as UserDocument);
}

export function getSprintAnchor(): Promise<SprintAnchor> {
    return getUserInfo().then(user => user.sprintAnchor);
}
