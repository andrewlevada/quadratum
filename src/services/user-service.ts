import { doc, getDoc, setDoc } from "@firebase/firestore";
import Sprint from "~services/sprint";
import List from "~services/list";
import { db, userId } from "~services/tools";
import { createNewSprint } from "~services/sprint/data";
import Project from "~services/project";

export interface UserDocument {
    dailyListId: string;
    noneProjectId: string;
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
    const noneProject = await Project.create("None");

    await setDoc(doc(db(), "users", userId()), {
        dailyListId: listForDaily.id,
        noneProjectId: noneProject.id,
        sprintAnchor: {
            currentSprintWeek: new Date().week(),
            currentSprintNumber: 0,
            lastSprintNumber: 0,
        },
    } as UserDocument);

    await createNewSprint(listForSprint.id, 0, new Date().week());
    await Sprint.createAndAppend();
}

export function getUserInfo(): Promise<UserDocument> {
    return getDoc(doc(db(), "users", userId()))
        .then(snap => snap.data() as UserDocument);
}

export function getSprintAnchor(): Promise<SprintAnchor> {
    return getUserInfo().then(user => user.sprintAnchor);
}

export function getDailyListId(): Promise<string> {
    return getUserInfo().then(userInfo => userInfo.dailyListId);
}

export function getNoneProjectId(): Promise<string> {
    return getUserInfo().then(userInfo => userInfo.noneProjectId);
}
