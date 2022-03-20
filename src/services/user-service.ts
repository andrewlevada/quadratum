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

    const sprintAnchor = {
        currentSprintWeek: new Date().week(),
        currentSprintNumber: 0,
        lastSprintNumber: 0,
    };

    localStorage.setItem("qd_sprint_anchor", JSON.stringify(sprintAnchor));

    const d = await getDoc(userDoc());
    if (d.exists()) return;

    await setDoc(userDoc(), { sprintAnchor } as UserDocument);

    await createNewSprint(new Sprint(0, { startWeek: new Date().week() }));
    await Sprint.createAndAppend();
}

export function getUserInfo(): Promise<UserDocument> {
    return getDoc(doc(db(), "users", userId()))
        .then(snap => snap.data() as UserDocument);
}

/*
Deprecated!
 */
export async function getSprintAnchor(): Promise<SprintAnchor> {
    const user = await getUserInfo();
    localStorage.setItem("qd_sprint_anchor", JSON.stringify(user.sprintAnchor));
    return user.sprintAnchor;
}

export function getSprintAnchorSync(): SprintAnchor {
    return JSON.parse(localStorage.getItem("qd_sprint_anchor") || "{}") as SprintAnchor;
}
