import { getDoc, onSnapshot, setDoc, Unsubscribe } from "@firebase/firestore";
import Sprint from "../models/legacy/sprint";
import { userDoc } from "../models/tools";
import { createNewSprint } from "../models/legacy/sprint/data";
import { Callback } from "~utils/types";

export interface OAuthData {
    accessToken: string;
    expiresIn: string;
    refreshToken: string;
}

export interface UserDocument {
    activeTaskId: string | null;
    figmaOAuth?: OAuthData | null;
    figmaMapUrl?: string;
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

    await setDoc(userDoc(), { activeTaskId: null, sprintAnchor } as UserDocument);

    await createNewSprint(new Sprint(0, { startWeek: new Date().week() }));
    await Sprint.createAndAppend();
}

export function getUserInfo(): Promise<UserDocument> {
    return getDoc(userDoc()).then(snap => snap.data() as UserDocument);
}

export function listenForUserInfo(callback: Callback<UserDocument>): Unsubscribe {
    return onSnapshot(userDoc(), snap => callback(snap.data() as UserDocument));
}

export function setActiveTask(taskId: string | null): Promise<void> {
    return setDoc(userDoc(), { activeTaskId: taskId }, { merge: true });
}

export function setFigmaOAuth(data: OAuthData): Promise<void> {
    return setDoc(userDoc(), { figmaOAuth: data }, { merge: true });
}

export function setFigmaMapUrl(value: string): Promise<void> {
    return setDoc(userDoc(), { figmaMapUrl: value }, { merge: true });
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
